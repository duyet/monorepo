use clap::{Args as ClapArgs, Subcommand};

use crate::error::{CliError, Slice};

const SLICE: Slice = Slice::P2Content;

const AFTER_HELP: &str = "\
Source: <blog_url>/posts-data.json and <blog_url>/posts-content/<key>.json, cached under the cache dir.

Examples:
  duyet posts list --limit 10
  duyet posts list --category data --json | jq '.data.items[].slug'
  duyet posts search \"rust wasm\"
  duyet posts read 2024-01-01-hello --raw > hello.md

JSON (duyet.posts.v1):
  list/search:
    {\"items\":[{\"slug\":\"..\",\"title\":\"..\",\"date\":\"YYYY-MM-DD\",\"category\":\"..\",\"tags\":[..],\"url\":\"..\"}],
     \"next_cursor\":\"..\"?}
  read:
    {\"slug\":\"..\",\"title\":\"..\",\"date\":\"..\",\"markdown\":\"..\",\"images\":[\"..\"]}

Status: not implemented yet, tracked in https://github.com/duyet/monorepo/issues/1443";

#[derive(Debug, ClapArgs)]
#[command(after_long_help = AFTER_HELP)]
pub struct Args {
    #[command(subcommand)]
    pub command: PostsCommand,
}

#[derive(Debug, Subcommand)]
pub enum PostsCommand {
    /// List posts, newest first
    #[command(after_long_help = AFTER_HELP)]
    List {
        /// Maximum number of posts
        #[arg(long, value_name = "N")]
        limit: Option<usize>,
        /// Only posts in this category
        #[arg(long, value_name = "C")]
        category: Option<String>,
        /// Only posts with this tag
        #[arg(long, value_name = "T")]
        tag: Option<String>,
    },
    /// Full-text search over titles, tags, and summaries (client side)
    #[command(after_long_help = AFTER_HELP)]
    Search {
        /// Words to search for
        query: String,
    },
    /// Print one post as terminal Markdown
    #[command(after_long_help = AFTER_HELP)]
    Read {
        /// Post slug or full URL
        target: String,
        /// Print the raw Markdown source without terminal rendering
        #[arg(long)]
        raw: bool,
        /// Also download the post's images into this directory
        #[arg(long, value_name = "DIR")]
        images: Option<std::path::PathBuf>,
    },
    /// Open a post in the browser
    #[command(after_long_help = AFTER_HELP)]
    Open {
        /// Post slug
        slug: String,
    },
}

pub fn run(_args: &Args) -> Result<(), CliError> {
    Err(CliError::NotImplemented(SLICE))
}
