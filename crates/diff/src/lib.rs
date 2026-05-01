use wasm_bindgen::prelude::*;
use serde::Serialize;
use similar::{ChangeTag, TextDiff};

/// Diff operation types matching the TypeScript DiffType enum.
/// 0 = equal (unchanged), 1 = insert, 2 = delete.
#[derive(Serialize, serde::Deserialize)]
struct DiffOp {
    r#type: i32,
    text: String,
}

/// Block alignment result matching the TypeScript BlockData interface.
#[derive(Serialize, serde::Deserialize)]
struct BlockAlign {
    r#type: i32,
    old_text: String,
    new_text: String,
}

/// Character-level diff between two strings.
///
/// Returns a JSON array of `{ type: number, text: string }` where:
/// - type 0 = equal
/// - type 1 = insert
/// - type 2 = delete
#[wasm_bindgen]
pub fn diff_text(old: &str, new: &str) -> String {
    let diff = TextDiff::from_chars(old, new);
    let mut ops: Vec<DiffOp> = Vec::new();
    for change in diff.iter_all_changes() {
        let tag = match change.tag() {
            ChangeTag::Equal => 0,
            ChangeTag::Insert => 1,
            ChangeTag::Delete => 2,
        };
        if let Some(last) = ops.last_mut() {
            if last.r#type == tag {
                last.text.push_str(change.value());
                continue;
            }
        }
        ops.push(DiffOp {
            r#type: tag,
            text: change.value().to_string(),
        });
    }
    serde_json::to_string(&ops).unwrap_or_else(|_| "[]".to_string())
}

/// Block-level LCS alignment of two texts (split by newlines).
///
/// Each block is a line. Returns a JSON array of
/// `{ type: number, old_text: string, new_text: string }` where:
/// - type 0 = equal
/// - type 1 = insert
/// - type 2 = delete
#[wasm_bindgen]
pub fn align_blocks(old: &str, new: &str) -> String {
    let old_lines: Vec<&str> = if old.is_empty() {
        vec![]
    } else {
        old.split('\n').collect()
    };
    let new_lines: Vec<&str> = if new.is_empty() {
        vec![]
    } else {
        new.split('\n').collect()
    };

    // LCS DP
    let m = old_lines.len();
    let n = new_lines.len();
    let mut dp = vec![vec![0usize; n + 1]; m + 1];

    for i in 1..=m {
        for j in 1..=n {
            if old_lines[i - 1] == new_lines[j - 1] {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = dp[i - 1][j].max(dp[i][j - 1]);
            }
        }
    }

    // Backtrack
    let mut result: Vec<BlockAlign> = Vec::new();
    let mut i = m;
    let mut j = n;

    while i > 0 || j > 0 {
        if i > 0 && j > 0 && old_lines[i - 1] == new_lines[j - 1] {
            result.push(BlockAlign {
                r#type: 0,
                old_text: old_lines[i - 1].to_string(),
                new_text: new_lines[j - 1].to_string(),
            });
            i -= 1;
            j -= 1;
        } else if j > 0 && (i == 0 || dp[i][j - 1] >= dp[i - 1][j]) {
            result.push(BlockAlign {
                r#type: 1,
                old_text: new_lines[j - 1].to_string(),
                new_text: new_lines[j - 1].to_string(),
            });
            j -= 1;
        } else if i > 0 {
            result.push(BlockAlign {
                r#type: 2,
                old_text: old_lines[i - 1].to_string(),
                new_text: old_lines[i - 1].to_string(),
            });
            i -= 1;
        }
    }

    result.reverse();
    serde_json::to_string(&result).unwrap_or_else(|_| "[]".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_diff_text_identical() {
        let result = diff_text("hello", "hello");
        let ops: Vec<DiffOp> = serde_json::from_str(&result).unwrap();
        assert_eq!(ops.len(), 1);
        assert_eq!(ops[0].r#type, 0);
        assert_eq!(ops[0].text, "hello");
    }

    #[test]
    fn test_diff_text_insert() {
        let result = diff_text("", "abc");
        let ops: Vec<DiffOp> = serde_json::from_str(&result).unwrap();
        assert!(ops.iter().all(|op| op.r#type == 1));
        let combined: String = ops.iter().map(|op| op.text.as_str()).collect();
        assert_eq!(combined, "abc");
    }

    #[test]
    fn test_diff_text_delete() {
        let result = diff_text("abc", "");
        let ops: Vec<DiffOp> = serde_json::from_str(&result).unwrap();
        assert!(ops.iter().all(|op| op.r#type == 2));
        let combined: String = ops.iter().map(|op| op.text.as_str()).collect();
        assert_eq!(combined, "abc");
    }

    #[test]
    fn test_diff_text_mixed() {
        let result = diff_text("abc", "axc");
        let ops: Vec<DiffOp> = serde_json::from_str(&result).unwrap();
        let combined: String = ops.iter().map(|op| op.text.as_str()).collect();
        assert!(combined.contains('a'));
        assert!(combined.contains('c'));
    }

    #[test]
    fn test_align_blocks_identical() {
        let result = align_blocks("line1\nline2", "line1\nline2");
        let blocks: Vec<BlockAlign> = serde_json::from_str(&result).unwrap();
        assert_eq!(blocks.len(), 2);
        assert!(blocks.iter().all(|b| b.r#type == 0));
    }

    #[test]
    fn test_align_blocks_insert() {
        let result = align_blocks("line1", "line1\nline2");
        let blocks: Vec<BlockAlign> = serde_json::from_str(&result).unwrap();
        assert_eq!(blocks.len(), 2);
        assert_eq!(blocks[0].r#type, 0);
        assert_eq!(blocks[1].r#type, 1);
    }

    #[test]
    fn test_align_blocks_delete() {
        let result = align_blocks("line1\nline2", "line1");
        let blocks: Vec<BlockAlign> = serde_json::from_str(&result).unwrap();
        assert_eq!(blocks.len(), 2);
        assert_eq!(blocks[0].r#type, 0);
        assert_eq!(blocks[1].r#type, 2);
    }

    #[test]
    fn test_align_blocks_empty() {
        let result = align_blocks("", "");
        let blocks: Vec<BlockAlign> = serde_json::from_str(&result).unwrap();
        assert_eq!(blocks.len(), 0);
    }

    #[test]
    fn test_align_blocks_reorder() {
        let result = align_blocks("a\nb\nc", "c\na\nb");
        let blocks: Vec<BlockAlign> = serde_json::from_str(&result).unwrap();
        // LCS of [a,b,c] and [c,a,b] — verify no crash and valid output
        assert!(!blocks.is_empty());
    }
}
