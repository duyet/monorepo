use std::fs;
use std::path::Path;

use serde::Deserialize;
use serde::de::DeserializeOwned;
use url::Url;

use crate::cli::Ctx;
use crate::config::ConfigKey;
use crate::domain::{
    ImageFile, InsightsOverview, KbArticle, NewsDigest, NewsStory, Note, NoteIndexEntry, Post,
    PostContentFile, PostIndexEntry, SeriesIndexEntry, SeriesPost, SeriesRead, SeriesSummary,
    content_key, date_only, normalize_slug,
};
use crate::error::CliError;
use crate::http::Http;
use crate::markdown::{
    extract_image_urls, filename_for, html_to_text, is_same_origin, render, resolve_media_url,
    search_score,
};

pub fn http(ctx: &Ctx) -> Result<Http, CliError> {
    Http::new(&ctx.paths, &ctx.globals, &ctx.settings)
}

pub fn join(base: &Url, rel: &str) -> Result<Url, CliError> {
    base.join(rel)
        .map_err(|err| CliError::Internal(err.to_string()))
}

pub fn get_json<T: DeserializeOwned>(http: &Http, url: &Url) -> Result<T, CliError> {
    let fetched = http.get(url)?;
    serde_json::from_str(&fetched.body).map_err(|err| CliError::InvalidPayload {
        url: url.to_string(),
        message: err.to_string(),
    })
}

pub fn get_text(http: &Http, url: &Url) -> Result<String, CliError> {
    Ok(http.get(url)?.body)
}

pub fn load_posts(ctx: &Ctx, http: &Http) -> Result<Vec<PostIndexEntry>, CliError> {
    let url = join(ctx.settings.url(ConfigKey::BlogUrl), "posts-data.json")?;
    get_json(http, &url)
}

pub fn find_post<'a>(
    posts: &'a [PostIndexEntry],
    target: &str,
) -> Result<&'a PostIndexEntry, CliError> {
    let want = normalize_slug(target);
    posts
        .iter()
        .find(|post| {
            let slug = normalize_slug(&post.slug);
            slug == want || slug.ends_with(&want) || content_key(&post.slug) == want
        })
        .ok_or_else(|| CliError::Missing {
            resource: "post",
            id: target.to_owned(),
        })
}

pub fn load_post_content(ctx: &Ctx, http: &Http, slug: &str) -> Result<PostContentFile, CliError> {
    let key = content_key(slug);
    let url = join(
        ctx.settings.url(ConfigKey::BlogUrl),
        &format!("posts-content/{key}.json"),
    )?;
    get_json(http, &url)
}

pub fn filter_posts<'a>(
    posts: &'a [PostIndexEntry],
    category: Option<&str>,
    tag: Option<&str>,
) -> Vec<&'a PostIndexEntry> {
    posts
        .iter()
        .filter(|post| {
            category.is_none_or(|c| {
                post.category.eq_ignore_ascii_case(c) || post.category_slug.eq_ignore_ascii_case(c)
            })
        })
        .filter(|post| tag.is_none_or(|t| post.tags.iter().any(|tag| tag.eq_ignore_ascii_case(t))))
        .collect()
}

pub fn summaries(blog: &Url, posts: &[&PostIndexEntry], limit: Option<usize>) -> Vec<Post> {
    let iter = posts.iter().map(|post| post.summary(blog));
    match limit {
        Some(n) => iter.take(n).collect(),
        None => iter.collect(),
    }
}

pub fn search_posts(blog: &Url, posts: &[PostIndexEntry], query: &str) -> Vec<Post> {
    let mut ranked: Vec<(i32, &PostIndexEntry)> = posts
        .iter()
        .map(|post| {
            (
                search_score(
                    query,
                    &post.title,
                    &post.excerpt,
                    &post.tags,
                    &post.category,
                ),
                post,
            )
        })
        .filter(|(score, _)| *score > 0)
        .collect();
    ranked.sort_by(|a, b| b.0.cmp(&a.0).then_with(|| a.1.slug.cmp(&b.1.slug)));
    ranked
        .into_iter()
        .map(|(_, post)| post.summary(blog))
        .collect()
}

