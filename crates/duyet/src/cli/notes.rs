use clap::{Args as ClapArgs, Subcommand};

use crate::error::{CliError, Slice};

const SLICE: Slice = Slice::P2Content;

const AFTER_HELP: &str = "\
Source: <blog_url>/notes-data.json and <blog_url>/note/<id>.md.

Examples:
  duyet notes list
  duyet notes list --json | jq '.data.items[0]'
  duyet notes read 42

JSON (duyet.notes.v1):
  list: {\"items\":[{\"id\":\"..\",\"title\":\"..\",\"date\":\"YYYY-MM-DD\",\"url\":\"..\"}]}
  read: {\"id\":\"..\",\"title\":\"..\",\"date\":\"..\",\"markdown\":\"..\"}

Status: not implemented yet, tracked in https://github.com/duyet/monorepo/issues/1443";

#[derive(Debug, ClapArgs)]
#[command(after_long_help = AFTER_HELP)]
pub struct Args {
    #[command(subcommand)]
    pub command: NotesCommand,
}

#[derive(Debug, Subcommand)]
pub enum NotesCommand {
    /// List notes, newest first
    #[command(after_long_help = AFTER_HELP)]
    List,
    /// Print one note
    #[command(after_long_help = AFTER_HELP)]
    Read {
        /// Note id
        id: String,
    },
}

pub fn run(_args: &Args) -> Result<(), CliError> {
    Err(CliError::NotImplemented(SLICE))
}
