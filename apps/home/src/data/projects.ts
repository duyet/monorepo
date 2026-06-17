import { duyetUrls } from "@duyet/urls";

export interface AppItem {
  name: string;
  href: string;
  host: string;
  utmContent: string;
  description: string;
  screenshot?: string;
  tone?: string;
  /**
   * Canonical production domain (without scheme). Optional — render in the
   * project row meta strip and link to `https://{domain}` when present.
   * Distinct from `host`, which is derived from the navigation `href` and may
   * point at a repo (e.g. github.com) or an internal route.
   */
  domain?: string;
  /**
   * Lucide-react icon name. Rendered at the top of each grid cell.
   * Fallback: "Github" for GitHub-only projects, "Globe" otherwise.
   */
  iconName?: string;
  /**
   * Short domain/tech labels (1–2 per project). Shown on the projects page
   * to give visitors a quick sense of what each thing is about.
   */
  tags?: string[];
  /** Optional logo URL. Rendered as a small image next to the domain. */
  logo?: string;
  /** Optional dark-mode logo URL. If provided, used when user prefers dark mode. */
  logoDark?: string;
}

const hostOf = (url: string) => new URL(url).host;

const projectUrls = {
  anyRouter: "https://anyrouter.dev",
  clickhouseMonitoring: "https://chmonitor.dev",
  llmTimeline: "https://llm-timeline.duyet.net",
  agents: "https://agents.duyet.net/agents",
  claw: "https://claw.duyet.net",
  claudePlugins: "https://github.com/duyet/claude-plugins",
  stamp: "https://stamp.duyet.net",
  agentState: "https://agentstate.app",
  pageview: "https://pageview.duyet.net",
  shareHtml: "https://html.duyet.net",
  fonts: "https://duyet.github.io/fonts/",
};

