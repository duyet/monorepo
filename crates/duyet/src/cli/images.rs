use std::path::PathBuf;

use clap::{Args as ClapArgs, Subcommand};

use crate::error::{CliError, Slice};

const SLICE: Slice = Slice::P2Content;

const AFTER_HELP: &str = "\
Only images on the post's own origin (blog_url) are fetched unless --allow-external is passed.

Examples:
  duyet images download 2024-01-01-hello --out ./hello-images
  duyet images download 2024-01-01-hello --out ./img --json | jq '.data.files[]'

JSON (duyet.images.v1):
  download:
    {\"slug\":\"..\",\"out\":\"DIR\",\"files\":[{\"url\":\"..\",\"path\":\"..\",\"bytes\":N}],\"skipped\":[\"..\"]}

Status: not implemented yet, tracked in https://github.com/duyet/monorepo/issues/1443";

#[derive(Debug, ClapArgs)]
#[command(after_long_help = AFTER_HELP)]
pub struct Args {
    #[command(subcommand)]
    pub command: ImagesCommand,
}

#[derive(Debug, Subcommand)]
pub enum ImagesCommand {
    /// Download every image referenced by a post
    #[command(after_long_help = AFTER_HELP)]
    Download {
        /// Post slug
        post_slug: String,
        /// Directory to write into (created if missing)
        #[arg(long, value_name = "DIR")]
        out: PathBuf,
        /// Also fetch images hosted outside blog_url
        #[arg(long)]
        allow_external: bool,
    },
}

pub fn run(_args: &Args) -> Result<(), CliError> {
    Err(CliError::NotImplemented(SLICE))
}
