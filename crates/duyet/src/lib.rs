pub mod cli;
pub mod config;
pub mod domain;
pub mod error;
pub mod http;
pub mod output;
pub mod paths;
pub mod term;

use std::ffi::OsString;

use clap::Parser;
use clap::error::ErrorKind;

use crate::cli::{Cli, Command, Ctx};
use crate::config::{ConfigState, Settings};
use crate::error::{CliError, ExitCode};
use crate::output::{Mode, Redactor, Style, emit_error};
use crate::paths::Paths;
use crate::term::Interactivity;

pub const VERSION: &str = env!("CARGO_PKG_VERSION");
pub const TARGET: &str = env!("DUYET_TARGET");
pub const COMMIT: &str = env!("DUYET_COMMIT");
pub const TOKEN_ENV: &str = "DUYET_AGENT_TOKEN";

pub fn run(args: impl IntoIterator<Item = OsString>) -> ExitCode {
    let args: Vec<OsString> = args.into_iter().collect();
    let json_hint = args.iter().any(|arg| arg == "--json");
    let cli = match Cli::try_parse_from(&args) {
        Ok(cli) => cli,
        Err(err) => return clap_exit(err, json_hint),
    };

    let flag_mode = if cli.globals.json {
        Mode::Json
    } else {
        Mode::Human
    };
    let style = term::style(cli.globals.no_color);
    let redactor = Redactor::from_env();

    let (command, ctx) = match bootstrap(cli, style, redactor.clone()) {
        Ok(bootstrapped) => bootstrapped,
        Err(err) => {
            emit_error(&err, flag_mode, &style, &redactor);
            return err.exit_code();
        }
    };
    match cli::dispatch(&command, &ctx) {
        Ok(()) => ExitCode::Ok,
        Err(err) => {
            emit_error(&err, ctx.mode, &ctx.style, &ctx.redactor);
            err.exit_code()
        }
    }
}

/// Help and version print and exit 0. Any other clap error is a usage error: an envelope when
/// the caller asked for `--json`, clap's own text otherwise.
fn clap_exit(err: clap::Error, json_hint: bool) -> ExitCode {
    match err.kind() {
        ErrorKind::DisplayHelp | ErrorKind::DisplayVersion => {
            err.print().ok();
            ExitCode::Ok
        }
        _ if json_hint => {
            let text = err.render().to_string();
            let trimmed = text.trim();
            let message = trimmed
                .strip_prefix("error: ")
                .unwrap_or(trimmed)
                .to_owned();
            emit_error(
                &CliError::Usage(message),
                Mode::Json,
                &Style::PLAIN,
                &Redactor::default(),
            );
            ExitCode::Usage
        }
        _ => {
            err.print().ok();
            ExitCode::Usage
        }
    }
}

fn bootstrap(cli: Cli, style: Style, redactor: Redactor) -> Result<(Command, Ctx), CliError> {
    let Cli {
        mut globals,
        command,
    } = cli;
    globals.apply_env();
    let paths = Paths::resolve(globals.config.as_deref())?;
    let config = match ConfigState::load(&paths.config_file) {
        ConfigState::Broken(err) if !command.tolerates_broken_config() => return Err(err),
        state => state,
    };
    let settings = Settings::resolve(config.file(), &globals)?;
    if globals.verbose >= 2 {
        eprintln!("duyet: config {}", paths.config_file.display());
        eprintln!("duyet: cache  {}", paths.cache_dir.display());
        eprintln!("duyet: data   {}", paths.data_dir.display());
    }
    let ctx = Ctx {
        mode: settings.mode(),
        interactivity: Interactivity::detect(globals.no_input),
        globals,
        paths,
        config,
        settings,
        style,
        redactor,
    };
    Ok((command, ctx))
}
