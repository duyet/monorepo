use std::io::Read;

use serde::Deserialize;

#[derive(Deserialize)]
struct Input {
    input: Vec<Op>,
}

#[derive(Deserialize)]
struct Op {
    #[serde(rename = "fn")]
    op_fn: String,
    args: Vec<serde_json::Value>,
}

pub fn run() -> Result<(), String> {
    let mut buf = String::new();
    std::io::stdin()
        .read_to_string(&mut buf)
        .map_err(|e| format!("failed to read stdin: {e}"))?;

    let input: Input =
        serde_json::from_str(&buf).map_err(|e| format!("failed to parse input: {e}"))?;

    let results: Vec<serde_json::Value> = input
        .input
        .iter()
        .map(|op| dispatch(op))
        .collect::<Result<Vec<_>, _>>()?;

    let output = serde_json::json!({"ok": true, "data": results});
    println!(
        "{}",
        serde_json::to_string(&output).map_err(|e| format!("serialization failed: {e}"))?
    );

    Ok(())
}

fn dispatch(op: &Op) -> Result<serde_json::Value, String> {
    match op.op_fn.as_str() {
        "normalize_date" => {
            let arg = args_str(&op.args, 0)?;
            Ok(serde_json::Value::String(duyet_normalizers::normalize_date(
                &arg,
            )))
        }
        "normalize_params" => {
            let arg = args_str(&op.args, 0)?;
            Ok(serde_json::Value::String(
                duyet_normalizers::normalize_params(&arg),
            ))
        }
        "normalize_license" => {
            let arg = args_str(&op.args, 0)?;
            Ok(serde_json::Value::String(
                duyet_normalizers::normalize_license(&arg),
            ))
        }
        "map_accessibility" => {
            let arg = args_str(&op.args, 0)?;
            Ok(serde_json::Value::String(
                duyet_normalizers::map_accessibility(&arg),
            ))
        }
        "normalize_type" => {
            let arg = args_str(&op.args, 0)?;
            Ok(serde_json::Value::String(duyet_normalizers::normalize_type(
                &arg,
            )))
        }
        "normalize_text" => {
            let arg = args_str(&op.args, 0)?;
            Ok(serde_json::Value::String(duyet_normalizers::normalize_text(
                &arg,
            )))
        }
        "convert_numeric_params" => {
            let arg = args_str(&op.args, 0)?;
            Ok(serde_json::Value::String(
                duyet_normalizers::convert_numeric_params(&arg),
            ))
        }
        "format_training_compute" => {
            let arg = args_f64(&op.args, 0)?;
            Ok(serde_json::Value::String(
                duyet_normalizers::format_training_compute(arg),
            ))
        }
        other => Err(format!("unknown function: {other}")),
    }
}

fn args_str(args: &[serde_json::Value], index: usize) -> Result<String, String> {
    args.get(index)
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| format!("args[{index}] must be a string"))
}

fn args_f64(args: &[serde_json::Value], index: usize) -> Result<f64, String> {
    args.get(index)
        .and_then(|v| v.as_f64())
        .ok_or_else(|| format!("args[{index}] must be a number"))
}
