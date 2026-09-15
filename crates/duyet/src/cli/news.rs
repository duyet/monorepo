use clap::{Args as ClapArgs, Subcommand, ValueEnum};

use super::Ctx;
use crate::config::ConfigKey;
use crate::content::{http, news_today};
use crate::error::CliError;

const AFTER_HELP: &str = "\
Source: <news_url>/api/public (default https://aidr.today; news.duyet.net host-redirects there).

The live payload is `{tldr:{date,bullets_en,bullets_vi}, stories:[{title,title_vi,url,category}]}`.
`news today` maps bullets for `--lang` plus the stories list. There is no `score` field on aidr.today.

Examples:
  duyet news today
  duyet news today --lang vi
  duyet news today --json | jq '.data.stories[].title'

JSON (duyet.news.v1):
  today:
    {\"date\":\"YYYY-MM-DD\",\"lang\":\"en|vi\",\"source\":\"..\",
     \"stories\":[{\"title\":\"..\",\"summary\":\"..?\",\"url\":\"..?\",\"score\":N?}]}";

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

impl Lang {
    fn as_str(self) -> &'static str {
        match self {
            Lang::En => "en",
            Lang::Vi => "vi",
        }
    }
}

impl std::fmt::Display for Lang {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
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

pub fn run(args: &Args, ctx: &Ctx) -> Result<(), CliError> {
    let http = http(ctx)?;
    match &args.command {
        NewsCommand::Today { lang } => {
            let digest = news_today(&http, ctx.settings.url(ConfigKey::NewsUrl), lang.as_str())?;
            ctx.emit(&digest)
        }
    }
}
