use axum::{
    extract::{Path, Request},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::Deserialize;

use crate::analytics::{detect_device_type, Analytics, AnalyticsEvent, AnalyticsSummary};
use crate::note::now;
use crate::store;

#[derive(Deserialize)]
pub struct AnalyticsParams {
    id: String,
}

pub async fn track_view(
    Path(AnalyticsParams { id }): Path<AnalyticsParams>,
    headers: HeaderMap,
) -> Response {
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
        country: None, // Could integrate with GeoIP service
        device_type,
    };

    // Get or create analytics
    let analytics_key = format!("analytics:{}", id);
    let mut analytics = match store::get_analytics(&analytics_key) {
        Ok(Some(a)) => a,
        Ok(None) => Analytics::new(id.clone(), now() as u64),
        Err(_) => Analytics::new(id.clone(), now() as u64),
    };

    analytics.add_event(event);

    // Save analytics with 30 day TTL
    match store::set_analytics(&analytics_key, &analytics, 30 * 24 * 60 * 60) {
        Ok(_) => (StatusCode::OK).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e).into_response(),
    }
}

pub async fn get_analytics(Path(AnalyticsParams { id }): Path<AnalyticsParams>) -> Response {
    let analytics_key = format!("analytics:{}", id);

    match store::get_analytics(&analytics_key) {
        Ok(Some(analytics)) => {
            let summary = analytics.get_summary();
            (StatusCode::OK, Json(summary)).into_response()
        }
        Ok(None) => {
            // Return empty analytics
            let empty_summary = AnalyticsSummary {
                total_views: 0,
                last_viewed: None,
                first_viewed: None,
                unique_countries: Vec::new(),
                device_breakdown: Default::default(),
            };
            (StatusCode::OK, Json(empty_summary)).into_response()
        }
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e).into_response(),
    }
}
