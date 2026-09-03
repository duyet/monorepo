pub mod auth;
pub mod chat;
pub mod comment;
pub mod completions;
pub mod config_cmd;
pub mod contact;
pub mod docs;
pub mod doctor;
pub mod images;
pub mod insights;
pub mod jd;
pub mod kb;
pub mod news;
pub mod notes;
pub mod posts;
pub mod series;
pub mod update;
pub mod version;

use std::path::PathBuf;

use clap::{ArgAction, Args, Parser, Subcommand};

use crate::config::{ConfigState, Settings};
use crate::error::CliError;
use crate::output::{Mode, Redactor, Render, Style, emit};
use crate::paths::Paths;
use crate::term::Interactivity;

const ROOT_AFTER_HELP: &str = "\
Output:
  Human-readable by default. --json prints one envelope per command:
    {\"ok\":true,\"schema\":\"duyet.<name>.v1\",\"data\":{...}}
    {\"ok\":false,\"schema\":\"duyet.error.v1\",\"error\":{\"code\":\"..\",\"message\":\"..\",\"exit_code\":N}}
  stdout carries data, stderr carries progress and human errors.

Exit codes:
  0 ok   1 generic   2 usage or not implemented   3 network   4 auth
  5 declined   6 not found   10 update available

Config precedence:
  flags > environment (DUYET_<KEY>) > config file > built-in default. See `duyet config show`.

Examples:
  duyet version --json | jq .data.version
  duyet config set blog_url https://blog.duyet.net
  duyet doctor
  duyet docs tree";

#[derive(Debug, Parser)]
#[command(
    name = "duyet",
    version,
    about = "Read duyet.net from the terminal: posts, notes, series, KB, news, insights, and the duyet agent",
    long_about = None,
    after_long_help = ROOT_AFTER_HELP,
    subcommand_required = true,
    arg_required_else_help = true,
    max_term_width = 100
)]
pub struct Cli {
    #[command(flatten)]
    pub globals: Globals,
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Debug, Args)]
#[command(next_help_heading = "Global options")]
pub struct Globals {
    /// Print a JSON envelope instead of human output
    #[arg(long, global = true)]
    pub json: bool,

    /// Suppress human output (JSON is still printed)
    #[arg(short, long, global = true)]
    pub quiet: bool,

    /// Log HTTP requests to stderr; -vv adds cache decisions and resolved paths
    #[arg(short, long, global = true, action = ArgAction::Count)]
    pub verbose: u8,

    /// Disable ANSI colors (NO_COLOR and TERM=dumb are also honored)
    #[arg(long, global = true)]
    pub no_color: bool,

    /// Config file to use instead of the default location
    #[arg(long, global = true, value_name = "PATH")]
    pub config: Option<PathBuf>,

    /// Answer yes to every confirmation
    #[arg(short, long, global = true)]
    pub yes: bool,

    /// Never prompt; a needed confirmation exits 5 instead
    #[arg(long, global = true)]
    pub no_input: bool,

    /// Show what would change without writing or sending anything
    #[arg(long, global = true)]
    pub dry_run: bool,

    /// Serve from cache only and skip network probes (or DUYET_OFFLINE=1)
    #[arg(long, global = true)]
    pub offline: bool,

    /// HTTP timeout in seconds
    #[arg(
        long,
        global = true,
        env = "DUYET_TIMEOUT",
        default_value_t = 30,
        value_name = "SECS"
    )]
    pub timeout: u64,
}

impl Globals {
    /// `DUYET_OFFLINE` is a switch, not a value: set and not one of `0`, `false`, `no`, `off`
    /// (or empty) means offline. clap's env parsers reject `1` or an empty string.
    pub fn apply_env(&mut self) {
        self.offline |= env_switch("DUYET_OFFLINE");
    }
}

