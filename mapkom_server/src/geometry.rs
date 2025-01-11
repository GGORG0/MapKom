pub mod point {
    use super::area::Area;
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize, Debug, Clone, Copy, Default, PartialEq)]
    pub struct Point {
        pub lat: f64,
        pub lng: f64,
    }

    impl Point {
        pub fn new(lat: f64, lng: f64) -> Self {
            Self { lat, lng }
        }

        pub fn distance(&self, other: &Self) -> f64 {
            ((self.lat - other.lat).powi(2) + (self.lng - other.lng).powi(2)).sqrt()
        }

        pub fn in_area(&self, area: &Area) -> bool {
            area.contains(self)
        }

        pub fn in_area_with_margin(&self, area: &Area, margin_percent: f64) -> bool {
            area.contains_with_margin(self, margin_percent)
        }

        pub fn angle_to(&self, other: &Self) -> f64 {
            use std::f64::consts::PI;

            fn to_radians(deg: f64) -> f64 {
                deg * PI / 180.0
            }

            fn to_degrees(rad: f64) -> f64 {
                rad * 180.0 / PI
            }

            let phi1 = to_radians(self.lat);
            let phi2 = to_radians(other.lat);
            let delta_lambda = to_radians(other.lng - self.lng);

            let y = delta_lambda.sin() * phi2.cos();
            let x = phi1.cos() * phi2.sin() - phi1.sin() * phi2.cos() * delta_lambda.cos();
            let theta = y.atan2(x);

            (to_degrees(theta) + 360.0) % 360.0
        }
    }

    impl From<(f64, f64)> for Point {
        fn from((lat, lng): (f64, f64)) -> Self {
            Self::new(lat, lng)
        }
    }

    impl From<Point> for (f64, f64) {
        fn from(point: Point) -> Self {
            (point.lat, point.lng)
        }
    }
}

pub mod area {
    use super::point::Point;
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize, Debug, Clone, Copy, Default, PartialEq)]
    pub struct Area {
        pub north_west: Point,
        pub south_east: Point,
    }

    impl Area {
        pub fn new(north_west: Point, south_east: Point) -> Self {
            Self {
                north_west,
                south_east,
            }
        }

        pub fn contains(&self, point: &Point) -> bool {
            (self.south_east.lat..=self.north_west.lat).contains(&point.lat)
                && (self.north_west.lng..=self.south_east.lng).contains(&point.lng)
        }

        pub fn contains_with_margin(&self, point: &Point, margin_percent: f64) -> bool {
            let margin_lat = (self.north_west.lat - self.south_east.lat).abs() * margin_percent;
            let margin_lng = (self.south_east.lng - self.north_west.lng).abs() * margin_percent;

            let north_west = Point::new(
                self.north_west.lat + margin_lat,
                self.north_west.lng - margin_lng,
            );
            let south_east = Point::new(
                self.south_east.lat - margin_lat,
                self.south_east.lng + margin_lng,
            );

            Area::new(north_west, south_east).contains(point)
        }
    }

    impl From<(Point, Point)> for Area {
        fn from((north_west, south_east): (Point, Point)) -> Self {
            Self::new(north_west, south_east)
        }
    }

    impl From<(f64, f64, f64, f64)> for Area {
        fn from((north, west, south, east): (f64, f64, f64, f64)) -> Self {
            Self::new(Point::new(north, west), Point::new(south, east))
        }
    }

    impl From<((f64, f64), (f64, f64))> for Area {
        fn from(((north, west), (south, east)): ((f64, f64), (f64, f64))) -> Self {
            Self::new(Point::new(north, west), Point::new(south, east))
        }
    }

    impl From<Area> for (Point, Point) {
        fn from(area: Area) -> Self {
            (area.north_west, area.south_east)
        }
    }

    impl From<Area> for (f64, f64, f64, f64) {
        fn from(area: Area) -> Self {
            (
                area.north_west.lat,
                area.north_west.lng,
                area.south_east.lat,
                area.south_east.lng,
            )
        }
    }

    impl From<Area> for ((f64, f64), (f64, f64)) {
        fn from(area: Area) -> Self {
            (
                (area.north_west.lat, area.north_west.lng),
                (area.south_east.lat, area.south_east.lng),
            )
        }
    }
}
