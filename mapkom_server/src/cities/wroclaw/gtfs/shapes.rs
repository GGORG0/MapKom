use crate::cities::GtfsFile;
use serde::{Deserialize, Serialize};

/*
shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence
805593,51.065716101056,16.987155455895,0
805593,51.065657586435,16.987255685753,1
805593,51.065644983276,16.987287186565,2
805593,51.065632380113,16.987318687378,3
805593,51.065620677174,16.987351620046,4
805593,51.065614375590,16.987377393438,5
805593,51.065608974231,16.987403166830,6
805593,51.065605373325,16.987430372077,7
805593,51.065602672646,16.987459009179,8
*/

#[derive(Debug, Serialize, Deserialize)]
pub struct WroclawShape {
    #[serde(rename = "shape_id")]
    pub id: u32,

    #[serde(rename = "shape_pt_lon")]
    pub x: f64,

    #[serde(rename = "shape_pt_lat")]
    pub y: f64,

    #[serde(rename = "shape_pt_sequence")]
    pub sequence: u32,
}

impl GtfsFile for WroclawShape {
    fn name() -> &'static str {
        "shapes.txt"
    }
}
