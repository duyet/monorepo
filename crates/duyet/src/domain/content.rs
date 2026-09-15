use std::io::{self, Write};
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::output::{Render, Style, table};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Post {
    pub slug: String,
    pub title: String,
    #[serde(default)]
    pub date: String,
    #[serde(default)]
    pub category: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub excerpt: String,
    #[serde(default)]
    pub url: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PostIndexEntry {
    pub slug: String,
    pub title: String,
    #[serde(default)]
    pub date: String,
    #[serde(default)]
    pub category: String,
    #[serde(default)]
    pub category_slug: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub excerpt: String,
    #[serde(default)]
    pub series: Option<String>,
    #[serde(default)]
    pub thumbnail: Option<String>,
}

impl PostIndexEntry {
    pub fn summary(&self, blog: &url::Url) -> Post {
        Post {
            slug: normalize_slug(&self.slug),
            title: self.title.clone(),
            date: date_only(&self.date),
            category: self.category.clone(),
            tags: self.tags.clone(),
            excerpt: self.excerpt.clone(),
            url: post_url(blog, &self.slug),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PostContentFile {
    #[serde(default)]
    pub content: String,
    #[serde(default)]
    pub html: String,
    #[serde(default, rename = "isMDX")]
    pub is_mdx: bool,
}

#[derive(Clone, Debug, Serialize)]
pub struct PostList {
    pub items: Vec<Post>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next_cursor: Option<String>,
}

impl Render for PostList {
    const SCHEMA: &'static str = "duyet.posts.v1";

    fn human(&self, out: &mut dyn Write, style: &Style) -> io::Result<()> {
        let rows: Vec<Vec<String>> = self
            .items
            .iter()
            .map(|post| {
                vec![
                    post.date.clone(),
                    post.slug.clone(),
                    post.title.clone(),
                    post.category.clone(),
                ]
            })
            .collect();
        table(out, style, &["date", "slug", "title", "category"], &rows)
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct PostRead {
    pub slug: String,
    pub title: String,
    pub date: String,
    pub markdown: String,
    pub images: Vec<String>,
    pub is_mdx: bool,
}

impl Render for PostRead {
    const SCHEMA: &'static str = "duyet.posts.v1";

    fn human(&self, out: &mut dyn Write, style: &Style) -> io::Result<()> {
        writeln!(out, "{}", style.bold(&self.title))?;
        writeln!(
            out,
            "{}",
            style.dim(&format!("{}  {}", self.date, self.slug))
        )?;
        writeln!(out)?;
        if self.is_mdx {
            writeln!(
                out,
                "{}",
                style.dim("MDX post: showing pre-rendered HTML stripped to text.")
            )?;
            writeln!(out)?;
        }
        out.write_all(self.markdown.as_bytes())?;
        if !self.markdown.ends_with('\n') {
            writeln!(out)?;
        }
        Ok(())
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct OpenReport {
    pub url: String,
    pub opened: bool,
}

impl Render for OpenReport {
    const SCHEMA: &'static str = "duyet.posts_open.v1";

    fn human(&self, out: &mut dyn Write, _style: &Style) -> io::Result<()> {
        if self.opened {
            writeln!(out, "opened {}", self.url)
        } else {
            writeln!(out, "{}", self.url)
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NoteIndexEntry {
    pub id: String,
    pub title: String,
    #[serde(default)]
    pub date: String,
    #[serde(default)]
    pub excerpt: String,
}

#[derive(Clone, Debug, Serialize)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub date: String,
    pub url: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub markdown: Option<String>,
}

#[derive(Clone, Debug, Serialize)]
pub struct NoteList {
    pub items: Vec<Note>,
}

impl Render for NoteList {
    const SCHEMA: &'static str = "duyet.notes.v1";

    fn human(&self, out: &mut dyn Write, style: &Style) -> io::Result<()> {
        let rows: Vec<Vec<String>> = self
            .items
            .iter()
            .map(|note| vec![note.date.clone(), note.id.clone(), note.title.clone()])
            .collect();
        table(out, style, &["date", "id", "title"], &rows)
    }
}

impl Render for Note {
    const SCHEMA: &'static str = "duyet.notes.v1";

    fn human(&self, out: &mut dyn Write, style: &Style) -> io::Result<()> {
        writeln!(out, "{}", style.bold(&self.title))?;
        writeln!(out, "{}", style.dim(&format!("{}  {}", self.date, self.id)))?;
        writeln!(out)?;
        if let Some(md) = &self.markdown {
            out.write_all(md.as_bytes())?;
            if !md.ends_with('\n') {
                writeln!(out)?;
            }
        }
        Ok(())
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SeriesIndexEntry {
    pub name: String,
    pub slug: String,
    #[serde(default)]
    pub posts: Vec<SeriesPost>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SeriesPost {
    pub slug: String,
    pub title: String,
    #[serde(default)]
    pub date: String,
}

#[derive(Clone, Debug, Serialize)]
pub struct SeriesSummary {
    pub slug: String,
    pub title: String,
    pub count: usize,
    pub url: String,
}

#[derive(Clone, Debug, Serialize)]
pub struct SeriesList {
    pub items: Vec<SeriesSummary>,
}

impl Render for SeriesList {
    const SCHEMA: &'static str = "duyet.series.v1";

    fn human(&self, out: &mut dyn Write, style: &Style) -> io::Result<()> {
        let rows: Vec<Vec<String>> = self
            .items
            .iter()
            .map(|s| vec![s.slug.clone(), s.title.clone(), s.count.to_string()])
            .collect();
        table(out, style, &["slug", "title", "count"], &rows)
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct SeriesRead {
    pub slug: String,
    pub title: String,
    pub description: String,
    pub posts: Vec<SeriesPost>,
}

impl Render for SeriesRead {
    const SCHEMA: &'static str = "duyet.series.v1";

    fn human(&self, out: &mut dyn Write, style: &Style) -> io::Result<()> {
        writeln!(out, "{}", style.bold(&self.title))?;
        writeln!(out, "{}", style.dim(&self.slug))?;
        let rows: Vec<Vec<String>> = self
            .posts
            .iter()
            .map(|p| vec![date_only(&p.date), normalize_slug(&p.slug), p.title.clone()])
            .collect();
        table(out, style, &["date", "slug", "title"], &rows)
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct KbArticle {
    pub slug: String,
    pub title: String,
    pub category: String,
    pub url: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub markdown: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub links: Vec<String>,
}

#[derive(Clone, Debug, Serialize)]
pub struct KbList {
    pub items: Vec<KbArticle>,
}

impl Render for KbList {
    const SCHEMA: &'static str = "duyet.kb.v1";

    fn human(&self, out: &mut dyn Write, style: &Style) -> io::Result<()> {
        let rows: Vec<Vec<String>> = self
            .items
            .iter()
            .map(|a| vec![a.category.clone(), a.slug.clone(), a.title.clone()])
            .collect();
        table(out, style, &["category", "slug", "title"], &rows)
    }
}

impl Render for KbArticle {
    const SCHEMA: &'static str = "duyet.kb.v1";

    fn human(&self, out: &mut dyn Write, style: &Style) -> io::Result<()> {
        writeln!(out, "{}", style.bold(&self.title))?;
        writeln!(
            out,
            "{}",
            style.dim(&format!("{}  {}", self.category, self.slug))
        )?;
        writeln!(out)?;
        if let Some(md) = &self.markdown {
            out.write_all(md.as_bytes())?;
            if !md.ends_with('\n') {
                writeln!(out)?;
            }
        }
        Ok(())
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct NewsStory {
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub score: Option<f64>,
}

#[derive(Clone, Debug, Serialize)]
pub struct NewsDigest {
    pub date: String,
    pub lang: String,
    pub stories: Vec<NewsStory>,
    /// aidr.today `/api/public` uses `tldr.bullets_{lang}` plus a `stories` array.
    pub source: String,
}

impl Render for NewsDigest {
    const SCHEMA: &'static str = "duyet.news.v1";

    fn human(&self, out: &mut dyn Write, style: &Style) -> io::Result<()> {
        writeln!(
            out,
            "{} ({})  {}",
            style.bold(&self.date),
            self.lang,
            style.dim(&self.source)
        )?;
        for (i, story) in self.stories.iter().enumerate() {
            writeln!(out, "{}. {}", i + 1, story.title)?;
            if let Some(summary) = &story.summary {
                writeln!(out, "   {summary}")?;
            }
            if let Some(url) = &story.url {
                writeln!(out, "   {}", style.dim(url))?;
            }
        }
        Ok(())
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct InsightsOverview {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub generated_at: Option<String>,
    pub cloudflare_requests: u64,
    pub cloudflare_pageviews: u64,
    pub posthog_views: u64,
    pub posthog_visitors: u64,
    pub waka_hours: f64,
    pub waka_top_language: String,
    pub ai_tokens: u64,
    pub ai_cost: f64,
}

impl Render for InsightsOverview {
    const SCHEMA: &'static str = "duyet.insights.v1";

    fn human(&self, out: &mut dyn Write, style: &Style) -> io::Result<()> {
        if let Some(at) = &self.generated_at {
            writeln!(out, "{}", style.dim(at))?;
        }
        let rows = vec![
            vec![
                "cloudflare.requests".into(),
                self.cloudflare_requests.to_string(),
            ],
            vec![
                "cloudflare.pageviews".into(),
                self.cloudflare_pageviews.to_string(),
            ],
            vec!["posthog.views".into(), self.posthog_views.to_string()],
            vec!["posthog.visitors".into(), self.posthog_visitors.to_string()],
            vec!["waka.hours".into(), format!("{:.1}", self.waka_hours)],
            vec!["waka.top_language".into(), self.waka_top_language.clone()],
            vec!["ai.tokens".into(), self.ai_tokens.to_string()],
            vec!["ai.cost".into(), format!("{:.2}", self.ai_cost)],
        ];
        table(out, style, &["metric", "value"], &rows)
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct ImageFile {
    pub url: String,
    pub path: String,
    pub bytes: u64,
}

#[derive(Clone, Debug, Serialize)]
pub struct ImageManifest {
    pub slug: String,
    pub out: PathBuf,
    pub files: Vec<ImageFile>,
    pub skipped: Vec<String>,
}

impl Render for ImageManifest {
    const SCHEMA: &'static str = "duyet.images.v1";

    fn human(&self, out: &mut dyn Write, _style: &Style) -> io::Result<()> {
        writeln!(
            out,
            "{} -> {} ({} files, {} skipped)",
            self.slug,
            self.out.display(),
            self.files.len(),
            self.skipped.len()
        )?;
        for file in &self.files {
            writeln!(out, "  {}  {} B", file.path, file.bytes)?;
        }
        for skip in &self.skipped {
            writeln!(out, "  skip {skip}")?;
        }
        Ok(())
    }
}

pub fn normalize_slug(slug: &str) -> String {
    slug.trim()
        .trim_start_matches("https://blog.duyet.net")
        .trim_start_matches("http://blog.duyet.net")
        .trim_start_matches('/')
        .trim_end_matches('/')
        .trim_end_matches(".html")
        .to_owned()
}

pub fn content_key(slug: &str) -> String {
    normalize_slug(slug).replace('/', "-")
}

pub fn date_only(raw: &str) -> String {
    raw.get(..10).unwrap_or(raw).to_owned()
}

pub fn post_url(blog: &url::Url, slug: &str) -> String {
    let slug = normalize_slug(slug);
    blog.join(&slug)
        .map(|u| u.to_string())
        .unwrap_or_else(|_| format!("{blog}{slug}"))
}

pub fn parse_frontmatter_title(markdown: &str) -> Option<String> {
    let rest = markdown.strip_prefix("---")?;
    let end = rest.find("\n---")?;
    for line in rest[..end].lines() {
        if let Some(value) = line.strip_prefix("title:") {
            return Some(value.trim().trim_matches('"').to_owned());
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn slug_and_content_key() {
        assert_eq!(normalize_slug("/2026/08/grok-bot"), "2026/08/grok-bot");
        assert_eq!(
            normalize_slug("https://blog.duyet.net/2026/08/grok-bot"),
            "2026/08/grok-bot"
        );
        assert_eq!(content_key("/2026/08/grok-bot"), "2026-08-grok-bot");
    }

    #[test]
    fn frontmatter_title() {
        let md = "---\ntitle: \"Welcome to the Knowledge Base\"\ncategory: meta\n---\n# Hi\n";
        assert_eq!(
            parse_frontmatter_title(md).as_deref(),
            Some("Welcome to the Knowledge Base")
        );
    }
}
