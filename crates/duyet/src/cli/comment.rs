use clap::Args as ClapArgs;

use crate::error::{CliError, Slice};

const SLICE: Slice = Slice::P7Submissions;

#[derive(Debug, ClapArgs)]
#[command(after_long_help = "\
Prints the full payload and destination, then asks `Send? [y/N]`. --yes skips the prompt; without
a terminal and without --yes the command exits 5. --dry-run shows the payload and sends nothing.
Comments enter a moderation queue and are not shown on the blog until approved.

Examples:
  duyet comment 2024-01-01-hello --body \"Great post\"
  duyet comment 2024-01-01-hello --body \"Typo in section 2\" --yes --json

JSON (duyet.submission.v1):
  {\"kind\":\"comment\",\"id\":\"..\",\"accepted\":true,\"idempotency_key\":\"..\"}

Status: not implemented yet, tracked in https://github.com/duyet/monorepo/issues/1448")]
pub struct Args {
    /// Slug of the post to comment on
    pub post_slug: String,
    /// Comment text (Markdown)
    #[arg(long)]
    pub body: String,
}

pub fn run(_args: &Args) -> Result<(), CliError> {
    Err(CliError::NotImplemented(SLICE))
}
