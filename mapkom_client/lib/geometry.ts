// using snake_case for interfaces to match the rust backend's types

export interface Point {
  lat: number;
  lng: number;
}

export interface Area {
  north_west: Point;
  south_east: Point;
}
