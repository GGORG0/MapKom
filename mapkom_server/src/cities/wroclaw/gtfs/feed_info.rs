use super::NaiveDateWrapper;
use crate::cities::GtfsFile;
use serde::{Deserialize, Serialize};

/*
feed_publisher_name,feed_publisher_url,feed_lang,feed_start_date,feed_end_date
"UM Wrocław","http://www.wroclaw.pl/urzad","pl","20241223","20250112"
*/

#[derive(Debug, Serialize, Deserialize)]
pub struct WroclawFeedInfo {
    #[serde(rename = "feed_publisher_name")]
    pub publisher_name: String,

    #[serde(rename = "feed_publisher_url")]
    pub publisher_url: String,

    #[serde(rename = "feed_lang")]
    pub lang: String,

    #[serde(rename = "feed_start_date")]
    pub start_date: NaiveDateWrapper,

    #[serde(rename = "feed_end_date")]
    pub end_date: NaiveDateWrapper,
}

impl GtfsFile for WroclawFeedInfo {
    fn name() -> &'static str {
        "feed_info.txt"
    }
}
