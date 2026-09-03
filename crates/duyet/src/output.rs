use std::fmt;
use std::io::{self, Write};
use std::path::PathBuf;
use std::str::FromStr;

use serde::{Deserialize, Serialize};

use crate::TOKEN_ENV;
use crate::error::CliError;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Mode {
    Human,
    Json,
}

impl FromStr for Mode {
    type Err = ();

    fn from_str(raw: &str) -> Result<Mode, ()> {
        match raw {
            "human" => Ok(Mode::Human),
            "json" => Ok(Mode::Json),
            _ => Err(()),
        }
    }
}

impl fmt::Display for Mode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(match self {
            Mode::Human => "human",
            Mode::Json => "json",
        })
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Style {
    pub color: bool,
    pub unicode: bool,
}

impl Style {
    pub const PLAIN: Style = Style {
        color: false,
        unicode: false,
    };

    fn sgr(&self, code: &str, text: &str) -> String {
        if self.color {
            format!("\x1b[{code}m{text}\x1b[0m")
        } else {
            text.to_owned()
        }
    }

    pub fn good(&self, text: &str) -> String {
        self.sgr("32", text)
    }

    pub fn bad(&self, text: &str) -> String {
        self.sgr("31", text)
    }

    pub fn warn(&self, text: &str) -> String {
        self.sgr("33", text)
    }

    pub fn dim(&self, text: &str) -> String {
        self.sgr("2", text)
    }

    pub fn bold(&self, text: &str) -> String {
        self.sgr("1", text)
    }

    pub fn mark_ok(&self) -> String {
        self.good(if self.unicode { "✓" } else { "ok" })
    }

    pub fn mark_fail(&self) -> String {
        self.bad(if self.unicode { "✗" } else { "FAIL" })
    }

    pub fn mark_skip(&self) -> String {
        self.dim(if self.unicode { "–" } else { "-" })
    }
}

/// A report a command can print. `SCHEMA` names the JSON `data` shape, `human` renders the
/// same value for a terminal.
pub trait Render: Serialize {
    const SCHEMA: &'static str;

    fn human(&self, out: &mut dyn Write, style: &Style) -> io::Result<()>;
}

#[derive(Serialize)]
struct Envelope<'a, T: Serialize> {
    ok: bool,
    schema: &'static str,
    data: &'a T,
}

#[derive(Serialize)]
struct ErrorEnvelope<T: Serialize> {
    ok: bool,
    schema: &'static str,
    error: T,
}

pub fn envelope_json<T: Render>(value: &T) -> String {
    serde_json::to_string(&Envelope {
        ok: true,
        schema: T::SCHEMA,
        data: value,
    })
    .unwrap_or_else(|err| internal_error_json(&err.to_string()))
}

