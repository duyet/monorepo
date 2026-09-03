use std::fmt;
use std::path::PathBuf;

use serde::Serialize;

use crate::config::ConfigKey;

/// Process exit status. The discriminant is the number the shell sees.
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ExitCode {
    Ok = 0,
    Generic = 1,
    Usage = 2,
    Network = 3,
    Auth = 4,
    Declined = 5,
    NotFound = 6,
    UpdateAvailable = 10,
}

impl ExitCode {
    pub const ALL: [ExitCode; 8] = [
        ExitCode::Ok,
        ExitCode::Generic,
        ExitCode::Usage,
        ExitCode::Network,
        ExitCode::Auth,
        ExitCode::Declined,
        ExitCode::NotFound,
        ExitCode::UpdateAvailable,
    ];

    pub fn describe(self) -> &'static str {
        match self {
            ExitCode::Ok => "success",
            ExitCode::Generic => "generic failure",
            ExitCode::Usage => "usage error or not implemented",
            ExitCode::Network => "network or HTTP failure",
            ExitCode::Auth => "authentication required or rejected",
            ExitCode::Declined => "confirmation declined or unavailable",
            ExitCode::NotFound => "resource not found",
            ExitCode::UpdateAvailable => "update available (from `update --check`)",
        }
    }
}

/// Later slices of epic #1440, keyed by the issue that tracks them.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Slice {
    P2Content,
    P3Release,
    P4Installers,
    P5Update,
    P7Submissions,
    P8Chat,
}

impl Slice {
    pub const ALL: [Slice; 6] = [
        Slice::P2Content,
        Slice::P3Release,
        Slice::P4Installers,
        Slice::P5Update,
        Slice::P7Submissions,
        Slice::P8Chat,
    ];

    pub fn issue(self) -> u32 {
        match self {
            Slice::P2Content => 1443,
            Slice::P3Release => 1444,
            Slice::P4Installers => 1446,
            Slice::P5Update => 1447,
            Slice::P7Submissions => 1448,
            Slice::P8Chat => 1445,
        }
    }

    pub fn url(self) -> String {
        format!("https://github.com/duyet/monorepo/issues/{}", self.issue())
    }
}

#[derive(Debug)]
pub enum CliError {
    NotImplemented(Slice),
    Usage(String),
    ConfigUnknownKey {
        key: String,
    },
    ConfigInvalidValue {
        key: ConfigKey,
        value: String,
        expected: &'static str,
    },
    ConfigInvalid {
        path: PathBuf,
        problems: Vec<String>,
    },
    Io {
        path: PathBuf,
        source: std::io::Error,
    },
    Offline {
        url: String,
    },
    Network {
        url: String,
        message: String,
        request_id: Option<String>,
    },
    Http {
        url: String,
        status: u16,
        request_id: Option<String>,
    },
    Declined,
    Internal(String),
}

impl CliError {
    pub fn code(&self) -> String {
        match self {
            CliError::NotImplemented(_) => "not_implemented".into(),
            CliError::Usage(_) => "usage".into(),
            CliError::ConfigUnknownKey { .. } => "config_unknown_key".into(),
            CliError::ConfigInvalidValue { .. } => "config_invalid_value".into(),
            CliError::ConfigInvalid { .. } => "config_invalid".into(),
            CliError::Io { .. } => "io".into(),
            CliError::Offline { .. } => "offline".into(),
            CliError::Network { .. } => "network".into(),
            CliError::Http { status, .. } => format!("http_{status}"),
            CliError::Declined => "declined".into(),
            CliError::Internal(_) => "internal".into(),
        }
    }

    pub fn exit_code(&self) -> ExitCode {
        match self {
            CliError::NotImplemented(_) => ExitCode::Usage,
            CliError::Usage(_) => ExitCode::Usage,
            CliError::ConfigUnknownKey { .. } => ExitCode::Usage,
            CliError::ConfigInvalidValue { .. } => ExitCode::Usage,
            CliError::ConfigInvalid { .. } => ExitCode::Generic,
            CliError::Io { .. } => ExitCode::Generic,
            CliError::Offline { .. } => ExitCode::Network,
            CliError::Network { .. } => ExitCode::Network,
            CliError::Http { status: 404, .. } => ExitCode::NotFound,
            CliError::Http { .. } => ExitCode::Network,
            CliError::Declined => ExitCode::Declined,
            CliError::Internal(_) => ExitCode::Generic,
        }
    }

