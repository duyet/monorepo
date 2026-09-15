use clap::Args as ClapArgs;

use crate::config::Channel;

#[derive(Debug, ClapArgs)]
#[command(after_long_help = "\
Reads the channel manifest at https://duyet.net/cli/<channel>.json, verifies SHA256 and the minisign
signature, swaps the binary atomically, and keeps the previous one for --rollback. --check exits 10
when a newer release exists and 0 otherwise.

A TTY session checks the channel manifest at most once per 24h and prints a one-line hint on stderr.
Disable with `update.check = false` or DUYET_NO_UPDATE_CHECK=1. Never runs under --json or --quiet.

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
    {\"from\":\"0.1.0\",\"to\":\"0.2.0\",\"channel\":\"stable\",\"previous_kept\":true}")]
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
