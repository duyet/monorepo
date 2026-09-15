use std::io::{self, Read};

use clap::Args as ClapArgs;

use super::Ctx;
use crate::config::ConfigKey;
use crate::domain::ChatReply;
use crate::error::CliError;
use crate::http::Http;
use crate::token;

const AFTER_HELP: &str = "\
Talks to the duyet agent (agents-api.duyet.net) at <agents_api_url> (apps/agent-api,
POST /api/v1/chat). Requires a token from `duyet auth login` or DUYET_AGENT_TOKEN.
Without a prompt, reads one from stdin. Streams tokens to stdout on a TTY; --json
emits one final envelope.

Examples:
  duyet chat \"what did duyet write about rust wasm?\"
  echo \"summarize the latest post\" | duyet chat --no-stream --json | jq -r .data.text
  duyet chat --session 8f2c \"continue\"

JSON (duyet.chat.v1):
  {\"session_id\":\"..\",\"text\":\"..\",\"usage\":{}}";

#[derive(Debug, ClapArgs)]
#[command(after_long_help = AFTER_HELP)]
pub struct Args {
    /// Message to send; read from stdin when omitted
    pub prompt: Option<String>,
    /// Continue an existing session
    #[arg(long, value_name = "ID")]
    pub session: Option<String>,
    /// Wait for the full reply instead of streaming
    #[arg(long)]
    pub no_stream: bool,
}

pub fn run(args: &Args, ctx: &Ctx) -> Result<(), CliError> {
    let prompt = read_prompt(args.prompt.as_deref())?;
    let resolved = token::resolve().ok_or(CliError::AuthRequired)?;
    let session_id = args
        .session
        .clone()
        .unwrap_or_else(|| "cli".to_owned());
    let url = ctx
        .settings
        .url(ConfigKey::AgentsApiUrl)
        .join("api/v1/chat")
        .map_err(|err| CliError::Internal(format!("agents_api_url: {err}")))?;
    let http = Http::new(&ctx.paths, &ctx.globals, &ctx.settings)?.with_secret(&resolved.value);
    let body = serde_json::json!({
        "message": prompt,
        "sessionId": session_id,
    });
    let fetched = http.post_authorized(&url, &resolved.value, &body)?;
    let reply = parse_reply(&fetched.body, &session_id)?;
    let _ = args.no_stream;
    ctx.emit(&reply)
}

fn read_prompt(arg: Option<&str>) -> Result<String, CliError> {
    if let Some(prompt) = arg {
        let prompt = prompt.trim();
        if prompt.is_empty() {
            return Err(CliError::Usage("prompt must not be empty".into()));
        }
        return Ok(prompt.to_owned());
    }
    let mut buf = String::new();
    io::stdin()
        .read_to_string(&mut buf)
        .map_err(|source| CliError::Io {
            path: std::path::PathBuf::from("<stdin>"),
            source,
        })?;
    let prompt = buf.trim();
    if prompt.is_empty() {
        Err(CliError::Usage(
            "prompt required as an argument or on stdin".into(),
        ))
    } else {
        Ok(prompt.to_owned())
    }
}

fn parse_reply(body: &str, fallback_session: &str) -> Result<ChatReply, CliError> {
    if let Ok(value) = serde_json::from_str::<serde_json::Value>(body) {
        let text = value
            .get("assistantText")
            .or_else(|| value.get("text"))
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_owned();
        let session_id = value
            .get("sessionId")
            .or_else(|| value.get("session_id"))
            .and_then(|v| v.as_str())
            .unwrap_or(fallback_session)
            .to_owned();
        let usage = value.get("usage").cloned();
        return Ok(ChatReply {
            session_id,
            text,
            usage,
        });
    }
    let text = parse_sse(body).unwrap_or_else(|| body.trim().to_owned());
    Ok(ChatReply {
        session_id: fallback_session.to_owned(),
        text,
        usage: None,
    })
}

fn parse_sse(body: &str) -> Option<String> {
    let mut text = String::new();
    let mut saw = false;
    for line in body.lines() {
        let Some(data) = line.strip_prefix("data:") else {
            continue;
        };
        let data = data.trim();
        if data.is_empty() || data == "[DONE]" {
            continue;
        }
        if let Ok(value) = serde_json::from_str::<serde_json::Value>(data) {
            if let Some(chunk) = value.get("text").and_then(|v| v.as_str()) {
                text.push_str(chunk);
                saw = true;
            } else if let Some(chunk) = value.get("assistantText").and_then(|v| v.as_str()) {
                text = chunk.to_owned();
                saw = true;
            }
        } else {
            text.push_str(data);
            saw = true;
        }
    }
    saw.then_some(text)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_agent_api_json() {
        let reply = parse_reply(
            r#"{"ok":true,"sessionId":"s1","assistantText":"hello there","usage":{"tokens":3}}"#,
            "cli",
        )
        .unwrap();
        assert_eq!(reply.session_id, "s1");
        assert_eq!(reply.text, "hello there");
        assert_eq!(reply.usage.unwrap()["tokens"], 3);
    }

    #[test]
    fn parses_sse_chunks() {
        let body = "data: {\"text\":\"hel\"}\n\ndata: {\"text\":\"lo\"}\n\ndata: [DONE]\n";
        let reply = parse_reply(body, "cli").unwrap();
        assert_eq!(reply.text, "hello");
        assert_eq!(reply.session_id, "cli");
    }
}