    pub fn message(&self) -> String {
        match self {
            CliError::NotImplemented(slice) => {
                format!("not implemented yet, tracked in #{}", slice.issue())
            }
            CliError::Usage(text) => text.clone(),
            CliError::ConfigUnknownKey { key } => format!("unknown config key `{key}`"),
            CliError::ConfigInvalidValue {
                key,
                value,
                expected,
            } => format!(
                "invalid value `{value}` for `{}` (expected {expected})",
                key.name()
            ),
            CliError::ConfigInvalid { path, problems } => format!(
                "config file {} has {} problem(s):\n  {}",
                path.display(),
                problems.len(),
                problems.join("\n  ")
            ),
            CliError::Io { path, source } => format!("{}: {source}", path.display()),
            CliError::Offline { url } => format!("offline and no cached copy of {url}"),
            CliError::Network { url, message, .. } => format!("{url}: {message}"),
            CliError::Http { url, status, .. } => format!("{url}: HTTP {status}"),
            CliError::Declined => "confirmation required but not given".into(),
            CliError::Internal(text) => text.clone(),
        }
    }

    pub fn remediation(&self) -> Option<String> {
        match self {
            CliError::NotImplemented(slice) => Some(format!("follow {}", slice.url())),
            CliError::Usage(_) => Some("run with --help for usage".into()),
            CliError::ConfigUnknownKey { .. } => Some(format!(
                "known keys: {}",
                ConfigKey::ALL
                    .iter()
                    .map(|key| key.name())
                    .collect::<Vec<_>>()
                    .join(", ")
            )),
            CliError::ConfigInvalidValue { key, .. } => Some(format!(
                "run `duyet config unset {}` or set a value of kind {}",
                key.name(),
                key.kind()
            )),
            CliError::ConfigInvalid { .. } => Some("fix or remove the lines listed above".into()),
            CliError::Io { .. } => None,
            CliError::Offline { .. } => Some("drop --offline / unset DUYET_OFFLINE".into()),
            CliError::Network { .. } => {
                Some("check connectivity, proxy, and `duyet doctor`".into())
            }
            CliError::Http { status: 404, .. } => Some("check the slug or id".into()),
            CliError::Http { .. } => None,
            CliError::Declined => Some("pass --yes to confirm non-interactively".into()),
            CliError::Internal(_) => None,
        }
    }

    pub fn request_id(&self) -> Option<&str> {
        match self {
            CliError::Network { request_id, .. } => request_id.as_deref(),
            CliError::Http { request_id, .. } => request_id.as_deref(),
            CliError::NotImplemented(_)
            | CliError::Usage(_)
            | CliError::ConfigUnknownKey { .. }
            | CliError::ConfigInvalidValue { .. }
            | CliError::ConfigInvalid { .. }
            | CliError::Io { .. }
            | CliError::Offline { .. }
            | CliError::Declined
            | CliError::Internal(_) => None,
        }
    }

    pub fn tracking(&self) -> Option<String> {
        match self {
            CliError::NotImplemented(slice) => Some(slice.url()),
            CliError::Usage(_)
            | CliError::ConfigUnknownKey { .. }
            | CliError::ConfigInvalidValue { .. }
            | CliError::ConfigInvalid { .. }
            | CliError::Io { .. }
            | CliError::Offline { .. }
            | CliError::Network { .. }
            | CliError::Http { .. }
            | CliError::Declined
            | CliError::Internal(_) => None,
        }
    }

    /// The `error` object of the JSON envelope, schema `duyet.error.v1`.
    pub fn body(&self) -> ErrorBody {
        ErrorBody {
            code: self.code(),
            message: self.message(),
            remediation: self.remediation(),
            request_id: self.request_id().map(str::to_owned),
            exit_code: self.exit_code() as u8,
            tracking: self.tracking(),
        }
    }
}

