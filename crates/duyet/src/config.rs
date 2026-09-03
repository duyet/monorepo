use std::fmt;
use std::fs;
use std::io;
use std::path::Path;
use std::str::FromStr;

use serde::{Deserialize, Serialize};
use url::Url;

use crate::cli::Globals;
use crate::error::CliError;
use crate::output::Mode;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ConfigKey {
    BlogUrl,
    KbUrl,
    ApiUrl,
    AgentsApiUrl,
    NewsUrl,
    Channel,
    Output,
    Telemetry,
    UpdateCheck,
}

impl ConfigKey {
    pub const ALL: [ConfigKey; 9] = [
        ConfigKey::BlogUrl,
        ConfigKey::KbUrl,
        ConfigKey::ApiUrl,
        ConfigKey::AgentsApiUrl,
        ConfigKey::NewsUrl,
        ConfigKey::Channel,
        ConfigKey::Output,
        ConfigKey::Telemetry,
        ConfigKey::UpdateCheck,
    ];

    pub fn name(self) -> &'static str {
        match self {
            ConfigKey::BlogUrl => "blog_url",
            ConfigKey::KbUrl => "kb_url",
            ConfigKey::ApiUrl => "api_url",
            ConfigKey::AgentsApiUrl => "agents_api_url",
            ConfigKey::NewsUrl => "news_url",
            ConfigKey::Channel => "channel",
            ConfigKey::Output => "output",
            ConfigKey::Telemetry => "telemetry",
            ConfigKey::UpdateCheck => "update.check",
        }
    }

    pub fn env_var(self) -> &'static str {
        match self {
            ConfigKey::BlogUrl => "DUYET_BLOG_URL",
            ConfigKey::KbUrl => "DUYET_KB_URL",
            ConfigKey::ApiUrl => "DUYET_API_URL",
            ConfigKey::AgentsApiUrl => "DUYET_AGENTS_API_URL",
            ConfigKey::NewsUrl => "DUYET_NEWS_URL",
            ConfigKey::Channel => "DUYET_CHANNEL",
            ConfigKey::Output => "DUYET_OUTPUT",
            ConfigKey::Telemetry => "DUYET_TELEMETRY",
            ConfigKey::UpdateCheck => "DUYET_UPDATE_CHECK",
        }
    }

    pub fn kind(self) -> Kind {
        match self {
            ConfigKey::BlogUrl
            | ConfigKey::KbUrl
            | ConfigKey::ApiUrl
            | ConfigKey::AgentsApiUrl
            | ConfigKey::NewsUrl => Kind::Url,
            ConfigKey::Channel => Kind::Channel,
            ConfigKey::Output => Kind::Output,
            ConfigKey::Telemetry | ConfigKey::UpdateCheck => Kind::Bool,
        }
    }

    pub fn describe(self) -> &'static str {
        match self {
            ConfigKey::BlogUrl => "base URL of the blog (posts, notes, series, images)",
            ConfigKey::KbUrl => "base URL of the knowledge base",
            ConfigKey::ApiUrl => "base URL of api.duyet.net (insights, submissions)",
            ConfigKey::AgentsApiUrl => "base URL of the duyet agent (chat)",
            ConfigKey::NewsUrl => "base URL of the news digest",
            ConfigKey::Channel => "release channel followed by `update`",
            ConfigKey::Output => "default output mode when --json is not passed",
            ConfigKey::Telemetry => "opt-in usage telemetry; nothing is sent in this release",
            ConfigKey::UpdateCheck => "background update check (at most once per 24h, TTY only)",
        }
    }

    pub fn default(self) -> Value {
        let url = |raw: &str| Value::Url(Url::parse(raw).expect("built-in URL"));
        match self {
            ConfigKey::BlogUrl => url("https://blog.duyet.net"),
            ConfigKey::KbUrl => url("https://kb.duyet.net"),
            ConfigKey::ApiUrl => url("https://api.duyet.net"),
            ConfigKey::AgentsApiUrl => url("https://agents-api.duyet.net"),
            ConfigKey::NewsUrl => url("https://news.duyet.net"),
            ConfigKey::Channel => Value::Channel(Channel::Stable),
            ConfigKey::Output => Value::Output(Mode::Human),
            ConfigKey::Telemetry => Value::Bool(false),
            ConfigKey::UpdateCheck => Value::Bool(true),
        }
    }

    /// The boundary for every raw value: CLI argument, environment variable, or TOML string.
    pub fn parse(self, raw: &str) -> Result<Value, CliError> {
        let raw = raw.trim();
        let invalid = || CliError::ConfigInvalidValue {
            key: self,
            value: raw.to_owned(),
            expected: self.kind().expected(),
        };
        match self.kind() {
            Kind::Url => Url::parse(raw)
                .ok()
                .filter(|url| matches!(url.scheme(), "http" | "https") && url.host().is_some())
                .map(Value::Url)
                .ok_or_else(invalid),
            Kind::Channel => raw.parse().map(Value::Channel).map_err(|_| invalid()),
            Kind::Output => raw.parse().map(Value::Output).map_err(|_| invalid()),
            Kind::Bool => match raw {
                "true" | "1" | "yes" | "on" => Ok(Value::Bool(true)),
                "false" | "0" | "no" | "off" => Ok(Value::Bool(false)),
                _ => Err(invalid()),
            },
        }
    }

    pub fn from_name(name: &str) -> Result<ConfigKey, CliError> {
        ConfigKey::ALL
            .into_iter()
            .find(|key| key.name() == name)
            .ok_or_else(|| CliError::ConfigUnknownKey {
                key: name.to_owned(),
            })
    }

    fn index(self) -> usize {
        self as usize
    }
}

