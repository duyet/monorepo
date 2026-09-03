use clap::Args as ClapArgs;

use super::Ctx;
use crate::TOKEN_ENV;
use crate::config::ConfigKey;
use crate::domain::{DoctorReport, TokenState};
use crate::error::CliError;
use crate::http::Http;

#[derive(Debug, ClapArgs)]
#[command(after_long_help = "\
Probes every base URL with HEAD (GET on 405), 5 s per probe. An unreachable endpoint is reported,
not fatal: the exit code is 0 whenever the report could be produced. --offline or DUYET_OFFLINE=1
skips the probes. The agent token is reported as set|unset and never printed.

Examples:
  duyet doctor
  duyet doctor --json | jq '.data.endpoints[] | select(.status.kind != \"reachable\")'
  DUYET_OFFLINE=1 duyet doctor

JSON (duyet.doctor.v1):
  {\"config_path\":\"..\",\"config_exists\":true,\"cache_dir\":\"..\",
   \"endpoints\":[{\"url\":\"..\",\"status\":{\"kind\":\"reachable\",\"status\":200},\"latency_ms\":N}],
   \"agent_token\":\"set|unset\",\"telemetry\":false,\"offline\":false}
  status.kind is reachable {status}, unreachable {message}, or skipped {reason}.")]
pub struct Args {}

const ENDPOINTS: [ConfigKey; 5] = [
    ConfigKey::BlogUrl,
    ConfigKey::KbUrl,
    ConfigKey::ApiUrl,
    ConfigKey::AgentsApiUrl,
    ConfigKey::NewsUrl,
];

pub fn run(_args: &Args, ctx: &Ctx) -> Result<(), CliError> {
    let http = Http::new(&ctx.paths, &ctx.globals, &ctx.settings)?;
    let endpoints = ENDPOINTS
        .iter()
        .map(|key| http.probe(ctx.settings.url(*key)))
        .collect();
    ctx.emit(&DoctorReport {
        config_path: ctx.paths.config_file.clone(),
        config_exists: ctx.config.exists(),
        cache_dir: ctx.paths.cache_dir.clone(),
        endpoints,
        agent_token: TokenState::from_env(TOKEN_ENV),
        telemetry: ctx.settings.telemetry(),
        offline: ctx.globals.offline,
    })
}
