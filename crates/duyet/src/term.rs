use std::io::{self, BufRead, IsTerminal, Write};

use crate::error::CliError;
use crate::output::Style;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Interactivity {
    Interactive,
    NonInteractive { reason: &'static str },
}

impl Interactivity {
    pub fn detect(no_input_flag: bool) -> Interactivity {
        if no_input_flag {
            Interactivity::NonInteractive {
                reason: "--no-input",
            }
        } else if std::env::var_os("CI").is_some() {
            Interactivity::NonInteractive {
                reason: "CI is set",
            }
        } else if !io::stdin().is_terminal() {
            Interactivity::NonInteractive {
                reason: "stdin is not a terminal",
            }
        } else if !io::stdout().is_terminal() {
            Interactivity::NonInteractive {
                reason: "stdout is not a terminal",
            }
        } else {
            Interactivity::Interactive
        }
    }
}

/// `--yes` always confirms. Without a terminal the answer is `Declined`, never a hang.
pub fn confirm(prompt: &str, yes: bool, interactivity: &Interactivity) -> Result<(), CliError> {
    if yes {
        return Ok(());
    }
    match interactivity {
        Interactivity::NonInteractive { .. } => Err(CliError::Declined),
        Interactivity::Interactive => {
            eprint!("{prompt} [y/N] ");
            io::stderr().flush().ok();
            let mut answer = String::new();
            io::stdin().lock().read_line(&mut answer).ok();
            match answer.trim() {
                "y" | "Y" | "yes" | "YES" => Ok(()),
                _ => Err(CliError::Declined),
            }
        }
    }
}

pub fn style(no_color_flag: bool) -> Style {
    let env = |name: &str| std::env::var(name).ok();
    let lang_utf8 = ["LC_ALL", "LC_CTYPE", "LANG"]
        .iter()
        .filter_map(|name| env(name))
        .any(|value| is_utf8_locale(&value));
    resolve_style(StyleInputs {
        no_color_flag,
        no_color_env: std::env::var_os("NO_COLOR").is_some(),
        clicolor_force: std::env::var_os("CLICOLOR_FORCE").is_some(),
        term: env("TERM"),
        lang_utf8: lang_utf8 || cfg!(windows),
        stdout_tty: io::stdout().is_terminal(),
    })
}

pub struct StyleInputs {
    pub no_color_flag: bool,
    pub no_color_env: bool,
    pub clicolor_force: bool,
    pub term: Option<String>,
    pub lang_utf8: bool,
    pub stdout_tty: bool,
}

pub fn resolve_style(inputs: StyleInputs) -> Style {
    let dumb = inputs.term.as_deref() == Some("dumb");
    let color = if inputs.no_color_flag {
        false
    } else if inputs.clicolor_force {
        true
    } else {
        !inputs.no_color_env && !dumb && inputs.stdout_tty
    };
    Style {
        color,
        unicode: !dumb && inputs.lang_utf8,
    }
}

fn is_utf8_locale(value: &str) -> bool {
    let lower = value.to_ascii_lowercase();
    lower.contains("utf-8") || lower.contains("utf8")
}

#[cfg(test)]
mod tests {
    use super::*;

    fn inputs() -> StyleInputs {
        StyleInputs {
            no_color_flag: false,
            no_color_env: false,
            clicolor_force: false,
            term: Some("xterm-256color".into()),
            lang_utf8: true,
            stdout_tty: true,
        }
    }

    #[test]
    fn color_rules() {
        assert!(resolve_style(inputs()).color);
        assert!(
            !resolve_style(StyleInputs {
                no_color_env: true,
                ..inputs()
            })
            .color
        );
        assert!(
            !resolve_style(StyleInputs {
                term: Some("dumb".into()),
                ..inputs()
            })
            .color
        );
        assert!(
            !resolve_style(StyleInputs {
                stdout_tty: false,
                ..inputs()
            })
            .color
        );
        assert!(
            resolve_style(StyleInputs {
                stdout_tty: false,
                clicolor_force: true,
                ..inputs()
            })
            .color
        );
        assert!(
            !resolve_style(StyleInputs {
                no_color_flag: true,
                clicolor_force: true,
                ..inputs()
            })
            .color
        );
    }

    #[test]
    fn unicode_rules() {
        assert!(resolve_style(inputs()).unicode);
        assert!(
            !resolve_style(StyleInputs {
                lang_utf8: false,
                ..inputs()
            })
            .unicode
        );
        assert!(
            !resolve_style(StyleInputs {
                term: Some("dumb".into()),
                ..inputs()
            })
            .unicode
        );
        assert!(is_utf8_locale("en_US.UTF-8"));
        assert!(is_utf8_locale("C.utf8"));
        assert!(!is_utf8_locale("POSIX"));
    }

    #[test]
    fn confirm_without_terminal_declines_unless_yes() {
        let non_interactive = Interactivity::NonInteractive { reason: "test" };
        assert!(confirm("Send?", true, &non_interactive).is_ok());
        assert!(matches!(
            confirm("Send?", false, &non_interactive),
            Err(CliError::Declined)
        ));
    }
}
