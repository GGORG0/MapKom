use crate::cities::GtfsFile;
use serde::{Deserialize, Serialize};

use super::NaiveTimeWrapper;

/*
trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type
3_14203602,20:52:00,20:52:00,4562,0,1,1
3_14203602,20:53:00,20:53:00,667,1,3,3
3_14203602,20:54:00,20:54:00,4890,2,3,3
3_14203602,20:55:00,20:55:00,1318,3,0,0
3_14203602,20:57:00,20:57:00,642,4,0,0
3_14203602,20:59:00,20:59:00,639,5,0,0
3_14203602,21:00:00,21:00:00,627,6,0,0
3_14203602,21:01:00,21:01:00,4715,7,3,3
3_14203602,21:02:00,21:02:00,779,8,0,0
*/

#[derive(Debug, Serialize, Deserialize)]
pub enum StopAvailability {
    #[serde(rename = "0")]
    Regular = 0,

    #[serde(rename = "1")]
    None = 1,

    #[serde(rename = "3")]
    OnDemand = 3,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WroclawStopTime {
    #[serde(rename = "trip_id")]
    pub id: String,

    #[serde(rename = "arrival_time")]
    pub arrival: NaiveTimeWrapper,

    #[serde(rename = "departure_time")]
    pub departure: NaiveTimeWrapper,

    #[serde(rename = "stop_id")]
    pub stop_id: u32,

    #[serde(rename = "stop_sequence")]
    pub sequence: u32,

    #[serde(rename = "pickup_type")]
    pub pickup_type: StopAvailability,

    #[serde(rename = "drop_off_type")]
    pub drop_off_type: StopAvailability,
}

impl GtfsFile for WroclawStopTime {
    fn name() -> &'static str {
        "stop_times.txt"
    }
}
