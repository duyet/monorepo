use clap::Args as ClapArgs;

use super::Ctx;
use crate::domain::Submission;
use crate::error::CliError;
use crate::term::prompt_required;

const PRIVACY: &str = "\
Sends post slug, author, optional email, and body as JSON to POST {api_url}/api/comments. The
slug is checked against cached posts-data.json first. Comments are queued for moderation; the
CLI stores no secrets. Prints the payload, then asks `Send? [y/N]`. --yes skips the prompt;
--no-input without --yes exits 5. --json returns {id, kind, accepted_at} and does not echo the
payload.

Examples:
  duyet comment 2026/08/grok-bot --body \"nice\" --author Ada --yes";

#[derive(Debug, ClapArgs)]
#[command(after_long_help = PRIVACY)]
pub struct Args {
    /// Slug of the post to comment on (YYYY/MM/slug)
    pub post_slug: String,
    /// Comment text
    #[arg(long)]
    pub body: String,
    /// Display name (prompted on a TTY if omitted)
    #[arg(long)]
    pub author: Option<String>,
    /// Optional reply-to address
    #[arg(long)]
    pub email: Option<String>,
}

pub fn run(args: &Args, ctx: &Ctx) -> Result<(), CliError> {
    let author = match args
        .author
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
    {
        Some(value) => value.to_owned(),
        None => match ctx.interactivity {
            crate::term::Interactivity::Interactive => {
                prompt_required("author", &ctx.interactivity)?
            }
            crate::term::Interactivity::NonInteractive { .. } => "anonymous".into(),
        },
    };
    let submission =
        Submission::comment(&args.post_slug, &author, args.email.as_deref(), &args.body)?;
    super::submit::send(ctx, submission)
}
