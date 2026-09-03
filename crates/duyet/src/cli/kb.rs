use clap::{Args as ClapArgs, Subcommand};

use crate::error::{CliError, Slice};

const SLICE: Slice = Slice::P2Content;

const AFTER_HELP: &str = "\
Source: <kb_url>/llms.txt for the index and <kb_url>/k/<slug>.md for articles.

Examples:
  duyet kb list --category data
  duyet kb search \"materialized view\" --json | jq '.data.items[].slug'
  duyet kb read data-lakehouse --raw

JSON (duyet.kb.v1):
  list/search: {\"items\":[{\"slug\":\"..\",\"title\":\"..\",\"category\":\"..\",\"url\":\"..\"}]}
  read:        {\"slug\":\"..\",\"title\":\"..\",\"markdown\":\"..\",\"links\":[\"..\"]}

Status: not implemented yet, tracked in https://github.com/duyet/monorepo/issues/1443";

#[derive(Debug, ClapArgs)]
#[command(after_long_help = AFTER_HELP)]
pub struct Args {
    #[command(subcommand)]
    pub command: KbCommand,
}

#[derive(Debug, Subcommand)]
pub enum KbCommand {
    /// List articles
    #[command(after_long_help = AFTER_HELP)]
    List {
        /// Only articles in this category
        #[arg(long, value_name = "C")]
        category: Option<String>,
    },
    /// Full-text search over the article index (client side)
    #[command(after_long_help = AFTER_HELP)]
    Search {
        /// Words to search for
        query: String,
    },
    /// Print one article as terminal Markdown
    #[command(after_long_help = AFTER_HELP)]
    Read {
        /// Article slug
        slug: String,
        /// Print the raw Markdown source without terminal rendering
        #[arg(long)]
        raw: bool,
    },
}

pub fn run(_args: &Args) -> Result<(), CliError> {
    Err(CliError::NotImplemented(SLICE))
}
