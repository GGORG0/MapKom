use crate::cities::GtfsFile;
use serde::{Deserialize, Serialize};

/*
stop_id,stop_code,stop_name,stop_lat,stop_lon
25,25314,"BIEŃKOWICE",51.0477088500,17.0910195600
29,21101,"Dyrekcyjna",51.0943013600,17.0322290900
30,10381,"pl. Orląt Lwowskich",51.1071331900,17.0193938800
44,23541,"POŚWIĘCKA (Ośrodek zdrowia)",51.1564994400,17.0320980800
51,29535,"Pawłowice",51.1655438200,17.1063972500
54,29536,"Malwowa",51.1669278700,17.1099854200
65,18343,"Mokrzańska",51.1475429900,16.8531224500
66,90336010,"Wilkszyn - Polna",51.1890493000,16.8661957000
71,18724,"Wilkszyńska",51.1736440100,16.8862201500
*/

#[derive(Debug, Serialize, Deserialize)]
pub struct WroclawStop {
    #[serde(rename = "stop_id")]
    pub id: u32,

    #[serde(rename = "stop_code")]
    pub code: u32,

    #[serde(rename = "stop_name")]
    pub name: String,

    #[serde(rename = "stop_lat")]
    pub lat: f64,

    #[serde(rename = "stop_lon")]
    pub lon: f64,
}

impl GtfsFile for WroclawStop {
    fn name() -> &'static str {
        "stops.txt"
    }
}
