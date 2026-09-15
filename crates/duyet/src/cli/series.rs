use clap::{Args as ClapArgs, Subcommand};

use super::Ctx;
use crate::config::ConfigKey;
use crate::content::{http, load_series, series_read, series_summaries};
use crate::domain::SeriesList;
use crate::error::CliError;

const AFTER_HELP: &str = "\
Source: <blog_url>/series-data.json.

Examples:
  duyet series list
  duyet series read rust-for-data --json | jq '.data.posts[].slug'

JSON (duyet.series.v1):
  list:
    {\"items\":[{\"slug\":\"..\",\"title\":\"..\",\"count\":N,\"url\":\"..\"}]}
  read:
    {\"slug\":\"..\",\"title\":\"..\",\"description\":\"..\",\"posts\":[{\"slug\":\"..\",\"title\":\"..\",\"date\":\"..\"}]}";

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

pub fn run(args: &Args, ctx: &Ctx) -> Result<(), CliError> {
    let http = http(ctx)?;
    let blog = ctx.settings.url(ConfigKey::BlogUrl).clone();
    let series = load_series(ctx, &http)?;
    match &args.command {
        SeriesCommand::List => ctx.emit(&SeriesList {
            items: series_summaries(&blog, &series),
        }),
        SeriesCommand::Read { slug } => {
            let entry = series
                .iter()
                .find(|s| s.slug == *slug || s.name.eq_ignore_ascii_case(slug))
                .ok_or_else(|| CliError::Missing {
                    resource: "series",
                    id: slug.clone(),
                })?;
            ctx.emit(&series_read(entry))
        }
    }
}
