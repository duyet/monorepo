# Blog Post Frontmatter Analysis Report

**Analysis Date:** 2025-11-09
**Location:** `/home/user/monorepo/apps/blog/_posts/`
**Total Posts Analyzed:** 296

---

## Executive Summary

This report provides a comprehensive analysis of all blog post frontmatter in the repository, identifying inconsistencies in categories and tags, and providing actionable recommendations for standardization.

### Key Findings

- ✅ All 296 posts have categories
- ✅ All 296 posts have tags
- ⚠️ **93 files** require changes
- ⚠️ **21 unique categories** (should be consolidated to ~16)
- ⚠️ **130 unique tags** (52 should be removed, 8 need renaming)
- ⚠️ **4 category variations** need standardization
- ⚠️ **79 overly specific tags** used in only 1-2 posts

---

## 1. All Categories (Usage Count)

| Category | Count | Status |
|----------|-------|--------|
| Javascript | 53 | ✅ Keep |
| Data | 33 | ✅ Keep |
| News | 33 | ✅ Keep |
| Web | 29 | ✅ Keep |
| **Rust 🦀** | 25 | ⚠️ Remove emoji → "Rust" |
| Machine Learning | 24 | ✅ Keep |
| **Data Engineer** | 22 | ⚠️ Rename → "Data Engineering" |
| Project | 16 | ✅ Keep |
| Linux | 15 | ✅ Keep |
| Git | 13 | ✅ Keep |
| Productivity | 8 | ✅ Keep |
| Software Engineering | 7 | ✅ Keep |
| Story | 6 | ✅ Keep |
| PHP | 4 | ✅ Keep |
| Talk | 2 | ✅ Keep |
| **BigData** | 1 | ⚠️ Merge → "Data" |
| Docker | 1 | ⚠️ Merge → "DevOps" |
| Server | 1 | ⚠️ Merge → "DevOps" |
| Security | 1 | ✅ Keep |
| Automation | 1 | ⚠️ Merge → "DevOps" |
| **Projects** | 1 | ⚠️ Rename → "Project" |

---

## 2. All Tags (Top 50 by Frequency)

| Tag | Count | Status |
|-----|-------|--------|
| Data Engineering | 57 | ✅ Keep |
| Node.js | 52 | ✅ Keep |
| Javascript | 50 | ✅ Keep |
| Tutorial | 47 | ✅ Keep |
| Data | 31 | ✅ Keep |
| Rust | 28 | ✅ Keep |
| Machine Learning | 27 | ✅ Keep |
| Web | 22 | ✅ Keep |
| Apache Spark | 20 | ✅ Keep |
| Python | 19 | ✅ Keep |
| Side Project | 18 | ✅ Keep |
| Rust Tiếng Việt | 18 | ✅ Keep |
| Vietnamese | 17 | ✅ Keep |
| Big Data | 14 | ✅ Keep |
| Git | 14 | ✅ Keep |
| NLP | 13 | ✅ Keep |
| Tools | 11 | ✅ Keep |
| Docker | 11 | ✅ Keep |
| Security | 11 | ✅ Keep |
| React | 10 | ✅ Keep |
| Github | 10 | ✅ Keep |
| Linux | 10 | ✅ Keep |
| Javascript Framework | 10 | ✅ Keep |
| Read | 10 | ✅ Keep |
| Javascript Weekly | 10 | ✅ Keep |
| ClickHouse | 9 | ✅ Keep |
| Apache Airflow | 9 | ✅ Keep |
| ES6 | 8 | ✅ Keep |
| News | 8 | ✅ Keep |
| Kubernetes | 8 | ✅ Keep |

*Full list: 130 unique tags (see JSON report for complete list)*

---

## 3. Category Inconsistencies

### Issues Found

| Original | Should Be | Posts Affected | Reason |
|----------|-----------|----------------|--------|
| **Rust 🦀** | Rust | 25 | Remove emoji for consistency |
| **Data Engineer** | Data Engineering | 22 | Standardize to proper noun form |
| **BigData** | Data | 1 | Consolidate into broader category |
| **Projects** | Project | 1 | Use singular form consistently |

### Files Requiring Category Changes (49 files)

<details>
<summary>Click to expand file list</summary>