pub fn env_switch(name: &str) -> bool {
    std::env::var(name).is_ok_and(|raw| {
        let raw = raw.trim().to_ascii_lowercase();
        !matches!(raw.as_str(), "" | "0" | "false" | "no" | "off")
    })
}

#[derive(Debug, Subcommand)]
pub enum Command {
    /// Blog posts: list, search, read, open
    Posts(posts::Args),
    /// Short notes
    Notes(notes::Args),
    /// Post series
    Series(series::Args),
    /// Knowledge base articles
    Kb(kb::Args),
    /// Daily LLM news digest
    News(news::Args),
    /// Download a post's images
    Images(images::Args),
    /// Site insights and stats
    Insights(insights::Args),
    /// Chat with the duyet agent
    Chat(chat::Args),
    /// Send a contact message (confirms before sending)
    Contact(contact::Args),
    /// Submit a job description (confirms before sending)
    Jd(jd::Args),
    /// Comment on a post (confirms before sending)
    Comment(comment::Args),
    /// Manage the agent token
    Auth(auth::Args),
    /// Read and edit the config file
    Config(config_cmd::Args),
    /// Update the binary or check for a newer release
    Update(update::Args),
    /// Check config, cache, endpoints, and token state
    Doctor(doctor::Args),
    /// Print version, target, channel, and commit
    Version(version::Args),
    /// Print a shell completion script
    Completions(completions::Args),
    /// Generate man pages, Markdown reference, or the command tree
    Docs(docs::Args),
}

impl Command {
    /// `config doctor` and `config path` must run on a file that fails to parse: they are how
    /// the user finds out what is wrong with it.
    pub fn tolerates_broken_config(&self) -> bool {
        matches!(
            self,
            Command::Config(config_cmd::Args {
                command: config_cmd::ConfigCommand::Doctor | config_cmd::ConfigCommand::Path
            })
        )
    }
}

/// Everything resolved once at startup that a command may need.
pub struct Ctx {
    pub globals: Globals,
    pub paths: Paths,
    pub config: ConfigState,
    pub settings: Settings,
    pub mode: Mode,
    pub style: Style,
    pub interactivity: Interactivity,
    pub redactor: Redactor,
}

impl Ctx {
    pub fn emit<T: Render>(&self, value: &T) -> Result<(), CliError> {
        emit(value, self.mode, &self.style, self.globals.quiet)
    }
}

pub fn dispatch(command: &Command, ctx: &Ctx) -> Result<(), CliError> {
    match command {
        Command::Posts(args) => posts::run(args),
        Command::Notes(args) => notes::run(args),
        Command::Series(args) => series::run(args),
        Command::Kb(args) => kb::run(args),
        Command::News(args) => news::run(args),
        Command::Images(args) => images::run(args),
        Command::Insights(args) => insights::run(args),
        Command::Chat(args) => chat::run(args),
        Command::Contact(args) => contact::run(args),
        Command::Jd(args) => jd::run(args),
        Command::Comment(args) => comment::run(args),
        Command::Auth(args) => auth::run(args),
        Command::Config(args) => config_cmd::run(args, ctx),
        Command::Update(args) => update::run(args),
        Command::Doctor(args) => doctor::run(args, ctx),
        Command::Version(args) => version::run(args, ctx),
        Command::Completions(args) => completions::run(args),
        Command::Docs(args) => docs::run(args, ctx),
    }
}

#[cfg(test)]
mod tests {
    use super::env_switch;

    #[test]
    fn env_switch_reads_like_a_flag() {
        let name = "DUYET_TEST_SWITCH";
        for (raw, expected) in [
            ("", false),
            ("0", false),
            ("false", false),
            ("No", false),
            ("off", false),
            ("1", true),
            ("true", true),
            ("yes", true),
            ("anything", true),
        ] {
            unsafe { std::env::set_var(name, raw) };
            assert_eq!(env_switch(name), expected, "{raw:?}");
        }
        unsafe { std::env::remove_var(name) };
        assert!(!env_switch(name));
    }
}