impl fmt::Display for ConfigKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.name())
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Kind {
    Url,
    Channel,
    Output,
    Bool,
}

impl Kind {
    pub fn expected(self) -> &'static str {
        match self {
            Kind::Url => "an http(s) URL",
            Kind::Channel => "stable|beta",
            Kind::Output => "human|json",
            Kind::Bool => "true|false",
        }
    }
}

impl fmt::Display for Kind {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.expected())
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Channel {
    Stable,
    Beta,
}

impl FromStr for Channel {
    type Err = ();

    fn from_str(raw: &str) -> Result<Channel, ()> {
        match raw {
            "stable" => Ok(Channel::Stable),
            "beta" => Ok(Channel::Beta),
            _ => Err(()),
        }
    }
}

impl fmt::Display for Channel {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(match self {
            Channel::Stable => "stable",
            Channel::Beta => "beta",
        })
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Value {
    Url(Url),
    Channel(Channel),
    Output(Mode),
    Bool(bool),
}

impl fmt::Display for Value {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Value::Url(url) => write!(f, "{url}"),
            Value::Channel(channel) => write!(f, "{channel}"),
            Value::Output(mode) => write!(f, "{mode}"),
            Value::Bool(flag) => write!(f, "{flag}"),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Source {
    Default,
    File,
    Env,
    Flag,
}

impl fmt::Display for Source {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(match self {
            Source::Default => "default",
            Source::File => "file",
            Source::Env => "env",
            Source::Flag => "flag",
        })
    }
}

/// Typed mirror of `config.toml`. Values stay raw strings here; `ConfigKey::parse` validates
/// them when `Settings` resolves. Unknown keys are tolerated so `config doctor` can name them.
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct ConfigFile {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blog_url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub kb_url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub api_url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub agents_api_url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub news_url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub channel: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub output: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub telemetry: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub update: Option<UpdateSection>,
}

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct UpdateSection {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub check: Option<bool>,
}

impl ConfigFile {
    pub fn load(path: &Path) -> Result<Option<ConfigFile>, CliError> {
        let text = match fs::read_to_string(path) {
            Ok(text) => text,
            Err(err) if err.kind() == io::ErrorKind::NotFound => return Ok(None),
            Err(err) => {
                return Err(CliError::Io {
                    path: path.to_path_buf(),
                    source: err,
                });
            }
        };
        toml::from_str(&text)
            .map(Some)
            .map_err(|err| CliError::ConfigInvalid {
                path: path.to_path_buf(),
                problems: vec![format!("parse error: {}", err.message())],
            })
    }