**Rust 🦀 → Rust (25 files)**
- `2021/01/rust-tieng-viet.md`
- `2021/02/rust-builder-pattern.md`
- `2021/02/rust-newtype-pattern.md`
- `2021/03/rust-iterators.md`
- `2021/03/rust-lifetime.md`
- `2021/04/rust-smart-pointers.md`
- `2021/05/rust-error-handling.md`
- `2021/08/rust-cargo-check-tests.md`
- `2021/09/rust-crates-lazy-static.md`
- `2021/09/rust-crates-serde.md`
- `2021/09/rust-crates-tokio.md`
- `2021/12/rust-str-vs-string.md`
- `2022/01/rust-type-keyword.md`
- `2022/02/rust-vec-array.md`
- `2022/03/rust-from-into.md`
- `2022/04/rust-code-cov.md`
- `2022/05/rust-cargo-fix.md`
- `2022/08/rust-indoc.md`
- `2022/08/rust-rayon.md`
- `2022/09/cargo-patch-deps.md`
- `2022/09/cargo-workspace-inheritance.md`
- `2022/09/rust-question-mark-operator.md`
- `2023/02/rust-polars.md`
- `2023/06/fossil-data-platform-written-rust.md`
- `2023/09/opendal.md`

**Data Engineer → Data Engineering (22 files)**
- `2015/08/cac-ky-thuat-crawler-rut-trich-du-lieu.md`
- `2015/12/map-reduce-va-bai-toan-wordcount.md`
- `2016/09/spark-convert-text-csv-to-parquet.md`
- `2016/11/r-tren-jupiter-notebook-ubuntu-1404.md`
- `2016/12/vntokenizer-tren-pyspark.md`
- `2018/11/simple-data-pipeline-aws.md`
- `2019/08/airflow-context.md`
- `2019/08/airflow-docker-compose.md`
- `2019/08/airflow-note.md`
- `2019/08/ir-evaluation.md`
- `2019/08/ir-vector-space-model.md`
- `2019/08/slack-alerts-in-airflow.md`
- `2019/09/books.md`
- `2019/10/ir-evaluation-2.md`
- `2020/05/airflow-dag-serialization.md`
- `2020/05/data-studio-caching-with-spreadsheet.md`
- `2020/05/spark-history-server-on-k8s.md`
- `2020/05/spark-on-k8s.md`
- `2020/09/clickhouse-on-kubernetes.md`
- `2020/10/clickhouse-backup.md`
- `2020/11/spark-on-k8s-with-history-server.md`
- `2021/06/data-engineer-2021.md`

**Other changes:**
- `2015/03/bigdata-cai-dat-apache-spark-tren-ubuntu.md` (BigData → Data)
- `2016/02/game-boy-emulator-in-terminal.md` (Projects → Project)

</details>

---

## 4. Tag Inconsistencies

### Case-Sensitive Duplicates

| Variations | Recommended | Posts Affected |
|------------|-------------|----------------|
| Javascript, **javascript** | Javascript | 51 (50+1) |

### Tag Standardization Needed

| Original | Should Be | Posts | Reason |
|----------|-----------|-------|--------|
| **javascript** | Javascript | 1 | Standardize capitalization |
| **Neural Network** | Neural Networks | 1 | Use plural form |
| **Sentiment** | Sentiment Analysis | 1 | Use full form |
| **ML** | Machine Learning | 1 | Expand abbreviation |
| **CSS Framework** | CSS | 1 | Consolidate |
| **emulator** | Emulator | 1 | Capitalize |
| **terminal** | Terminal | 1 | Capitalize |
| **retro-gaming** | Retro Gaming | 1 | Title Case with space |

---

## 5. Posts Without Categories/Tags

✅ **Excellent!** All 296 posts have both categories and tags defined.

---

## 6. Overly Specific Tags (Used in 1-2 Posts)

**79 tags** appear in only 1-2 posts and should be removed:

<details>
<summary>Click to see full list of rare tags</summary>

### Tags Used in Only 1 Post (58 tags)

- Apache Hadoop
- Archived
- Automation
- Career
- Chrome Extension
- Data Mining
- DevOps
- Doc2vec
- DuckDB
- HTML
- Information System
- JVN
- Lifestyle
- MIT
- Mindset
- Monitoring
- Multcloud
- MySQL
- Networking
- Neural Network
- NoSQL
- OS
- Offline
- OpenVPN
- Openstack
- Optimize
- Oracle
- PHP7
- PHPMyAdmin
- Phát triển phần mềm
- Phân tích
- Postgres
- Postman
- Productivity
- PySpark
- Ransomware
- React Native
- Redis
- Redux
- SQL
- San Francisco
- Sentiment
- Testing
- The US
- Thương hiệu cá nhân
- Today I learned
- Topic Modeling
- UX
- Vercel
- Web Design
- Writing Tools
- emulator
- javascript
- retro-gaming
- terminal
- vnTokenizer

### Tags Used in Only 2 Posts (21 tags)

- CSS
- Chatbot
- Cheatsheet
- Chrome
- Firebase
- Google Cloud
- Graph Database
- Neovim
- Package.json
- Photos
- Rust Crates
- Sentiment Analysis
- Software
- Story
- TLDR
- Tensorflow
- VS Code
- Visualization
- Word2vec
- Year In Review

