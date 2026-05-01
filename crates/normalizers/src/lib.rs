use std::collections::HashMap;
use std::sync::OnceLock;
use regex::Regex;
use wasm_bindgen::prelude::*;

fn month_map() -> &'static HashMap<&'static str, &'static str> {
    static M: OnceLock<HashMap<&str, &str>> = OnceLock::new();
    M.get_or_init(|| {
        let mut m = HashMap::new();
        m.insert("january", "01");
        m.insert("february", "02");
        m.insert("march", "03");
        m.insert("april", "04");
        m.insert("may", "05");
        m.insert("june", "06");
        m.insert("july", "07");
        m.insert("august", "08");
        m.insert("september", "09");
        m.insert("october", "10");
        m.insert("november", "11");
        m.insert("december", "12");
        m.insert("jan", "01");
        m.insert("feb", "02");
        m.insert("mar", "03");
        m.insert("apr", "04");
        m.insert("jun", "06");
        m.insert("jul", "07");
        m.insert("aug", "08");
        m.insert("sep", "09");
        m.insert("oct", "10");
        m.insert("nov", "11");
        m.insert("dec", "12");
        m
    })
}

macro_rules! re {
    ($pattern:expr) => {{
        static RE: OnceLock<Regex> = OnceLock::new();
        RE.get_or_init(|| Regex::new($pattern).unwrap())
    }};
}

/// Normalize a raw date string into YYYY-MM-DD format.
/// Returns empty string for unparseable/TBA/TBD inputs (caller maps to null).
#[wasm_bindgen]
pub fn normalize_date(raw: &str) -> String {
    let s = raw.trim();
    if s.is_empty() || s.eq_ignore_ascii_case("tba") || s.eq_ignore_ascii_case("tbd") || s == "-" {
        return String::new();
    }

    if re!(r"^\d{4}-\d{2}-\d{2}$").is_match(s) {
        return s.to_string();
    }

    if let Some(caps) = re!(r"^(\d{4}-\d{2}-\d{2})T").captures(s) {
        return caps[1].to_string();
    }

    if re!(r"^\d{4}-\d{2}$").is_match(s) {
        return format!("{}-01", s);
    }

    if re!(r"^\d{4}$").is_match(s) {
        return format!("{}-01-01", s);
    }

    if let Some(caps) = re!(r"(?i)Q([1-4])[\s/]+(20\d{2})").captures(s) {
        let q: u32 = caps[1].parse().unwrap();
        let y = &caps[2];
        let month = (q - 1) * 3 + 1;
        return format!("{}-{:02}-01", y, month);
    }

    let mmap = month_map();

    if let Some(caps) = re!(r"(?i)^([a-z]{3,})/(20\d{2})$").captures(s) {
        let month_name = caps[1].to_lowercase();
        if let Some(&month) = mmap.get(month_name.as_str()) {
            return format!("{}-{}-01", &caps[2], month);
        }
    }

    if let Some(caps) = re!(r"(?i)^([a-z]+)[,.\s]+(20\d{2})$").captures(s) {
        let month_name = caps[1].to_lowercase();
        if let Some(&month) = mmap.get(month_name.as_str()) {
            return format!("{}-{}-01", &caps[2], month);
        }
    }

    if let Some(caps) = re!(r"(?i)^(20\d{2})[,.\s]+([a-z]+)$").captures(s) {
        let month_name = caps[2].to_lowercase();
        if let Some(&month) = mmap.get(month_name.as_str()) {
            return format!("{}-{}-01", &caps[1], month);
        }
    }

    String::new()
}

/// Normalize parameter count strings.
/// Returns empty string for unknown/n/a (caller maps to null).
#[wasm_bindgen]
pub fn normalize_params(raw: &str) -> String {
    let s = raw.trim();
    let lower = s.to_lowercase();
    if lower.is_empty()
        || lower == "unknown"
        || lower == "n/a"
        || lower == "-"
        || lower == "tbd"
        || lower == "tba"
    {
        return String::new();
    }

    if re!(r"^[~<>≈]?\d+(\.\d+)?[bBtTmMkK]").is_match(s) {
        return s.to_string();
    }

    if re!(r"^\d+(\.\d+)?[bBtTmMkK]-[aA]\d+(\.\d+)?[bBtTmMkK]").is_match(s) {
        return s.to_string();
    }

    if let Some(caps) = re!(r"(?i)^([~<>≈]?\d+(?:\.\d+)?)\s*(billion|trillion|million|thousand|b|t|m|k)").captures(&lower) {
        let num = &caps[1];
        let unit = &caps[2];
        let suffix = match unit {
            "billion" | "b" => "B",
            "trillion" | "t" => "T",
            "million" | "m" => "M",
            "thousand" | "k" => "K",
            _ => "B",
        };
        return format!("{}{}", num, suffix);
    }

    if let Some(caps) = re!(r"^(\d+(?:\.\d+)?)$").captures(&lower) {
        if let Ok(n) = caps[1].parse::<f64>() {
            if n > 0.0 {
                return format!("{}B", n);
            }
        }
    }

    if s.is_empty() { String::new() } else { s.to_string() }
}