    /// Writes atomically (temp file in the same directory, then rename) with mode 0600 on
    /// unix. Returns the TOML text so `--dry-run` can show what would have been written.
    pub fn save(&self, path: &Path, dry_run: bool) -> Result<String, CliError> {
        let text = toml::to_string(self).map_err(|err| CliError::Internal(err.to_string()))?;
        if dry_run {
            return Ok(text);
        }
        let io_err = |source: io::Error| CliError::Io {
            path: path.to_path_buf(),
            source,
        };
        let dir = path.parent().filter(|dir| !dir.as_os_str().is_empty());
        if let Some(dir) = dir {
            fs::create_dir_all(dir).map_err(io_err)?;
        }
        let tmp = path.with_extension(format!("toml.tmp-{}", std::process::id()));
        write_private(&tmp, &text).map_err(io_err)?;
        fs::rename(&tmp, path).map_err(|source| {
            fs::remove_file(&tmp).ok();
            io_err(source)
        })?;
        Ok(text)
    }

    pub fn get(&self, key: ConfigKey) -> Option<String> {
        match key {
            ConfigKey::BlogUrl => self.blog_url.clone(),
            ConfigKey::KbUrl => self.kb_url.clone(),
            ConfigKey::ApiUrl => self.api_url.clone(),
            ConfigKey::AgentsApiUrl => self.agents_api_url.clone(),
            ConfigKey::NewsUrl => self.news_url.clone(),
            ConfigKey::Channel => self.channel.clone(),
            ConfigKey::Output => self.output.clone(),
            ConfigKey::Telemetry => self.telemetry.map(|flag| flag.to_string()),
            ConfigKey::UpdateCheck => self
                .update
                .as_ref()
                .and_then(|update| update.check)
                .map(|flag| flag.to_string()),
        }
    }

    pub fn set(&mut self, key: ConfigKey, value: &Value) {
        let text = value.to_string();
        let flag = matches!(value, Value::Bool(true));
        match key {
            ConfigKey::BlogUrl => self.blog_url = Some(text),
            ConfigKey::KbUrl => self.kb_url = Some(text),
            ConfigKey::ApiUrl => self.api_url = Some(text),
            ConfigKey::AgentsApiUrl => self.agents_api_url = Some(text),
            ConfigKey::NewsUrl => self.news_url = Some(text),
            ConfigKey::Channel => self.channel = Some(text),
            ConfigKey::Output => self.output = Some(text),
            ConfigKey::Telemetry => self.telemetry = Some(flag),
            ConfigKey::UpdateCheck => self.update = Some(UpdateSection { check: Some(flag) }),
        }
    }

    /// Returns whether the key was set before. Unsetting an unset key is a no-op, not an error.
    pub fn unset(&mut self, key: ConfigKey) -> bool {
        let was_set = self.get(key).is_some();
        match key {
            ConfigKey::BlogUrl => self.blog_url = None,
            ConfigKey::KbUrl => self.kb_url = None,
            ConfigKey::ApiUrl => self.api_url = None,
            ConfigKey::AgentsApiUrl => self.agents_api_url = None,
            ConfigKey::NewsUrl => self.news_url = None,
            ConfigKey::Channel => self.channel = None,
            ConfigKey::Output => self.output = None,
            ConfigKey::Telemetry => self.telemetry = None,
            ConfigKey::UpdateCheck => self.update = None,
        }
        was_set
    }
}

/// What startup found at the config path. `Broken` is only survivable by `config doctor` and
/// `config path`; every other command refuses to run on it.
#[derive(Debug)]
pub enum ConfigState {
    Missing,
    Loaded(ConfigFile),
    Broken(CliError),
}

impl ConfigState {
    pub fn load(path: &Path) -> ConfigState {
        match ConfigFile::load(path) {
            Ok(Some(file)) => ConfigState::Loaded(file),
            Ok(None) => ConfigState::Missing,
            Err(err) => ConfigState::Broken(err),
        }
    }

    pub fn exists(&self) -> bool {
        match self {
            ConfigState::Missing => false,
            ConfigState::Loaded(_) | ConfigState::Broken(_) => true,
        }
    }

