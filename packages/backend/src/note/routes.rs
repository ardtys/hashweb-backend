use axum::{
    extract::Path,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use std::{sync::Arc, time::SystemTime};
use tokio::sync::Mutex;

use crate::analytics::{detect_device_type, Analytics, AnalyticsEvent};
use crate::note::{generate_id, Note, NoteInfo};
use crate::store;
use crate::{config, lock::SharedState};

use super::NotePublic;

pub fn now() -> u32 {
    SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_secs() as u32
}

#[derive(Deserialize)]
pub struct OneNoteParams {
    id: String,
}

#[derive(Serialize)]
pub struct NotePreview {
    pub meta: String,
    pub views: Option<u32>,
    pub expiration: Option<u32>,
}

pub async fn preview(Path(OneNoteParams { id }): Path<OneNoteParams>) -> Response {
    let note = store::get(&id);

    match note {
        Ok(Some(n)) => (
            StatusCode::OK,
            Json(NotePreview {
                meta: n.meta,
                views: n.views,
                expiration: n.expiration,
            }),
        )
            .into_response(),
        Ok(None) => (StatusCode::NOT_FOUND).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

#[derive(Serialize, Deserialize)]
struct CreateResponse {
    id: String,
}

pub async fn create(Json(mut n): Json<Note>) -> Response {
    // let mut n = note.into_inner();
    let id = generate_id();
    // let bad_req = HttpResponse::BadRequest().finish();
    if n.views == None && n.expiration == None {
        return (
            StatusCode::BAD_REQUEST,
            "At least views or expiration must be set",
        )
            .into_response();
    }
    if !*config::ALLOW_ADVANCED {
        n.views = Some(1);
        n.expiration = None;
    }
    match n.views {
        Some(v) => {
            if v > *config::MAX_VIEWS || v < 1 {
                return (StatusCode::BAD_REQUEST, "Invalid views").into_response();
            }
            n.expiration = None; // views overrides expiration
        }
        _ => {}
    }
    match n.expiration {
        Some(e) => {
            if e > *config::MAX_EXPIRATION || e < 1 {
                return (StatusCode::BAD_REQUEST, "Invalid expiration").into_response();
            }
            let expiration = now() + (e * 60);
            n.expiration = Some(expiration);
        }
        _ => {}
    }
    match store::set(&id.clone(), &n.clone()) {
        Ok(_) => (StatusCode::OK, Json(CreateResponse { id })).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn delete(
    Path(OneNoteParams { id }): Path<OneNoteParams>,
    headers: HeaderMap,
    state: axum::extract::State<SharedState>,
) -> Response {
    let mut locks_map = state.locks.lock().await;
    let lock = locks_map
        .entry(id.clone())
        .or_insert_with(|| Arc::new(Mutex::new(())))
        .clone();
    drop(locks_map);
    let _guard = lock.lock().await;

    let note = store::get(&id);
    match note {
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
        Ok(None) => (StatusCode::NOT_FOUND).into_response(),
        Ok(Some(note)) => {
            let mut changed = note.clone();
            if changed.views == None && changed.expiration == None {
                return (StatusCode::BAD_REQUEST).into_response();
            }
            match changed.views {
                Some(v) => {
                    changed.views = Some(v - 1);
                    let id = id.clone();
                    if v <= 1 {
                        match store::del(&id) {
                            Err(e) => {
                                return (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
                                    .into_response();
                            }
                            _ => {}
                        }
                    } else {
                        match store::set(&id, &changed.clone()) {
                            Err(e) => {
                                return (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
                                    .into_response();
                            }
                            _ => {}
                        }
                    }
                }
                _ => {}
            }

            let n = now();
            match changed.expiration {
                Some(e) => {
                    if e < n {
                        match store::del(&id.clone()) {
                            Ok(_) => return (StatusCode::BAD_REQUEST).into_response(),
                            Err(e) => {
                                return (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
                                    .into_response()
                            }
                        }
                    }
                }
                _ => {}
            }

            // Track analytics
            let user_agent = headers
                .get("user-agent")
                .and_then(|v| v.to_str().ok())
                .map(String::from);

            let device_type = user_agent
                .as_ref()
                .map(|ua| detect_device_type(ua))
                .or(Some("unknown".to_string()));

            let event = AnalyticsEvent {
                timestamp: now() as u64,
                user_agent: user_agent.clone(),
                country: None,
                device_type,
            };

            let analytics_key = format!("analytics:{}", id);
            let mut analytics = match store::get_analytics(&analytics_key) {
                Ok(Some(a)) => a,
                Ok(None) => Analytics::new(id.clone(), now() as u64),
                Err(_) => Analytics::new(id.clone(), now() as u64),
            };

            analytics.add_event(event);
            let _ = store::set_analytics(&analytics_key, &analytics, 30 * 24 * 60 * 60);

            return (
                StatusCode::OK,
                Json(NotePublic {
                    contents: changed.contents,
                    meta: changed.meta,
                }),
            )
                .into_response();
        }
    }
}

#[derive(Deserialize)]
pub struct ExtendNoteRequest {
    pub views: Option<u32>,
    pub expiration: Option<u32>,
}

#[derive(Serialize)]
pub struct ExtendNoteResponse {
    pub views: Option<u32>,
    pub expiration: Option<u32>,
}

pub async fn extend(
    Path(OneNoteParams { id }): Path<OneNoteParams>,
    Json(req): Json<ExtendNoteRequest>,
) -> Response {
    // Get existing note
    let note = store::get(&id);

    match note {
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
        Ok(None) => (StatusCode::NOT_FOUND, "Note not found").into_response(),
        Ok(Some(mut note)) => {
            // Validate that at least one field is provided
            if req.views.is_none() && req.expiration.is_none() {
                return (
                    StatusCode::BAD_REQUEST,
                    "At least views or expiration must be provided",
                )
                    .into_response();
            }

            // Handle views extension
            if let Some(additional_views) = req.views {
                if additional_views < 1 || additional_views > *config::MAX_VIEWS {
                    return (StatusCode::BAD_REQUEST, "Invalid views count").into_response();
                }

                // Add to existing views or set new views
                let current_views = note.views.unwrap_or(0);
                let new_views = current_views + additional_views;

                if new_views > *config::MAX_VIEWS {
                    return (StatusCode::BAD_REQUEST, "Total views exceed maximum").into_response();
                }

                note.views = Some(new_views);
                note.expiration = None; // Clear expiration when using views
            }

            // Handle expiration extension
            if let Some(additional_minutes) = req.expiration {
                if additional_minutes < 1 || additional_minutes > *config::MAX_EXPIRATION {
                    return (StatusCode::BAD_REQUEST, "Invalid expiration time").into_response();
                }

                let new_expiration = now() + (additional_minutes * 60);
                note.expiration = Some(new_expiration);
                note.views = None; // Clear views when using expiration
            }

            // Save updated note
            match store::set(&id, &note) {
                Ok(_) => (
                    StatusCode::OK,
                    Json(ExtendNoteResponse {
                        views: note.views,
                        expiration: note.expiration,
                    }),
                )
                    .into_response(),
                Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
            }
        }
    }
}