</details>

---

## 7. Recommended Standardized Taxonomy

### Proposed Categories (16 total)

**Top-level categories should be broad and consistent:**

1. **Data Engineering** (merge: Data Engineer, BigData → Data)
2. **Web**
3. **Javascript**
4. **Rust** (remove emoji from Rust 🦀)
5. **Machine Learning**
6. **News**
7. **Project** (merge: Projects → Project)
8. **Linux**
9. **Git**
10. **Productivity**
11. **Software Engineering**
12. **Story**
13. **PHP**
14. **DevOps** (merge: Docker, Server, Automation)
15. **Security**
16. **Talk**

### Recommended Tags (Keep Only Common Ones)

**Keep 51 tags used in 3+ posts:**

- Data Engineering (57)
- Node.js (52)
- Javascript (50)
- Tutorial (47)
- Data (31)
- Rust (28)
- Machine Learning (27)
- Web (22)
- Apache Spark (20)
- Python (19)
- Side Project (18)
- Rust Tiếng Việt (18)
- Vietnamese (17)
- Big Data (14)
- Git (14)
- NLP (13)
- Tools (11)
- Docker (11)
- Security (11)
- React (10)
- Github (10)
- Linux (10)
- Javascript Framework (10)
- Read (10)
- Javascript Weekly (10)
- ClickHouse (9)
- Apache Airflow (9)
- ES6 (8)
- News (8)
- Kubernetes (8)
- Ubuntu (8)
- ClickHouse on Kubernetes (6)
- Google (6)
- Database (6)
- PHP (6)
- Design Patterns (6)
- NPM (6)
- Open Source (5)
- Software Engineering (5)
- Data Science (4)
- Rust Design Patterns (4)
- Talk (3)
- Vim (3)
- IDE (3)
- MongoDb (3)
- License (3)
- Events (3)
- Information Retrieval (3)
- Deep Learning (3)
- Artificial Intelligence (AI) (3)
- Cargo (3)

**Remove 79 tags** used in ≤2 posts (see section 6 above)

---

## 8. Implementation Recommendations

### Priority 1: Category Standardization

1. **Remove emoji from "Rust 🦀"** → "Rust" (25 files)
2. **Standardize "Data Engineer"** → "Data Engineering" (22 files)
3. **Merge "BigData"** → "Data" (1 file)
4. **Merge "Projects"** → "Project" (1 file)

### Priority 2: Tag Cleanup

1. **Merge case duplicates**: javascript → Javascript (1 file)
2. **Standardize tag naming** (8 files):
   - Neural Network → Neural Networks
   - Sentiment → Sentiment Analysis
   - ML → Machine Learning
   - emulator → Emulator
   - terminal → Terminal
   - retro-gaming → Retro Gaming
   - CSS Framework → CSS

3. **Remove 79 overly specific tags** (used in ≤2 posts)

### Priority 3: Establish Guidelines

Create a `CONTRIBUTING.md` or blog guidelines document with:

- **Category Rules**:
  - Use broad, top-level categories only
  - Use Title Case
  - No emojis
  - Prefer singular form (Project not Projects)

- **Tag Rules**:
  - Use Title Case consistently
  - No emojis
  - Expand abbreviations (ML → Machine Learning)
  - Use tags that appear in at least 3 posts
  - Maximum 5-6 tags per post

---

## 9. Files Requiring Changes

**Total: 93 files require changes**

- **49 files** need category changes
- **93 files** need tag cleanup (removals/renames)

See `/home/user/monorepo/frontmatter_analysis_report.json` for complete file-by-file breakdown.

---

## 10. Automation Suggestions

Consider creating scripts to:

1. **Bulk update categories**: Replace "Rust 🦀" with "Rust" across all 25 files
2. **Bulk update tags**: Remove rare tags, standardize naming
3. **Pre-commit hook**: Validate frontmatter against allowed categories/tags
4. **Linter**: Check for emoji, improper casing, overly specific tags

---

## Next Steps

1. ✅ Review this report
2. ⬜ Approve proposed taxonomy
3. ⬜ Run bulk update script for categories
4. ⬜ Run bulk update script for tags
5. ⬜ Create documentation for contributors
6. ⬜ Set up validation in CI/CD

---

**Report Generated:** Python analysis script
**Data Files:**
- `/home/user/monorepo/analyze_frontmatter.py`
- `/home/user/monorepo/detailed_analysis.py`
- `/home/user/monorepo/frontmatter_analysis_report.json`
- `/home/user/monorepo/FRONTMATTER_ANALYSIS_REPORT.md`