pub fn body_for_read(content: &PostContentFile, raw: bool) -> String {
    if content.is_mdx {
        if raw {
            return content.html.clone();
        }
        return html_to_text(&content.html);
    }
    if raw {
        content.content.clone()
    } else {
        render(&content.content)
    }
}

pub fn load_notes(ctx: &Ctx, http: &Http) -> Result<Vec<NoteIndexEntry>, CliError> {
    let url = join(ctx.settings.url(ConfigKey::BlogUrl), "notes-data.json")?;
    get_json(http, &url)
}

pub fn note_summary(blog: &Url, entry: &NoteIndexEntry) -> Note {
    Note {
        url: join(blog, &format!("note/{}", entry.id))
            .map(|u| u.to_string())
            .unwrap_or_default(),
        id: entry.id.clone(),
        title: entry.title.clone(),
        date: date_only(&entry.date),
        markdown: None,
    }
}

pub fn load_series(ctx: &Ctx, http: &Http) -> Result<Vec<SeriesIndexEntry>, CliError> {
    let url = join(ctx.settings.url(ConfigKey::BlogUrl), "series-data.json")?;
    get_json(http, &url)
}

pub fn series_summaries(blog: &Url, items: &[SeriesIndexEntry]) -> Vec<SeriesSummary> {
    items
        .iter()
        .map(|s| SeriesSummary {
            slug: s.slug.clone(),
            title: s.name.clone(),
            count: s.posts.len(),
            url: join(blog, &format!("series/{}", s.slug))
                .map(|u| u.to_string())
                .unwrap_or_default(),
        })
        .collect()
}

pub fn series_read(entry: &SeriesIndexEntry) -> SeriesRead {
    SeriesRead {
        slug: entry.slug.clone(),
        title: entry.name.clone(),
        description: String::new(),
        posts: entry
            .posts
            .iter()
            .map(|p| SeriesPost {
                slug: normalize_slug(&p.slug),
                title: p.title.clone(),
                date: date_only(&p.date),
            })
            .collect(),
    }
}

pub fn parse_llms(text: &str, kb: &Url) -> Vec<KbArticle> {
    let mut articles = Vec::new();
    let mut current_title: Option<String> = None;
    let mut slug = String::new();
    let mut category = String::new();
    let mut in_articles = false;
    for line in text.lines() {
        if line.starts_with("## Articles") {
            in_articles = true;
            continue;
        }
        if line.starts_with("## ") && in_articles && !line.starts_with("## Articles") {
            break;
        }
        if !in_articles {
            continue;
        }
        if let Some(title) = line.strip_prefix("### ") {
            if let Some(title) = current_title.take() {
                articles.push(article(kb, slug.clone(), title, category.clone()));
            }
            current_title = Some(title.trim().to_owned());
            slug.clear();
            category.clear();
            continue;
        }
        if let Some(url) = line.strip_prefix("URL: ") {
            if let Ok(parsed) = Url::parse(url.trim()) {
                slug = parsed
                    .path_segments()
                    .and_then(|mut s| s.next_back())
                    .unwrap_or("")
                    .trim_end_matches(".md")
                    .to_owned();
            }
        }
        if let Some(cat) = line.strip_prefix("Category: ") {
            category = cat.trim().to_owned();
        }
    }
    if let Some(title) = current_title {
        articles.push(article(kb, slug, title, category));
    }
    articles
}

fn article(kb: &Url, slug: String, title: String, category: String) -> KbArticle {
    KbArticle {
        url: join(kb, &format!("k/{slug}"))
            .map(|u| u.to_string())
            .unwrap_or_default(),
        slug,
        title,
        category,
        markdown: None,
        links: Vec::new(),
    }
}

pub fn kb_index(ctx: &Ctx, http: &Http) -> Result<Vec<KbArticle>, CliError> {
    let url = join(ctx.settings.url(ConfigKey::KbUrl), "llms.txt")?;
    let text = get_text(http, &url)?;
    Ok(parse_llms(&text, ctx.settings.url(ConfigKey::KbUrl)))
}