/// Normalize license/accessibility string to standard type.
#[wasm_bindgen]
pub fn normalize_license(raw: &str) -> String {
    let s = raw.trim();

    if s.contains('\u{1f7e2}') { return "open".to_string(); }
    if s.contains('\u{1f534}') { return "closed".to_string(); }
    if s.contains('\u{1f7e1}') || s.contains('\u{1f7e0}') {
        return "partial".to_string();
    }

    let lower = s.to_lowercase();

    if re!(r"(?i)open|apache|mit|gpl|lgpl|bsd|cc|creative|llama.?license").is_match(&lower) {
        return "open".to_string();
    }
    if re!(r"(?i)partial|research|non.commercial|limited|restricted|community").is_match(&lower) {
        return "partial".to_string();
    }
    if re!(r"(?i)yes|public|true").is_match(&lower) {
        return "open".to_string();
    }
    if re!(r"(?i)no|private|false|closed|proprietary").is_match(&lower) {
        return "closed".to_string();
    }

    "closed".to_string()
}

/// Map accessibility string to license type (Epoch.ai format).
#[wasm_bindgen]
pub fn map_accessibility(accessibility: &str) -> String {
    let s = accessibility.trim().to_lowercase();

    if s.contains("open") || s.contains("public") || s == "yes" || s == "true" {
        return "open".to_string();
    }
    if s.contains("closed") || s.contains("private") || s == "no" || s == "false" {
        return "closed".to_string();
    }
    if s.contains("partial") || s.contains("research") || s.contains("limited") {
        return "partial".to_string();
    }

    "closed".to_string()
}

/// Normalize model type string.
#[wasm_bindgen]
pub fn normalize_type(raw: &str) -> String {
    let s = raw.trim().to_lowercase();
    if re!(r"(?i)milestone|event|paper|architecture|announcement|breakthrough").is_match(&s) {
        "milestone".to_string()
    } else {
        "model".to_string()
    }
}

/// Normalize text: collapse whitespace, trim.
#[wasm_bindgen]
pub fn normalize_text(raw: &str) -> String {
    let step1 = re!(r"[\n\r]").replace_all(raw, " ");
    let trimmed = step1.trim();
    re!(r"\s+").replace_all(trimmed, " ").to_string()
}

/// Convert parameter count from float to readable format.
/// Returns empty string for zero/invalid inputs.
#[wasm_bindgen]
pub fn convert_numeric_params(float_value: &str) -> String {
    if float_value.is_empty() || float_value == "0" {
        return String::new();
    }

    let num: f64 = match float_value.parse() {
        Ok(n) => n,
        Err(_) => return String::new(),
    };

    if num == 0.0 || num.is_nan() {
        return String::new();
    }

    if num >= 1e12 {
        let t = num / 1e12;
        return if t == t.floor() {
            format!("{}T", t as u64)
        } else {
            format!("{:.1}T", t)
        };
    }
    if num >= 1e9 {
        let b = num / 1e9;
        return if b == b.floor() {
            format!("{}B", b as u64)
        } else {
            format!("{:.1}B", b)
        };
    }
    if num >= 1e6 {
        let m = num / 1e6;
        return if m == m.floor() {
            format!("{}M", m as u64)
        } else {
            format!("{:.1}M", m)
        };
    }
    if num >= 1e3 {
        let k = num / 1e3;
        return if k == k.floor() {
            format!("{}K", k as u64)
        } else {
            format!("{:.1}K", k)
        };
    }

    format!("{}", num.floor() as u64)
}

