use std::io::Cursor;

use exif::{In, Reader, Tag, Value};
use serde::Serialize;
use wasm_bindgen::prelude::*;

#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
struct GpsInfo {
    #[serde(skip_serializing_if = "Option::is_none")]
    latitude: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    longitude: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    altitude: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    latitude_ref: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    longitude_ref: Option<String>,
}

#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
struct ExifResult {
    #[serde(skip_serializing_if = "Option::is_none")]
    make: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    model: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    lens_model: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    exposure_time: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    f_number: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    aperture: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    iso: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    focal_length: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    focal_length_in35mm: Option<u32>,

    #[serde(skip_serializing_if = "Option::is_none")]
    date_time: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    date_time_original: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    date_time_digitized: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    gps: Option<GpsInfo>,

    #[serde(skip_serializing_if = "Option::is_none")]
    orientation: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    width: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    height: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    color_space: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    white_balance: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    software: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    artist: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    copyright: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    user_comment: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    exposure_mode: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    exposure_program: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    metering_mode: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    flash: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    scene_capture_type: Option<String>,
}

/// Extract EXIF metadata from image data (JPEG, PNG, WebP, HEIF, TIFF).
/// Returns a JSON string matching the TypeScript `DetailedExif` interface,
/// or `"null"` if no EXIF data is found.
#[wasm_bindgen]
pub fn extract_exif(data: &[u8]) -> String {
    match extract_exif_inner(data) {
        Some(result) => serde_json::to_string(&result).unwrap_or_else(|_| "null".to_string()),
        None => "null".to_string(),
    }
}

fn extract_exif_inner(data: &[u8]) -> Option<ExifResult> {
    let mut cursor = Cursor::new(data);
    let exif = Reader::new()
        .read_from_container(&mut cursor)
        .ok()?;

    let mut result = ExifResult::default();

    result.make = get_string(&exif, Tag::Make);
    result.model = get_string(&exif, Tag::Model);
    result.lens_model = get_string(&exif, Tag::LensModel);

    result.exposure_time = get_display_value(&exif, Tag::ExposureTime);
    result.f_number = get_rational_as_value(&exif, Tag::FNumber);
    result.aperture = get_display_value(&exif, Tag::ApertureValue);
    result.iso = get_uint(&exif, Tag::PhotographicSensitivity);
    result.focal_length = get_rational_as_value(&exif, Tag::FocalLength);
    result.focal_length_in35mm = get_uint(&exif, Tag::FocalLengthIn35mmFilm);

    result.date_time = get_ascii(&exif, Tag::DateTime);
    result.date_time_original = get_ascii(&exif, Tag::DateTimeOriginal);
    result.date_time_digitized = get_ascii(&exif, Tag::DateTimeDigitized);

    let lat = get_gps_coordinate(&exif, Tag::GPSLatitude);
    let lon = get_gps_coordinate(&exif, Tag::GPSLongitude);
    let alt = get_gps_altitude(&exif);
    if lat.is_some() || lon.is_some() || alt.is_some() {
        result.gps = Some(GpsInfo {
            latitude: lat,
            longitude: lon,
            altitude: alt,
            latitude_ref: get_ascii(&exif, Tag::GPSLatitudeRef),
            longitude_ref: get_ascii(&exif, Tag::GPSLongitudeRef),
        });
    }

    result.orientation = get_uint(&exif, Tag::Orientation);
    result.width = get_uint(&exif, Tag::PixelXDimension);
    result.height = get_uint(&exif, Tag::PixelYDimension);
    result.color_space = get_display_value(&exif, Tag::ColorSpace);
    result.white_balance = get_display_value(&exif, Tag::WhiteBalance);

    result.software = get_string(&exif, Tag::Software);
    result.artist = get_string(&exif, Tag::Artist);
    result.copyright = get_string(&exif, Tag::Copyright);
    result.description = get_string(&exif, Tag::ImageDescription);
    result.user_comment = get_display_value(&exif, Tag::UserComment);

    result.exposure_mode = get_display_value(&exif, Tag::ExposureMode);
    result.exposure_program = get_display_value(&exif, Tag::ExposureProgram);
    result.metering_mode = get_display_value(&exif, Tag::MeteringMode);
    result.flash = get_display_value(&exif, Tag::Flash);
    result.scene_capture_type = get_display_value(&exif, Tag::SceneCaptureType);

    Some(result)
}

fn get_ascii(exif: &exif::Exif, tag: Tag) -> Option<String> {
    let field = exif.get_field(tag, In::PRIMARY)?;
    match &field.value {
        Value::Ascii(vec) if !vec.is_empty() => {
            Some(String::from_utf8_lossy(&vec[0]).trim_end_matches('\0').to_string())
        }
        _ => None,
    }
}

fn get_display_value(exif: &exif::Exif, tag: Tag) -> Option<String> {
    let field = exif.get_field(tag, In::PRIMARY)?;
    Some(field.display_value().to_string())
}

fn get_string(exif: &exif::Exif, tag: Tag) -> Option<String> {
    get_ascii(exif, tag).or_else(|| get_display_value(exif, tag))
}

fn get_uint(exif: &exif::Exif, tag: Tag) -> Option<u32> {
    let field = exif.get_field(tag, In::PRIMARY)?;
    field.value.get_uint(0).map(|v| v as u32)
}

fn rational_to_json_value(f: f64) -> serde_json::Value {
    if f.fract() == 0.0 {
        serde_json::Value::from(f as i64)
    } else {
        serde_json::Value::from(f)
    }
}

fn get_rational_as_value(exif: &exif::Exif, tag: Tag) -> Option<serde_json::Value> {
    let field = exif.get_field(tag, In::PRIMARY)?;
    let f64_val = match &field.value {
        Value::Rational(vec) if !vec.is_empty() => vec[0].to_f64(),
        Value::SRational(vec) if !vec.is_empty() => vec[0].to_f64(),
        _ => return Some(serde_json::Value::String(field.display_value().to_string())),
    };
    Some(rational_to_json_value(f64_val))
}

fn get_gps_coordinate(exif: &exif::Exif, tag: Tag) -> Option<f64> {
    let field = exif.get_field(tag, In::PRIMARY)?;
    match &field.value {
        Value::Rational(vec) if vec.len() >= 3 => {
            Some(vec[0].to_f64() + vec[1].to_f64() / 60.0 + vec[2].to_f64() / 3600.0)
        }
        _ => None,
    }
}

fn get_gps_altitude(exif: &exif::Exif) -> Option<f64> {
    let field = exif.get_field(Tag::GPSAltitude, In::PRIMARY)?;
    match &field.value {
        Value::Rational(vec) if !vec.is_empty() => Some(vec[0].to_f64()),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_exif_no_data() {
        assert_eq!(extract_exif(&[]), "null");
    }

    #[test]
    fn test_extract_exif_invalid_jpeg() {
        assert_eq!(extract_exif(b"\xff\xd8\xff\xd9"), "null");
    }

    #[test]
    fn test_extract_exif_returns_valid_json() {
        let data = b"\xff\xd8\xff\xe1\x00\x08Exif\x00\x00\xff\xd9";
        let parsed: serde_json::Value =
            serde_json::from_str(&extract_exif(data)).expect("should be valid JSON");
        assert!(parsed.is_null() || parsed.is_object());
    }
}
