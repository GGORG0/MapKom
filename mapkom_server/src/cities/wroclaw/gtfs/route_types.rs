use crate::cities::GtfsFile;
use serde::{Deserialize, Serialize};

/*
route_type2_id,route_type2_name
30,"Normalna autobusowa"
31,"Normalna tramwajowa"
32,"Okresowa autobusowa"
34,"Podmiejska autobusowa"
35,"Pospieszna autobusowa"
39,"Strefowa autobusowa"
40,"Nocna autobusowa"
*/

#[derive(Debug, Serialize, Deserialize)]
pub struct WroclawRouteType {
    #[serde(rename = "route_type2_id")]
    pub id: u32,

    #[serde(rename = "route_type2_name")]
    pub name: String,
}

impl GtfsFile for WroclawRouteType {
    fn name() -> &'static str {
        "route_types.txt"
    }
}
