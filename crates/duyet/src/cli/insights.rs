use clap::{Args as ClapArgs, Subcommand};

use crate::error::{CliError, Slice};

const SLICE: Slice = Slice::P2Content;

const AFTER_HELP: &str = "\
Source: <api_url>/api/insights/overview.

Examples:
  duyet insights overview
  duyet insights overview --json | jq .data

JSON (duyet.insights.v1):
  overview:
    {\"posts\":N,\"words\":N,\"first_post\":\"YYYY-MM-DD\",\"latest_post\":\"YYYY-MM-DD\",
     \"categories\":[{\"name\":\"..\",\"count\":N}]}

Status: not implemented yet, tracked in https://github.com/duyet/monorepo/issues/1443";

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

pub fn run(_args: &Args) -> Result<(), CliError> {
    Err(CliError::NotImplemented(SLICE))
}
