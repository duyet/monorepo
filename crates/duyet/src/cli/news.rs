use clap::{Args as ClapArgs, Subcommand, ValueEnum};

use crate::error::{CliError, Slice};

const SLICE: Slice = Slice::P2Content;

const AFTER_HELP: &str = "\
Source: <news_url>/api/public.

Examples:
  duyet news today
  duyet news today --lang vi
  duyet news today --json | jq '.data.stories[].title'

JSON (duyet.news.v1):
  today:
    {\"date\":\"YYYY-MM-DD\",\"lang\":\"en|vi\",
     \"stories\":[{\"title\":\"..\",\"summary\":\"..\",\"url\":\"..\",\"score\":N}]}

Status: not implemented yet, tracked in https://github.com/duyet/monorepo/issues/1443";

#[derive(Debug, ClapArgs)]
#[command(after_long_help = AFTER_HELP)]
pub struct Args {
    #[command(subcommand)]
    pub command: NewsCommand,
}

#[derive(Clone, Copy, Debug, ValueEnum)]
pub enum Lang {
    En,
    Vi,
}

#[derive(Debug, Subcommand)]
pub enum NewsCommand {
    /// Today's digest
    #[command(after_long_help = AFTER_HELP)]
    Today {
        /// Digest language
        #[arg(long, value_enum, default_value_t = Lang::En)]
        lang: Lang,
    },
}

pub fn run(_args: &Args) -> Result<(), CliError> {
    Err(CliError::NotImplemented(SLICE))
}
