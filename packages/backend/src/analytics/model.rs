use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AnalyticsEvent {
    pub timestamp: u64,
    pub user_agent: Option<String>,
    pub country: Option<String>,
    pub device_type: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Analytics {
    pub note_id: String,
    pub events: Vec<AnalyticsEvent>,
    pub total_views: u32,
    pub created_at: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AnalyticsSummary {
    pub total_views: u32,
    pub last_viewed: Option<u64>,
    pub first_viewed: Option<u64>,
    pub unique_countries: Vec<String>,
    pub device_breakdown: DeviceBreakdown,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct DeviceBreakdown {
    pub mobile: u32,
    pub desktop: u32,
    pub tablet: u32,
    pub unknown: u32,
}

impl Analytics {
    pub fn new(note_id: String, created_at: u64) -> Self {
        Analytics {
            note_id,
            events: Vec::new(),
            total_views: 0,
            created_at,
        }
    }

    pub fn add_event(&mut self, event: AnalyticsEvent) {
        self.events.push(event);
        self.total_views += 1;
    }

    pub fn get_summary(&self) -> AnalyticsSummary {
        let last_viewed = self.events.last().map(|e| e.timestamp);
        let first_viewed = self.events.first().map(|e| e.timestamp);

        let mut unique_countries: Vec<String> = self
            .events
            .iter()
            .filter_map(|e| e.country.clone())
            .collect();
        unique_countries.sort();
        unique_countries.dedup();

        let mut device_breakdown = DeviceBreakdown::default();
        for event in &self.events {
            if let Some(device) = &event.device_type {
                match device.as_str() {
                    "mobile" => device_breakdown.mobile += 1,
                    "desktop" => device_breakdown.desktop += 1,
                    "tablet" => device_breakdown.tablet += 1,
                    _ => device_breakdown.unknown += 1,
                }
            } else {
                device_breakdown.unknown += 1;
            }
        }

        AnalyticsSummary {
            total_views: self.total_views,
            last_viewed,
            first_viewed,
            unique_countries,
            device_breakdown,
        }
    }
}

pub fn detect_device_type(user_agent: &str) -> String {
    let ua_lower = user_agent.to_lowercase();

    if ua_lower.contains("mobile") || ua_lower.contains("android") || ua_lower.contains("iphone") {
        "mobile".to_string()
    } else if ua_lower.contains("tablet") || ua_lower.contains("ipad") {
        "tablet".to_string()
    } else if ua_lower.contains("windows") || ua_lower.contains("mac") || ua_lower.contains("linux") {
        "desktop".to_string()
    } else {
        "unknown".to_string()
    }
}