export const apps: AppItem[] = [
  // ── Deployed apps ────────────────────────────────────────────────────────
  {
    name: "AnyRouter",
    href: projectUrls.anyRouter,
    host: hostOf(projectUrls.anyRouter),
    utmContent: "anyrouter_bento",
    description:
      "One API for every AI model. Route traffic across providers with fallback, observability, and BYOK from a single OpenAI-compatible endpoint built on Cloudflare's edge.",
    screenshot: "/screenshots/anyrouter-art.svg",
    tone: "bg-[#536f91]",
    domain: "anyrouter.dev",
    iconName: "Cloud",
    logo: "https://anyrouter.dev/brand/anyrouter-logo.svg",
    tags: ["AI", "Infra"],
  },
  {
    name: "ClickHouse Monitoring",
    href: projectUrls.clickhouseMonitoring,
    host: hostOf(projectUrls.clickhouseMonitoring),
    utmContent: "ch_monitor_bento",
    description:
      "ClickHouse monitoring with AI agent support for finding insights, monitoring clusters, and triaging activity",
    screenshot: "/screenshots/ch-monitor.png",
    tone: "bg-[#8b633f]",
    domain: "chmonitor.dev",
    iconName: "Database",
    logo: "https://chmonitor.dev/brand/logo-mark.svg",
    tags: ["Data", "AI"],
  },
  {
    name: "ShareHTML",
    href: projectUrls.shareHtml,
    host: hostOf(projectUrls.shareHtml),
    utmContent: "sharehtml_bento",
    description:
      "Share HTML, Markdown, and code files. Built for Human and AI Agent. Self-hosted on Cloudflare Workers.",
    tone: "bg-[#5f6257]",
    domain: "html.duyet.net",
    iconName: "Share2",
    logo: "https://stamp.duyet.net/api/stamps/EzFmilcUpdI9/image",
    tags: ["Tool"],
  },
  {
    name: "AI Agents",
    href: projectUrls.agents,
    host: hostOf(projectUrls.agents),
    utmContent: "agents_bento",
    description: "AI chat interface with Cloudflare Workers AI and streaming",
    screenshot: "/screenshots/ai-agents.png",
    tone: "bg-[#536f91]",
    domain: "agents.duyet.net",
    iconName: "Bot",
    tags: ["AI"],
  },
  {
    name: "Agent State",
    href: projectUrls.agentState,
    host: hostOf(projectUrls.agentState),
    utmContent: "agentstate_bento",
    description: "State store for AI agents — persistent memory and state management for agent workflows.",
    screenshot: "/screenshots/agentstate-art.svg",
    tone: "bg-[#536f91]",
    domain: "agentstate.app",
    iconName: "Bot",
    logo: "https://agentstate.app/brand/agentstate-logo.svg",
    logoDark: "https://agentstate.app/brand/agentstate-logo-dark.svg",
    tags: ["AI"],
  },
  {
    name: "MCP Tools",
    href: duyetUrls.external.mcp ?? "https://mcp.duyet.net",
    host: hostOf(duyetUrls.external.mcp ?? "https://mcp.duyet.net"),
    utmContent: "mcp_bento",
    description: "Model Context Protocol tools and integrations",
    screenshot: "/screenshots/mcp-tools-art.png",
    tone: "bg-[#5f6257]",
    domain: "mcp.duyet.net",
    iconName: "Plug",
    logo: "https://cdn.simpleicons.org/modelcontextprotocol",
    tags: ["AI", "Tool"],
  },
  {
    name: "Claude Codex Plugins",
    href: projectUrls.claudePlugins,
    host: hostOf(projectUrls.claudePlugins),
    utmContent: "claude_plugins_bento",
    description: "Official plugins for Claude Code and AI SDK",
    screenshot: "/screenshots/claude-plugins-art.png",
    tone: "bg-[#4f6f62]",
    iconName: "Puzzle",
    tags: ["AI", "TypeScript"],
  },
  {
    name: "Stamps",
    href: projectUrls.stamp,
    host: hostOf(projectUrls.stamp),
    utmContent: "stamp_bento",
    description: "URL shortener with analytics and custom domains",
    screenshot: "/screenshots/stamp.png",
    tone: "bg-[#7f524e]",
    domain: "stamp.duyet.net",
    iconName: "Link",
    logo: "https://stamp.duyet.net/api/stamps/eNVALg5MthyB/image",
    tags: ["Tool"],
  },
  {
    name: "PageView",
    href: projectUrls.pageview,
    host: hostOf(projectUrls.pageview),
    utmContent: "pageview_bento",
    description: "Simple, privacy-friendly analytics for websites",
    screenshot: "/screenshots/pageview-art.svg",
    tone: "bg-[#7a705d]",
    domain: "pageview.duyet.net",
    iconName: "BarChart2",
    tags: ["Tool"],
  },
  {
    name: "LLM Timeline",
    href: "/",
    host: hostOf(projectUrls.llmTimeline),
    utmContent: "llm_timeline_bento",
    description: "Interactive timeline of LLM models from 2017-2025",
    screenshot: "/screenshots/llm-timeline.png",
    tone: "bg-[#4f6f62]",
    domain: "llm-timeline.duyet.net",
    iconName: "BrainCircuit",
    tags: ["Data", "AI"],
  },
  {
    name: "Rust Tieng Viet",
    href: duyetUrls.external.rust ?? "https://rust-tieng-viet.github.io",
    host: hostOf(
      duyetUrls.external.rust ?? "https://rust-tieng-viet.github.io"
    ),
    utmContent: "rust_bento",
    description: "Rust programming language documentation in Vietnamese",
    screenshot: "/screenshots/rust-art.png",
    tone: "bg-[#6a5578]",
    iconName: "BookOpen",
    logo: "https://rust-lang.org/logos/rust-logo-blk.svg",
    tags: ["Rust"],
  },
  {
    name: "Duyet Serif",
    href: projectUrls.fonts,
    host: hostOf(projectUrls.fonts),
    utmContent: "fonts_bento",
    description: "Curated collection of beautiful Vietnamese-compatible fonts",
    tone: "bg-[#7a705d]",
    iconName: "Type",
    tags: ["FE"],
  },

  // ── GitHub-only projects ──────────────────────────────────────────────────
  {
    name: "LLM over DNS",
    href: "https://duyet.github.io/llm-over-dns",
    host: "duyet.github.io",
    utmContent: "llm_over_dns_bento",
    description:
      "Query an LLM directly via DNS TXT records — `dig @llm.duyet.net 'explain quantum computing' TXT +short`",
    domain: "duyet.github.io/llm-over-dns",
    iconName: "Terminal",
    logo: "https://cdn.simpleicons.org/cloudflare",
    tags: ["AI", "Infra"],
  },
  {
    name: "CCR",
    href: "https://github.com/duyet/ccr",
    host: "github.com",
    utmContent: "ccr_bento",
    description:
      "Claude Code + OpenRouter — route Claude Code sessions through OpenRouter for model flexibility.",
    domain: "github.com/duyet/ccr",
    iconName: "Bot",
    tags: ["AI", "TypeScript"],
  },
  {
    name: "Codex & Claude Plugins",
    href: "https://github.com/duyet/codex-claude-plugins",
    host: "github.com",
    utmContent: "codex_claude_plugins_bento",
    description: "Codex and Claude Code plugins for AI-powered development workflows.",
    domain: "github.com/duyet/codex-claude-plugins",
    iconName: "Puzzle",
    logo: "https://cdn.simpleicons.org/anthropic",
    tags: ["AI", "TypeScript"],
  },
  {
    name: "duyet MCP Server",
    href: "https://github.com/duyet/duyet-mcp-server",
    host: "github.com",
    utmContent: "duyet_mcp_server_bento",
    description: "Remote Model Context Protocol server for duyet.net — exposes blog, analytics, and personal data.",
    domain: "github.com/duyet/duyet-mcp-server",
    iconName: "Plug",
    tags: ["AI", "TypeScript"],
  },
  {
    name: "ClickHouse UDFs (Rust)",
    href: "https://github.com/duyet/clickhouse-udf-rs",
    host: "github.com",
    utmContent: "clickhouse_udf_rs_bento",
    description:
      "Collection of useful User-Defined Functions for ClickHouse written in Rust.",
    domain: "github.com/duyet/clickhouse-udf-rs",
    iconName: "Database",
    tags: ["Data", "Rust"],
  },
  {
    name: "Helm Charts",
    href: "https://github.com/duyet/charts",
    host: "github.com",
    utmContent: "charts_bento",
    description:
      "Collection of useful Helm Charts, well-tested with KinD and Kubeconform.",
    domain: "github.com/duyet/charts",
    iconName: "Package",
    logo: "https://helm.sh/img/helm.svg",
    tags: ["Infra"],
  },
  {
    name: "ccusage → ClickHouse",
    href: "https://github.com/duyet/ccusage-import",
    host: "github.com",
    utmContent: "ccusage_import_bento",
    description:
      "Import Claude Code usage data (ccusage) into ClickHouse for long-term analytics.",
    domain: "github.com/duyet/ccusage-import",
    iconName: "Database",
    tags: ["Data"],
  },
  {
    name: "Clauduck",
    href: "https://github.com/duyet/clauduck",
    host: "github.com",
    utmContent: "clauduck_bento",
    description:
      "Analyze your Claude Code usage with DuckDB — query session stats, token costs, and model breakdown.",
    domain: "github.com/duyet/clauduck",
    iconName: "BarChart2",
    tags: ["Data"],
  },
  {
    name: "Git Insights (Rust)",
    href: "https://github.com/duyet/git-insights-rs",
    host: "github.com",
    utmContent: "git_insights_rs_bento",
    description:
      "Generate commit insights from local or remote Git repositories — authors, churn, and hotspots.",
    domain: "github.com/duyet/git-insights-rs",
    iconName: "GitBranch",
    tags: ["Rust", "Tool"],
  },
  {
    name: "Glossary API (Rust)",
    href: "https://github.com/duyet/glossary-rs",
    host: "github.com",
    utmContent: "glossary_rs_bento",
    description:
      "Glossary API service written in Rust, powered by actix-web and Diesel.",
    domain: "github.com/duyet/glossary-rs",
    iconName: "Code2",
    tags: ["Rust"],
  },
  {
    name: "LLM Daily",
    href: "https://github.com/duyet/llm-daily",
    host: "github.com",
    utmContent: "llm_daily_bento",
    description:
      "Daily digest of LLM papers, releases, and community highlights — auto-generated and published.",
    domain: "github.com/duyet/llm-daily",
    iconName: "Rss",
    tags: ["AI"],
  },
  {
    name: "Bruteforce Database",
    href: "https://github.com/duyet/bruteforce-database",
    host: "github.com",
    utmContent: "bruteforce_db_bento",
    description:
      "Collection of breach datasets for security research and password analysis — 1.7k stars.",
    domain: "github.com/duyet/bruteforce-database",
    iconName: "Shield",
    tags: ["Security", "Data"],
  },
  {
    name: "PriceTrack",
    href: "https://github.com/duyet/pricetrack",
    host: "github.com",
    utmContent: "pricetrack_bento",
    description:
      "Price tracker for Vietnamese e-commerce (Tiki, Shopee, Lotte) with Firebase and price-drop alerts.",
    domain: "github.com/duyet/pricetrack",
    iconName: "ShoppingCart",
    tags: ["FE"],
  },
  {
    name: "Vietnamese Namedb",
    href: "https://github.com/duyet/vietnamese-namedb",
    host: "github.com",
    utmContent: "vn_namedb_bento",
    description:
      "Vietnamese name dictionary — comprehensive dataset of family and given names in Việt Nam.",
    domain: "github.com/duyet/vietnamese-namedb",
    iconName: "BookOpen",
    tags: ["Data"],
  },
  {
    name: "Skill2Vec",
    href: "https://github.com/duyet/skill2vec",
    host: "github.com",
    utmContent: "skill2vec_bento",
    description:
      "Skill Representations in Vector Space — pre-trained model and dataset for skill similarity and matching.",
    domain: "github.com/duyet/skill2vec",
    iconName: "BrainCircuit",
    tags: ["AI"],
  },
  {
    name: "Skill2Vec Dataset",
    href: "https://github.com/duyet/skill2vec-dataset",
    host: "github.com",
    utmContent: "skill2vec_dataset_bento",
    description:
      "Dataset and pre-trained vectors for Skill2Vec — job skill embeddings for NLP and recommendation systems.",
    domain: "github.com/duyet/skill2vec-dataset",
    iconName: "Database",
    tags: ["AI", "Data"],
  },
  {
    name: "Gaxy",
    href: "https://github.com/duyet/gaxy",
    host: "github.com",
    utmContent: "gaxy_bento",
    description:
      "Google Analytics / Google Tag Manager proxy — self-hosted for performance and privacy.",
    domain: "github.com/duyet/gaxy",
    iconName: "Globe",
    tags: ["FE", "Tool"],
  },
  {
    name: "Athena RS",
    href: "https://github.com/duyet/athena-rs",
    host: "github.com",
    utmContent: "athena_rs_bento",
    description:
      "Manage AWS Athena schemas as Code in GitOps style — written in Rust.",
    domain: "github.com/duyet/athena-rs",
    iconName: "Database",
    tags: ["Rust", "Infra"],
  },
  {
    name: "Coding Agent Insights",
    href: "https://github.com/duyet/coding-agent-insights",
    host: "github.com",
    utmContent: "coding_agent_insights_bento",
    description:
      "Analytics and insights from coding agent usage patterns — token costs, model breakdowns, and productivity metrics.",
    domain: "github.com/duyet/coding-agent-insights",
    iconName: "BarChart2",
    tags: ["AI"],
  },
];