    pub fn file(&self) -> Option<&ConfigFile> {
        match self {
            ConfigState::Loaded(file) => Some(file),
            ConfigState::Missing | ConfigState::Broken(_) => None,
        }
    }
}

#[cfg(unix)]
fn write_private(path: &Path, text: &str) -> io::Result<()> {
    use std::io::Write;
    use std::os::unix::fs::OpenOptionsExt;

    let mut file = fs::OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .mode(0o600)
        .open(path)?;
    file.write_all(text.as_bytes())?;
    file.sync_all()
}

#[cfg(not(unix))]
fn write_private(path: &Path, text: &str) -> io::Result<()> {
    fs::write(path, text)
}

/// Every key resolved once at startup. Precedence: flag > env > file > default.
#[derive(Clone, Debug)]
pub struct Settings {
    values: [(Value, Source); 9],
}

impl Settings {
    pub fn resolve(file: Option<&ConfigFile>, flags: &Globals) -> Result<Settings, CliError> {
        let mut values = Vec::with_capacity(ConfigKey::ALL.len());
        for key in ConfigKey::ALL {
            values.push(resolve_key(key, file, flags)?);
        }
        let values: [(Value, Source); 9] = values
            .try_into()
            .map_err(|_| CliError::Internal("config key table size mismatch".into()))?;
        Ok(Settings { values })
    }

    pub fn get(&self, key: ConfigKey) -> (&Value, Source) {
        let (value, source) = &self.values[key.index()];
        (value, *source)
    }

    pub fn url(&self, key: ConfigKey) -> &Url {
        match self.get(key).0 {
            Value::Url(url) => url,
            Value::Channel(_) | Value::Output(_) | Value::Bool(_) => {
                unreachable!("{key} is a URL key; ConfigKey::parse keeps kinds aligned")
            }
        }
    }

    pub fn channel(&self) -> Channel {
        match self.get(ConfigKey::Channel).0 {
            Value::Channel(channel) => *channel,
            Value::Url(_) | Value::Output(_) | Value::Bool(_) => {
                unreachable!("channel key holds a Channel by construction")
            }
        }
    }

    pub fn mode(&self) -> Mode {
        match self.get(ConfigKey::Output).0 {
            Value::Output(mode) => *mode,
            Value::Url(_) | Value::Channel(_) | Value::Bool(_) => {
                unreachable!("output key holds a Mode by construction")
            }
        }
    }

    pub fn telemetry(&self) -> bool {
        matches!(self.get(ConfigKey::Telemetry).0, Value::Bool(true))
    }
}

fn resolve_key(
    key: ConfigKey,
    file: Option<&ConfigFile>,
    flags: &Globals,
) -> Result<(Value, Source), CliError> {
    if key == ConfigKey::Output && flags.json {
        return Ok((Value::Output(Mode::Json), Source::Flag));
    }
    if let Some(raw) = std::env::var(key.env_var())
        .ok()
        .filter(|raw| !raw.trim().is_empty())
    {
        return key.parse(&raw).map(|value| (value, Source::Env));
    }
    if let Some(raw) = file.and_then(|file| file.get(key)) {
        return key.parse(&raw).map(|value| (value, Source::File));
    }
    Ok((key.default(), Source::Default))
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Error,
    Warning,
}

/// One finding from `config doctor`. Values are never included: a secret-looking key must not
/// leak through the report.
#[derive(Debug, PartialEq, Eq)]
pub enum Problem {
    Unreadable(String),
    Parse(String),
    UnknownKey(String),
    InvalidValue {
        key: ConfigKey,
        expected: &'static str,
    },
    SecretKey(String),
    Permissions(u32),
}

impl Problem {
    pub fn severity(&self) -> Severity {
        match self {
            Problem::Unreadable(_)
            | Problem::Parse(_)
            | Problem::UnknownKey(_)
            | Problem::InvalidValue { .. }
            | Problem::SecretKey(_) => Severity::Error,
            Problem::Permissions(_) => Severity::Warning,
        }
    }
}

impl fmt::Display for Problem {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Problem::Unreadable(message) => write!(f, "cannot read file: {message}"),
            Problem::Parse(message) => write!(f, "parse error: {message}"),
            Problem::UnknownKey(key) => write!(f, "unknown key `{key}`"),
            Problem::InvalidValue { key, expected } => {
                write!(f, "invalid value for `{key}` (expected {expected})")
            }
            Problem::SecretKey(key) => write!(
                f,
                "key `{key}` looks like a secret; the config file never holds secrets, use DUYET_AGENT_TOKEN"
            ),
            Problem::Permissions(mode) => write!(
                f,
                "file mode is {mode:04o}, expected 0600 (run `chmod 600` on it)"
            ),
        }
    }
}

