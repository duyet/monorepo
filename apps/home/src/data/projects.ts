import { duyetUrls } from "@duyet/urls";

export interface AppItem {
  name: string;
  href: string;
  host: string;
  utmContent: string;
  description: string;
  screenshot?: string;
  tone?: string;
}

const hostOf = (url: string) => new URL(url).host;

const projectUrls = {
  llmTimeline: "https://llm-timeline.duyet.net",
  agents: "https://agents.duyet.net/agents",
  claw: "https://claw.duyet.net",
  claudePlugins: "https://github.com/duyet/claude-plugins",
  stamp: "https://stamp.duyet.net",
  agentState: "https://agentstate.app",
  okie: "https://okie.one",
  pageview: "https://pageview.duyet.net",
};

export const apps: AppItem[] = [
  {
    name: "ClickHouse Monitoring",
    href: duyetUrls.external.clickhouse ?? "https://clickhouse.duyet.net",
    host: hostOf(
      duyetUrls.external.clickhouse ?? "https://clickhouse.duyet.net"
    ),
    utmContent: "ch_monitor_bento",
    description: "Real-time monitoring dashboard for ClickHouse clusters",
    screenshot: "/screenshots/ch-monitor.png",
    tone: "bg-[#8b633f]",
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
  },
  {
    name: "MCP Tools",
    href: duyetUrls.external.mcp ?? "https://mcp.duyet.net",
    host: hostOf(duyetUrls.external.mcp ?? "https://mcp.duyet.net"),
    utmContent: "mcp_bento",
    description: "Model Context Protocol tools and integrations",
    screenshot: "/screenshots/mcp-tools-art.png",
    tone: "bg-[#5f6257]",
  },
  {
    name: "AI Agents",
    href: projectUrls.agents,
    host: hostOf(projectUrls.agents),
    utmContent: "agents_bento",
    description: "AI chat interface with Cloudflare Workers AI and streaming",
    screenshot: "/screenshots/ai-agents.png",
    tone: "bg-[#536f91]",
  },
  {
    name: "Claude Codex Plugins",
    href: projectUrls.claudePlugins,
    host: hostOf(projectUrls.claudePlugins),
    utmContent: "claude_plugins_bento",
    description: "Official plugins for Claude Code and AI SDK",
    screenshot: "/screenshots/claude-plugins-art.png",
    tone: "bg-[#4f6f62]",
  },
  {
    name: "Stamps",
    href: "/stamp",
    host: hostOf(projectUrls.stamp),
    utmContent: "stamp_bento",
    description: "URL shortener with analytics and custom domains",
    screenshot: "/screenshots/stamp.png",
    tone: "bg-[#7f524e]",
  },
  {
    name: "Agent State",
    href: projectUrls.agentState,
    host: hostOf(projectUrls.agentState),
    utmContent: "agentstate_bento",
    description: "AI agent state management and debugging tools",
    screenshot: "/screenshots/agentstate-art.svg",
    tone: "bg-[#536f91]",
  },
  {
    name: "Okie.one",
    href: "/okie",
    host: hostOf(projectUrls.okie),
    utmContent: "okie_bento",
    description: "A focused demo for testing agent workflows and prompt tools",
    screenshot: "/screenshots/okie.png",
    tone: "bg-[#5f6257]",
  },
  {
    name: "PageView",
    href: projectUrls.pageview,
    host: hostOf(projectUrls.pageview),
    utmContent: "pageview_bento",
    description: "Simple, privacy-friendly analytics for websites",
    screenshot: "/screenshots/pageview-art.svg",
    tone: "bg-[#7a705d]",
  },
  {
    name: "LLM Timeline",
    href: "/",
    host: hostOf(projectUrls.llmTimeline),
    utmContent: "llm_timeline_bento",
    description: "Interactive timeline of 50+ LLM models from 2017-2025",
    screenshot: "/screenshots/llm-timeline.png",
    tone: "bg-[#4f6f62]",
  },
];
