use std::collections::BTreeMap;
use std::io::{self, Write};
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::config::{Channel, Severity, Source};
use crate::http::{Probe, ProbeStatus};
use crate::output::{Render, Style, table};

#[derive(Debug, Serialize)]
pub struct VersionInfo {
    pub version: &'static str,
    pub target: &'static str,
    pub channel: Channel,
    pub commit: &'static str,
}

impl Render for VersionInfo {
    const SCHEMA: &'static str = "duyet.version.v1";

    fn human(&self, out: &mut dyn Write, _style: &Style) -> io::Result<()> {
        writeln!(out, "duyet {}", self.version)?;
        writeln!(out, "target:  {}", self.target)?;
        writeln!(out, "channel: {}", self.channel)?;
        writeln!(out, "commit:  {}", self.commit)
    }
}

/// Whether an agent token is configured. The token value never enters this type.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TokenState {
    Set,
    Unset,
}

impl TokenState {
    pub fn from_env(var: &str) -> TokenState {
        match std::env::var_os(var) {
            Some(value) if !value.is_empty() => TokenState::Set,
            Some(_) | None => TokenState::Unset,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct DoctorReport {
    pub config_path: PathBuf,
    pub config_exists: bool,
    pub cache_dir: PathBuf,
    pub endpoints: Vec<Probe>,
    pub agent_token: TokenState,
    pub telemetry: bool,
    pub offline: bool,
}

impl Render for DoctorReport {
    const SCHEMA: &'static str = "duyet.doctor.v1";

    fn human(&self, out: &mut dyn Write, style: &Style) -> io::Result<()> {
        let exists = if self.config_exists {
            ""
        } else {
            " (not created yet)"
        };
        writeln!(
            out,
            "config:  {}{}",
            self.config_path.display(),
            style.dim(exists)
        )?;
        writeln!(out, "cache:   {}", self.cache_dir.display())?;
        writeln!(
            out,
            "token:   {}",
            match self.agent_token {
                TokenState::Set => "set (DUYET_AGENT_TOKEN)",
                TokenState::Unset => "unset",
            }
        )?;
        writeln!(
            out,
            "telemetry: {} (nothing is sent in this release)",
            if self.telemetry { "on" } else { "off" }
        )?;
        writeln!(
            out,
            "endpoints{}:",
            if self.offline { " (offline)" } else { "" }
        )?;
        for probe in &self.endpoints {
            let (mark, detail) = match &probe.status {
                ProbeStatus::Reachable { status } => (style.mark_ok(), format!("HTTP {status}")),
                ProbeStatus::Unreachable { message } => (style.mark_fail(), message.clone()),
                ProbeStatus::Skipped { reason } => {
                    (style.mark_skip(), format!("skipped ({reason})"))
                }
            };
            let latency = probe
                .latency_ms
                .map(|ms| style.dim(&format!(" {ms}ms")))
                .unwrap_or_default();
            writeln!(out, "  {mark} {}  {detail}{latency}", probe.url)?;
        }
        Ok(())
    }
}

#[derive(Debug, Serialize)]
pub struct ConfigEntry {
    pub value: String,
    pub source: Source,
}

#[derive(Debug, Serialize)]
pub struct ConfigReport {
    pub path: PathBuf,
    pub exists: bool,
    pub values: BTreeMap<&'static str, ConfigEntry>,
}

impl Render for ConfigReport {
    const SCHEMA: &'static str = "duyet.config.v1";

    fn human(&self, out: &mut dyn Write, style: &Style) -> io::Result<()> {
        writeln!(
            out,
            "{} {}{}",
            style.dim("#"),
            self.path.display(),
            if self.exists {
                ""
            } else {
                " (not created yet)"
            }
        )?;
        let rows: Vec<Vec<String>> = self
            .values
            .iter()
            .map(|(key, entry)| {
                vec![
                    (*key).to_owned(),
                    entry.value.clone(),
                    entry.source.to_string(),
                ]
            })
            .collect();
        table(out, style, &["key", "value", "source"], &rows)
    }
}

#[derive(Debug, Serialize)]
pub struct ConfigPathReport {
    pub path: PathBuf,
    pub exists: bool,
}

impl Render for ConfigPathReport {
    const SCHEMA: &'static str = "duyet.config_path.v1";

    fn human(&self, out: &mut dyn Write, _style: &Style) -> io::Result<()> {
        writeln!(out, "{}", self.path.display())
    }
}

/// Result of `config set` / `config unset`. `toml` is the full file content after the change,
/// which is what `--dry-run` shows instead of writing.
#[derive(Debug, Serialize)]
pub struct ConfigWrite {
    pub path: PathBuf,
    pub key: &'static str,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
    pub changed: bool,
    pub dry_run: bool,
    pub toml: String,
}

impl Render for ConfigWrite {
    const SCHEMA: &'static str = "duyet.config_write.v1";

    fn human(&self, out: &mut dyn Write, style: &Style) -> io::Result<()> {
        if self.dry_run {
            writeln!(
                out,
                "{}",
                style.dim(&format!("# dry run, would write {}", self.path.display()))
            )?;
            return out.write_all(self.toml.as_bytes());
        }
        match (&self.value, self.changed) {
            (Some(value), _) => writeln!(out, "{} = {value}", self.key),
            (None, true) => writeln!(out, "unset {}", self.key),
            (None, false) => writeln!(out, "{} was not set", self.key),
        }
    }
}

#[derive(Debug, Serialize)]
pub struct ProblemEntry {
    pub severity: Severity,
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct ConfigDoctorReport {
    pub path: PathBuf,
    pub exists: bool,
    pub problems: Vec<ProblemEntry>,
}

impl Render for ConfigDoctorReport {
    const SCHEMA: &'static str = "duyet.config_doctor.v1";

    fn human(&self, out: &mut dyn Write, style: &Style) -> io::Result<()> {
        writeln!(
            out,
            "{} {}{}",
            style.mark_ok(),
            self.path.display(),
            if self.exists {
                ""
            } else {
                " (not created yet)"
            }
        )?;
        for problem in &self.problems {
            writeln!(out, "  {} {}", style.warn("warning:"), problem.message)?;
        }
        Ok(())
    }
}

#[derive(Debug, Serialize)]
pub struct ManReport {
    pub out: PathBuf,
    pub files: Vec<String>,
}

impl Render for ManReport {
    const SCHEMA: &'static str = "duyet.docs_man.v1";

    fn human(&self, out: &mut dyn Write, _style: &Style) -> io::Result<()> {
        for file in &self.files {
            writeln!(out, "{}", self.out.join(file).display())?;
        }
        Ok(())
    }
}

/// Opaque pagination token: base64url of the provider's position. P2 fills it.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct Cursor(String);

impl Cursor {
    pub fn encode(position: &str) -> Cursor {
        Cursor(base64url_encode(position.as_bytes()))
    }

    pub fn decode(&self) -> Option<String> {
        base64url_decode(&self.0).and_then(|bytes| String::from_utf8(bytes).ok())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Page<T> {
    pub items: Vec<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next_cursor: Option<Cursor>,
}

const B64: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

fn base64url_encode(bytes: &[u8]) -> String {
    let mut out = String::with_capacity(bytes.len().div_ceil(3) * 4);
    for chunk in bytes.chunks(3) {
        let n = chunk
            .iter()
            .enumerate()
            .fold(0u32, |acc, (i, b)| acc | (u32::from(*b) << (16 - 8 * i)));
        let count = chunk.len() + 1;
        for i in 0..count {
            let index = ((n >> (18 - 6 * i)) & 0x3f) as usize;
            out.push(B64[index] as char);
        }
    }
    out
}

fn base64url_decode(text: &str) -> Option<Vec<u8>> {
    let mut out = Vec::with_capacity(text.len() * 3 / 4);
    for chunk in text.as_bytes().chunks(4) {
        if chunk.len() == 1 {
            return None;
        }
        let mut n = 0u32;
        for (i, c) in chunk.iter().enumerate() {
            let value = B64.iter().position(|b| b == c)? as u32;
            n |= value << (18 - 6 * i);
        }
        for i in 0..chunk.len() - 1 {
            out.push(((n >> (16 - 8 * i)) & 0xff) as u8);
        }
    }
    Some(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cursor_round_trip() {
        for position in ["", "a", "ab", "abc", "offset=42&sort=date", "ünï"] {
            let cursor = Cursor::encode(position);
            assert!(
                cursor
                    .as_str()
                    .bytes()
                    .all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_')
            );
            assert_eq!(cursor.decode().as_deref(), Some(position), "{position}");
        }
        assert_eq!(Cursor("!".into()).decode(), None);
        assert_eq!(Cursor("a".into()).decode(), None);
    }

    #[test]
    fn page_round_trip_omits_absent_cursor() {
        let page = Page {
            items: vec![1, 2, 3],
            next_cursor: Some(Cursor::encode("3")),
        };
        let json = serde_json::to_string(&page).unwrap();
        let back: Page<u32> = serde_json::from_str(&json).unwrap();
        assert_eq!(back, page);
        assert_eq!(back.next_cursor.unwrap().decode().as_deref(), Some("3"));

        let last: Page<u32> = Page {
            items: vec![],
            next_cursor: None,
        };
        assert_eq!(serde_json::to_string(&last).unwrap(), r#"{"items":[]}"#);
    }

    #[test]
    fn token_state_never_carries_the_value() {
        assert_eq!(serde_json::to_string(&TokenState::Set).unwrap(), r#""set""#);
        assert_eq!(
            serde_json::to_string(&TokenState::Unset).unwrap(),
            r#""unset""#
        );
    }
}