fn internal_error_json(message: &str) -> String {
    serde_json::to_string(&ErrorEnvelope {
        ok: false,
        schema: "duyet.error.v1",
        error: CliError::Internal(format!("serialization failed: {message}")).body(),
    })
    .unwrap_or_else(|_| r#"{"ok":false,"schema":"duyet.error.v1","error":{"code":"internal","message":"serialization failed","exit_code":1}}"#.to_owned())
}

/// Print one report to stdout. `quiet` silences human output only; JSON is data and stays.
pub fn emit<T: Render>(value: &T, mode: Mode, style: &Style, quiet: bool) -> Result<(), CliError> {
    let mut buf = Vec::new();
    match mode {
        Mode::Json => writeln!(buf, "{}", envelope_json(value)),
        Mode::Human if quiet => Ok(()),
        Mode::Human => value.human(&mut buf, style),
    }
    .map_err(|source| CliError::Internal(format!("render failed: {source}")))?;
    write_stdout(&buf)
}

/// A reader that hung up (`duyet docs tree | head`) is not an error: stop writing, exit 0.
pub fn write_stdout(bytes: &[u8]) -> Result<(), CliError> {
    let stdout = io::stdout();
    let mut out = stdout.lock();
    match out.write_all(bytes).and_then(|()| out.flush()) {
        Ok(()) => Ok(()),
        Err(source) if source.kind() == io::ErrorKind::BrokenPipe => Ok(()),
        Err(source) => Err(CliError::Io {
            path: PathBuf::from("<stdout>"),
            source,
        }),
    }
}

/// JSON errors go to stdout as an envelope so `| jq` sees them; human errors go to stderr.
pub fn emit_error(err: &CliError, mode: Mode, style: &Style, redactor: &Redactor) {
    match mode {
        Mode::Json => {
            let mut body = err.body();
            body.message = redactor.redact(&body.message);
            body.remediation = body.remediation.map(|text| redactor.redact(&text));
            let text = serde_json::to_string(&ErrorEnvelope {
                ok: false,
                schema: "duyet.error.v1",
                error: body,
            })
            .unwrap_or_else(|err| internal_error_json(&err.to_string()));
            write_stdout(format!("{text}\n").as_bytes()).ok();
        }
        Mode::Human => {
            let message = redactor.redact(&err.message());
            eprintln!("{} {message}", style.bad("error:"));
            if let Some(remediation) = err.remediation() {
                eprintln!("  {} {}", style.dim("hint:"), redactor.redact(&remediation));
            }
            if let Some(request_id) = err.request_id() {
                eprintln!("  {} {request_id}", style.dim("request id:"));
            }
        }
    }
}

/// Streaming output: one `{"schema":..,"data":..}` line per item in JSON mode, human lines
/// otherwise. Nothing streams in P1; P2 (`posts list`) and P8 (`chat`) build on it.
pub struct Stream<W: Write> {
    out: W,
    mode: Mode,
    style: Style,
}

#[derive(Serialize)]
struct StreamItem<'a, T: Serialize> {
    schema: &'static str,
    data: &'a T,
}

impl<W: Write> Stream<W> {
    pub fn new(out: W, mode: Mode, style: Style) -> Stream<W> {
        Stream { out, mode, style }
    }

    pub fn item<T: Render>(&mut self, value: &T) -> io::Result<()> {
        match self.mode {
            Mode::Json => {
                let line = serde_json::to_string(&StreamItem {
                    schema: T::SCHEMA,
                    data: value,
                })
                .map_err(io::Error::other)?;
                writeln!(self.out, "{line}")
            }
            Mode::Human => value.human(&mut self.out, &self.style),
        }?;
        self.out.flush()
    }

    pub fn into_inner(self) -> W {
        self.out
    }
}

/// Replaces every known secret, and any `Bearer <token>` credential, with `[redacted]`.
#[derive(Clone, Debug, Default)]
pub struct Redactor {
    secrets: Vec<String>,
}

impl Redactor {
    pub fn new(secrets: impl IntoIterator<Item = String>) -> Redactor {
        Redactor {
            secrets: secrets.into_iter().filter(|s| !s.is_empty()).collect(),
        }
    }

    /// The only secret P1 knows about is the agent token in `DUYET_AGENT_TOKEN`.
    pub fn from_env() -> Redactor {
        Redactor::new(std::env::var(TOKEN_ENV).ok())
    }

    pub fn redact(&self, text: &str) -> String {
        let mut out = String::with_capacity(text.len());
        for (index, line) in text.split('\n').enumerate() {
            if index > 0 {
                out.push('\n');
            }
            out.push_str(&self.redact_line(line));
        }
        out
    }

    fn redact_line(&self, line: &str) -> String {
        let mut result = line.to_owned();
        for secret in &self.secrets {
            result = result.replace(secret, "[redacted]");
        }
        let mut rebuilt = String::with_capacity(result.len());
        let mut rest = result.as_str();
        while let Some(pos) = rest.find("Bearer ") {
            let (head, tail) = rest.split_at(pos + "Bearer ".len());
            rebuilt.push_str(head);
            let token_len = tail
                .find(|c: char| c.is_whitespace() || c == '"' || c == '\'' || c == ',')
                .unwrap_or(tail.len());
            if token_len > 0 {
                rebuilt.push_str("[redacted]");
            }
            rest = &tail[token_len..];
        }
        rebuilt.push_str(rest);
        rebuilt
    }
}

