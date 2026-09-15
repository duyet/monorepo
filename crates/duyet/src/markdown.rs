//! Terminal Markdown rendering and image-URL extraction.

/// Render Markdown for a TTY: headings, lists, fenced code, links as `text (url)`.
pub fn render(markdown: &str) -> String {
    let mut out = String::with_capacity(markdown.len());
    let mut in_fence = false;
    for line in markdown.lines() {
        if let Some(rest) = line.strip_prefix("```") {
            in_fence = !in_fence;
            if in_fence && !rest.is_empty() {
                out.push_str(&format!("[{rest}]\n"));
            }
            continue;
        }
        if in_fence {
            out.push_str(line);
            out.push('\n');
            continue;
        }
        let trimmed = line.trim_start();
        let indent = line.len() - trimmed.len();
        let rendered = if let Some(heading) = heading(trimmed) {
            heading
        } else if let Some(item) = list_item(trimmed) {
            format!("{}{item}", " ".repeat(indent))
        } else {
            format!("{}{}", " ".repeat(indent), inline(trimmed))
        };
        out.push_str(&rendered);
        out.push('\n');
    }
    out
}

fn heading(line: &str) -> Option<String> {
    let hashes = line.chars().take_while(|c| *c == '#').count();
    if hashes == 0 || hashes > 6 {
        return None;
    }
    let rest = line[hashes..].trim_start();
    if rest.is_empty() && hashes == line.len() {
        return None;
    }
    Some(inline(rest).to_uppercase())
}

fn list_item(line: &str) -> Option<String> {
    let rest = line
        .strip_prefix("- ")
        .or_else(|| line.strip_prefix("* "))
        .or_else(|| line.strip_prefix("+ "));
    if let Some(rest) = rest {
        return Some(format!("- {}", inline(rest)));
    }
    let mut chars = line.chars();
    let mut n = 0;
    while let Some(c) = chars.next() {
        if c.is_ascii_digit() {
            n += 1;
        } else if c == '.' && n > 0 {
            let rest = chars.as_str().strip_prefix(' ')?;
            return Some(format!("{}. {}", &line[..n], inline(rest)));
        } else {
            break;
        }
    }
    None
}

fn inline(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let bytes = text.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'`' {
            if let Some(end) = text[i + 1..].find('`') {
                out.push_str(&text[i + 1..i + 1 + end]);
                i += end + 2;
                continue;
            }
        }
        if bytes[i] == b'!' && i + 1 < bytes.len() && bytes[i + 1] == b'[' {
            if let Some((alt, url, consumed)) = parse_link(&text[i + 1..]) {
                if alt.is_empty() {
                    out.push_str(&format!("({url})"));
                } else {
                    out.push_str(&format!("{alt} ({url})"));
                }
                i += 1 + consumed;
                continue;
            }
        }
        if bytes[i] == b'[' {
            if let Some((label, url, consumed)) = parse_link(&text[i..]) {
                if url.is_empty() {
                    out.push_str(label);
                } else {
                    out.push_str(&format!("{label} ({url})"));
                }
                i += consumed;
                continue;
            }
        }
        if bytes[i] == b'*' || bytes[i] == b'_' {
            let marker = bytes[i];
            let double = i + 1 < bytes.len() && bytes[i + 1] == marker;
            let start = if double { i + 2 } else { i + 1 };
            if let Some(rel) = text[start..].find(|c| c == marker as char) {
                let end = start + rel;
                let more_double = double && end + 1 < bytes.len() && bytes[end + 1] == marker;
                if !double || more_double {
                    out.push_str(&inline(&text[start..end]));
                    i = end + if more_double { 2 } else { 1 };
                    continue;
                }
            }
        }
        out.push(bytes[i] as char);
        i += 1;
    }
    out
}

fn parse_link(text: &str) -> Option<(&str, &str, usize)> {
    if !text.starts_with('[') {
        return None;
    }
    let close = text.find(']')?;
    let after = &text[close + 1..];
    if !after.starts_with('(') {
        return None;
    }
    let end = after.find(')')?;
    let label = &text[1..close];
    let url = after[1..end].trim();
    Some((label, url, close + 1 + end + 1))
}

pub fn html_to_text(html: &str) -> String {
    let mut out = String::with_capacity(html.len());
    let mut in_tag = false;
    let mut skip = false;
    let lower = html.to_ascii_lowercase();
    let chars: Vec<char> = html.chars().collect();
    let lower_chars: Vec<char> = lower.chars().collect();
    let mut i = 0;
    while i < chars.len() {
        if chars[i] == '<' {
            let rest: String = lower_chars[i..].iter().take(10).collect();
            if rest.starts_with("<script") || rest.starts_with("<style") {
                skip = true;
            }
            if rest.starts_with("</script") || rest.starts_with("</style") {
                skip = false;
            }
            if rest.starts_with("<br") || rest.starts_with("<p") || rest.starts_with("<div") {
                out.push('\n');
            }
            in_tag = true;
            i += 1;
            continue;
        }
        if chars[i] == '>' {
            in_tag = false;
            i += 1;
            continue;
        }
        if !in_tag && !skip {
            out.push(chars[i]);
        }
        i += 1;
    }
    out.replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&#39;", "'")
        .replace("&nbsp;", " ")
}

