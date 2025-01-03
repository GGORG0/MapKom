use super::BoolWrapper;
use crate::cities::GtfsFile;
use serde::{Deserialize, Serialize};

/*
variant_id,is_main,equiv_main_variant_id,join_stop_id,disjoin_stop_id
819353,0,839822,,
829864,0,,,
830103,0,839822,,
830543,0,,,
834323,1,,,
834789,0,,,
835253,1,,,
835345,0,,,
835431,0,839822,,
*/

#[derive(Debug, Serialize, Deserialize)]
pub struct WroclawVariant {
    #[serde(rename = "variant_id")]
    pub id: u32,

    #[serde(rename = "is_main")]
    pub is_main: BoolWrapper,

    #[serde(rename = "equiv_main_variant_id")]
    pub main: Option<u32>,
}

impl GtfsFile for WroclawVariant {
    fn name() -> &'static str {
        "variants.txt"
    }
}
