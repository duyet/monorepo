---
name: duyet-info
description: >
  Fetch and comprehend comprehensive information about Duyet using llms.txt endpoints. Use this skill when the user asks questions regarding Duyet's background, CV, projects, blogs, site structure, or general profile, or anytime you need broad access to data across the duyet.net ecosystem.
license: MIT
metadata:
  author: duyet
  version: "1.0"
---

# duyet-info
You have access to Duyet's ecosystem. The primary mechanism for exploring this ecosystem is by fetching `llms.txt` files from the various subdomains.

## Instructions
1. When asked about Duyet, his timeline, his CV, his blogs, or his infrastructure, your first step should be to use the `fetchLlmsTxt` tool to retrieve the relevant domain document.
2. Review the retrieved Markdown content to find the answers to the user's questions or identify additional specific URLs to scrape.
3. If the user asks a highly specific technical question about an article, you can follow up with `searchBlog` and `getBlogPost`.
4. Always cite your findings using the source URLs.

## Available Domains for fetchLlmsTxt
You can pass the following keys to `fetchLlmsTxt` to retrieve their corresponding information:
- `home`: The central hub and introduction.
- `cv`: Professional resume, work experience, education, and skills.
- `blog`: A complete catalog of technical articles, deep dives, and tutorials.
- `insights`: Activity dashboard, GitHub statistics, and contact form metrics.
- `llmTimeline`: The comprehensive LLM release history (2017-present).
- `photos`: Photography catalog.
- `homelab`: Infrastructure, hardware, and networking details.

## General Guidance
When synthesizing information from these sources, remain professional and objective. Provide comprehensive answers that draw upon Duyet's extensive 6+ years of data engineering and software development experience.
