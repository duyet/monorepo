use wasm_bindgen::prelude::*;

/// Escape special regex characters in a string.
///
/// Characters escaped: . * + ? ^ $ { } ( ) | [ ] \
///
/// # Examples
/// ```ignore
/// assert_eq!(escape_reg_exp("hello+world"), "hello\\+world");
/// ```
#[wasm_bindgen]
pub fn escape_reg_exp(input: &str) -> String {
    let mut out = String::with_capacity(input.len() * 2);
    for ch in input.chars() {
        match ch {
            '.' | '*' | '+' | '?' | '^' | '$' | '{' | '}' | '(' | ')' | '|' | '[' | ']' | '\\' => {
                out.push('\\');
                out.push(ch);
            }
            _ => out.push(ch),
        }
    }
    out
}

/// Convert a string to a URL-safe slug.
///
/// - Lowercases the input
/// - Strips non-ASCII characters (emoji, symbols)
/// - Replaces whitespace and non-alphanumeric runs with a single hyphen
/// - Strips leading/trailing hyphens
/// - Truncates at `max_length` without breaking mid-word
///
/// # Examples
/// ```ignore
/// assert_eq!(slugify("Hello World", 100), "hello-world");
/// assert_eq!(slugify("Hello World 😹", 100), "hello-world");
/// ```
#[wasm_bindgen]
pub fn slugify(input: &str, max_length: Option<usize>) -> String {
    let max_len = max_length.unwrap_or(100);

    if input.is_empty() {
        return String::new();
    }

    let lower = input.to_lowercase();

    let mut slug = String::with_capacity(lower.len());
    let mut prev_hyphen = true; // treat start as if we just had a hyphen (skip leading)

    for ch in lower.chars() {
        if ch.is_ascii_alphanumeric() {
            slug.push(ch);
            prev_hyphen = false;
        } else if ch == ' ' || ch == '-' || ch == '_' {
            if !prev_hyphen {
                slug.push('-');
                prev_hyphen = true;
            }
        }
        // All other chars (non-ASCII, symbols, punctuation) are silently dropped
    }

    // Remove trailing hyphen
    if slug.ends_with('-') {
        slug.pop();
    }

    // Truncate at max_len without breaking mid-word
    if slug.len() > max_len {
        slug = slug[..max_len].to_string();
        if let Some(pos) = slug.rfind('-') {
            slug.truncate(pos);
        }
    }

    slug
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_escape_reg_exp_basic() {
        assert_eq!(escape_reg_exp("hello"), "hello");
        assert_eq!(escape_reg_exp("hello+world"), "hello\\+world");
        assert_eq!(escape_reg_exp("a.b"), "a\\.b");
        assert_eq!(escape_reg_exp("a*b"), "a\\*b");
        assert_eq!(escape_reg_exp("a?b"), "a\\?b");
        assert_eq!(escape_reg_exp("a^b"), "a\\^b");
        assert_eq!(escape_reg_exp("a$b"), "a\\$b");
        assert_eq!(escape_reg_exp("a{b}"), "a\\{b\\}");
        assert_eq!(escape_reg_exp("a(b)"), "a\\(b\\)");
        assert_eq!(escape_reg_exp("a|b"), "a\\|b");
        assert_eq!(escape_reg_exp("a[b]"), "a\\[b\\]");
        assert_eq!(escape_reg_exp("a\\b"), "a\\\\b");
    }

    #[test]
    fn test_escape_reg_exp_empty() {
        assert_eq!(escape_reg_exp(""), "");
    }

    #[test]
    fn test_escape_reg_exp_no_special() {
        assert_eq!(escape_reg_exp("hello world 123"), "hello world 123");
    }

    #[test]
    fn test_slugify_basic() {
        assert_eq!(slugify("Hello", None), "hello");
        assert_eq!(slugify("Hello World", None), "hello-world");
        assert_eq!(slugify(" Hello World", None), "hello-world");
        assert_eq!(slugify(" Hello World ", None), "hello-world");
    }

    #[test]
    fn test_slugify_emoji() {
        assert_eq!(slugify(" Hello World 😹", None), "hello-world");
        assert_eq!(slugify("😆 Hello World 😹", None), "hello-world");
    }

    #[test]
    fn test_slugify_empty() {
        assert_eq!(slugify("", None), "");
        assert_eq!(slugify("", Some(50)), "");
    }

    #[test]
    fn test_slugify_max_length() {
        assert_eq!(slugify("Hello World", Some(5)), "hello");
        assert_eq!(slugify("Hello World", Some(7)), "hello");
    }

    #[test]
    fn test_slugify_unicode() {
        // Non-ASCII chars are stripped
        assert_eq!(slugify("café", None), "caf");
    }

    #[test]
    fn test_slugify_special_chars() {
        assert_eq!(slugify("Hello & World!", None), "hello-world");
        assert_eq!(slugify("a---b", None), "a-b");
    }
}
