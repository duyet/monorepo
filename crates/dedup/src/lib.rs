use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use wasm_bindgen::prelude::*;

/// Model — mirrors the TypeScript Model interface exactly.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Model {
    pub name: String,
    pub date: String,
    pub org: String,
    pub params: Option<String>,
    #[serde(rename = "type")]
    pub model_type: String,
    pub license: String,
    pub desc: String,
    pub source: Option<String>,
    pub domain: Option<String>,
    pub link: Option<String>,
    pub training_compute: Option<String>,
    pub training_hardware: Option<String>,
    pub training_dataset: Option<String>,
    pub authors: Option<String>,
}

/// Lightweight source descriptor passed alongside each batch of models.
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SourceInfo {
    name: String,
    priority: i32,
}

/// One source's contribution: the adapter metadata + its models.
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SourceResult {
    source: SourceInfo,
    models: Vec<Model>,
}

/// Stats returned alongside the merged models.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct MergeStats {
    sources: HashMap<String, usize>,
    duplicates: usize,
    total: usize,
}

/// WASM-visible wrapper for the merge result.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct MergeOutput {
    models: Vec<Model>,
    stats: MergeStats,
}

/// Build a dedup key: lowercase trimmed `name|org|date`.
fn model_key(m: &Model) -> String {
    format!(
        "{}|{}|{}",
        m.name.to_lowercase().trim(),
        m.org.to_lowercase().trim(),
        m.date
    )
}

