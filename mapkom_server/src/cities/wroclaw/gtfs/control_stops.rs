use crate::cities::GtfsFile;
use serde::{Deserialize, Serialize};

/*
variant_id,stop_id
819353,1897
829864,494
830103,1603
830103,1497
830103,2818
830543,539
830543,4664
830543,838
834323,148
*/

#[derive(Debug, Serialize, Deserialize)]
pub struct WroclawControlStop {
    #[serde(rename = "variant_id")]
    pub variant: u32,

    #[serde(rename = "stop_id")]
    pub stop: u32,
}

impl GtfsFile for WroclawControlStop {
    fn name() -> &'static str {
        "control_stops.txt"
    }
}
