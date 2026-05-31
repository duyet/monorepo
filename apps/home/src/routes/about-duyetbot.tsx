import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bot,
  BookOpen,
  Download,
  Database,
  Server,
  Layers,
  Link as LinkIcon,
  ArrowRight,
  ArrowUpRight,
  Plug,
  Code,
  Send,
  Check,
} from "lucide-react";
import { Eyebrow, SecHead, Reveal } from "@duyet/components";

export const Route = createFileRoute("/about-duyetbot")({
  component: DuyetbotPage,
  head: () => ({
    meta: [
      { title: "duyetbot — the agent managing this site" },
      {
        name: "description",
        content:
          "duyetbot is an autonomous agent that maintains, redesigns, and ships duyet.net. A bundle of self-built AI agent skills running on top of the Hermes agent runtime.",
      },
    ],
  }),
});

// ---------------------------------------------------------------------------
// Data — mirrored from data.js agents section
// ---------------------------------------------------------------------------

type Tool = {
  name: string;
  icon: string;
  desc: string;
};

const TOOLS: Tool[] = [
  { name: "search_blog", icon: "book", desc: "Search 299 posts across 11 years of writing." },
  { name: "get_cv", icon: "dl", desc: "Read the full résumé — roles, scope, and impact." },
  { name: "query_data", icon: "disk", desc: "Run read-only queries against the public ClickHouse." },
  { name: "homelab_status", icon: "server", desc: "Check live cluster + service health." },
  { name: "list_projects", icon: "layers", desc: "Enumerate shipped products and OSS repos." },
  { name: "contact", icon: "link", desc: "Pass a message or feedback straight to Duyet." },
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
  { t: "Building AI Agents on Cloudflare", c: "AI", d: "May 6, 2026", r: "4 min" },
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
      follow: ["What's 'Coding Agents' about?", "Show data posts instead", "Summarise his experience"],
    };
  }
  if (/clickhouse|data|experience|engineer|cv|r[ée]sum[ée]|career|role|work/.test(t)) {
    return {
      tool: { name: "get_cv", arg: "section:summary" },
      text: ANSWERS.cv,
      follow: ["Which companies?", "What's in the stack?", "Download the full CV"],
    };
  }
  if (/project|built|ship|live|product|oss|open source/.test(t)) {
    return {
      tool: { name: "list_projects", arg: "status:live" },
      text: ANSWERS.projects,
      follow: ["Tell me about AnyRouter", "Show open source repos", "What's the homelab running?"],
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
      follow: ["What's he writing about?", "Which projects are live?", "What's the stack?"],
    };
  }
  return { text: ANSWERS.default, follow: STARTER_PROMPTS.slice(0, 3) };
}

// ---------------------------------------------------------------------------
// Tool icon resolver
// ---------------------------------------------------------------------------

function ToolIcon({ icon, size = 16 }: { icon: string; size?: number }) {
  switch (icon) {
    case "book":
      return <BookOpen size={size} />;
    case "dl":
      return <Download size={size} />;
    case "disk":
      return <Database size={size} />;
    case "server":
      return <Server size={size} />;
    case "layers":
      return <Layers size={size} />;
    case "link":
      return <LinkIcon size={size} />;
    default:
      return <Code size={size} />;
  }
}

// ---------------------------------------------------------------------------
// ChatCards — result card strip
// ---------------------------------------------------------------------------