impl fmt::Display for CliError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.message())
    }
}

impl std::error::Error for CliError {}

#[derive(Debug, Serialize)]
pub struct ErrorBody {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub remediation: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub request_id: Option<String>,
    pub exit_code: u8,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tracking: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn exit_code_discriminants() {
        let codes: Vec<u8> = ExitCode::ALL.iter().map(|code| *code as u8).collect();
        assert_eq!(codes, [0, 1, 2, 3, 4, 5, 6, 10]);
    }

    #[test]
    fn slice_issues() {
        let issues: Vec<u32> = Slice::ALL.iter().map(|slice| slice.issue()).collect();
        assert_eq!(issues, [1443, 1444, 1446, 1447, 1448, 1445]);
        assert_eq!(
            Slice::P2Content.url(),
            "https://github.com/duyet/monorepo/issues/1443"
        );
    }

    fn io(kind: std::io::ErrorKind) -> CliError {
        CliError::Io {
            path: PathBuf::from("/x"),
            source: std::io::Error::from(kind),
        }
    }

    #[test]
    fn every_variant_maps_to_an_exit_code() {
        let cases = [
            (CliError::NotImplemented(Slice::P2Content), ExitCode::Usage),
            (CliError::Usage("bad".into()), ExitCode::Usage),
            (
                CliError::ConfigUnknownKey { key: "k".into() },
                ExitCode::Usage,
            ),
            (
                CliError::ConfigInvalidValue {
                    key: ConfigKey::BlogUrl,
                    value: "x".into(),
                    expected: "a URL",
                },
                ExitCode::Usage,
            ),
            (
                CliError::ConfigInvalid {
                    path: PathBuf::from("/c"),
                    problems: vec![],
                },
                ExitCode::Generic,
            ),
            (io(std::io::ErrorKind::NotFound), ExitCode::Generic),
            (CliError::Offline { url: "u".into() }, ExitCode::Network),
            (
                CliError::Network {
                    url: "u".into(),
                    message: "m".into(),
                    request_id: None,
                },
                ExitCode::Network,
            ),
            (
                CliError::Http {
                    url: "u".into(),
                    status: 500,
                    request_id: None,
                },
                ExitCode::Network,
            ),
            (
                CliError::Http {
                    url: "u".into(),
                    status: 404,
                    request_id: Some("r".into()),
                },
                ExitCode::NotFound,
            ),
            (CliError::Declined, ExitCode::Declined),
            (CliError::Internal("i".into()), ExitCode::Generic),
        ];
        for (err, expected) in cases {
            assert_eq!(err.exit_code(), expected, "{err:?}");
            assert_eq!(err.body().exit_code, expected as u8);
        }
    }

    #[test]
    fn http_code_carries_status() {
        let err = CliError::Http {
            url: "u".into(),
            status: 404,
            request_id: Some("cf-1".into()),
        };
        assert_eq!(err.code(), "http_404");
        assert_eq!(err.request_id(), Some("cf-1"));
    }

    #[test]
    fn body_omits_absent_optionals() {
        let value = serde_json::to_value(CliError::Declined.body()).unwrap();
        let keys: Vec<&str> = value
            .as_object()
            .unwrap()
            .keys()
            .map(String::as_str)
            .collect();
        assert_eq!(keys, ["code", "exit_code", "message", "remediation"]);

        let value = serde_json::to_value(CliError::Internal("x".into()).body()).unwrap();
        let keys: Vec<&str> = value
            .as_object()
            .unwrap()
            .keys()
            .map(String::as_str)
            .collect();
        assert_eq!(keys, ["code", "exit_code", "message"]);

        let value = serde_json::to_value(CliError::NotImplemented(Slice::P8Chat).body()).unwrap();
        assert_eq!(
            value["tracking"],
            "https://github.com/duyet/monorepo/issues/1445"
        );
        assert_eq!(value["message"], "not implemented yet, tracked in #1445");
    }
}
