use crate::cities::GtfsFile;
use serde::{Deserialize, Serialize};
use super::NaiveDateWrapper;

/*
service_id,date,exception_type
6,20241230,1
8,20241230,2
6,20241231,1
3,20241231,2
4,20250101,1
32,20250101,2
6,20250102,1
32,20250102,2
8,20250103,1
*/

#[derive(Debug, Serialize, Deserialize)]
pub enum ExceptionType {
    #[serde(rename = "1")]
    Added = 1,

    #[serde(rename = "2")]
    Removed = 2,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WroclawCalendarDate {
    #[serde(rename = "service_id")]
    pub service: u32,

    pub date: NaiveDateWrapper,

    #[serde(rename = "exception_type")]
    pub exception: ExceptionType,
}

impl GtfsFile for WroclawCalendarDate {
    fn name() -> &'static str {
        "calendar_dates.txt"
    }
}
