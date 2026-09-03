use clap::Args as ClapArgs;

use crate::error::{CliError, Slice};

const SLICE: Slice = Slice::P8Chat;

#[derive(Debug, ClapArgs)]
#[command(after_long_help = "\
Talks to the duyet agent at <agents_api_url> (apps/agent-api). Requires a token from `duyet auth login`
or DUYET_AGENT_TOKEN. Without a prompt, reads one from stdin. Streams tokens to stdout on a TTY;
--json streams NDJSON, one {\"schema\":\"duyet.chat.v1\",\"data\":{..}} per line.

Examples:
  duyet chat \"what did duyet write about rust wasm?\"
  echo \"summarize the latest post\" | duyet chat --no-stream --json | jq -r .data.text
  duyet chat --session 8f2c \"continue\"

JSON (duyet.chat.v1):
  {\"session\":\"..\",\"role\":\"assistant\",\"text\":\"..\",\"done\":true}

Status: not implemented yet, tracked in https://github.com/duyet/monorepo/issues/1445")]
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

pub fn run(_args: &Args) -> Result<(), CliError> {
    Err(CliError::NotImplemented(SLICE))
}
