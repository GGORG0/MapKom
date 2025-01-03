use chrono::Utc;

fn main() {
    let timestamp = Utc::now().to_rfc3339();
    println!("cargo:rustc-env=BUILD_TIMESTAMP={}", timestamp);
}