/// Merge models from N data sources, deduplicating by key.
///
/// Higher-priority sources win on duplicates. Models are sorted by date ascending.
///
/// Input  — JSON string representing `SourceResult[]`
/// Output — JSON string `{ models: Model[], stats: MergeStats }`
#[wasm_bindgen]
pub fn merge_all_sources(input: &str) -> String {
    let mut results: Vec<SourceResult> = match serde_json::from_str(input) {
        Ok(r) => r,
        Err(e) => {
            return serde_json::to_string(&serde_json::json!({
                "error": format!("Failed to parse input: {e}")
            }))
            .unwrap_or_else(|_| r#"{"error":"parse failed"}"#.to_string());
        }
    };

    // Collect source counts before sorting (preserves input order in stats)
    let source_counts: HashMap<String, usize> = results
        .iter()
        .map(|sr| (sr.source.name.clone(), sr.models.len()))
        .collect();

    results.sort_by(|a, b| b.source.priority.cmp(&a.source.priority));

    let mut seen: HashSet<String> = HashSet::new();
    let mut merged: Vec<Model> = Vec::new();
    let mut duplicate_count: usize = 0;

    for sr in &results {
        for model in &sr.models {
            let key = model_key(model);
            if seen.contains(&key) {
                duplicate_count += 1;
                continue;
            }
            seen.insert(key);
            merged.push(model.clone());
        }
    }

    merged.sort_by(|a, b| a.date.cmp(&b.date));

    let total = merged.len();
    let output = MergeOutput {
        models: merged,
        stats: MergeStats {
            sources: source_counts,
            duplicates: duplicate_count,
            total,
        },
    };

    serde_json::to_string(&output)
        .unwrap_or_else(|_| r#"{"models":[],"stats":{"sources":{},"duplicates":0,"total":0}}"#.to_string())
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn dedup_same_name_across_sources() {
        let input = serde_json::json!([
            {
                "source": { "name": "curated", "priority": 100 },
                "models": [
                    { "name": "GPT-4", "date": "2023-03-14", "org": "OpenAI", "params": null, "type": "model", "license": "closed", "desc": "Curated desc" }
                ]
            },
            {
                "source": { "name": "epoch", "priority": 50 },
                "models": [
                    { "name": "GPT-4", "date": "2023-03-14", "org": "OpenAI", "params": "1.8T", "type": "model", "license": "closed", "desc": "Epoch desc" }
                ]
            }
        ]);

        let json = merge_all_sources(&input.to_string());
        let out: MergeOutput = serde_json::from_str(&json).unwrap();

        assert_eq!(out.models.len(), 1);
        assert_eq!(out.models[0].desc, "Curated desc"); // Higher priority wins
        assert_eq!(out.stats.duplicates, 1);
        assert_eq!(out.stats.total, 1);
    }

    #[test]
    fn sorted_by_date_ascending() {
        let input = serde_json::json!([
            {
                "source": { "name": "src", "priority": 1 },
                "models": [
                    { "name": "B", "date": "2024-01-01", "org": "X", "params": null, "type": "model", "license": "open", "desc": "" },
                    { "name": "A", "date": "2023-01-01", "org": "X", "params": null, "type": "model", "license": "open", "desc": "" }
                ]
            }
        ]);

        let json = merge_all_sources(&input.to_string());
        let out: MergeOutput = serde_json::from_str(&json).unwrap();

        assert_eq!(out.models[0].name, "A");
        assert_eq!(out.models[1].name, "B");
    }

    #[test]
    fn source_stats_count() {
        let input = serde_json::json!([
            {
                "source": { "name": "curated", "priority": 100 },
                "models": [
                    { "name": "M1", "date": "2023-01-01", "org": "X", "params": null, "type": "model", "license": "open", "desc": "" },
                    { "name": "M2", "date": "2023-02-01", "org": "X", "params": null, "type": "model", "license": "open", "desc": "" }
                ]
            },
            {
                "source": { "name": "epoch", "priority": 50 },
                "models": [
                    { "name": "E1", "date": "2023-03-01", "org": "Y", "params": null, "type": "model", "license": "closed", "desc": "" }
                ]
            }
        ]);

        let json = merge_all_sources(&input.to_string());
        let out: MergeOutput = serde_json::from_str(&json).unwrap();

        assert_eq!(out.stats.sources["curated"], 2);
        assert_eq!(out.stats.sources["epoch"], 1);
        assert_eq!(out.stats.duplicates, 0);
        assert_eq!(out.stats.total, 3);
    }

    #[test]
    fn case_insensitive_key() {
        let input = serde_json::json!([
            {
                "source": { "name": "a", "priority": 10 },
                "models": [
                    { "name": "gpt-4", "date": "2023-01-01", "org": "openai", "params": null, "type": "model", "license": "open", "desc": "" }
                ]
            },
            {
                "source": { "name": "b", "priority": 5 },
                "models": [
                    { "name": "GPT-4", "date": "2023-01-01", "org": "OpenAI", "params": null, "type": "model", "license": "open", "desc": "" }
                ]
            }
        ]);

        let json = merge_all_sources(&input.to_string());
        let out: MergeOutput = serde_json::from_str(&json).unwrap();

        assert_eq!(out.models.len(), 1);
        assert_eq!(out.stats.duplicates, 1);
    }

    #[test]
    fn empty_input() {
        let json = merge_all_sources("[]");
        let out: MergeOutput = serde_json::from_str(&json).unwrap();

        assert!(out.models.is_empty());
        assert_eq!(out.stats.duplicates, 0);
        assert_eq!(out.stats.total, 0);
    }

    #[test]
    fn invalid_json_returns_error() {
        let json = merge_all_sources("not json");
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert!(parsed.get("error").is_some());
    }

    #[test]
    fn optional_fields_roundtrip() {
        let input = serde_json::json!([
            {
                "source": { "name": "src", "priority": 1 },
                "models": [
                    {
                        "name": "Full",
                        "date": "2023-06-01",
                        "org": "Lab",
                        "params": "70B",
                        "type": "model",
                        "license": "open",
                        "desc": "A model",
                        "source": "curated",
                        "domain": "nlp",
                        "link": "https://example.com",
                        "trainingCompute": "1.2e25",
                        "trainingHardware": "TPU v4",
                        "trainingDataset": "The Pile",
                        "authors": "Jane Doe"
                    }
                ]
            }
        ]);

        let json = merge_all_sources(&input.to_string());
        let out: MergeOutput = serde_json::from_str(&json).unwrap();

        let m = &out.models[0];
        assert_eq!(m.params.as_deref(), Some("70B"));
        assert_eq!(m.source.as_deref(), Some("curated"));
        assert_eq!(m.domain.as_deref(), Some("nlp"));
        assert_eq!(m.link.as_deref(), Some("https://example.com"));
        assert_eq!(m.training_compute.as_deref(), Some("1.2e25"));
        assert_eq!(m.training_hardware.as_deref(), Some("TPU v4"));
        assert_eq!(m.training_dataset.as_deref(), Some("The Pile"));
        assert_eq!(m.authors.as_deref(), Some("Jane Doe"));
    }
}
