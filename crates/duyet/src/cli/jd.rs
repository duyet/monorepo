use clap::{Args as ClapArgs, Subcommand};

use crate::error::{CliError, Slice};

const SLICE: Slice = Slice::P7Submissions;

const AFTER_HELP: &str = "\
Prints the full payload and destination, then asks `Send? [y/N]`. --yes skips the prompt; without
a terminal and without --yes the command exits 5. --dry-run shows the payload and sends nothing.

Examples:
  duyet jd submit ./role.md --company Acme --note \"remote, EU hours\"
  duyet jd submit https://example.com/jobs/123 --yes --json

JSON (duyet.submission.v1):
  {\"kind\":\"jd\",\"id\":\"..\",\"accepted\":true,\"idempotency_key\":\"..\"}

Status: not implemented yet, tracked in https://github.com/duyet/monorepo/issues/1448";

#[derive(Debug, ClapArgs)]
#[command(after_long_help = AFTER_HELP)]
pub struct Args {
    #[command(subcommand)]
    pub command: JdCommand,
}

#[derive(Debug, Subcommand)]
pub enum JdCommand {
    /// Submit a job description from a file or URL
    #[command(after_long_help = AFTER_HELP)]
    Submit {
        /// Path to a text/Markdown/PDF file, or an http(s) URL
        source: String,
        /// Company name
        #[arg(long)]
        company: Option<String>,
        /// Anything else worth knowing
        #[arg(long)]
        note: Option<String>,
    },
}

pub fn run(_args: &Args) -> Result<(), CliError> {
    Err(CliError::NotImplemented(SLICE))
}
