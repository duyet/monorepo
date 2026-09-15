use clap::{Args as ClapArgs, Subcommand};

use super::Ctx;
use crate::config::ConfigKey;
use crate::content::{get_text, http, join, kb_index, search_kb};
use crate::domain::{KbArticle, KbList, parse_frontmatter_title};
use crate::error::CliError;
use crate::markdown::render;

const AFTER_HELP: &str = "\
Source: <kb_url>/llms.txt for the index and <kb_url>/k/<slug>.md for articles.

Examples:
  duyet kb list --category data
  duyet kb search \"materialized view\" --json | jq '.data.items[].slug'
  duyet kb read data-lakehouse --raw

JSON (duyet.kb.v1):
  list/search: {\"items\":[{\"slug\":\"..\",\"title\":\"..\",\"category\":\"..\",\"url\":\"..\"}]}
  read:        {\"slug\":\"..\",\"title\":\"..\",\"markdown\":\"..\",\"links\":[\"..\"]}";

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

pub fn run(args: &Args, ctx: &Ctx) -> Result<(), CliError> {
    let http = http(ctx)?;
    let kb = ctx.settings.url(ConfigKey::KbUrl).clone();
    match &args.command {
        KbCommand::List { category } => {
            let mut items = kb_index(ctx, &http)?;
            if let Some(cat) = category {
                items.retain(|a| a.category.eq_ignore_ascii_case(cat));
            }
            ctx.emit(&KbList { items })
        }
        KbCommand::Search { query } => {
            let items = kb_index(ctx, &http)?;
            ctx.emit(&KbList {
                items: search_kb(&items, query),
            })
        }
        KbCommand::Read { slug, raw } => {
            let url = join(&kb, &format!("k/{slug}.md"))?;
            let markdown = get_text(&http, &url)?;
            let title = parse_frontmatter_title(&markdown).unwrap_or_else(|| slug.clone());
            let mut article = KbArticle {
                slug: slug.clone(),
                title,
                category: String::new(),
                url: join(&kb, &format!("k/{slug}"))
                    .map(|u| u.to_string())
                    .unwrap_or_default(),
                markdown: Some(if *raw {
                    markdown.clone()
                } else {
                    render(&markdown)
                }),
                links: Vec::new(),
            };
            if let Some(index) = kb_index(ctx, &http)
                .ok()
                .and_then(|items| items.into_iter().find(|a| a.slug == *slug))
            {
                article.category = index.category;
            }
            ctx.emit(&article)
        }
    }
}
