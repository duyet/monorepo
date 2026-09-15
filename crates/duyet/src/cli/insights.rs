use clap::{Args as ClapArgs, Subcommand};

use super::Ctx;
use crate::config::ConfigKey;
use crate::content::{http, insights_overview};
use crate::error::CliError;

const AFTER_HELP: &str = "\
Source: <api_url>/api/insights/overview.

Live shape is the insights dashboard (Cloudflare / PostHog / WakaTime / AI metrics), not
blog post counts. Unknown fields are ignored.

Examples:
  duyet insights overview
  duyet insights overview --json | jq .data

JSON (duyet.insights.v1):
  {\"generated_at\":\"..?\",\"cloudflare_requests\":N,\"cloudflare_pageviews\":N,
   \"posthog_views\":N,\"posthog_visitors\":N,\"waka_hours\":N,\"waka_top_language\":\"..\",
   \"ai_tokens\":N,\"ai_cost\":N}";

#[derive(Debug, ClapArgs)]
#[command(after_long_help = AFTER_HELP)]
pub struct Args {
    #[command(subcommand)]
    pub command: InsightsCommand,
}

#[derive(Debug, Subcommand)]
pub enum InsightsCommand {
    /// Site-wide totals
    #[command(after_long_help = AFTER_HELP)]
    Overview,
}

pub fn run(args: &Args, ctx: &Ctx) -> Result<(), CliError> {
    let http = http(ctx)?;
    match args.command {
        InsightsCommand::Overview => ctx.emit(&insights_overview(
            &http,
            ctx.settings.url(ConfigKey::ApiUrl),
        )?),
    }
}
