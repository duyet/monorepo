use crate::TOKEN_ENV;
use crate::error::CliError;

pub const KEYCHAIN_SERVICE: &str = "duyet";
pub const KEYCHAIN_KEY: &str = "agent_token";

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TokenSource {
    Env,
    Keychain,
}

impl TokenSource {
    pub fn as_str(self) -> &'static str {
        match self {
            TokenSource::Env => "env",
            TokenSource::Keychain => "keychain",
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ResolvedToken {
    pub value: String,
    pub source: TokenSource,
}

/// Env wins over the keychain so CI can inject `DUYET_AGENT_TOKEN` without touching the OS store.
pub fn resolve() -> Option<ResolvedToken> {
    match std::env::var(TOKEN_ENV) {
        Ok(value) if !value.is_empty() => {
            return Some(ResolvedToken {
                value,
                source: TokenSource::Env,
            });
        }
        Ok(_) | Err(_) => {}
    }
    match keychain_get() {
        Ok(Some(value)) if !value.is_empty() => Some(ResolvedToken {
            value,
            source: TokenSource::Keychain,
        }),
        _ => None,
    }
}

pub fn preview(token: &str) -> String {
    let mut chars = token.chars();
    let head: String = chars.by_ref().take(4).collect();
    if head.is_empty() {
        "...".into()
    } else {
        format!("{head}...")
    }
}

pub fn store(token: &str) -> Result<(), CliError> {
    let token = token.trim();
    if token.is_empty() {
        return Err(CliError::Usage("token must not be empty".into()));
    }
    keychain_set(token)
}

pub fn delete() -> Result<(), CliError> {
    match keychain_delete() {
        Ok(()) => Ok(()),
        Err(err) if is_not_found(&err) => Ok(()),
        Err(err) => Err(keychain_error(&err)),
    }
}

fn entry() -> Result<keyring::Entry, keyring::Error> {
    keyring::Entry::new(KEYCHAIN_SERVICE, KEYCHAIN_KEY)
}

fn keychain_get() -> Result<Option<String>, keyring::Error> {
    match entry()?.get_password() {
        Ok(value) => Ok(Some(value)),
        Err(err) if is_not_found(&err) => Ok(None),
        Err(err) => Err(err),
    }
}

fn keychain_set(token: &str) -> Result<(), CliError> {
    entry()
        .and_then(|e| e.set_password(token))
        .map_err(|err| keychain_error(&err))
}

fn keychain_delete() -> Result<(), keyring::Error> {
    entry()?.delete_credential()
}

fn is_not_found(err: &keyring::Error) -> bool {
    matches!(err, keyring::Error::NoEntry)
}

fn keychain_error(err: &keyring::Error) -> CliError {
    CliError::KeychainUnavailable {
        message: err.to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn preview_is_first_four_chars() {
        assert_eq!(preview("abcd-secret"), "abcd...");
        assert_eq!(preview("ab"), "ab...");
        assert_eq!(preview(""), "...");
    }

    #[test]
    fn env_wins_over_empty() {
        let name = TOKEN_ENV;
        unsafe { std::env::remove_var(name) };
        // Without a keychain entry this is None; with one it is keychain. Either is a resolve.
        let _ = resolve();
        unsafe { std::env::set_var(name, "env-token-value") };
        let got = resolve().expect("env token");
        assert_eq!(got.value, "env-token-value");
        assert_eq!(got.source, TokenSource::Env);
        unsafe { std::env::remove_var(name) };
    }
}