pub fn search_kb(articles: &[KbArticle], query: &str) -> Vec<KbArticle> {
    let mut ranked: Vec<(i32, &KbArticle)> = articles
        .iter()
        .map(|a| (search_score(query, &a.title, "", &[], &a.category), a))
        .filter(|(score, _)| *score > 0)
        .collect();
    ranked.sort_by(|a, b| b.0.cmp(&a.0).then_with(|| a.1.slug.cmp(&b.1.slug)));
    ranked.into_iter().map(|(_, a)| a.clone()).collect()
}

#[derive(Deserialize)]
struct AidrPublic {
    #[serde(default)]
    tldr: AidrTldr,
    #[serde(default)]
    stories: Vec<AidrStory>,
}

#[derive(Default, Deserialize)]
struct AidrTldr {
    #[serde(default)]
    date: String,
    #[serde(default)]
    bullets_en: Vec<AidrBullet>,
    #[serde(default)]
    bullets_vi: Vec<AidrBullet>,
}

#[derive(Deserialize)]
struct AidrBullet {
    #[serde(default)]
    text: String,
}

#[derive(Deserialize)]
struct AidrStory {
    #[serde(default)]
    title: String,
    #[serde(default)]
    title_vi: String,
    #[serde(default)]
    url: String,
}

pub fn news_today(http: &Http, news_url: &Url, lang: &str) -> Result<NewsDigest, CliError> {
    let url = join(news_url, "api/public")?;
    let raw: AidrPublic = get_json(http, &url)?;
    let vi = lang.eq_ignore_ascii_case("vi");
    let bullets = if vi {
        &raw.tldr.bullets_vi
    } else {
        &raw.tldr.bullets_en
    };
    let mut stories: Vec<NewsStory> = bullets
        .iter()
        .map(|b| NewsStory {
            title: b.text.clone(),
            summary: None,
            url: None,
            score: None,
        })
        .collect();
    for story in raw.stories {
        let title = if vi && !story.title_vi.is_empty() {
            story.title_vi
        } else {
            story.title
        };
        stories.push(NewsStory {
            title,
            summary: None,
            url: Some(story.url).filter(|u| !u.is_empty()),
            score: None,
        });
    }
    Ok(NewsDigest {
        date: raw.tldr.date,
        lang: lang.to_ascii_lowercase(),
        stories,
        source: url.to_string(),
    })
}

#[derive(Deserialize)]
struct InsightsRaw {
    #[serde(default)]
    cloudflare: Option<CfBlock>,
    #[serde(default)]
    posthog: Option<PhBlock>,
    #[serde(default, rename = "wakaMetrics")]
    waka_metrics: Option<WakaBlock>,
    #[serde(default, rename = "aiMetrics")]
    ai_metrics: Option<AiBlock>,
}

#[derive(Deserialize)]
struct CfBlock {
    #[serde(default, rename = "generatedAt")]
    generated_at: Option<String>,
    #[serde(default, rename = "totalRequests")]
    total_requests: u64,
    #[serde(default, rename = "totalPageviews")]
    total_pageviews: u64,
}

#[derive(Deserialize)]
struct PhBlock {
    #[serde(default, rename = "totalViews")]
    total_views: u64,
    #[serde(default, rename = "totalVisitors")]
    total_visitors: u64,
}

#[derive(Deserialize)]
struct WakaBlock {
    #[serde(default, rename = "totalHours")]
    total_hours: f64,
    #[serde(default, rename = "topLanguage")]
    top_language: Option<String>,
}

#[derive(Deserialize)]
struct AiBlock {
    #[serde(default, rename = "totalTokens")]
    total_tokens: u64,
    #[serde(default, rename = "totalCost")]
    total_cost: f64,
}

pub fn insights_overview(http: &Http, api: &Url) -> Result<InsightsOverview, CliError> {
    let url = join(api, "api/insights/overview")?;
    let raw: InsightsRaw = get_json(http, &url)?;
    Ok(InsightsOverview {
        generated_at: raw.cloudflare.as_ref().and_then(|c| c.generated_at.clone()),
        cloudflare_requests: raw
            .cloudflare
            .as_ref()
            .map(|c| c.total_requests)
            .unwrap_or(0),
        cloudflare_pageviews: raw
            .cloudflare
            .as_ref()
            .map(|c| c.total_pageviews)
            .unwrap_or(0),
        posthog_views: raw.posthog.as_ref().map(|p| p.total_views).unwrap_or(0),
        posthog_visitors: raw.posthog.as_ref().map(|p| p.total_visitors).unwrap_or(0),
        waka_hours: raw
            .waka_metrics
            .as_ref()
            .map(|w| w.total_hours)
            .unwrap_or(0.0),
        waka_top_language: raw
            .waka_metrics
            .and_then(|w| w.top_language)
            .unwrap_or_else(|| "N/A".into()),
        ai_tokens: raw.ai_metrics.as_ref().map(|a| a.total_tokens).unwrap_or(0),
        ai_cost: raw.ai_metrics.map(|a| a.total_cost).unwrap_or(0.0),
    })
}

