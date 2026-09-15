use std::path::PathBuf;

use clap::{Args as ClapArgs, Subcommand};

use super::Ctx;
use crate::config::ConfigKey;
use crate::content::{download_images, find_post, http, load_post_content, load_posts};
use crate::domain::{ImageManifest, normalize_slug};
use crate::error::CliError;

const AFTER_HELP: &str = "\
Only images on the post's own origin (blog_url) are fetched unless --allow-external is passed.

Examples:
  duyet images download 2024-01-01-hello --out ./hello-images
  duyet images download 2024-01-01-hello --out ./img --json | jq '.data.files[]'

JSON (duyet.images.v1):
  download:
    {\"slug\":\"..\",\"out\":\"DIR\",\"files\":[{\"url\":\"..\",\"path\":\"..\",\"bytes\":N}],\"skipped\":[\"..\"]}";

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

pub fn run(args: &Args, ctx: &Ctx) -> Result<(), CliError> {
    let http = http(ctx)?;
    let blog = ctx.settings.url(ConfigKey::BlogUrl).clone();
    match &args.command {
        ImagesCommand::Download {
            post_slug,
            out,
            allow_external,
        } => {
            let posts = load_posts(ctx, &http)?;
            let post = find_post(&posts, post_slug)?;
            let content = load_post_content(ctx, &http, &post.slug)?;
            let extra = post.thumbnail.clone().into_iter().collect::<Vec<_>>();
            let (files, skipped) = download_images(
                &http,
                &blog,
                &content.content,
                &content.html,
                &extra,
                out,
                *allow_external,
            )?;
            ctx.emit(&ImageManifest {
                slug: normalize_slug(&post.slug),
                out: out.clone(),
                files,
                skipped,
            })
        }
    }
}
