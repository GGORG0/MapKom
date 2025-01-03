use crate::cities::GtfsFile;
use serde::{Deserialize, Serialize};

/*
route_id,agency_id,route_short_name,route_long_name,route_desc,route_type,route_type2_id,valid_from,valid_until
A,2,"A","","KOSZAROWA (SZPITAL) - Koszarowa - Berenta - Aleja Kromera - Wyszyńskiego - pl. Powstańców Warszawy - Oławska - Podwale - Świdnicka - Krucza - Inżynierska - Hallera - Grabiszyńska - Solskiego - Aleja Piastów - Racławicka - Skarbowców - Sowia - Karkonoska - KRZYKI|KRZYKI - Sowia - Skarbowców - Racławicka - Aleja Piastów - Solskiego - Grabiszyńska - Hallera - Aleja Pracy - Inżynierska - Krucza - Wielka - Świdnicka - Kościuszki - Krasińskiego - pl. Powstańców Warszawy - Wyszyńskiego - Boya-Żeleńskiego - Berenta - Kasprowicza - Czajkowskiego - Koszarowa - KOSZAROWA (SZPITAL)",3,35,"2024-10-19","2999-01-01"
D,2,"D","","OSIEDLE SOBIESKIEGO - Królewska - Bora-Komorowskiego - Krzywoustego - Brücknera - Kochanowskiego - rondo Reagana - pl. Grunwaldzki - Oławska - Piotra Skargi - Podwale - Świdnicka - Powstańców Śląskich - Krzycka - Wałbrzyska - Karmelkowa - Giełdowa - GIEŁDOWA (CENTRUM HURTU)|GIEŁDOWA (CENTRUM HURTU) - Karmelkowa - Wałbrzyska - Krzycka - Powstańców Śląskich - Świdnicka - Oławska - pl. Powstańców Warszawy - pl. Grunwaldzki - rondo Reagana - Kochanowskiego - Brücknera - Krzywoustego - Bora-Komorowskiego - Królewska - OSIEDLE SOBIESKIEGO",3,35,"2024-12-21","2999-01-01"
K,2,"K","","GAJ - PĘTLA - Świeradowska - Borowska - Peronowa - Kazimierza Wielkiego - Pomorska - Reymonta - Osobowicka - Łużycka - Bezpieczna - Obornicka - Broniewskiego - Żmigrodzka - Kamieńskiego - KAMIEŃSKIEGO (PĘTLA)|KAMIEŃSKIEGO (PĘTLA) - Żmigrodzka - Broniewskiego - Obornicka - Bezpieczna - Łużycka - Osobowicka - Reymonta - Pomorska - Nowy Świat - Kazimierza Wielkiego - Piotra Skargi - Peronowa - Ślężna - Borowska - Świeradowska - GAJ - PĘTLA|KAMIEŃSKIEGO (PĘTLA) - Kamieńskiego - Żmigrodzka - Broniewskiego - Obornicka - Bezpieczna - Łużycka - Osobowicka - Reymonta - Pomorska - Nowy Świat - Kazimierza Wielkiego - Piotra Skargi - Peronowa - Ślężna - Borowska - Świeradowska - GAJ - PĘTLA",3,35,"2024-12-21","2999-01-01"
N,2,"N","","LITEWSKA - Litewska - Żmudzka - Kiełczowska - Krzywoustego - Aleja Kromera - Wyszyńskiego - pl. Powstańców Warszawy - Oławska - Piotra Skargi - Peronowa - Ślężna - Petrusewicza - PETRUSEWICZA|PETRUSEWICZA - Borowska - Peronowa - Oławska - pl. Powstańców Warszawy - Wyszyńskiego - Aleja Kromera - Krzywoustego - Kiełczowska - Żmudzka - Litewska - LITEWSKA",3,35,"2024-12-21","2999-01-01"
0,3,"0","","ZOO - Wróblewskiego - rondo Reagana - pl. Grunwaldzki - pl. Powstańców Warszawy - Traugutta - Pułaskiego - Małachowskiego - Piłsudskiego - DWORZEC GŁÓWNY|DWORZEC GŁÓWNY - Świdnicka - pl. Teatralny - Widok - Szewska - Drobnera - Sienkiewicza - Wyszyńskiego - Szczytnicka - rondo Reagana - Wróblewskiego - ZOO",0,31,"2024-12-21","2999-01-01"
2,3,"2","","KRZYKI - Karkonoska - Powstańców Śląskich - pl. Powstańców Śląskich - Powstańców Śląskich - Świdnicka - Piłsudskiego - Kołłątaja - Oławska - pl. Powstańców Warszawy - Wyszyńskiego - Szczytnicka - rondo Reagana - Wróblewskiego - Olszewskiego - BISKUPIN|BISKUPIN - Wróblewskiego - rondo Reagana - Wyszyńskiego - pl. Powstańców Warszawy - Oławska - Skargi - Kołłątaja - Piłsudskiego - Powstańców Śląskich - Karkonoska - KRZYKI",0,31,"2024-12-21","2999-01-01"
3,3,"3","","LEŚNICA - Średzka - Kosmonautów - Lotnicza - Legnicka - Kazimierza Wielkiego - Oławska - Traugutta - Krakowska - Opolska - KSIĘŻE MAŁE|KSIĘŻE MAŁE - Krakowska - Traugutta - Oławska - Kazimierza Wielkiego - Legnicka - Lotnicza - Kosmonautów - Średzka - LEŚNICA",0,31,"2024-12-21","2999-01-01"
4,3,"4","","BISKUPIN - Olszewskiego - Wróblewskiego - rondo Reagana - pl. Grunwaldzki - pl. Powstańców Warszawy - Traugutta - Pułaskiego - Małachowskiego - Piłsudskiego - Grabiszyńska - OPORÓW|OPORÓW - Piłsudskiego - Małachowskiego - Pułaskiego - Traugutta - pl. Powstańców Warszawy - pl. Grunwaldzki - rondo Reagana - Wróblewskiego - Olszewskiego - BISKUPIN",0,31,"2024-12-21","2999-01-01"
5,3,"5","","GRABISZYŃSKA (CMENTARZ) - Grabiszyńska - Piłsudskiego - Kołłątaja - Oławska - Traugutta - Krakowska - Opolska - KSIĘŻE MAŁE|KSIĘŻE MAŁE - Krakowska - Traugutta - Oławska - Skargi - Kołłątaja - Piłsudskiego - Grabiszyńska - GRABISZYŃSKA (CMENTARZ)",0,31,"2024-12-21","2999-01-01"
*/

#[derive(Debug, Serialize, Deserialize)]
pub struct WroclawRoute {
    #[serde(rename = "route_id")]
    pub id: String,

    #[serde(rename = "agency_id")]
    pub agency_id: u32,

    #[serde(rename = "route_desc")]
    pub description: String,

    #[serde(rename = "route_type")]
    pub type_id: u32,

    #[serde(rename = "route_type2_id")]
    pub type2_id: u32,
}

impl GtfsFile for WroclawRoute {
    fn name() -> &'static str {
        "routes.txt"
    }
}