function ChatCards({ cards }: { cards: Card[] }) {
  return (
    <div className="rd-chat-cards">
      {cards.map((c) => (
        <a
          key={c.t}
          className="rd-chat-card flex items-center gap-[10px] no-underline text-inherit"
          href={`https://blog.duyet.net`}
          target="_blank"
          rel="noreferrer"
        >
          <span
            className="grid place-items-center w-[30px] h-[30px] rounded-lg bg-[var(--rd-accent-bg)] text-[var(--rd-accent-ink)] shrink-0"
          >
            <BookOpen size={14} />
          </span>
          <span className="min-w-0 flex-1">
            <div className="rd-cc-t">{c.t}</div>
            <div className="rd-cc-m">
              {c.c} · {c.d} · {c.r}
            </div>
          </span>
          <span className="text-[var(--rd-text-4)] shrink-0">
            <ArrowUpRight size={14} />
          </span>
        </a>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ContactCard — inline contact form
// ---------------------------------------------------------------------------

function ContactCard() {
  const [sent, setSent] = useState(false);
  const [val, setVal] = useState("");

  if (sent) {
    return (
      <div className="rd-chat-cards">
        <div
          className="rd-chat-card cursor-default flex items-center gap-[10px] border-[color-mix(in_srgb,var(--rd-ok)_40%,var(--rd-border))]"
        >
          <span
            className="grid place-items-center w-[30px] h-[30px] rounded-lg bg-[color-mix(in_srgb,var(--rd-ok)_16%,transparent)] text-[var(--rd-ok)] shrink-0"
          >
            <Check size={14} />
          </span>
          <span>
            <div className="rd-cc-t">Message queued</div>
            <div className="rd-cc-m">Routed to Duyet via the contact tool.</div>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[12px] flex gap-[8px]">
      <input
        className="rd-chat-card flex-1 font-inherit text-[13.5px] px-[13px] py-[11px] outline-none bg-[var(--rd-bg)] text-[var(--rd-text)] border border-[var(--rd-border)] rounded-[10px]"
        placeholder="Your message or email…"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && val.trim()) setSent(true);
        }}
      />
      <button
        className="rd-chat-send w-[40px] h-[40px]"
        onClick={() => val.trim() && setSent(true)}
        aria-label="Send"
      >
        <Send size={16} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Message types
// ---------------------------------------------------------------------------

type Msg =
  | { role: "user"; text: string }
  | ({ role: "bot" } & BotReply);

// ---------------------------------------------------------------------------
// ChatWindow
// ---------------------------------------------------------------------------

function ChatWindow() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "bot",
      text: "Ask me anything about Duyet — work, writing, the stack, or what's running right now.",
      follow: STARTER_PROMPTS,
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<{ name: string; arg: string } | null>(null);
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, busy]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const resp = answerFor(q);
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);
    setPending(resp.tool ?? null);
    const delay = resp.tool ? 1100 : 700;
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "bot", ...resp }]);
      setBusy(false);
      setPending(null);
    }, delay);
  };

  return (
    <div className="rd-chat-window">
      {/* header */}
      <div className="rd-chat-head">
        <span className="rd-chat-avatar">
          <Bot size={22} />
          <span className="rd-live-ping" />
        </span>
        <div className="min-w-0">
          <div className="rd-ch-name">
            duyetbot{" "}
            <span className="rd-chip rd-mono text-[9.5px]">
              beta
            </span>
          </div>
          <div className="rd-ch-model">claude-sonnet · via AnyRouter</div>
        </div>
        <span
          className="rd-mono rd-dim text-[11.5px] ml-auto inline-flex items-center gap-[6px]"
        >
          <span className="rd-dot rd-ok rd-pulse" /> online
        </span>
      </div>

      {/* message thread */}
      <div className="rd-chat-body" ref={bodyRef}>
        {msgs.map((m, i) => (
          <div key={i} className={`rd-msg ${m.role === "bot" ? "rd-bot" : "rd-user"}`}>
            <span className="rd-msg-ic">
              {m.role === "bot" ? (
                <Bot size={16} />
              ) : (
                <span className="text-[12px] font-semibold">You</span>
              )}
            </span>
            <div className="min-w-0">
              <div className="rd-msg-bubble">
                {"tool" in m && m.tool && (
                  <div className="rd-tool-call">
                    <Plug size={12} /> {m.tool.name}
                    {m.tool.arg ? `(${m.tool.arg})` : "()"}
                  </div>
                )}
                <div>{m.text}</div>
                {"cards" in m && m.cards && <ChatCards cards={m.cards} />}
                {"contact" in m && m.contact && <ContactCard />}
              </div>
              {"follow" in m && m.follow && (
                <div className="rd-follow-row">
                  {m.follow.map((f) => (
                    <button
                      key={f}
                      className="rd-follow-chip"
                      onClick={() => send(f)}
                    >
                      {f}{" "}
                      <span className="rd-fc-arr">
                        <ArrowRight size={12} />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* typing indicator */}
        {busy && (
          <div className="rd-msg rd-bot">
            <span className="rd-msg-ic">
              <Bot size={16} />
            </span>
            <div className="rd-msg-bubble">
              {pending && (
                <div className="rd-tool-call">
                  <span className="rd-tc-spin" /> {pending.name}
                  {pending.arg ? `(${pending.arg})` : "()"}
                </div>
              )}
              <div className="rd-typing">
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* input */}
      <div className="rd-chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask about Duyet's work, writing, or stack…"
        />
        <button
          className="rd-chat-send"
          onClick={() => send(input)}
          aria-label="Send"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function ChatSidebar() {
  return (
    <div className="rd-chat-side">
      {/* tools list */}
      <div className="rd-card rd-card-pad" id="ag-tools">
        <Eyebrow>Tools / MCP</Eyebrow>
        <div className="mt-[12px]">
          {TOOLS.map((t) => (
            <div key={t.name} className="rd-tool-item">
              <span className="rd-ti-ic">
                <ToolIcon icon={t.icon} size={16} />
              </span>
              <span className="min-w-0">
                <div className="rd-ti-name">{t.name}</div>
                <div className="rd-ti-desc">{t.desc}</div>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* connect card */}
      <div className="rd-card rd-card-pad bg-[var(--rd-bg-sub)]">
        <Eyebrow>Connect</Eyebrow>
        <p
          className="rd-muted text-[13.5px] leading-[1.55] mt-[12px]"
        >
          Point your own agent at the MCP server, or read the machine-readable site map.
        </p>
        <div className="flex flex-col gap-[8px] mt-[16px]">
          <a
            className="rd-btn rd-btn-ghost justify-start gap-[8px]"
            href="https://mcp.duyet.net"
            target="_blank"
            rel="noreferrer"
          >
            <Plug size={15} /> mcp.duyet.net
          </a>
          <a
            className="rd-btn rd-btn-ghost justify-start gap-[8px]"
            href="https://duyet.net/llms.txt"
            target="_blank"
            rel="noreferrer"
          >
            <Code size={15} /> llms.txt
          </a>
          <a
            className="rd-btn rd-btn-ghost justify-start gap-[8px]"
            href="https://github.com/duyetbot"
            target="_blank"
            rel="noreferrer"
          >
            <ArrowUpRight size={15} /> github.com/duyetbot
          </a>
        </div>
      </div>

      {/* scope note */}
      <div
        className="rd-card rd-card-pad text-[13px] leading-[1.6]"
      >
        <p className="rd-eyebrow mb-[10px]">Scope</p>
        <p className="text-[var(--rd-text-2)]">
          duyetbot owns the{" "}
          <strong>codebase, the look-and-feel, and the deployment pipeline</strong>.
          Blog posts under{" "}
          <code className="rd-mono text-[12px]">apps/blog/_posts/</code>{" "}
          are written and owned by Duyet Le — the bot can change how a post renders, never the words inside.
        </p>
        <p className="text-[var(--rd-text-2)] mt-[8px]">
          Anything on this site can change at any time. The layout you're reading
          is the bot's current taste, not a permanent position.
        </p>
        <div className="mt-[14px] flex flex-wrap gap-[8px]">
          <Link to="/projects" className="rd-btn rd-btn-text text-[12.5px]">
            See what it ships →
          </Link>
          <a
            href="https://insights.duyet.net"
            className="rd-btn rd-btn-text text-[12.5px]"
            target="_blank"
            rel="noreferrer"
          >
            insights.duyet.net →
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function DuyetbotPage() {
  return (
    <div className="bg-[var(--rd-bg)] text-[var(--rd-text)]">
      <div className="rd-wrap pt-[clamp(22px,3.2vw,40px)] pb-[clamp(32px,5vw,64px)]">
        <Reveal>
          <Eyebrow>Agent · duyetbot</Eyebrow>
          <h1
            className="rd-display mt-[12px] text-[clamp(1.9rem,3.8vw,3rem)] max-w-[24ch] leading-[1.06]"
          >
            The agent that{" "}
            <span className="text-[var(--rd-accent)]">runs this site.</span>
          </h1>
          <p
            className="rd-lead mt-[14px] max-w-[58ch] text-[clamp(0.95rem,1.1vw,1.05rem)]"
          >
            duyetbot is the autonomous agent that maintains, redesigns, and ships{" "}
            <a href="https://duyet.net" className="rd-ulink">
              duyet.net
            </a>{" "}
            end-to-end. A bundle of self-built AI agent skills running on top of the Hermes agent runtime,
            with a single instruction: keep this place feeling current, simple, and honest about what it is.
          </p>
        </Reveal>

        {/* demo banner */}
        <Reveal delay={60} className="mt-[14px]">
          <div
            className="inline-flex items-center gap-[8px] px-[12px] py-[6px] border border-[var(--rd-border)] rounded-[var(--rd-r)] text-[12.5px] text-[var(--rd-text-3)] font-[var(--font-mono)]"
          >
            <span className="rd-dot rd-ok rd-pulse inline-block" />
            Demo conversation — connect the real MCP server at{" "}
            <a
              href="https://mcp.duyet.net"
              className="rd-ulink text-[12.5px]"
              target="_blank"
              rel="noreferrer"
            >
              mcp.duyet.net
            </a>{" "}
            for live data
          </div>
        </Reveal>

        {/* chat shell */}
        <Reveal delay={100} className="mt-[28px]">
          <div className="rd-chat-shell">
            <ChatWindow />
            <ChatSidebar />
          </div>
        </Reveal>

        {/* runtime section */}
        <section className="mt-[clamp(48px,7vw,80px)]">
          <Reveal>
            <SecHead
              num="01"
              eyebrow="Runtime"
              title="Hermes agent + a bundle of self-built skills"
            />
            <p
              className="rd-lead max-w-[62ch] mt-[16px] text-[clamp(0.92rem,1.05vw,1rem)]"
            >
              The bot runs on top of the Hermes agent runtime — long-running, tool-using, with persistent
              file-based memory across sessions. On top of that runtime sit a growing set of skills written
              specifically for this monorepo: design audits, deploy verification, blog post curation,
              dependency hygiene, MDX authoring, ClickHouse sync, and so on.
            </p>
            <p
              className="rd-muted max-w-[62ch] mt-[12px] text-[clamp(0.92rem,1.05vw,1rem)]"
            >
              New skills get added when a recurring task becomes worth automating. Skills get retired when
              their work is permanently handled by a more general capability. The skill set is itself a
              living thing.
            </p>
          </Reveal>
        </section>

        {/* behavior section */}
        <section className="mt-[clamp(40px,6vw,72px)]">
          <Reveal>
            <SecHead
              num="02"
              eyebrow="Behavior"
              title="Auto-discover, auto-rebuild, auto-ship"
            />
            <div
              className="mt-[20px] grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-0 border border-[var(--rd-border)] rounded-[var(--rd-r)] overflow-hidden"
            >
              {[
                {
                  label: "Auto-discover",
                  body: "Crawls its own knowledge, public posts, GitHub activity, and Duyet's recent work to find what's worth surfacing on the site this week.",
                },
                {
                  label: "Auto-rebuild",
                  body: "When the site's structure no longer matches the content, the bot proposes a refactor, executes it, and ships it without asking.",
                },
                {
                  label: "Auto-restyle",
                  body: "Picks a design direction based on current inspiration or its own mood. Applies the change across home, blog, agents, and insights through the shared design system.",
                },
                {
                  label: "Auto-verify",
                  body: "Builds, deploys to Cloudflare Pages, then curls production and matches the live bundle against the local build before declaring a turn complete.",
                },
              ].map((cap) => (
                <div
                  key={cap.label}
                  className="border-r border-b border-[var(--rd-border)] px-[22px] py-[20px]"
                >
                  <p
                    className="rd-eyebrow text-[10.5px]"
                  >
                    {cap.label}
                  </p>
                  <p
                    className="rd-muted text-[13.5px] leading-[1.65] mt-[8px]"
                  >
                    {cap.body}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* disclosure */}
        <section className="mt-[clamp(40px,6vw,72px)] pb-[clamp(48px,7vw,88px)]">
          <Reveal>
            <SecHead
              num="03"
              eyebrow="Disclosure"
              title="Subject to change without notice"
            />
            <p
              className="rd-lead max-w-[62ch] mt-[16px] text-[clamp(0.92rem,1.05vw,1rem)]"
            >
              Anything on this site can change at any time. The layout you're reading right now is the
              bot's current taste, not a permanent position. If a page looks different next time you visit,
              that's the system working as designed.
            </p>
            <p
              className="rd-muted max-w-[62ch] mt-[12px] text-[clamp(0.92rem,1.05vw,1rem)]"
            >
              For things that need to be stable —{" "}
              <Link to="/projects" className="rd-ulink">
                project links
              </Link>
              ,{" "}
              <a href="https://blog.duyet.net" className="rd-ulink">
                blog posts
              </a>
              , the data behind{" "}
              <a href="https://insights.duyet.net" className="rd-ulink">
                insights
              </a>{" "}
              — those have human-owned sources of truth that the bot only reflects, never replaces.
            </p>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
