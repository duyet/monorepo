use clap::Args as ClapArgs;

use crate::config::Channel;
use crate::error::{CliError, Slice};

const SLICE: Slice = Slice::P5Update;

#[derive(Debug, ClapArgs)]
#[command(after_long_help = "\
Reads the channel manifest at https://duyet.net/cli/<channel>.json, verifies SHA256 and the minisign
signature, swaps the binary atomically, and keeps the previous one for --rollback. --check exits 10
when a newer release exists and 0 otherwise.

Examples:
  duyet update --check
  duyet update
  duyet update --channel beta
  duyet update --version 0.2.0
  duyet update --rollback

JSON (duyet.update.v1):
  --check:
    {\"current\":\"0.1.0\",\"latest\":\"0.2.0\",\"channel\":\"stable\",\"update_available\":true}
  update:
    {\"from\":\"0.1.0\",\"to\":\"0.2.0\",\"channel\":\"stable\",\"previous_kept\":true}

Status: not implemented yet, tracked in https://github.com/duyet/monorepo/issues/1447")]
pub struct Args {
    /// Only report whether an update exists (exit 10 if so)
    #[arg(long)]
    pub check: bool,
    /// Switch channel in the config and update from it
    #[arg(long, value_parser = parse_channel)]
    pub channel: Option<Channel>,
    /// Install this exact version
    #[arg(long, value_name = "X")]
    pub version: Option<String>,
    /// Swap the previous binary back
    #[arg(long, conflicts_with_all = ["check", "channel", "version"])]
    pub rollback: bool,
}

fn parse_channel(raw: &str) -> Result<Channel, String> {
    raw.parse()
        .map_err(|()| "expected stable or beta".to_owned())
}

pub fn run(_args: &Args) -> Result<(), CliError> {
    Err(CliError::NotImplemented(SLICE))
}
