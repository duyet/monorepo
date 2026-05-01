use std::io::Read;

use serde::Deserialize;

#[derive(Deserialize)]
struct Input {
    input: String,
}

pub fn run() -> Result<(), String> {
    let mut buf = String::new();
    std::io::stdin()
        .read_to_string(&mut buf)
        .map_err(|e| format!("failed to read stdin: {e}"))?;

    let input: Input =
        serde_json::from_str(&buf).map_err(|e| format!("failed to parse input: {e}"))?;

    let parsed_str = duyet_csv_parser::parse_csv(&input.input);
    let parsed: serde_json::Value =
        serde_json::from_str(&parsed_str).map_err(|e| format!("csv parse output invalid: {e}"))?;

    let output = serde_json::json!({"ok": true, "data": parsed});
    println!(
        "{}",
        serde_json::to_string(&output).map_err(|e| format!("serialization failed: {e}"))?
    );

    Ok(())
}
