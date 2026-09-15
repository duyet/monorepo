use clap::{Args as ClapArgs, Subcommand};

use super::Ctx;
use crate::config::ConfigKey;
use crate::content::{get_text, http, join, load_notes, note_summary};
use crate::domain::{NoteList, parse_frontmatter_title};
use crate::error::CliError;
use crate::markdown::render;

const AFTER_HELP: &str = "\
Source: <blog_url>/notes-data.json and <blog_url>/note/<id>.md.

Examples:
  duyet notes list
  duyet notes list --json | jq '.data.items[0]'
  duyet notes read 42

JSON (duyet.notes.v1):
  list: {\"items\":[{\"id\":\"..\",\"title\":\"..\",\"date\":\"YYYY-MM-DD\",\"url\":\"..\"}]}
  read: {\"id\":\"..\",\"title\":\"..\",\"date\":\"..\",\"markdown\":\"..\"}";

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

pub fn run(args: &Args, ctx: &Ctx) -> Result<(), CliError> {
    let http = http(ctx)?;
    let blog = ctx.settings.url(ConfigKey::BlogUrl).clone();
    let notes = load_notes(ctx, &http)?;
    match &args.command {
        NotesCommand::List => {
            let items = notes.iter().map(|n| note_summary(&blog, n)).collect();
            ctx.emit(&NoteList { items })
        }
        NotesCommand::Read { id } => {
            let entry = notes
                .iter()
                .find(|n| n.id == *id)
                .ok_or_else(|| CliError::Missing {
                    resource: "note",
                    id: id.clone(),
                })?;
            let url = join(&blog, &format!("note/{id}.md"))?;
            let raw = get_text(&http, &url)?;
            let title = parse_frontmatter_title(&raw).unwrap_or_else(|| entry.title.clone());
            let mut note = note_summary(&blog, entry);
            note.title = title;
            note.markdown = Some(render(&raw));
            ctx.emit(&note)
        }
    }
}
