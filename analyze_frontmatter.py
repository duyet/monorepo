#!/usr/bin/env python3
"""
Analyze all blog post frontmatter to extract categories and tags
"""

import os
import re
from collections import Counter
import yaml
from pathlib import Path

def extract_frontmatter(file_path):
    """Extract YAML frontmatter from markdown file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract frontmatter between --- markers
        match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        if not match:
            return None

        frontmatter_text = match.group(1)
        frontmatter = yaml.safe_load(frontmatter_text)
        return frontmatter
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def analyze_blog_posts(posts_dir):
    """Analyze all blog posts and collect metadata"""
    all_categories = Counter()
    all_tags = Counter()
    posts_without_category = []
    posts_without_tags = []
    category_variations = {}
    tag_variations = {}
    all_posts_data = []

    # Find all markdown files
    md_files = list(Path(posts_dir).rglob('*.md'))
    print(f"Found {len(md_files)} markdown files")

    for md_file in md_files:
        frontmatter = extract_frontmatter(md_file)
        if not frontmatter:
            continue

        rel_path = str(md_file.relative_to(posts_dir))

        # Extract category
        category = frontmatter.get('category')
        if category:
            all_categories[category] += 1
            # Track category variations (case-insensitive check)
            category_lower = category.lower()
            if category_lower not in category_variations:
                category_variations[category_lower] = set()
            category_variations[category_lower].add(category)
        else:
            posts_without_category.append(rel_path)

        # Extract tags
        tags = frontmatter.get('tags', [])
        if tags:
            if isinstance(tags, list):
                for tag in tags:
                    if tag:
                        all_tags[tag] += 1
                        # Track tag variations
                        tag_lower = tag.lower().strip()
                        if tag_lower not in tag_variations:
                            tag_variations[tag_lower] = set()
                        tag_variations[tag_lower].add(tag)
        else:
            posts_without_tags.append(rel_path)

        # Store post data
        all_posts_data.append({
            'path': rel_path,
            'category': category,
            'tags': tags if tags else []
        })

    return {
        'categories': all_categories,
        'tags': all_tags,
        'posts_without_category': posts_without_category,
        'posts_without_tags': posts_without_tags,
        'category_variations': category_variations,
        'tag_variations': tag_variations,
        'posts_data': all_posts_data,
        'total_posts': len(all_posts_data)
    }

def print_report(analysis):
    """Print comprehensive analysis report"""
    print("\n" + "="*80)
    print("BLOG POST FRONTMATTER ANALYSIS REPORT")
    print("="*80)

    print(f"\nTotal posts analyzed: {analysis['total_posts']}")

    # Categories
    print("\n" + "-"*80)
    print("1. ALL CATEGORIES (with usage counts)")
    print("-"*80)
    for category, count in analysis['categories'].most_common():
        print(f"  {category}: {count}")
    print(f"\nTotal unique categories: {len(analysis['categories'])}")

    # Tags
    print("\n" + "-"*80)
    print("2. ALL TAGS (sorted by frequency)")
    print("-"*80)
    for tag, count in analysis['tags'].most_common():
        print(f"  {tag}: {count}")
    print(f"\nTotal unique tags: {len(analysis['tags'])}")

    # Category inconsistencies
    print("\n" + "-"*80)
    print("3. CATEGORY INCONSISTENCIES")
    print("-"*80)
    category_issues = {k: v for k, v in analysis['category_variations'].items() if len(v) > 1}
    if category_issues:
        for category_lower, variations in sorted(category_issues.items()):
            print(f"  '{category_lower}' has {len(variations)} variations:")
            for var in sorted(variations):
                print(f"    - '{var}' ({analysis['categories'][var]} posts)")
    else:
        print("  No category inconsistencies found (case-sensitive)")

    # Tag inconsistencies
    print("\n" + "-"*80)
    print("4. TAG INCONSISTENCIES")
    print("-"*80)
    tag_issues = {k: v for k, v in analysis['tag_variations'].items() if len(v) > 1}
    if tag_issues:
        print(f"Found {len(tag_issues)} tags with variations:")
        for tag_lower, variations in sorted(tag_issues.items()):
            if len(variations) > 1:
                print(f"  '{tag_lower}' has {len(variations)} variations:")
                for var in sorted(variations):
                    print(f"    - '{var}' ({analysis['tags'][var]} posts)")
    else:
        print("  No tag inconsistencies found")

    # Posts without category
    print("\n" + "-"*80)
    print("5. POSTS WITHOUT CATEGORIES")
    print("-"*80)
    if analysis['posts_without_category']:
        print(f"  {len(analysis['posts_without_category'])} posts without category:")
        for post in sorted(analysis['posts_without_category'])[:20]:  # Show first 20
            print(f"    - {post}")
        if len(analysis['posts_without_category']) > 20:
            print(f"    ... and {len(analysis['posts_without_category']) - 20} more")
    else:
        print("  All posts have categories!")

    # Posts without tags
    print("\n" + "-"*80)
    print("6. POSTS WITHOUT TAGS")
    print("-"*80)
    if analysis['posts_without_tags']:
        print(f"  {len(analysis['posts_without_tags'])} posts without tags:")
        for post in sorted(analysis['posts_without_tags'])[:20]:  # Show first 20
            print(f"    - {post}")
        if len(analysis['posts_without_tags']) > 20:
            print(f"    ... and {len(analysis['posts_without_tags']) - 20} more")
    else:
        print("  All posts have tags!")

    # Overly specific tags (1-2 posts)
    print("\n" + "-"*80)
    print("7. OVERLY SPECIFIC TAGS (used in only 1-2 posts)")
    print("-"*80)
    rare_tags = [(tag, count) for tag, count in analysis['tags'].items() if count <= 2]
    if rare_tags:
        print(f"  {len(rare_tags)} tags used in only 1-2 posts:")
        for tag, count in sorted(rare_tags, key=lambda x: (x[1], x[0])):
            print(f"    - '{tag}': {count} post(s)")
    else:
        print("  No overly specific tags found")

    # Recommendations
    print("\n" + "="*80)
    print("8. RECOMMENDATIONS")
    print("="*80)

    print("\nRECOMMENDED CATEGORY TAXONOMY (broad categories):")
    print("  Suggested standardized categories based on analysis:")

    # Analyze existing categories and suggest groupings
    categories = list(analysis['categories'].keys())
    suggested_categories = set()

    for cat in categories:
        cat_lower = cat.lower()
        if any(x in cat_lower for x in ['data', 'spark', 'mining', 'bigdata']):
            suggested_categories.add('Data')
        elif any(x in cat_lower for x in ['machine learning', 'ml', 'ai', 'neural']):
            suggested_categories.add('Machine Learning')
        elif any(x in cat_lower for x in ['web', 'javascript', 'js', 'react', 'node']):
            suggested_categories.add('Web')
        elif any(x in cat_lower for x in ['rust']):
            suggested_categories.add('Rust')
        elif any(x in cat_lower for x in ['devops', 'docker', 'kubernetes']):
            suggested_categories.add('DevOps')
        elif any(x in cat_lower for x in ['software', 'programming']):
            suggested_categories.add('Software Engineering')
        else:
            suggested_categories.add(cat)

    for cat in sorted(suggested_categories):
        print(f"    - {cat}")

    print("\nRECOMMENDED TAG CLEANUP:")
    print("  1. Merge similar tags (case-insensitive duplicates)")
    if tag_issues:
        print("     Examples of tags to merge:")
        for tag_lower, variations in list(tag_issues.items())[:10]:
            if len(variations) > 1:
                canonical = max(variations, key=lambda x: analysis['tags'][x])
                print(f"       - Merge {variations} -> '{canonical}'")

    print("\n  2. Remove overly specific tags (used in ≤2 posts)")
    if rare_tags:
        print(f"     Consider removing {len(rare_tags)} rare tags")

    print("\n  3. Standardize tag naming:")
    print("     - Use Title Case consistently")
    print("     - Remove emoji from tags (e.g., 'Rust 🦀' -> 'Rust')")
    print("     - Use singular form where appropriate")

    print("\n" + "="*80)

if __name__ == '__main__':
    posts_dir = '/home/user/monorepo/apps/blog/_posts'
    analysis = analyze_blog_posts(posts_dir)
    print_report(analysis)
