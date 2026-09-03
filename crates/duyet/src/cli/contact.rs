use clap::Args as ClapArgs;

use crate::error::{CliError, Slice};

const SLICE: Slice = Slice::P7Submissions;

#[derive(Debug, ClapArgs)]
#[command(after_long_help = "\
Prints the full payload and destination, then asks `Send? [y/N]`. --yes skips the prompt; without
a terminal and without --yes the command exits 5. --dry-run shows the payload and sends nothing.
Sends carry an idempotency key so a retry never double-posts.

Examples:
  duyet contact --name \"Ada\" --email ada@example.com --message \"Hi!\"
  duyet contact --name Ada --email ada@example.com --message Hi --yes --json

JSON (duyet.submission.v1):
  {\"kind\":\"contact\",\"id\":\"..\",\"accepted\":true,\"idempotency_key\":\"..\"}

Status: not implemented yet, tracked in https://github.com/duyet/monorepo/issues/1448")]
pub struct Args {
    /// Your name
    #[arg(long)]
    pub name: String,
    /// Reply-to address
    #[arg(long)]
    pub email: String,
    /// Message body
    #[arg(long)]
    pub message: String,
}

pub fn run(_args: &Args) -> Result<(), CliError> {
    Err(CliError::NotImplemented(SLICE))
}
