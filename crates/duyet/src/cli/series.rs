use clap::{Args as ClapArgs, Subcommand};

use crate::error::{CliError, Slice};

const SLICE: Slice = Slice::P2Content;

const AFTER_HELP: &str = "\
Source: <blog_url>/series-data.json.

Examples:
  duyet series list
  duyet series read rust-for-data --json | jq '.data.posts[].slug'

JSON (duyet.series.v1):
  list:
    {\"items\":[{\"slug\":\"..\",\"title\":\"..\",\"count\":N,\"url\":\"..\"}]}
  read:
    {\"slug\":\"..\",\"title\":\"..\",\"description\":\"..\",\"posts\":[{\"slug\":\"..\",\"title\":\"..\",\"date\":\"..\"}]}

Status: not implemented yet, tracked in https://github.com/duyet/monorepo/issues/1443";

#[derive(Debug, ClapArgs)]
#[command(after_long_help = AFTER_HELP)]
pub struct Args {
    #[command(subcommand)]
    pub command: SeriesCommand,
}

#[derive(Debug, Subcommand)]
pub enum SeriesCommand {
    /// List series
    #[command(after_long_help = AFTER_HELP)]
    List,
    /// Show one series and its posts
    #[command(after_long_help = AFTER_HELP)]
    Read {
        /// Series slug
        slug: String,
    },
}

pub fn run(_args: &Args) -> Result<(), CliError> {
    Err(CliError::NotImplemented(SLICE))
}