/// The one table helper. Columns are padded to the widest cell; headers are bold when
/// color is on.
pub fn table(
    out: &mut dyn Write,
    style: &Style,
    headers: &[&str],
    rows: &[Vec<String>],
) -> io::Result<()> {
    let mut widths: Vec<usize> = headers.iter().map(|h| h.chars().count()).collect();
    for row in rows {
        for (index, cell) in row.iter().enumerate() {
            if index >= widths.len() {
                widths.push(0);
            }
            widths[index] = widths[index].max(cell.chars().count());
        }
    }
    let line = |cells: Vec<String>| -> String {
        cells
            .iter()
            .enumerate()
            .map(|(index, cell)| {
                if index + 1 == cells.len() {
                    cell.clone()
                } else {
                    format!("{cell:<width$}", width = widths[index])
                }
            })
            .collect::<Vec<_>>()
            .join("  ")
    };
    writeln!(
        out,
        "{}",
        style.bold(&line(headers.iter().map(|h| h.to_string()).collect()))
    )?;
    for row in rows {
        writeln!(out, "{}", line(row.clone()))?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Serialize)]
    struct Item {
        n: u32,
    }

    impl Render for Item {
        const SCHEMA: &'static str = "duyet.test.v1";

        fn human(&self, out: &mut dyn Write, _style: &Style) -> io::Result<()> {
            writeln!(out, "item {}", self.n)
        }
    }

    #[test]
    fn success_envelope_has_exactly_ok_schema_data() {
        let value: serde_json::Value =
            serde_json::from_str(&envelope_json(&Item { n: 1 })).unwrap();
        let keys: Vec<&str> = value
            .as_object()
            .unwrap()
            .keys()
            .map(String::as_str)
            .collect();
        assert_eq!(keys, ["data", "ok", "schema"]);
        assert_eq!(value["ok"], true);
        assert_eq!(value["schema"], "duyet.test.v1");
        assert_eq!(value["data"]["n"], 1);
    }

    #[test]
    fn stream_writes_one_line_per_item() {
        let mut stream = Stream::new(Vec::new(), Mode::Json, Style::PLAIN);
        for n in 0..3 {
            stream.item(&Item { n }).unwrap();
        }
        let text = String::from_utf8(stream.into_inner()).unwrap();
        let lines: Vec<&str> = text.lines().collect();
        assert_eq!(lines.len(), 3);
        for (n, line) in lines.iter().enumerate() {
            let value: serde_json::Value = serde_json::from_str(line).unwrap();
            assert_eq!(value["schema"], "duyet.test.v1");
            assert_eq!(value["data"]["n"], n as u64);
        }

        let mut stream = Stream::new(Vec::new(), Mode::Human, Style::PLAIN);
        stream.item(&Item { n: 7 }).unwrap();
        assert_eq!(String::from_utf8(stream.into_inner()).unwrap(), "item 7\n");
    }

    #[test]
    fn redactor_hides_secret_and_bearer_forms() {
        let redactor = Redactor::new(["sk-fake-123".to_owned()]);
        assert_eq!(
            redactor.redact("token sk-fake-123 sent"),
            "token [redacted] sent"
        );
        assert_eq!(
            redactor.redact("Authorization: Bearer abc.def-ghi\nnext"),
            "Authorization: Bearer [redacted]\nnext"
        );
        assert_eq!(
            redactor.redact(r#"{"auth":"Bearer x","k":1}"#),
            r#"{"auth":"Bearer [redacted]","k":1}"#
        );
        assert_eq!(Redactor::default().redact("plain"), "plain");
    }

    #[test]
    fn mode_parses_and_prints() {
        assert_eq!("json".parse::<Mode>(), Ok(Mode::Json));
        assert_eq!("human".parse::<Mode>(), Ok(Mode::Human));
        assert!("yaml".parse::<Mode>().is_err());
        assert_eq!(Mode::Json.to_string(), "json");
    }

    #[test]
    fn table_pads_all_but_last_column() {
        let mut out = Vec::new();
        table(
            &mut out,
            &Style::PLAIN,
            &["key", "value"],
            &[
                vec!["a".into(), "1".into()],
                vec!["long_key".into(), "22".into()],
            ],
        )
        .unwrap();
        assert_eq!(
            String::from_utf8(out).unwrap(),
            "key       value\na         1\nlong_key  22\n"
        );
    }
}
