use crate::cities::GtfsFile;
use color_eyre::Result;
use serde::{Deserialize, Deserializer, Serialize};

/*
agency_id,agency_name,agency_url,agency_timezone,agency_phone,agency_lang
2,MPK Autobusy,http://www.mpk.wroc.pl,Europe/Warsaw,71 308 50 30,pl
3,MPK Tramwaje,http://www.mpk.wroc.pl,Europe/Warsaw,71 308 50 30,pl
5,DLA Wisznia Mała,http://www.dla.com.pl,Europe/Warsaw,71 782 81 31,pl
11,DLA Miękinia,http://www.dla.com.pl,Europe/Warsaw,71 782 81 31,pl
15,KŁOSOK Długołęka,http://www.klosok.eu,Europe/Warsaw,792700440,pl
17,DLA Długołęka,http://www.dla.com.pl,Europe/Warsaw,71 782 81 31,pl
18,KŁOSOK Wisznia Mała,http://www.klosok.eu,Europe/Warsaw,792700440,pl
19,DLA 5 Gmin,http://www.dla.com.pl,Europe/Warsaw,71 782 81 31,pl
*/

fn deserialize_phone<'de, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'de>,
{
    let s: String = Deserialize::deserialize(deserializer)?;
    Ok(s.replace(" ", ""))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WroclawAgency {
    #[serde(rename = "agency_id")]
    pub id: u32,

    #[serde(rename = "agency_name")]
    pub name: String,

    #[serde(rename = "agency_url")]
    pub url: String,

    #[serde(rename = "agency_phone", deserialize_with = "deserialize_phone")]
    pub phone: String,
}

impl GtfsFile for WroclawAgency {
    fn name() -> &'static str {
        "agency.txt"
    }
}
