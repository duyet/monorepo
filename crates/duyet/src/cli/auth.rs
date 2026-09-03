use clap::{Args as ClapArgs, Subcommand};

use crate::error::{CliError, Slice};

const SLICE: Slice = Slice::P8Chat;

const AFTER_HELP: &str = "\
The token lives in the OS keychain (key `agent_token`) or in DUYET_AGENT_TOKEN for CI. It is never
written to the config file and never printed: `status` reports set|unset only.

Examples:
  duyet auth login                 # prompts for the token on a TTY
  duyet auth login --token \"$TOKEN\"
  duyet auth status --json | jq -r .data.state
  duyet auth logout

JSON (duyet.auth.v1):
  status: {\"state\":\"set|unset\",\"source\":\"keychain|env|none\"}
  login/logout: {\"state\":\"set|unset\"}

Status: not implemented yet, tracked in https://github.com/duyet/monorepo/issues/1445";

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
    /// Report whether a token is available (never prints it)
    #[command(after_long_help = AFTER_HELP)]
    Status,
}

pub fn run(_args: &Args) -> Result<(), CliError> {
    Err(CliError::NotImplemented(SLICE))
}