pub fn extract_image_urls(markdown: &str, html: &str) -> Vec<String> {
    let mut urls = Vec::new();
    let mut seen = std::collections::BTreeSet::new();
    let mut push = |raw: String| {
        let url = raw.trim().to_owned();
        if url.is_empty() {
            return;
        }
        if seen.insert(url.clone()) {
            urls.push(url);
        }
    };
    let bytes = markdown.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'!' && i + 1 < bytes.len() && bytes[i + 1] == b'[' {
            if let Some((_, url, consumed)) = parse_link(&markdown[i + 1..]) {
                push(url.to_owned());
                i += 1 + consumed;
                continue;
            }
        }
        i += 1;
    }
    let lower = html.to_ascii_lowercase();
    let mut search = lower.as_str();
    let mut offset = 0;
    while let Some(pos) = search.find("src=") {
        let after = &html[offset + pos + 4..];
        let quoted = after.strip_prefix('"').or_else(|| after.strip_prefix('\''));
        if let Some(quoted) = quoted {
            let quote = after.as_bytes()[0] as char;
            if let Some(end) = quoted.find(quote) {
                push(quoted[..end].to_owned());
            }
        }
        offset += pos + 4;
        search = &lower[offset..];
    }
    urls
}

pub fn is_same_origin(candidate: &url::Url, origin: &url::Url) -> bool {
    candidate.scheme() == origin.scheme()
        && candidate.host_str() == origin.host_str()
        && candidate.port_or_known_default() == origin.port_or_known_default()
}

pub fn resolve_media_url(raw: &str, base: &url::Url) -> Option<url::Url> {
    if raw.starts_with("data:") {
        return None;
    }
    base.join(raw).ok()
}

pub fn filename_for(url: &url::Url) -> String {
    url.path_segments()
        .and_then(|mut segs| segs.next_back())
        .filter(|name| !name.is_empty())
        .map(|name| name.to_owned())
        .unwrap_or_else(|| "image".into())
}

pub fn search_score(
    query: &str,
    title: &str,
    excerpt: &str,
    tags: &[String],
    category: &str,
) -> i32 {
    let q = query.trim().to_ascii_lowercase();
    if q.is_empty() {
        return 0;
    }
    let terms: Vec<&str> = q.split_whitespace().collect();
    let mut score = 0;
    for term in terms {
        if title.to_ascii_lowercase().contains(term) {
            score += 8;
        }
        if tags
            .iter()
            .any(|tag| tag.to_ascii_lowercase().contains(term))
        {
            score += 4;
        }
        if category.to_ascii_lowercase().contains(term) {
            score += 2;
        }
        if excerpt.to_ascii_lowercase().contains(term) {
            score += 1;
        }
    }
    score
}

#[cfg(test)]
mod tests {
    use super::*;
    use url::Url;

    #[test]
    fn renders_headings_lists_links_and_code() {
        let md = "# Title\n\n- item [x](https://e/x)\n\n```rs\nlet x = 1;\n```\n\nSee ![img](/a.png) and **bold**.";
        let text = render(md);
        assert!(text.contains("TITLE"));
        assert!(text.contains("- item x (https://e/x)"));
        assert!(text.contains("let x = 1;"));
        assert!(text.contains("img (/a.png)"));
        assert!(text.contains("bold"));
        assert!(!text.contains("**"));
    }

    #[test]
    fn extracts_markdown_and_html_images_deduped() {
        let md = "![a](/m/a.jpg) ![b](/m/b.jpg) ![a](/m/a.jpg)";
        let html = r#"<img src="/m/b.jpg"><img src="/m/c.jpg">"#;
        assert_eq!(
            extract_image_urls(md, html),
            vec!["/m/a.jpg", "/m/b.jpg", "/m/c.jpg"]
        );
    }

    #[test]
    fn same_origin_filter() {
        let blog = Url::parse("https://blog.duyet.net/").unwrap();
        let ok = Url::parse("https://blog.duyet.net/media/x.jpg").unwrap();
        let other = Url::parse("https://cdn.example/x.jpg").unwrap();
        assert!(is_same_origin(&ok, &blog));
        assert!(!is_same_origin(&other, &blog));
        assert_eq!(
            resolve_media_url("/media/x.jpg", &blog).unwrap().as_str(),
            "https://blog.duyet.net/media/x.jpg"
        );
    }

    #[test]
    fn search_ranks_title_above_excerpt() {
        let tags = vec!["Rust".into()];
        let title_hit = search_score("grok", "Grok Bot", "hello", &tags, "AI");
        let excerpt_hit = search_score("grok", "Other", "mentions grok once", &[], "data");
        assert!(title_hit > excerpt_hit);
        assert_eq!(search_score("nope", "a", "b", &[], "c"), 0);
    }

    #[test]
    fn html_to_text_strips_tags() {
        let text = html_to_text("<p>Hello <strong>world</strong></p><script>x</script>");
        assert!(text.contains("Hello"));
        assert!(text.contains("world"));
        assert!(!text.contains("script"));
        assert!(!text.contains("<p>"));
    }
}
