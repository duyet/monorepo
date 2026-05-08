use pulldown_cmark::{Options, Parser, html};
use wasm_bindgen::prelude::*;

/// Generate a URL-safe slug from heading text.
fn slugify(text: &str) -> String {
    text.trim()
        .to_lowercase()
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() {
                c
            } else if c == ' ' || c == '-' || c == '_' {
                '-'
            } else {
                '\0'
            }
        })
        .filter(|&c| c != '\0')
        .collect::<String>()
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

/// Convert CommonMark/GFM markdown to HTML.
///
/// Supports: GFM tables, strikethrough, task lists, autolink,
/// heading IDs (slugs), and autolinked headings.
#[wasm_bindgen]
pub fn markdown_to_html(input: &str) -> String {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TASKLISTS);
    options.insert(Options::ENABLE_MATH);
    options.insert(Options::ENABLE_GFM);

    let parser = Parser::new_ext(input, options);

    // Post-process: inject id attributes on headings and wrap with autolink.
    let events: Vec<_> = parser.into_iter().collect();
    let mut html_output = String::with_capacity(input.len() * 2);
    html::push_html(&mut html_output, events.into_iter());

    // Inject heading IDs and autolink anchors.
    inject_heading_ids(&mut html_output)
}

/// Add `id="slug"` attributes and autolink anchors to heading elements.
fn inject_heading_ids(html: &mut String) -> String {
    let input = std::mem::take(html);
    let mut result = String::with_capacity(input.len() + 256);
    let mut slug_counts: std::collections::HashMap<String, usize> = std::collections::HashMap::new();
    let mut pos = 0;
    let bytes = input.as_bytes();

    while pos < bytes.len() {
        // Look for heading open tags: <h1>, <h2>, ..., <h6>
        if bytes[pos] == b'<' && pos + 2 < bytes.len() {
            let h_level = if bytes[pos + 1] == b'h'
                && (b'1'..=b'6').contains(&bytes[pos + 2])
            {
                Some((bytes[pos + 2] - b'0') as usize)
            } else {
                None
            };

            if let Some(level) = h_level {
                // Find the end of the opening tag and the closing tag
                let open_end = find_matching_close_tag(&input, pos);
                let close_tag = format!("</h{}>", level);
                let close_start = match input[pos..].find(&close_tag) {
                    Some(i) => pos + i,
                    None => {
                        // Malformed HTML — copy as-is and move on
                        result.push(bytes[pos] as char);
                        pos += 1;
                        continue;
                    }
                };

                // Extract heading text content
                let content_start = open_end;
                let content_end = close_start;
                let text = input[content_start..content_end]
                    .chars()
                    .collect::<String>();

                // Strip any inner HTML tags to get plain text for slug
                let plain_text = strip_tags(&text);

                // Generate unique slug
                let base_slug = slugify(&plain_text);
                let slug = if let Some(count) = slug_counts.get_mut(&base_slug) {
                    *count += 1;
                    format!("{}-{}", base_slug, count)
                } else {
                    slug_counts.insert(base_slug.clone(), 1);
                    base_slug
                };

                // Reconstruct: <hN id="slug" class="heading">...content...<a href="#slug" class="heading-link" aria-hidden="true">#</a></hN>
                result.push_str(&format!(
                    "<h{} id=\"{}\" class=\"heading\"><a href=\"#{}\" class=\"heading-link\" aria-hidden=\"true\">#</a>{}</h{}>",
                    level,
                    slug,
                    slug,
                    &text,
                    level,
                ));

                pos = close_start + close_tag.len();
                continue;
            }
        }

        let ch = input[pos..].chars().next().unwrap();
        result.push(ch);
        pos += ch.len_utf8();
    }

    result
}

/// Find the position after the `>` of the opening tag starting at `pos`.
fn find_matching_close_tag(html: &str, pos: usize) -> usize {
    let bytes = html.as_bytes();
    let mut i = pos;
    while i < bytes.len() {
        if bytes[i] == b'>' {
            return i + 1;
        }
        i += 1;
    }
    html.len()
}