const SECRET_MARKERS: [&str; 4] = ["token", "secret", "password", "api_key"];

pub fn looks_secret(name: &str) -> bool {
    let lower = name.to_ascii_lowercase();
    SECRET_MARKERS.iter().any(|marker| lower.contains(marker))
}

/// Lints the file on disk. A missing file yields no problems; `exists` is reported separately.
pub fn doctor(path: &Path) -> Vec<Problem> {
    let mut problems = Vec::new();
    let text = match fs::read_to_string(path) {
        Ok(text) => text,
        Err(err) if err.kind() == io::ErrorKind::NotFound => return problems,
        Err(err) => {
            problems.push(Problem::Unreadable(err.to_string()));
            return problems;
        }
    };
    let table: toml::Table = match text.parse() {
        Ok(table) => table,
        Err(err) => {
            problems.push(Problem::Parse(err.message().to_owned()));
            return problems;
        }
    };
    for (name, value) in &table {
        match value {
            toml::Value::Table(section) => {
                for (leaf, value) in section {
                    check_entry(&format!("{name}.{leaf}"), value, &mut problems);
                }
            }
            leaf => check_entry(name, leaf, &mut problems),
        }
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if let Ok(metadata) = fs::metadata(path) {
            let mode = metadata.permissions().mode() & 0o777;
            if mode & 0o077 != 0 {
                problems.push(Problem::Permissions(mode));
            }
        }
    }
    problems
}

