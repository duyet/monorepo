use clap::{Args as ClapArgs, Subcommand, ValueEnum};

use super::Ctx;
use crate::config::ConfigKey;
use crate::content::{
    body_for_read, download_images, filter_posts, find_post, http, load_post_content, load_posts,
    open_url, rss_from_posts, search_posts, summaries,
};
use crate::domain::{OpenReport, PostList, PostRead, date_only, normalize_slug, post_url};
use crate::error::CliError;
use crate::markdown::extract_image_urls;
use crate::output::{Mode, write_stdout};

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
    {\"slug\":\"..\",\"title\":\"..\",\"date\":\"..\",\"markdown\":\"..\",\"images\":[\"..\"],\"is_mdx\":false}";

#[derive(Debug, ClapArgs)]
#[command(after_long_help = AFTER_HELP)]
pub struct Args {
    #[command(subcommand)]
    pub command: PostsCommand,
}

#[derive(Clone, Copy, Debug, ValueEnum)]
pub enum ListFormat {
    Table,
    Rss,
}

impl std::fmt::Display for ListFormat {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ListFormat::Table => f.write_str("table"),
            ListFormat::Rss => f.write_str("rss"),
        }
    }
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
        /// table (default) or rss XML
        #[arg(long, value_enum, default_value_t = ListFormat::Table)]
        format: ListFormat,
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

pub fn run(args: &Args, ctx: &Ctx) -> Result<(), CliError> {
    let http = http(ctx)?;
    let blog = ctx.settings.url(ConfigKey::BlogUrl).clone();
    match &args.command {
        PostsCommand::List {
            limit,
            category,
            tag,
            format,
        } => {
            let posts = load_posts(ctx, &http)?;
            let filtered = filter_posts(&posts, category.as_deref(), tag.as_deref());
            let items = summaries(&blog, &filtered, *limit);
            if matches!(format, ListFormat::Rss) && ctx.mode != Mode::Json {
                return write_stdout(rss_from_posts(&blog, &items).as_bytes());
            }
            ctx.emit(&PostList {
                items,
                next_cursor: None,
            })
        }
        PostsCommand::Search { query } => {
            let posts = load_posts(ctx, &http)?;
            ctx.emit(&PostList {
                items: search_posts(&blog, &posts, query),
                next_cursor: None,
            })
        }
        PostsCommand::Read {
            target,
            raw,
            images,
        } => {
            let posts = load_posts(ctx, &http)?;
            let post = find_post(&posts, target)?;
            let content = load_post_content(ctx, &http, &post.slug)?;
            let markdown = body_for_read(&content, *raw);
            let image_urls = extract_image_urls(&content.content, &content.html);
            if let Some(dir) = images {
                let extra = post.thumbnail.clone().into_iter().collect::<Vec<_>>();
                download_images(
                    &http,
                    &blog,
                    &content.content,
                    &content.html,
                    &extra,
                    dir,
                    false,
                )?;
            }
            ctx.emit(&PostRead {
                slug: normalize_slug(&post.slug),
                title: post.title.clone(),
                date: date_only(&post.date),
                markdown,
                images: image_urls,
                is_mdx: content.is_mdx,
            })
        }
        PostsCommand::Open { slug } => {
            let posts = load_posts(ctx, &http)?;
            let post = find_post(&posts, slug)?;
            let url = post_url(&blog, &post.slug);
            let opened = if ctx.globals.dry_run {
                false
            } else {
                open_url(&url)
            };
            ctx.emit(&OpenReport { url, opened })
        }
    }
}
