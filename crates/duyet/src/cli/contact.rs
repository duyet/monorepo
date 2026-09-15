use clap::Args as ClapArgs;

use super::Ctx;
use crate::domain::Submission;
use crate::error::CliError;
use crate::term::prompt_required;

const PRIVACY: &str = "\
Sends name, email, and message as JSON to POST {api_url}/api/contact. The CLI stores no secrets;
the message is queued for review. Prints the payload, then asks `Send? [y/N]`. --yes skips the
prompt; --no-input without --yes exits 5. --json returns {id, kind, accepted_at} and does not
echo the payload.

Examples:
  duyet contact --name Ada --email ada@example.com --message \"Hi\" --yes";

#[derive(Debug, ClapArgs)]
#[command(after_long_help = PRIVACY)]
pub struct Args {
    /// Your name
    #[arg(long)]
    pub name: Option<String>,
    /// Reply-to address
    #[arg(long)]
    pub email: Option<String>,
    /// Message body
    #[arg(long)]
    pub message: Option<String>,
}

pub fn run(args: &Args, ctx: &Ctx) -> Result<(), CliError> {
    let name = required_or_prompt("name", args.name.as_deref(), ctx)?;
    let email = required_or_prompt("email", args.email.as_deref(), ctx)?;
    let message = required_or_prompt("message", args.message.as_deref(), ctx)?;
    let submission = Submission::contact(&name, &email, &message)?;
    super::submit::send(ctx, submission)
}

fn required_or_prompt(flag: &str, value: Option<&str>, ctx: &Ctx) -> Result<String, CliError> {
    match value.map(str::trim).filter(|value| !value.is_empty()) {
        Some(value) => Ok(value.to_owned()),
        None => prompt_required(flag, &ctx.interactivity),
    }
}