/// Strip HTML tags from a string to extract plain text.
fn strip_tags(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut inside_tag = false;
    for c in s.chars() {
        match c {
            '<' => inside_tag = true,
            '>' => inside_tag = false,
            _ if !inside_tag => result.push(c),
            _ => {}
        }
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_paragraph() {
        let html = markdown_to_html("Hello **world**");
        assert!(html.contains("<strong>world</strong>"));
        assert!(html.contains("Hello"));
    }

    #[test]
    fn test_heading() {
        let html = markdown_to_html("## Section Title");
        assert!(html.contains("<h2"));
        assert!(html.contains("Section Title"));
        assert!(html.contains("id=\"section-title\""));
    }

    #[test]
    fn test_link() {
        let html = markdown_to_html("[Click here](https://example.com)");
        assert!(html.contains("href=\"https://example.com\""));
        assert!(html.contains("Click here"));
    }

    #[test]
    fn test_gfm_table() {
        let md = "| Name | Age |\n| ---- | --- |\n| Alice | 30 |\n| Bob | 25 |";
        let html = markdown_to_html(md);
        assert!(html.contains("<table"));
        assert!(html.contains("Alice"));
        assert!(html.contains("Bob"));
    }

    #[test]
    fn test_strikethrough() {
        let html = markdown_to_html("~~deleted~~");
        assert!(html.contains("<del>deleted</del>"));
    }

    #[test]
    fn test_inline_code() {
        let html = markdown_to_html("`const x = 1`");
        assert!(html.contains("<code>"));
        assert!(html.contains("const x = 1"));
    }

    #[test]
    fn test_fenced_code_block() {
        let md = "```js\nconst x = 1;\n```";
        let html = markdown_to_html(md);
        assert!(html.contains("<pre>"));
        assert!(html.contains("<code"));
    }

    #[test]
    fn test_empty_string() {
        let html = markdown_to_html("");
        assert!(html.trim().is_empty());
    }

    #[test]
    fn test_slugify() {
        assert_eq!(slugify("Hello World"), "hello-world");
        assert_eq!(slugify("Foo & Bar!"), "foo-bar");
        assert_eq!(slugify("  spaces  "), "spaces");
    }

    #[test]
    fn test_unique_heading_slugs() {
        let md = "## Foo\n\n## Foo";
        let html = markdown_to_html(md);
        assert!(html.contains("id=\"foo\""));
        assert!(html.contains("id=\"foo-2\""));
    }

    #[test]
    fn test_autolink_heading() {
        let html = markdown_to_html("## Section");
        assert!(html.contains("href=\"#section\""));
        assert!(html.contains("heading-link"));
    }

    #[test]
    fn test_inline_math() {
        let html = markdown_to_html("Inline: $E = mc^2$");
        assert!(html.contains("math-inline"));
        assert!(html.contains("E = mc^2"));
    }

    #[test]
    fn test_display_math() {
        let html = markdown_to_html("Display: $$E = mc^2$$");
        assert!(html.contains("math-display"));
        assert!(html.contains("E = mc^2"));
    }

    #[test]
    fn test_emoji_preserved() {
        let html = markdown_to_html("- ✅ Done\n- ❌ Failed\n- 📊 Chart");
        assert!(html.contains("✅"), "checkmark emoji should be preserved");
        assert!(html.contains("❌"), "cross emoji should be preserved");
        assert!(html.contains("📊"), "chart emoji should be preserved");
    }

    #[test]
    fn test_heading_no_extra_gt() {
        let html = markdown_to_html("## Section Title");
        // Should NOT contain a bare ">" before the autolink anchor
        assert!(!html.contains("heading\">>"), "no extra > before anchor");
        assert!(html.contains("class=\"heading\"><a"));
    }
}
