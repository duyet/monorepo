use std::io::Read;

use serde::Deserialize;

#[derive(Deserialize)]
struct Input {
    input: serde_json::Value,
}

pub fn run() -> Result<(), String> {
    let mut buf = String::new();
    std::io::stdin()
        .read_to_string(&mut buf)
        .map_err(|e| format!("failed to read stdin: {e}"))?;

    let input: Input =
        serde_json::from_str(&buf).map_err(|e| format!("failed to parse input: {e}"))?;

    let input_str = serde_json::to_string(&input.input)
        .map_err(|e| format!("failed to serialize input: {e}"))?;

    let result_str = duyet_dedup::merge_all_sources(&input_str);
    let result: serde_json::Value =
        serde_json::from_str(&result_str).map_err(|e| format!("dedup output invalid: {e}"))?;

    let output = serde_json::json!({"ok": true, "data": result});
    println!(
        "{}",
        serde_json::to_string(&output).map_err(|e| format!("serialization failed: {e}"))?
    );

    Ok(())
}
