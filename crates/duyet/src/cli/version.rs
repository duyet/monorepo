use clap::Args as ClapArgs;

use super::Ctx;
use crate::domain::VersionInfo;
use crate::error::CliError;
use crate::{COMMIT, TARGET, VERSION};

#[derive(Debug, ClapArgs)]
#[command(after_long_help = "\
Works offline and never touches the network or the cache.

Examples:
  duyet version
  duyet version --json | jq -r .data.version

JSON (duyet.version.v1):
  {\"version\":\"X.Y.Z\",\"target\":\"<triple>\",\"channel\":\"stable|beta\",\"commit\":\"<short sha>\"}")]
pub struct Args {}

pub fn run(_args: &Args, ctx: &Ctx) -> Result<(), CliError> {
    ctx.emit(&VersionInfo {
        version: VERSION,
        target: TARGET,
        channel: ctx.settings.channel(),
        commit: COMMIT,
    })
}
