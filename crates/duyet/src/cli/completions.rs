use clap::{Args as ClapArgs, CommandFactory};
use clap_complete::Shell;

use super::Cli;
use crate::error::CliError;
use crate::output::write_stdout;

#[derive(Debug, ClapArgs)]
#[command(after_long_help = "\
Prints the script to stdout; --json has no effect here.

Examples:
  duyet completions bash > ~/.local/share/bash-completion/completions/duyet
  duyet completions zsh > \"${fpath[1]}/_duyet\"
  duyet completions fish > ~/.config/fish/completions/duyet.fish
  duyet completions powershell >> $PROFILE")]
pub struct Args {
    /// Shell to generate for
    #[arg(value_enum)]
    pub shell: Shell,
}

pub fn run(args: &Args) -> Result<(), CliError> {
    let mut command = Cli::command();
    let mut script = Vec::new();
    clap_complete::generate(args.shell, &mut command, "duyet", &mut script);
    write_stdout(&script)
}
