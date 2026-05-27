---
title: "Decision: Jekyll Slug Migration"
category: "decisions"
tags: ["blog", "slugs", "jekyll", "migration"]
links: ["blog-app", "tanstack-start-adoption"]
summary: ".html suffix stripped from all 297 blog post slugs at generation time during the March 2026 blog migration."
updated: "2026-03-23"
---

# Decision: Jekyll Slug Migration

**Date:** 2026-03-23  
**Status:** Complete

## Problem

The blog was migrated from Jekyll. Post frontmatter slugs retained a `.html` suffix (e.g. `my-post.html`) from the Jekyll era. TanStack Router expects clean slugs without extensions.

## What was done

The `.html` suffix is stripped at data generation time — when `posts.ts` loads the frontmatter, it removes the `.html` before the slug is used in routing or navigation.

`getPostBySlug()` includes defensive normalization: it tries both the raw slug and the `.html`-stripped version. This handles any edge case where old links or data might pass in a suffixed slug.

## Scope

All 297 posts had their slugs normalized. No post URLs broke — the clean slug matches the new routes, and the `.html` suffix in old links would 404 at the Cloudflare Pages level (expected behavior; no redirect rules were added since there was no existing production traffic on the old domain).

## Why not strip in frontmatter directly

Stripping at generation time rather than editing 297 `.md` frontmatter files keeps the source files clean and avoids a massive diff. The blog post content files in `apps/blog/_posts/**` are out of scope for duyetbot anyway — they belong to Duyet Le.
