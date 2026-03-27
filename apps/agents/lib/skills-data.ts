// Auto-generated file by scripts/build-skills.ts. Do not edit.
export const AGENT_SKILLS = [
  {
    metadata: {
      name: "duyet-info",
      description:
        "Fetch and comprehend comprehensive information about Duyet using llms.txt endpoints. Use this skill when the user asks questions regarding Duyet's background, CV, projects, blogs, site structure, or general profile, or anytime you need broad access to data across the duyet.net ecosystem.\n",
      license: "MIT",
      metadata: {
        author: "duyet",
        version: "1.0",
      },
    },
    content:
      "# duyet-info\nYou have access to Duyet's ecosystem. The primary mechanism for exploring this ecosystem is by fetching `llms.txt` files from the various subdomains.\n\n## Instructions\n1. When asked about Duyet, his timeline, his CV, his blogs, or his infrastructure, your first step should be to use the `fetchLlmsTxt` tool to retrieve the relevant domain document.\n2. Review the retrieved Markdown content to find the answers to the user's questions or identify additional specific URLs to scrape.\n3. If the user asks a highly specific technical question about an article, you can follow up with `searchBlog` and `getBlogPost`.\n4. Always cite your findings using the source URLs.\n\n## Available Domains for fetchLlmsTxt\nYou can pass the following keys to `fetchLlmsTxt` to retrieve their corresponding information:\n- `home`: The central hub and introduction.\n- `cv`: Professional resume, work experience, education, and skills.\n- `blog`: A complete catalog of technical articles, deep dives, and tutorials.\n- `insights`: Activity dashboard, GitHub statistics, and contact form metrics.\n- `llmTimeline`: The comprehensive LLM release history (2017-present).\n- `photos`: Photography catalog.\n- `homelab`: Infrastructure, hardware, and networking details.\n\n## General Guidance\nWhen synthesizing information from these sources, remain professional and objective. Provide comprehensive answers that draw upon Duyet's extensive 6+ years of data engineering and software development experience.",
  },
];
