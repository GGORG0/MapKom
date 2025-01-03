use crate::cities::GtfsFile;
use serde::{Deserialize, Serialize};
use super::{BoolWrapper, NaiveDateWrapper};

/*
service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date
32,0,0,1,1,0,0,0,20241223,20250112
4,0,0,0,0,0,0,1,20241223,20250112
8,1,0,0,0,0,0,0,20241223,20250112
3,0,1,0,0,1,1,0,20241223,20250112
*/

#[derive(Debug, Serialize, Deserialize)]
pub struct WroclawCalendar {
    #[serde(rename = "service_id")]
    pub service: u32,

    pub monday: BoolWrapper,
    pub tuesday: BoolWrapper,
    pub wednesday: BoolWrapper,
    pub thursday: BoolWrapper,
    pub friday: BoolWrapper,
    pub saturday: BoolWrapper,
    pub sunday: BoolWrapper,

    pub start_date: NaiveDateWrapper,
    pub end_date: NaiveDateWrapper,
}

impl GtfsFile for WroclawCalendar {
    fn name() -> &'static str {
        "calendar.txt"
    }
}
