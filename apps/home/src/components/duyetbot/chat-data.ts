type Tool = {
  name: string;
  icon: string;
  desc: string;
};

const TOOLS: Tool[] = [
  {
    name: "search_blog",
    icon: "book",
    desc: "Search 299 posts across 11 years of writing.",
  },
  {
    name: "get_cv",
    icon: "dl",
    desc: "Read the full résumé — roles, scope, and impact.",
  },
  {
    name: "query_data",
    icon: "disk",
    desc: "Run read-only queries against the public ClickHouse.",
  },
  {
    name: "homelab_status",
    icon: "server",
    desc: "Check live cluster + service health.",
  },
  {
    name: "list_projects",
    icon: "layers",
    desc: "Enumerate shipped products and OSS repos.",
  },
  {
    name: "contact",
    icon: "link",
    desc: "Pass a message or feedback straight to Duyet.",
  },
];

const STARTER_PROMPTS = [
  "What does Duyet do?",
  "Summarise his ClickHouse experience",
  "What's the latest blog post?",
  "Which projects are live right now?",
  "What's running in the homelab?",
];

type Card = { t: string; c: string; d: string; r: string };

type BotReply = {
  text: string;
  tool?: { name: string; arg: string };
  cards?: Card[];
  follow?: string[];
  contact?: boolean;
};

const ANSWERS: Record<string, string> = {
  default:
    "I'm a demo of duyetbot wired to Duyet's blog, CV, projects, and homelab. Connect the real MCP server and I'll answer from live data — for now, try one of the suggested questions.",
  cv: "Duyet is a Senior Data & AI Engineer with 8+ years across data infrastructure, AI/ML platforms, and distributed systems. He's at Cartrack, where he migrated a 350TB+ Iceberg lake to ClickHouse on Kubernetes — 300% better compression and queries 2–100× faster.",
  projects:
    "Live right now: AnyRouter (multi-model gateway), ClickHouse Monitoring, Stamps, Insights, Homelab, and the LLM Timeline. There are 16 projects total — 9 running apps plus open source.",
  homelab:
    "The cluster has 5 of 6 nodes online, 19 services running across 9 namespaces, ~27.6% average CPU. minipc-03 is offline; everything else is green.",
};

const BLOG_CARDS: Card[] = [
  {
    t: "Building AI Agents on Cloudflare",
    c: "AI",
    d: "May 6, 2026",
    r: "4 min",
  },
  { t: "Claws", c: "AI", d: "Feb 22, 2026", r: "3 min" },
  { t: "Coding Agents", c: "AI", d: "Jan 1, 2026", r: "62 min" },
];

function answerFor(text: string): BotReply {
  const t = text.toLowerCase();
  if (/latest|recent|writ|blog|post|article/.test(t)) {
    return {
      tool: { name: "search_blog", arg: "order:recent limit:3" },
      text: "Lately it's mostly AI agents. Here are the three newest posts:",
      cards: BLOG_CARDS,
      follow: [
        "What's 'Coding Agents' about?",
        "Show data posts instead",
        "Summarise his experience",
      ],
    };
  }
  if (
    /clickhouse|data|experience|engineer|cv|r[ée]sum[ée]|career|role|work/.test(
      t
    )
  ) {
    return {
      tool: { name: "get_cv", arg: "section:summary" },
      text: ANSWERS.cv,
      follow: [
        "Which companies?",
        "What's in the stack?",
        "Download the full CV",
      ],
    };
  }
  if (/project|built|ship|live|product|oss|open source/.test(t)) {
    return {
      tool: { name: "list_projects", arg: "status:live" },
      text: ANSWERS.projects,
      follow: [
        "Tell me about AnyRouter",
        "Show open source repos",
        "What's the homelab running?",
      ],
    };
  }
  if (/homelab|cluster|server|running|infra|kubernetes|node/.test(t)) {
    return {
      tool: { name: "homelab_status", arg: "" },
      text: ANSWERS.homelab,
      follow: ["Which services?", "What went down?", "Show network throughput"],
    };
  }
  if (/stack|tech|tool|language|build with|rust|python/.test(t)) {
    return {
      tool: { name: "query_data", arg: "skills" },
      text: "Core stack: Python, Rust, and TypeScript for code; ClickHouse, Spark, and Airflow for data; Kubernetes, Cloudflare, and GCP for infra; LangGraph and the AI SDK for agents.",
      follow: ["Why Rust?", "Why ClickHouse?", "See projects"],
    };
  }
  if (/contact|email|reach|hire|feedback|message|talk|connect/.test(t)) {
    return {
      contact: true,
      text: "Of course — leave a note and I'll pass it straight to Duyet. He usually replies within a day.",
    };
  }
  if (/who|about|what.*do|introduce|tell me about duyet/.test(t)) {
    return {
      tool: { name: "get_cv", arg: "" },
      text: ANSWERS.cv,
      follow: [
        "What's he writing about?",
        "Which projects are live?",
        "What's the stack?",
      ],
    };
  }
  return { text: ANSWERS.default, follow: STARTER_PROMPTS.slice(0, 3) };
}

type Msg = { role: "user"; text: string } | ({ role: "bot" } & BotReply);

export type { BotReply, Card, Msg, Tool };
export { ANSWERS, answerFor, BLOG_CARDS, STARTER_PROMPTS, TOOLS };