pub fn download_images(
    http: &Http,
    blog: &Url,
    markdown: &str,
    html: &str,
    extra: &[String],
    out: &Path,
    allow_external: bool,
) -> Result<(Vec<ImageFile>, Vec<String>), CliError> {
    fs::create_dir_all(out).map_err(|source| CliError::Io {
        path: out.to_path_buf(),
        source,
    })?;
    let mut urls = extract_image_urls(markdown, html);
    for extra in extra {
        if !urls.contains(extra) {
            urls.push(extra.clone());
        }
    }
    let mut files = Vec::new();
    let mut skipped = Vec::new();
    let mut used_names = std::collections::BTreeSet::new();
    for raw in urls {
        let Some(url) = resolve_media_url(&raw, blog) else {
            skipped.push(format!("{raw} (skipped data/invalid)"));
            continue;
        };
        if !allow_external && !is_same_origin(&url, blog) {
            skipped.push(format!("{url} (external)"));
            continue;
        }
        let mut name = filename_for(&url);
        if !used_names.insert(name.clone()) {
            name = format!("{}-{name}", used_names.len());
            used_names.insert(name.clone());
        }
        let path = out.join(&name);
        let bytes = http.get_bytes(&url)?;
        if path.exists() {
            if let Ok(meta) = fs::metadata(&path) {
                if meta.len() == bytes.len() as u64 {
                    skipped.push(format!("{} (exists)", path.display()));
                    continue;
                }
            }
        }
        fs::write(&path, &bytes).map_err(|source| CliError::Io {
            path: path.clone(),
            source,
        })?;
        files.push(ImageFile {
            url: url.to_string(),
            path: path.display().to_string(),
            bytes: bytes.len() as u64,
        });
    }
    Ok((files, skipped))
}

pub fn rss_from_posts(blog: &Url, posts: &[Post]) -> String {
    let mut items = String::new();
    for post in posts {
        items.push_str(&format!(
            "    <item><title><![CDATA[{}]]></title><link>{}</link><pubDate>{}</pubDate></item>\n",
            post.title, post.url, post.date
        ));
    }
    format!(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<rss version=\"2.0\"><channel>\n  <title>duyet posts</title>\n  <link>{blog}</link>\n{items}</channel></rss>\n"
    )
}

pub fn open_url(url: &str) -> bool {
    let cmds: &[&str] = if cfg!(target_os = "macos") {
        &["open"]
    } else if cfg!(windows) {
        &["cmd"]
    } else {
        &["xdg-open"]
    };
    for cmd in cmds {
        let mut command = if *cmd == "cmd" {
            let mut c = std::process::Command::new("cmd");
            c.args(["/C", "start", "", url]);
            c
        } else {
            let mut c = std::process::Command::new(cmd);
            c.arg(url);
            c
        };
        if command
            .stdin(std::process::Stdio::null())
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::null())
            .status()
            .map(|s| s.success())
            .unwrap_or(false)
        {
            return true;
        }
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_llms_articles() {
        let text = "\
# kb\n\n## Articles\n\n### Welcome\nURL: https://kb.duyet.net/k/welcome\nCategory: meta\nSummary: hi\n\n### Blog App\nURL: https://kb.duyet.net/k/blog-app\nCategory: apps\n";
        let kb = Url::parse("https://kb.duyet.net/").unwrap();
        let items = parse_llms(text, &kb);
        assert_eq!(items.len(), 2);
        assert_eq!(items[0].slug, "welcome");
        assert_eq!(items[0].category, "meta");
        assert_eq!(items[1].slug, "blog-app");
    }
}
