#!/usr/bin/env python3
"""
Fix frontmatter categories and tags in blog posts based on analysis report.

This script:
1. Fixes 4 category variations (49 files affected)
2. Standardizes 8 tag variations
3. Removes 79 overly specific tags (used in ≤2 posts)

Based on: FRONTMATTER_ANALYSIS_REPORT.md
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple
from collections import defaultdict

# Category fixes mapping
CATEGORY_FIXES = {
    "Rust 🦀": "Rust",
    "Data Engineer": "Data Engineering",
    "BigData": "Data",
    "Projects": "Project",
}

# Tag standardization mapping
TAG_STANDARDIZATIONS = {
    # Case fixes
    "javascript": "Javascript",

    # Pluralization
    "Neural Network": "Neural Networks",

    # Expand abbreviations
    "ML": "Machine Learning",
    "Sentiment": "Sentiment Analysis",

    # Capitalization
    "emulator": "Emulator",
    "terminal": "Terminal",

    # Title Case with space
    "retro-gaming": "Retro Gaming",

    # Consolidate
    "CSS Framework": "CSS",
}

# Rare tags to remove (used in only 1-2 posts)
# Tags used in only 1 post (58 tags)
RARE_TAGS_TO_REMOVE = {
    # Single use tags
    "Apache Hadoop", "Archived", "Automation", "Career", "Chrome Extension",
    "Data Mining", "DevOps", "Doc2vec", "DuckDB", "HTML", "Information System",
    "JVN", "Lifestyle", "MIT", "Mindset", "Monitoring", "Multcloud", "MySQL",
    "Networking", "Neural Network", "NoSQL", "OS", "Offline", "OpenVPN",
    "Openstack", "Optimize", "Oracle", "PHP7", "PHPMyAdmin",
    "Phát triển phần mềm", "Phân tích", "Postgres", "Postman", "Productivity",
    "PySpark", "Ransomware", "React Native", "Redis", "Redux", "SQL",
    "San Francisco", "Sentiment", "Testing", "The US", "Thương hiệu cá nhân",
    "Today I learned", "Topic Modeling", "UX", "Vercel", "Web Design",
    "Writing Tools", "emulator", "javascript", "retro-gaming", "terminal",
    "vnTokenizer",

    # Tags used in only 2 posts (21 tags)
    "CSS", "Chatbot", "Cheatsheet", "Chrome", "Firebase", "Google Cloud",
    "Graph Database", "Neovim", "Package.json", "Photos", "Rust Crates",
    "Sentiment Analysis", "Software", "Story", "TLDR", "Tensorflow", "VS Code",
    "Visualization", "Word2vec", "Year In Review",
}


def extract_frontmatter(content: str) -> Tuple[str, int, int]:
    """
    Extract frontmatter from markdown content.
    Returns (frontmatter_yaml, start_pos, end_pos)
    """
    # Match YAML frontmatter between --- delimiters
    pattern = r'^---\s*\n(.*?)\n---\s*\n'
    match = re.match(pattern, content, re.DOTALL)

    if match:
        return match.group(1), match.start(), match.end()
    return "", 0, 0


def parse_frontmatter(yaml_text: str) -> Dict:
    """
    Parse YAML frontmatter using PyYAML.
    Returns a dictionary with parsed data.
    """
    import yaml
    try:
        return yaml.safe_load(yaml_text) or {}
    except Exception as e:
        print(f"YAML parse error: {e}")
        return {}


def serialize_frontmatter(data: Dict) -> str:
    """
    Serialize dictionary back to YAML frontmatter.
    """
    import yaml

    # Use safe_dump with specific settings to maintain readability
    return yaml.safe_dump(
        data,
        default_flow_style=False,
        allow_unicode=True,
        sort_keys=False,
        width=1000,  # Prevent line wrapping
    ).rstrip()


def fix_category(category: str) -> str:
    """Fix category based on CATEGORY_FIXES mapping."""
    return CATEGORY_FIXES.get(category, category)


def fix_tag(tag: str) -> str:
    """Standardize tag based on TAG_STANDARDIZATIONS mapping."""
    return TAG_STANDARDIZATIONS.get(tag, tag)


def should_remove_tag(tag: str) -> bool:
    """Check if tag should be removed (rare tag)."""
    return tag in RARE_TAGS_TO_REMOVE


def process_file(file_path: Path) -> Dict:
    """
    Process a single markdown file using string-based replacements to preserve formatting.
    Returns dictionary with statistics about changes.
    """
    stats = {
        "categories_fixed": [],
        "tags_standardized": [],
        "tags_removed": [],
        "modified": False,
        "error": None
    }

    try:
        content = file_path.read_text(encoding='utf-8')
        frontmatter_yaml, start_pos, end_pos = extract_frontmatter(content)

        if not frontmatter_yaml:
            stats["error"] = "No frontmatter found"
            return stats

        # Parse YAML to understand structure
        data = parse_frontmatter(frontmatter_yaml)

        if not data:
            stats["error"] = "Empty frontmatter"
            return stats

        new_content = content
        modified = False

        # Fix category using string replacement
        if 'category' in data:
            original = data['category']
            fixed = fix_category(original)
            if original != fixed:
                # Replace in YAML content (don't use re.escape for simple replacement)
                pattern = f"category: {original}"
                replacement = f"category: {fixed}"
                if pattern in new_content:
                    new_content = new_content.replace(pattern, replacement)
                    stats['categories_fixed'].append(f"{original} → {fixed}")
                    modified = True

        # Fix tags using string replacement
        if 'tags' in data and isinstance(data['tags'], list):
            tags_to_remove = []
            tags_to_standardize = {}

            for tag in data['tags']:
                # Check if should be removed
                if should_remove_tag(tag):
                    tags_to_remove.append(tag)
                    stats['tags_removed'].append(tag)
                    modified = True
                else:
                    # Check if needs standardization
                    fixed = fix_tag(tag)
                    if tag != fixed:
                        tags_to_standardize[tag] = fixed
                        stats['tags_standardized'].append(f"{tag} → {fixed}")
                        modified = True

            # Remove tags
            for tag in tags_to_remove:
                # Match both formats: "  - Tag" and "- Tag"
                patterns = [
                    f"\n  - {tag}\n",
                    f"\n  - {tag}",
                    f"- {tag}\n",
                ]
                for pattern in patterns:
                    if pattern in new_content:
                        new_content = new_content.replace(pattern, "\n")
                        break

            # Standardize tags
            for old_tag, new_tag in tags_to_standardize.items():
                # Match tag in list format
                patterns = [
                    (f"  - {old_tag}\n", f"  - {new_tag}\n"),
                    (f"  - {old_tag}", f"  - {new_tag}"),
                    (f"- {old_tag}\n", f"- {new_tag}\n"),
                    (f"- {old_tag}", f"- {new_tag}"),
                ]
                for old_pattern, new_pattern in patterns:
                    if old_pattern in new_content:
                        new_content = new_content.replace(old_pattern, new_pattern)
                        break

        if modified:
            file_path.write_text(new_content, encoding='utf-8')
            stats['modified'] = True

    except Exception as e:
        stats['error'] = str(e)

    return stats


def main():
    """Main function to process all blog posts."""
    blog_posts_dir = Path("/home/user/monorepo/apps/blog/_posts")

    if not blog_posts_dir.exists():
        print(f"Error: Directory {blog_posts_dir} does not exist")
        return

    # Find all markdown files
    md_files = sorted(list(blog_posts_dir.rglob("*.md")))
    print(f"Found {len(md_files)} markdown files")
    print()

    # Process all files
    total_modified = 0
    total_categories_fixed = 0
    total_tags_standardized = 0
    total_tags_removed = 0
    errors = []
    modified_files = []

    # Track changes by type
    category_changes = defaultdict(int)
    tag_standardizations_count = defaultdict(int)
    tags_removed_count = defaultdict(int)

    for file_path in md_files:
        stats = process_file(file_path)

        if stats['error']:
            errors.append(f"{file_path.relative_to(blog_posts_dir)}: {stats['error']}")
            continue

        if stats['modified']:
            total_modified += 1
            modified_files.append(str(file_path.relative_to(blog_posts_dir)))
            total_categories_fixed += len(stats['categories_fixed'])
            total_tags_standardized += len(stats['tags_standardized'])
            total_tags_removed += len(stats['tags_removed'])

            # Track specific changes
            for fix in stats['categories_fixed']:
                category_changes[fix] += 1
            for fix in stats['tags_standardized']:
                tag_standardizations_count[fix] += 1
            for tag in stats['tags_removed']:
                tags_removed_count[tag] += 1

            print(f"✓ {file_path.relative_to(blog_posts_dir)}")
            if stats['categories_fixed']:
                for fix in stats['categories_fixed']:
                    print(f"  Category: {fix}")
            if stats['tags_standardized']:
                for fix in stats['tags_standardized']:
                    print(f"  Tag: {fix}")
            if stats['tags_removed']:
                print(f"  Removed tags: {', '.join(stats['tags_removed'])}")
            print()

    # Print summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total files processed: {len(md_files)}")
    print(f"Files modified: {total_modified}")
    print(f"Categories fixed: {total_categories_fixed}")
    print(f"Tags standardized: {total_tags_standardized}")
    print(f"Tags removed: {total_tags_removed}")
    print()

    if category_changes:
        print("Category Changes:")
        for change, count in sorted(category_changes.items()):
            print(f"  {change} ({count} files)")
        print()

    if tag_standardizations_count:
        print("Tag Standardizations:")
        for change, count in sorted(tag_standardizations_count.items()):
            print(f"  {change} ({count} files)")
        print()

    if tags_removed_count:
        print(f"Removed Tags (by frequency):")
        for tag, count in sorted(tags_removed_count.items(), key=lambda x: -x[1])[:20]:
            print(f"  {tag}: {count} occurrences")
        if len(tags_removed_count) > 20:
            print(f"  ... and {len(tags_removed_count) - 20} more")
        print()

    if errors:
        print("ERRORS:")
        for error in errors:
            print(f"  {error}")
        print()

    # Save summary to file
    summary_path = Path("/home/user/monorepo/frontmatter_fixes_summary.txt")
    with open(summary_path, 'w') as f:
        f.write("FRONTMATTER FIXES SUMMARY\n")
        f.write("=" * 70 + "\n\n")
        f.write(f"Total files processed: {len(md_files)}\n")
        f.write(f"Files modified: {total_modified}\n")
        f.write(f"Categories fixed: {total_categories_fixed}\n")
        f.write(f"Tags standardized: {total_tags_standardized}\n")
        f.write(f"Tags removed: {total_tags_removed}\n\n")

        f.write("\nModified Files:\n")
        for file in modified_files:
            f.write(f"  {file}\n")

        if category_changes:
            f.write("\n\nCategory Changes:\n")
            for change, count in sorted(category_changes.items()):
                f.write(f"  {change} ({count} files)\n")

        if tag_standardizations_count:
            f.write("\n\nTag Standardizations:\n")
            for change, count in sorted(tag_standardizations_count.items()):
                f.write(f"  {change} ({count} files)\n")

        if tags_removed_count:
            f.write(f"\n\nRemoved Tags:\n")
            for tag, count in sorted(tags_removed_count.items(), key=lambda x: -x[1]):
                f.write(f"  {tag}: {count} occurrences\n")

    print(f"Summary saved to: {summary_path}")


if __name__ == "__main__":
    main()
