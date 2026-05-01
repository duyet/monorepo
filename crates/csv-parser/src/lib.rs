use wasm_bindgen::prelude::*;

/// Parse a CSV string (RFC 4180) and return a JSON 2D string array.
///
/// Handles quoted fields, embedded commas, embedded newlines, and escaped
/// double-quotes (`""`).
#[wasm_bindgen]
pub fn parse_csv(input: &str) -> String {
    let mut reader = csv::ReaderBuilder::new()
        .has_headers(false)
        .flexible(true)
        .from_reader(input.as_bytes());

    let rows: Vec<Vec<String>> = reader
        .records()
        .filter_map(|result| result.ok())
        .filter(|record| !record.is_empty())
        .map(|record| record.iter().map(|field| field.to_string()).collect())
        .collect();

    serde_json::to_string(&rows).unwrap_or_else(|_| "[]".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn simple_csv() {
        let json = parse_csv("a,b,c\n1,2,3");
        let rows: Vec<Vec<String>> = serde_json::from_str(&json).unwrap();
        assert_eq!(
            rows,
            vec![
                vec!["a", "b", "c"],
                vec!["1", "2", "3"],
            ]
        );
    }

    #[test]
    fn quoted_field_with_comma() {
        let json = parse_csv("name,desc\n\"hello, world\",test");
        let rows: Vec<Vec<String>> = serde_json::from_str(&json).unwrap();
        assert_eq!(
            rows,
            vec![
                vec!["name", "desc"],
                vec!["hello, world", "test"],
            ]
        );
    }

    #[test]
    fn escaped_quotes() {
        let json = parse_csv("a,b\n\"he said \"\"hi\"\"\",ok");
        let rows: Vec<Vec<String>> = serde_json::from_str(&json).unwrap();
        assert_eq!(
            rows,
            vec![
                vec!["a", "b"],
                vec!["he said \"hi\"", "ok"],
            ]
        );
    }

    #[test]
    fn newline_in_quoted_field() {
        let json = parse_csv("a,b\n\"line1\nline2\",ok");
        let rows: Vec<Vec<String>> = serde_json::from_str(&json).unwrap();
        assert_eq!(
            rows,
            vec![
                vec!["a", "b"],
                vec!["line1\nline2", "ok"],
            ]
        );
    }

    #[test]
    fn empty_input() {
        let json = parse_csv("");
        let rows: Vec<Vec<String>> = serde_json::from_str(&json).unwrap();
        assert!(rows.is_empty());
    }

    #[test]
    fn trailing_newline_only_row() {
        // A single trailing newline should not produce an extra empty row
        let json = parse_csv("a,b\n1,2\n");
        let rows: Vec<Vec<String>> = serde_json::from_str(&json).unwrap();
        assert_eq!(
            rows,
            vec![
                vec!["a", "b"],
                vec!["1", "2"],
            ]
        );
    }

    #[test]
    fn crlf_line_endings() {
        let json = parse_csv("a,b\r\n1,2\r\n");
        let rows: Vec<Vec<String>> = serde_json::from_str(&json).unwrap();
        assert_eq!(
            rows,
            vec![
                vec!["a", "b"],
                vec!["1", "2"],
            ]
        );
    }
}
