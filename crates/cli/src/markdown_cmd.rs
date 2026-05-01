use std::io::Read;

use serde::Deserialize;

#[derive(Deserialize)]
struct Input {
    input: Vec<Item>,
}

#[derive(Deserialize)]
struct Item {
    markdown: String,
}

pub fn run() -> Result<(), String> {
    let mut buf = String::new();
    std::io::stdin()
        .read_to_string(&mut buf)
        .map_err(|e| format!("failed to read stdin: {e}"))?;

    let input: Input =
        serde_json::from_str(&buf).map_err(|e| format!("failed to parse input: {e}"))?;

    let results: Vec<String> = input
        .input
        .iter()
        .map(|item| duyet_markdown::markdown_to_html(&item.markdown))
        .collect();

    let output = serde_json::json!({"ok": true, "data": results});
    println!(
        "{}",
        serde_json::to_string(&output).map_err(|e| format!("serialization failed: {e}"))?
    );

    Ok(())
}
