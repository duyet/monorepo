use clap::{Args as ClapArgs, Subcommand};

use super::Ctx;
use crate::domain::{AuthStatus, TokenState};
use crate::error::CliError;
use crate::term::Interactivity;
use crate::token::{self, TokenSource};

const AFTER_HELP: &str = "\
The token lives in the OS keychain (key `agent_token`) or in DUYET_AGENT_TOKEN for CI. It is never
written to the config file. `status` reports set|unset and the first 4 characters only.

This talks to the duyet agent (agents-api.duyet.net).

Examples:
  duyet auth login                 # prompts for the token on a TTY
  duyet auth login --token \"$TOKEN\"
  duyet auth status --json | jq -r .data.state
  duyet auth logout

JSON (duyet.auth.v1):
  status: {\"state\":\"set|unset\",\"source\":\"keychain|env|none\"}
  login/logout: {\"state\":\"set|unset\"}";

#[derive(Debug, ClapArgs)]
#[command(after_long_help = AFTER_HELP)]
pub struct Args {
    #[command(subcommand)]
    pub command: AuthCommand,
}

#[derive(Debug, Subcommand)]
pub enum AuthCommand {
    /// Store an agent token in the OS keychain
    #[command(after_long_help = AFTER_HELP)]
    Login {
        /// Token value; prompted for when omitted
        #[arg(long)]
        token: Option<String>,
    },
    /// Remove the stored token
    #[command(after_long_help = AFTER_HELP)]
    Logout,
    /// Report whether a token is available (never prints more than 4 characters)
    #[command(after_long_help = AFTER_HELP)]
    Status,
}

pub fn run(args: &Args, ctx: &Ctx) -> Result<(), CliError> {
    match &args.command {
        AuthCommand::Login { token } => login(ctx, token.as_deref()),
        AuthCommand::Logout => {
            token::delete()?;
            ctx.emit(&AuthStatus {
                state: TokenState::Unset,
                source: "none",
                preview: None,
            })
        }
        AuthCommand::Status => ctx.emit(&status_report()),
    }
}

fn login(ctx: &Ctx, token: Option<&str>) -> Result<(), CliError> {
    let value = match token {
        Some(value) => value.to_owned(),
        None => read_token(ctx)?,
    };
    token::store(&value)?;
    ctx.emit(&AuthStatus {
        state: TokenState::Set,
        source: TokenSource::Keychain.as_str(),
        preview: Some(token::preview(&value)),
    })
}

fn read_token(ctx: &Ctx) -> Result<String, CliError> {
    match ctx.interactivity {
        Interactivity::NonInteractive { reason } => Err(CliError::Usage(format!(
            "token required ({reason}); pass --token or set DUYET_AGENT_TOKEN"
        ))),
        Interactivity::Interactive => {
            eprint!("agent token: ");
            let value = rpassword::read_password().map_err(|source| CliError::Io {
                path: std::path::PathBuf::from("<stdin>"),
                source,
            })?;
            if value.trim().is_empty() {
                Err(CliError::Usage("token must not be empty".into()))
            } else {
                Ok(value)
            }
        }
    }
}

fn status_report() -> AuthStatus {
    match token::resolve() {
        Some(resolved) => AuthStatus {
            state: TokenState::Set,
            source: resolved.source.as_str(),
            preview: Some(token::preview(&resolved.value)),
        },
        None => AuthStatus {
            state: TokenState::Unset,
            source: "none",
            preview: None,
        },
    }
}
