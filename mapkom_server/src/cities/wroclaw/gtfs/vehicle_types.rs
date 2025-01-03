use crate::cities::GtfsFile;
use serde::{Deserialize, Serialize};

/*
vehicle_type_id,vehicle_type_name,vehicle_type_description,vehicle_type_symbol
1,"Solo","","S"
2,"Przegubowy","","P"
8,"Midi","","M"
13,"Mini","","m"
43,"m - Moderus","","m"
92,"M - Moderus [N!]","N - kurs obsługiwany przez tramwaj NISKOPODŁOGOWY","M"
93,"S - Skoda 16T [N]","N - kurs obsługiwany przez tramwaj NISKOPODŁOGOWY","S"
96,"$ - Skoda 19T [N]","N - kurs obsługiwany przez tramwaj NISKOPODŁOGOWY","$"
123,"P - Pesa [N]","N - kurs obsługiwany przez tramwaj NISKOPODŁOGOWY","P"
*/

#[derive(Debug, Serialize, Deserialize)]
pub struct WroclawVehicleType {
    #[serde(rename = "vehicle_type_id")]
    pub id: u32,

    #[serde(rename = "vehicle_type_name")]
    pub name: String,

    #[serde(rename = "vehicle_type_description")]
    pub description: String,

    #[serde(rename = "vehicle_type_symbol")]
    pub symbol: String,
}

impl GtfsFile for WroclawVehicleType {
    fn name() -> &'static str {
        "vehicle_types.txt"
    }
}