/// Format a FLOP count as a readable string.
#[wasm_bindgen]
pub fn format_training_compute(flop: f64) -> String {
    if flop >= 1e15 {
        let exp = flop.log10().floor() as i32;
        let mantissa = flop / 10f64.powi(exp);
        if (mantissa - 1.0).abs() < f64::EPSILON {
            format!("1e{}", exp)
        } else {
            format!("{:.1}e{}", mantissa, exp)
        }
    } else {
        format!("{}", flop)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_date_yyyy_mm_dd() {
        assert_eq!(normalize_date("2024-01-15"), "2024-01-15");
    }

    #[test]
    fn test_normalize_date_iso_datetime() {
        assert_eq!(normalize_date("2024-01-15T00:00:00"), "2024-01-15");
    }

    #[test]
    fn test_normalize_date_yyyy_mm() {
        assert_eq!(normalize_date("2024-01"), "2024-01-01");
    }

    #[test]
    fn test_normalize_date_year_only() {
        assert_eq!(normalize_date("2024"), "2024-01-01");
    }

    #[test]
    fn test_normalize_date_quarter() {
        assert_eq!(normalize_date("Q1 2024"), "2024-01-01");
        assert_eq!(normalize_date("Q2 2024"), "2024-04-01");
        assert_eq!(normalize_date("Q3 2024"), "2024-07-01");
        assert_eq!(normalize_date("Q4 2024"), "2024-10-01");
    }

    #[test]
    fn test_normalize_date_slash_month() {
        assert_eq!(normalize_date("Feb/2026"), "2026-02-01");
    }

    #[test]
    fn test_normalize_date_month_year() {
        assert_eq!(normalize_date("Jan 2024"), "2024-01-01");
        assert_eq!(normalize_date("January 2024"), "2024-01-01");
        assert_eq!(normalize_date("Jan, 2024"), "2024-01-01");
    }

    #[test]
    fn test_normalize_date_reverse() {
        assert_eq!(normalize_date("2024 Jan"), "2024-01-01");
    }

    #[test]
    fn test_normalize_date_tba() {
        assert_eq!(normalize_date("TBA"), "");
        assert_eq!(normalize_date("TBD"), "");
        assert_eq!(normalize_date("-"), "");
        assert_eq!(normalize_date(""), "");
    }

    #[test]
    fn test_normalize_params_compact() {
        assert_eq!(normalize_params("175B"), "175B");
        assert_eq!(normalize_params("1.8T"), "1.8T");
        assert_eq!(normalize_params("~45B"), "~45B");
    }

    #[test]
    fn test_normalize_params_compound() {
        assert_eq!(normalize_params("230B-A10B"), "230B-A10B");
    }

    #[test]
    fn test_normalize_params_word() {
        assert_eq!(normalize_params("175 billion"), "175B");
        assert_eq!(normalize_params("1.8 trillion"), "1.8T");
        assert_eq!(normalize_params("70 million"), "70M");
    }

    #[test]
    fn test_normalize_params_plain_number() {
        assert_eq!(normalize_params("175"), "175B");
    }

    #[test]
    fn test_normalize_params_unknown() {
        assert_eq!(normalize_params("unknown"), "");
        assert_eq!(normalize_params("n/a"), "");
        assert_eq!(normalize_params("-"), "");
    }

    #[test]
    fn test_normalize_license_open() {
        assert_eq!(normalize_license("Apache 2.0"), "open");
        assert_eq!(normalize_license("MIT"), "open");
        assert_eq!(normalize_license("Yes"), "open");
    }

    #[test]
    fn test_normalize_license_closed() {
        assert_eq!(normalize_license("No"), "closed");
        assert_eq!(normalize_license("Proprietary"), "closed");
    }

    #[test]
    fn test_normalize_license_partial() {
        assert_eq!(normalize_license("Research only"), "partial");
        assert_eq!(normalize_license("Non-commercial"), "partial");
    }

    #[test]
    fn test_normalize_license_default() {
        assert_eq!(normalize_license(""), "closed");
        assert_eq!(normalize_license("something"), "closed");
    }

    #[test]
    fn test_map_accessibility() {
        assert_eq!(map_accessibility("Open access"), "open");
        assert_eq!(map_accessibility("Closed"), "closed");
        assert_eq!(map_accessibility("Research"), "partial");
        assert_eq!(map_accessibility(""), "closed");
    }

    #[test]
    fn test_normalize_type() {
        assert_eq!(normalize_type("milestone"), "milestone");
        assert_eq!(normalize_type("event"), "milestone");
        assert_eq!(normalize_type("paper"), "milestone");
        assert_eq!(normalize_type("model"), "model");
        assert_eq!(normalize_type("llm"), "model");
    }

    #[test]
    fn test_normalize_text() {
        assert_eq!(normalize_text("  hello\nworld  "), "hello world");
        assert_eq!(normalize_text("a   b"), "a b");
    }

    #[test]
    fn test_convert_numeric_params() {
        assert_eq!(convert_numeric_params("175000000000"), "175B");
        assert_eq!(convert_numeric_params("1000000000"), "1B");
        assert_eq!(convert_numeric_params("1500000000"), "1.5B");
        assert_eq!(convert_numeric_params("0"), "");
        assert_eq!(convert_numeric_params(""), "");
    }

    #[test]
    fn test_convert_numeric_params_trillion() {
        assert_eq!(convert_numeric_params("1800000000000"), "1.8T");
        assert_eq!(convert_numeric_params("1000000000000"), "1T");
    }

    #[test]
    fn test_convert_numeric_params_million() {
        assert_eq!(convert_numeric_params("700000000"), "700M");
        assert_eq!(convert_numeric_params("1500000"), "1.5M");
    }

    #[test]
    fn test_convert_numeric_params_thousand() {
        assert_eq!(convert_numeric_params("5000"), "5K");
        assert_eq!(convert_numeric_params("1500"), "1.5K");
    }

    #[test]
    fn test_format_training_compute() {
        assert_eq!(format_training_compute(1.2e25), "1.2e25");
        assert_eq!(format_training_compute(1e25), "1e25");
        assert_eq!(format_training_compute(1e10), "10000000000");
    }
}
