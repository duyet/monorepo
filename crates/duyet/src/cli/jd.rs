use clap::{Args as ClapArgs, Subcommand};

use super::Ctx;
use crate::domain::Submission;
use crate::error::CliError;

const PRIVACY: &str = "\
Sends a job description as JSON to POST {api_url}/api/jd: file contents as `text` (32 KB cap) or
an https `url`. The CLI stores no secrets. Prints the payload, then asks `Send? [y/N]`. --yes
skips the prompt; --no-input without --yes exits 5. --json returns {id, kind, accepted_at} and
does not echo the payload.

Examples:
  duyet jd submit ./role.md --company Acme --note \"remote, EU hours\" --yes";

#[derive(Debug, ClapArgs)]
#[command(after_long_help = PRIVACY)]
pub struct Args {
    #[command(subcommand)]
    pub command: JdCommand,
}

#[derive(Debug, Subcommand)]
pub enum JdCommand {
    /// Submit a job description from a file or URL
    #[command(after_long_help = PRIVACY)]
    Submit {
        /// Path to a text/Markdown file, or an https URL
        source: String,
        /// Company name
        #[arg(long)]
        company: Option<String>,
        /// Anything else worth knowing
        #[arg(long)]
        note: Option<String>,
    },
}

pub fn run(args: &Args, ctx: &Ctx) -> Result<(), CliError> {
    let JdCommand::Submit {
        source,
        company,
        note,
    } = &args.command;
    let submission = Submission::jd(source, company.as_deref(), note.as_deref())?;
    super::submit::send(ctx, submission)
}
