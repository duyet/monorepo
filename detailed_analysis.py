#!/usr/bin/env python3
"""
Detailed analysis with specific file-level recommendations
"""

import os
import re
from collections import Counter, defaultdict
import yaml
from pathlib import Path

def extract_frontmatter(file_path):
    """Extract YAML frontmatter from markdown file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        if not match:
            return None

        frontmatter_text = match.group(1)
        frontmatter = yaml.safe_load(frontmatter_text)
        return frontmatter
    except Exception as e:
        return None

def analyze_in_detail(posts_dir):
    """Detailed analysis with specific recommendations"""

    md_files = list(Path(posts_dir).rglob('*.md'))

    # Data structures
    category_issues = []
    tag_issues = []
    all_categories = Counter()
    all_tags = Counter()

    # Category mapping for standardization
    category_mapping = {
        'Rust 🦀': 'Rust',
        'Data Engineer': 'Data Engineering',
        'BigData': 'Data',
        'Projects': 'Project',
    }

    # Tag mapping for standardization
    tag_mapping = {
        'javascript': 'Javascript',
        'Neural Network': 'Neural Networks',
        'Sentiment': 'Sentiment Analysis',
        'ML': 'Machine Learning',
        'CSS Framework': 'CSS',
        'emulator': 'Emulator',
        'terminal': 'Terminal',
        'retro-gaming': 'Retro Gaming',
    }

    # Tags to potentially remove (too specific, used in 1-2 posts)
    rare_tags = set([
        'Apache Hadoop', 'Archived', 'Automation', 'Career', 'Chrome Extension',
        'Data Mining', 'DevOps', 'Doc2vec', 'DuckDB', 'HTML', 'Information System',
        'JVN', 'Lifestyle', 'MIT', 'Mindset', 'Monitoring', 'Multcloud',
        'MySQL', 'Networking', 'NoSQL', 'OS', 'Offline', 'OpenVPN', 'Openstack',
        'Optimize', 'Oracle', 'PHP7', 'PHPMyAdmin', 'Phát triển phần mềm',
        'Phân tích', 'Postgres', 'Postman', 'Productivity', 'PySpark',
        'Ransomware', 'React Native', 'Redis', 'Redux', 'SQL', 'San Francisco',
        'Testing', 'The US', 'Thương hiệu cá nhân', 'Today I learned',
        'Topic Modeling', 'UX', 'Vercel', 'Web Design', 'Writing Tools',
        'vnTokenizer', 'Sentiment', 'javascript'
    ])

    print("="*80)
    print("DETAILED FILE-LEVEL ANALYSIS")
    print("="*80)

    issues_by_file = defaultdict(list)

    for md_file in md_files:
        frontmatter = extract_frontmatter(md_file)
        if not frontmatter:
            continue

        rel_path = str(md_file.relative_to(posts_dir))
        category = frontmatter.get('category')
        tags = frontmatter.get('tags', [])

        # Check category issues
        if category:
            all_categories[category] += 1

            if category in category_mapping:
                issues_by_file[rel_path].append({
                    'type': 'category',
                    'issue': f"Category should be '{category_mapping[category]}' instead of '{category}'"
                })

        # Check tag issues
        if tags and isinstance(tags, list):
            for tag in tags:
                if tag:
                    all_tags[tag] += 1

                    # Check if tag should be mapped
                    if tag in tag_mapping:
                        issues_by_file[rel_path].append({
                            'type': 'tag_rename',
                            'issue': f"Tag '{tag}' should be renamed to '{tag_mapping[tag]}'"
                        })

                    # Check if tag is too rare
                    if tag in rare_tags:
                        issues_by_file[rel_path].append({
                            'type': 'tag_remove',
                            'issue': f"Tag '{tag}' is too specific (used in ≤2 posts) - consider removing"
                        })

    # Print issues
    print("\nFILES WITH ISSUES:")
    print("-"*80)

    files_with_issues = sorted(issues_by_file.items())

    if files_with_issues:
        for file_path, issues in files_with_issues:
            print(f"\n{file_path}:")
            for issue in issues:
                print(f"  [{issue['type'].upper()}] {issue['issue']}")
    else:
        print("No issues found!")

    print("\n" + "="*80)
    print("CATEGORY CONSOLIDATION RECOMMENDATIONS")
    print("="*80)
    print("\nSuggested category mappings:")
    for old, new in sorted(category_mapping.items()):
        count = all_categories[old]
        print(f"  '{old}' -> '{new}' ({count} posts)")

    print("\n" + "="*80)
    print("TAG CONSOLIDATION RECOMMENDATIONS")
    print("="*80)
    print("\nSuggested tag mappings:")
    for old, new in sorted(tag_mapping.items()):
        count = all_tags[old]
        print(f"  '{old}' -> '{new}' ({count} posts)")

    print("\n" + "="*80)
    print("PROPOSED STANDARDIZED TAXONOMY")
    print("="*80)

    print("\nCATEGORIES (broad, top-level):")
    proposed_categories = [
        "Data Engineering",  # Merge: Data Engineer, Data, BigData
        "Web",              # Keep as is
        "Javascript",       # Keep as is
        "Rust",            # Remove emoji from Rust 🦀
        "Machine Learning", # Keep as is
        "News",            # Keep as is
        "Project",         # Merge: Project, Projects
        "Linux",           # Keep as is
        "Git",             # Keep as is
        "Productivity",    # Keep as is
        "Software Engineering",
        "Story",
        "PHP",
        "DevOps",          # Merge: Docker, Server, Automation
        "Security",
        "Talk"
    ]

    for cat in proposed_categories:
        print(f"  - {cat}")

    print("\nCOMMON TAGS (keep these, used in 3+ posts):")
    common_tags = sorted([tag for tag, count in all_tags.items() if count >= 3 and tag not in rare_tags])
    for tag in common_tags:
        count = all_tags[tag]
        print(f"  - {tag} ({count} posts)")

    print("\n" + "="*80)
    print("SUMMARY STATISTICS")
    print("="*80)
    print(f"Total posts analyzed: {len(md_files)}")
    print(f"Files with issues: {len(files_with_issues)}")
    print(f"Category mappings needed: {len(category_mapping)}")
    print(f"Tag mappings needed: {len(tag_mapping)}")
    print(f"Rare tags to consider removing: {len(rare_tags)}")

    return issues_by_file

if __name__ == '__main__':
    posts_dir = '/home/user/monorepo/apps/blog/_posts'
    analyze_in_detail(posts_dir)
