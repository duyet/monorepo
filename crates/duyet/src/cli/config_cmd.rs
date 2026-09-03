use std::collections::BTreeMap;

use clap::{Args as ClapArgs, Subcommand};

use super::Ctx;
use crate::config::{self, ConfigKey, Severity};
use crate::domain::{
    ConfigDoctorReport, ConfigEntry, ConfigPathReport, ConfigReport, ConfigWrite, ProblemEntry,
};
use crate::error::CliError;

const AFTER_HELP: &str = "\
Keys (each also readable from the environment variable in parentheses):
  blog_url        (DUYET_BLOG_URL)        base URL of the blog
  kb_url          (DUYET_KB_URL)          base URL of the knowledge base
  api_url         (DUYET_API_URL)         base URL of api.duyet.net
  agents_api_url  (DUYET_AGENTS_API_URL)  base URL of the duyet agent
  news_url        (DUYET_NEWS_URL)        base URL of the news digest
  channel         (DUYET_CHANNEL)         stable|beta
  output          (DUYET_OUTPUT)          human|json
  telemetry       (DUYET_TELEMETRY)       true|false, opt-in; nothing is sent in this release
  update.check    (DUYET_UPDATE_CHECK)    true|false

Precedence: flags > environment > config file > default. The file never holds a secret; the agent
token lives in DUYET_AGENT_TOKEN. Writes are atomic (temp file + rename, mode 0600 on unix).

Examples:
  duyet config path
  duyet config show --json | jq '.data.values.blog_url'
  duyet config set blog_url https://blog.duyet.net
  duyet config set --dry-run channel beta
  duyet config unset blog_url
  duyet config doctor

JSON:
  path (duyet.config_path.v1):
    {\"path\":\"..\",\"exists\":true}
  show (duyet.config.v1):
    {\"path\":\"..\",\"exists\":true,\"values\":{\"<key>\":{\"value\":\"..\",\"source\":\"default|file|env|flag\"}}}
  set/unset (duyet.config_write.v1):
    {\"path\":\"..\",\"key\":\"..\",\"value\":\"..\"?,\"changed\":true,\"dry_run\":false,\"toml\":\"..\"}
  doctor (duyet.config_doctor.v1), exits 1 with code config_invalid when any problem is an error:
    {\"path\":\"..\",\"exists\":true,\"problems\":[{\"severity\":\"warning\",\"message\":\"..\"}]}";

#[derive(Debug, ClapArgs)]
#[command(after_long_help = AFTER_HELP)]
pub struct Args {
    #[command(subcommand)]
    pub command: ConfigCommand,
}

#[derive(Debug, Subcommand)]
pub enum ConfigCommand {
    /// Print the config file path
    #[command(after_long_help = AFTER_HELP)]
    Path,
    /// Print every key with its effective value and where it came from
    #[command(after_long_help = AFTER_HELP)]
    Show,
    /// Set a key (validated before writing)
    #[command(after_long_help = AFTER_HELP)]
    Set {
        /// Key name, e.g. blog_url or update.check
        key: String,
        /// New value
        value: String,
    },
    /// Remove a key from the file (no error if it is not set)
    #[command(after_long_help = AFTER_HELP)]
    Unset {
        /// Key name
        key: String,
    },
    /// Lint the file: parse errors, unknown keys, bad values, secret-looking keys, loose permissions
    #[command(after_long_help = AFTER_HELP)]
    Doctor,
}

pub fn run(args: &Args, ctx: &Ctx) -> Result<(), CliError> {
    let path = &ctx.paths.config_file;
    let exists = ctx.config.exists();
    match &args.command {
        ConfigCommand::Path => ctx.emit(&ConfigPathReport {
            path: path.clone(),
            exists,
        }),
        ConfigCommand::Show => {
            let values: BTreeMap<&'static str, ConfigEntry> = ConfigKey::ALL
                .iter()
                .map(|key| {
                    let (value, source) = ctx.settings.get(*key);
                    (
                        key.name(),
                        ConfigEntry {
                            value: value.to_string(),
                            source,
                        },
                    )
                })
                .collect();
            ctx.emit(&ConfigReport {
                path: path.clone(),
                exists,
                values,
            })
        }
        ConfigCommand::Set { key, value } => {
            let key = ConfigKey::from_name(key)?;
            let parsed = key.parse(value)?;
            let mut file = ctx.config.file().cloned().unwrap_or_default();
            let changed = file.get(key).as_deref() != Some(parsed.to_string().as_str());
            file.set(key, &parsed);
            let toml = file.save(path, ctx.globals.dry_run)?;
            ctx.emit(&ConfigWrite {
                path: path.clone(),
                key: key.name(),
                value: Some(parsed.to_string()),
                changed,
                dry_run: ctx.globals.dry_run,
                toml,
            })
        }
        ConfigCommand::Unset { key } => {
            let key = ConfigKey::from_name(key)?;
            let mut file = ctx.config.file().cloned().unwrap_or_default();
            let changed = file.unset(key);
            let toml = if changed || ctx.globals.dry_run {
                file.save(path, ctx.globals.dry_run)?
            } else {
                toml::to_string(&file).map_err(|err| CliError::Internal(err.to_string()))?
            };
            ctx.emit(&ConfigWrite {
                path: path.clone(),
                key: key.name(),
                value: None,
                changed,
                dry_run: ctx.globals.dry_run,
                toml,
            })
        }
        ConfigCommand::Doctor => {
            let problems = config::doctor(path);
            let errors: Vec<String> = problems
                .iter()
                .filter(|problem| problem.severity() == Severity::Error)
                .map(|problem| problem.to_string())
                .collect();
            if !errors.is_empty() {
                return Err(CliError::ConfigInvalid {
                    path: path.clone(),
                    problems: errors,
                });
            }
            ctx.emit(&ConfigDoctorReport {
                path: path.clone(),
                exists,
                problems: problems
                    .iter()
                    .map(|problem| ProblemEntry {
                        severity: problem.severity(),
                        message: problem.to_string(),
                    })
                    .collect(),
            })
        }
    }
}
