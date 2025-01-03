use crate::cities::GtfsFile;
use serde::{Deserialize, Serialize};

/*
route_id,service_id,trip_id,trip_headsign,direction_id,shape_id,brigade_id,vehicle_id,variant_id
A,3,3_14203603,"KRZYKI",0,842094,23,1,842094
A,3,3_14203702,"KRZYKI",0,842094,22,1,842094
A,3,3_14203814,"KRZYKI",0,842094,1,2,842094
A,3,3_14203816,"KRZYKI",0,842094,1,2,842094
A,3,3_14203818,"KRZYKI",0,842094,1,2,842094
A,3,3_14203820,"KRZYKI",0,842094,1,2,842094
A,3,3_14203822,"KRZYKI",0,842094,1,2,842094
A,3,3_14203824,"KRZYKI",0,842094,1,2,842094
A,3,3_14203826,"KRZYKI",0,842094,1,2,842094
*/

#[derive(Debug, Serialize, Deserialize)]
pub struct WroclawTrip {
    #[serde(rename = "route_id")]
    pub id: String,

    #[serde(rename = "service_id")]
    pub service: u32,

    #[serde(rename = "trip_id")]
    pub trip: String,

    #[serde(rename = "trip_headsign")]
    pub headsign: String,

    #[serde(rename = "direction_id")]
    pub direction: u32,

    #[serde(rename = "shape_id")]
    pub shape: u32,

    #[serde(rename = "brigade_id")]
    pub brigade: u32,

    #[serde(rename = "vehicle_id")]
    pub vehicle: u32,

    #[serde(rename = "variant_id")]
    pub variant: u32,
}

impl GtfsFile for WroclawTrip {
    fn name() -> &'static str {
        "trips.txt"
    }
}
