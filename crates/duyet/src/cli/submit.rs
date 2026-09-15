use std::time::{SystemTime, UNIX_EPOCH};

use sha2::{Digest, Sha256};
use url::Url;

use super::Ctx;
use crate::config::ConfigKey;
use crate::domain::{is_known_post_slug, AcceptedSubmission, Submission};
use crate::error::CliError;
use crate::http::Http;
use crate::term::confirm;

pub fn send(ctx: &Ctx, submission: Submission) -> Result<(), CliError> {
    let payload = submission.api_payload();
    let dest = destination(ctx, submission.path())?;
    print_confirm_preview(&dest, &payload);
    if ctx.globals.dry_run {
        return Ok(());
    }
    confirm("Send?", ctx.globals.yes, &ctx.interactivity)?;

    if let Submission::Comment { post, .. } = &submission {
        ensure_known_post(ctx, post)?;
    }

    let http = Http::new(&ctx.paths, &ctx.globals, &ctx.settings)?;
    let idempotency = idempotency_key(&payload);
    let fetched = http.post_json(&dest, &payload, &idempotency)?;
    let id = parse_id(&fetched.body).ok_or_else(|| {
        CliError::Internal(format!("submission response missing id: {}", fetched.body))
    })?;
    ctx.emit(&AcceptedSubmission {
        id,
        kind: submission.kind(),
        accepted_at: rfc3339_now(),
    })
}

fn destination(ctx: &Ctx, path: &str) -> Result<Url, CliError> {
    ctx.settings
        .url(ConfigKey::ApiUrl)
        .join(path.trim_start_matches('/'))
        .map_err(|err| CliError::Internal(format!("api url: {err}")))
}

fn print_confirm_preview(dest: &Url, payload: &serde_json::Value) {
    let pretty = serde_json::to_string_pretty(payload).unwrap_or_else(|_| payload.to_string());
    eprintln!("POST {dest}");
    eprintln!("{pretty}");
}

fn ensure_known_post(ctx: &Ctx, slug: &str) -> Result<(), CliError> {
    let url = ctx
        .settings
        .url(ConfigKey::BlogUrl)
        .join("posts-data.json")
        .map_err(|err| CliError::Internal(format!("blog url: {err}")))?;
    let http = Http::new(&ctx.paths, &ctx.globals, &ctx.settings)?;
    let fetched = http.get(&url)?;
    if is_known_post_slug(&fetched.body, slug) {
        return Ok(());
    }
    Err(CliError::Http {
        url: slug.to_owned(),
        status: 404,
        request_id: None,
        retry_after: None,
    })
}

fn parse_id(body: &str) -> Option<String> {
    let value: serde_json::Value = serde_json::from_str(body).ok()?;
    value.get("id")?.as_str().map(str::to_owned)
}

fn idempotency_key(payload: &serde_json::Value) -> String {
    let mut hasher = Sha256::new();
    hasher.update(payload.to_string().as_bytes());
    hasher.update(unix_now().to_le_bytes());
    hasher.update(std::process::id().to_le_bytes());
    hasher
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn unix_now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn rfc3339_now() -> String {
    let secs = unix_now();
    let (year, month, day, hour, min, sec) = civil_utc(secs);
    format!("{year:04}-{month:02}-{day:02}T{hour:02}:{min:02}:{sec:02}Z")
}

fn civil_utc(secs: u64) -> (i32, u32, u32, u32, u32, u32) {
    let sec = (secs % 60) as u32;
    let mins = secs / 60;
    let min = (mins % 60) as u32;
    let hours = mins / 60;
    let hour = (hours % 24) as u32;
    let mut days = hours / 24;
    let mut year: i32 = 1970;
    loop {
        let length = if is_leap(year) { 366 } else { 365 };
        if days < length {
            break;
        }
        days -= length;
        year += 1;
    }
    let month_lengths = [
        31,
        if is_leap(year) { 29 } else { 28 },
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ];
    let mut month = 1u32;
    for length in month_lengths {
        if days < length {
            break;
        }
        days -= length;
        month += 1;
    }
    (year, month, (days as u32) + 1, hour, min, sec)
}

fn is_leap(year: i32) -> bool {
    year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)
}