fn check_entry(name: &str, value: &toml::Value, problems: &mut Vec<Problem>) {
    let key = match ConfigKey::from_name(name) {
        Ok(key) => key,
        Err(_) if looks_secret(name) => {
            problems.push(Problem::SecretKey(name.to_owned()));
            return;
        }
        Err(_) => {
            problems.push(Problem::UnknownKey(name.to_owned()));
            return;
        }
    };
    let valid = match (key.kind(), value) {
        (Kind::Bool, toml::Value::Boolean(_)) => true,
        (Kind::Bool, _) => false,
        (Kind::Url | Kind::Channel | Kind::Output, toml::Value::String(raw)) => {
            key.parse(raw).is_ok()
        }
        (Kind::Url | Kind::Channel | Kind::Output, _) => false,
    };
    if !valid {
        problems.push(Problem::InvalidValue {
            key,
            expected: key.kind().expected(),
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn names_and_env_vars_line_up() {
        for key in ConfigKey::ALL {
            let expected = format!("DUYET_{}", key.name().replace('.', "_").to_uppercase());
            assert_eq!(key.env_var(), expected);
            assert_eq!(ConfigKey::from_name(key.name()).unwrap(), key);
        }
        assert!(matches!(
            ConfigKey::from_name("nope"),
            Err(CliError::ConfigUnknownKey { .. })
        ));
    }

    #[test]
    fn parse_validates_by_kind() {
        assert!(ConfigKey::BlogUrl.parse("http://127.0.0.1:1").is_ok());
        assert!(matches!(
            ConfigKey::BlogUrl.parse("not a url"),
            Err(CliError::ConfigInvalidValue { .. })
        ));
        assert!(ConfigKey::BlogUrl.parse("ftp://x").is_err());
        assert_eq!(
            ConfigKey::Channel.parse("beta").unwrap(),
            Value::Channel(Channel::Beta)
        );
        assert!(ConfigKey::Channel.parse("nightly").is_err());
        assert_eq!(
            ConfigKey::Output.parse("json").unwrap(),
            Value::Output(Mode::Json)
        );
        assert_eq!(ConfigKey::Telemetry.parse("1").unwrap(), Value::Bool(true));
        assert_eq!(
            ConfigKey::UpdateCheck.parse("off").unwrap(),
            Value::Bool(false)
        );
        assert!(ConfigKey::Telemetry.parse("maybe").is_err());
    }

    #[test]
    fn defaults_match_their_kind() {
        for key in ConfigKey::ALL {
            let value = key.default();
            let kind = match value {
                Value::Url(_) => Kind::Url,
                Value::Channel(_) => Kind::Channel,
                Value::Output(_) => Kind::Output,
                Value::Bool(_) => Kind::Bool,
            };
            assert_eq!(kind, key.kind(), "{key}");
            assert!(key.parse(&value.to_string()).is_ok(), "{key}");
        }
    }

    #[test]
    fn file_round_trip_and_unset() {
        let mut file = ConfigFile::default();
        file.set(ConfigKey::UpdateCheck, &Value::Bool(false));
        file.set(ConfigKey::Channel, &Value::Channel(Channel::Beta));
        let text = toml::to_string(&file).unwrap();
        assert!(text.contains("channel = \"beta\""));
        assert!(text.contains("[update]"));
        assert!(text.contains("check = false"));
        let parsed: ConfigFile = toml::from_str(&text).unwrap();
        assert_eq!(parsed, file);
        assert_eq!(parsed.get(ConfigKey::UpdateCheck).as_deref(), Some("false"));

        assert!(file.unset(ConfigKey::UpdateCheck));
        assert!(!file.unset(ConfigKey::UpdateCheck));
        assert_eq!(toml::to_string(&file).unwrap(), "channel = \"beta\"\n");
    }

    #[test]
    fn unknown_keys_survive_load() {
        let parsed: ConfigFile =
            toml::from_str("token = \"abc\"\nblog_url = \"http://x\"").unwrap();
        assert_eq!(parsed.blog_url.as_deref(), Some("http://x"));
    }

    #[test]
    fn doctor_reports_each_problem_kind_without_values() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("config.toml");
        ConfigFile::default().save(&path, false).unwrap();
        fs::write(
            &path,
            "token = \"abc\"\nbogus = 1\nchannel = \"nightly\"\ntelemetry = \"yes\"\n[update]\ncheck = 1\n",
        )
        .unwrap();
        let problems = doctor(&path);
        let rendered: Vec<String> = problems.iter().map(|p| p.to_string()).collect();
        assert!(problems.contains(&Problem::SecretKey("token".into())));
        assert!(problems.contains(&Problem::UnknownKey("bogus".into())));
        assert!(problems.contains(&Problem::InvalidValue {
            key: ConfigKey::Channel,
            expected: "stable|beta",
        }));
        assert!(problems.contains(&Problem::InvalidValue {
            key: ConfigKey::Telemetry,
            expected: "true|false",
        }));
        assert!(problems.contains(&Problem::InvalidValue {
            key: ConfigKey::UpdateCheck,
            expected: "true|false",
        }));
        assert!(rendered.iter().all(|line| !line.contains("abc")));
        assert!(problems.iter().all(|p| p.severity() == Severity::Error));

        fs::write(&path, "channel = [").unwrap();
        assert!(matches!(doctor(&path)[0], Problem::Parse(_)));
        assert!(doctor(&dir.path().join("missing.toml")).is_empty());
    }

    #[cfg(unix)]
    #[test]
    fn save_is_private_and_doctor_warns_on_loose_mode() {
        use std::os::unix::fs::PermissionsExt;

        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("nested").join("config.toml");
        let mut file = ConfigFile::default();
        file.set(ConfigKey::Telemetry, &Value::Bool(true));
        let text = file.save(&path, true).unwrap();
        assert!(!path.exists(), "dry run must not write");
        assert_eq!(text, "telemetry = true\n");

        file.save(&path, false).unwrap();
        assert_eq!(
            fs::metadata(&path).unwrap().permissions().mode() & 0o777,
            0o600
        );
        assert!(doctor(&path).is_empty());

        fs::set_permissions(&path, fs::Permissions::from_mode(0o644)).unwrap();
        let problems = doctor(&path);
        assert_eq!(problems, vec![Problem::Permissions(0o644)]);
        assert_eq!(problems[0].severity(), Severity::Warning);
    }
}
