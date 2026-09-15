use std::io::{self, Write};
use std::path::Path;

use serde::Serialize;
use url::Url;

use crate::error::CliError;
use crate::output::{Render, Style};

pub const JD_TEXT_MAX_BYTES: usize = 32_768;
const EMAIL_MAX: usize = 254;

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum JdSource {
    Text(String),
    Url(String),
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum Submission {
    Contact {
        name: String,
        email: String,
        message: String,
    },
    Jd {
        #[serde(skip_serializing_if = "Option::is_none")]
        company: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        note: Option<String>,
        #[serde(flatten)]
        source: JdSourceFlat,
    },
    Comment {
        post: String,
        author: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        email: Option<String>,
        body: String,
    },
}

/// Wire shape for JD: either `text` or `url`, matching POST /api/jd.
#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
pub enum JdSourceFlat {
    #[serde(rename = "text")]
    Text(String),
    #[serde(rename = "url")]
    Url(String),
}

impl From<JdSource> for JdSourceFlat {
    fn from(source: JdSource) -> JdSourceFlat {
        match source {
            JdSource::Text(text) => JdSourceFlat::Text(text),
            JdSource::Url(url) => JdSourceFlat::Url(url),
        }
    }
}

impl Submission {
    pub fn kind(&self) -> &'static str {
        match self {
            Submission::Contact { .. } => "contact",
            Submission::Jd { .. } => "jd",
            Submission::Comment { .. } => "comment",
        }
    }

    pub fn path(&self) -> &'static str {
        match self {
            Submission::Contact { .. } => "/api/contact",
            Submission::Jd { .. } => "/api/jd",
            Submission::Comment { .. } => "/api/comments",
        }
    }

    pub fn contact(name: &str, email: &str, message: &str) -> Result<Submission, CliError> {
        let name = require_nonempty(name, "name")?;
        let email = parse_email(email)?;
        let message = require_nonempty(message, "message")?;
        Ok(Submission::Contact {
            name,
            email,
            message,
        })
    }

    pub fn jd(
        source: &str,
        company: Option<&str>,
        note: Option<&str>,
    ) -> Result<Submission, CliError> {
        let company = optional_nonempty(company);
        let note = optional_nonempty(note);
        let source = parse_jd_source(source)?;
        Ok(Submission::Jd {
            company,
            note,
            source: source.into(),
        })
    }

    pub fn comment(
        post: &str,
        author: &str,
        email: Option<&str>,
        body: &str,
    ) -> Result<Submission, CliError> {
        let post = parse_post_slug(post)?;
        let author = require_nonempty(author, "author")?;
        let email = match email {
            None => None,
            Some(value) if value.trim().is_empty() => None,
            Some(value) => Some(parse_email(value)?),
        };
        let body = require_nonempty(body, "body")?;
        Ok(Submission::Comment {
            post,
            author,
            email,
            body,
        })
    }

    pub fn api_payload(&self) -> serde_json::Value {
        match self {
            Submission::Contact {
                name,
                email,
                message,
            } => serde_json::json!({
                "name": name,
                "email": email,
                "message": message,
            }),
            Submission::Jd {
                company,
                note,
                source,
            } => {
                let mut map = serde_json::Map::new();
                if let Some(company) = company {
                    map.insert("company".into(), serde_json::Value::String(company.clone()));
                }
                if let Some(note) = note {
                    map.insert("note".into(), serde_json::Value::String(note.clone()));
                }
                match source {
                    JdSourceFlat::Text(text) => {
                        map.insert("text".into(), serde_json::Value::String(text.clone()));
                    }
                    JdSourceFlat::Url(url) => {
                        map.insert("url".into(), serde_json::Value::String(url.clone()));
                    }
                }
                serde_json::Value::Object(map)
            }
            Submission::Comment {
                post,
                author,
                email,
                body,
            } => {
                let mut map = serde_json::Map::new();
                map.insert("post".into(), serde_json::Value::String(post.clone()));
                map.insert("author".into(), serde_json::Value::String(author.clone()));
                if let Some(email) = email {
                    map.insert("email".into(), serde_json::Value::String(email.clone()));
                }
                map.insert("body".into(), serde_json::Value::String(body.clone()));
                serde_json::Value::Object(map)
            }
        }
    }
}

#[derive(Debug, Serialize)]
pub struct AcceptedSubmission {
    pub id: String,
    pub kind: &'static str,
    pub accepted_at: String,
}

impl Render for AcceptedSubmission {
    const SCHEMA: &'static str = "duyet.submission.v1";

    fn human(&self, out: &mut dyn Write, _style: &Style) -> io::Result<()> {
        writeln!(out, "{}", self.id)
    }
}

pub fn parse_email(raw: &str) -> Result<String, CliError> {
    let email = raw.trim();
    if email.len() > EMAIL_MAX || !is_email(email) {
        return Err(CliError::Usage(format!("invalid email `{raw}`")));
    }
    Ok(email.to_owned())
}

pub fn parse_post_slug(raw: &str) -> Result<String, CliError> {
    let trimmed = raw.trim().trim_start_matches('/');
    let trimmed = trimmed.strip_suffix(".html").unwrap_or(trimmed);
    if !is_post_slug(trimmed) {
        return Err(CliError::Usage(format!(
            "invalid post slug `{raw}` (expected YYYY/MM/slug)"
        )));
    }
    Ok(format!("/{trimmed}"))
}

pub fn is_known_post_slug(posts_data: &str, slug: &str) -> bool {
    let Ok(value) = serde_json::from_str::<serde_json::Value>(posts_data) else {
        return false;
    };
    let Some(items) = value.as_array() else {
        return false;
    };
    items.iter().any(|item| {
        item.get("slug")
            .and_then(|s| s.as_str())
            .is_some_and(|found| {
                let normalized = parse_post_slug(found).ok();
                normalized.as_deref() == Some(slug) || found == slug
            })
    })
}

fn parse_jd_source(source: &str) -> Result<JdSource, CliError> {
    let trimmed = source.trim();
    if looks_like_url(trimmed) {
        let url =
            Url::parse(trimmed).map_err(|_| CliError::Usage(format!("invalid URL `{trimmed}`")))?;
        if url.scheme() != "https" {
            return Err(CliError::Usage(
                "JD URL must be https (http is not accepted)".into(),
            ));
        }
        return Ok(JdSource::Url(url.to_string()));
    }
    let path = Path::new(trimmed);
    let text = std::fs::read_to_string(path).map_err(|source| CliError::Io {
        path: path.to_path_buf(),
        source,
    })?;
    let text = text.trim().to_owned();
    if text.is_empty() {
        return Err(CliError::Usage("JD file is empty".into()));
    }
    if text.len() > JD_TEXT_MAX_BYTES {
        return Err(CliError::Usage(format!(
            "JD text is {} bytes; the client cap is {JD_TEXT_MAX_BYTES} bytes",
            text.len()
        )));
    }
    Ok(JdSource::Text(text))
}

fn looks_like_url(value: &str) -> bool {
    value.starts_with("https://") || value.starts_with("http://")
}

fn require_nonempty(value: &str, field: &str) -> Result<String, CliError> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return Err(CliError::Usage(format!("{field} is required")));
    }
    Ok(trimmed.to_owned())
}

fn optional_nonempty(value: Option<&str>) -> Option<String> {
    value
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_owned)
}

fn is_email(value: &str) -> bool {
    let Some((user, host)) = value.split_once('@') else {
        return false;
    };
    !user.is_empty()
        && !user.contains(char::is_whitespace)
        && host.contains('.')
        && !host.contains(char::is_whitespace)
        && !host.starts_with('.')
        && !host.ends_with('.')
}

fn is_post_slug(value: &str) -> bool {
    let mut parts = value.split('/');
    let (Some(year), Some(month), Some(slug), None) =
        (parts.next(), parts.next(), parts.next(), parts.next())
    else {
        return false;
    };
    year.len() == 4
        && year.bytes().all(|b| b.is_ascii_digit())
        && month.len() == 2
        && month.bytes().all(|b| b.is_ascii_digit())
        && !slug.is_empty()
        && slug
            .bytes()
            .next()
            .is_some_and(|b| b.is_ascii_alphanumeric())
        && slug
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_')
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn contact_rejects_bad_email() {
        assert!(Submission::contact("Ada", "not-an-email", "hi").is_err());
        assert!(Submission::contact("Ada", "ada@example.com", "hi").is_ok());
    }

    #[test]
    fn slug_format() {
        assert_eq!(
            parse_post_slug("2026/08/grok-bot").unwrap(),
            "/2026/08/grok-bot"
        );
        assert_eq!(
            parse_post_slug("/2026/08/grok-bot.html").unwrap(),
            "/2026/08/grok-bot"
        );
        assert!(parse_post_slug("not-a-slug").is_err());
    }

    #[test]
    fn known_slug_from_posts_data() {
        let json = r#"[{"slug":"/2026/08/grok-bot"}]"#;
        assert!(is_known_post_slug(json, "/2026/08/grok-bot"));
        assert!(!is_known_post_slug(json, "/2026/08/nope"));
    }
}
