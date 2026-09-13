import { Eyebrow } from "@duyet/components";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Code, Plug } from "lucide-react";
import { TOOLS } from "./chat-data";
import { ToolIcon } from "./ToolIcon";

function ChatSidebar() {
  return (
    <div className="p-4">
      {/* tools list */}
      <div className="rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)] p-[clamp(18px,2.2vw,26px)]" id="ag-tools">
        <Eyebrow>Tools / MCP</Eyebrow>
        <div className="mt-[12px]">
          {TOOLS.map((t) => (
            <div key={t.name} className="mt-2 flex gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center text-[var(--rd-text-3)]">
                <ToolIcon icon={t.icon} size={16} />
              </span>
              <span className="min-w-0">
                <div className="text-[0.85rem] font-medium">{t.name}</div>
                <div className="text-[0.75rem] text-[var(--rd-text-3)]">
                  {t.desc}
                </div>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* connect card */}
      <div className="rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)] p-[clamp(18px,2.2vw,26px)] bg-[var(--rd-bg-sub)]">
        <Eyebrow>Connect</Eyebrow>
        <p className="text-[var(--rd-text-2)] text-[13.5px] leading-[1.55] mt-[12px]">
          Point your own agent at the MCP server, or read the machine-readable
          site map.
        </p>
        <div className="flex flex-col gap-[8px] mt-[16px]">
          <a
            className="inline-flex items-center justify-center rounded-full border border-[var(--rd-border)] bg-transparent px-4 py-2 text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--rd-text)] no-underline hover:bg-[var(--rd-surface-2)] justify-start gap-[8px]"
            href="https://mcp.duyet.net"
            target="_blank"
            rel="noreferrer"
          >
            <Plug size={15} /> mcp.duyet.net
          </a>
          <a
            className="inline-flex items-center justify-center rounded-full border border-[var(--rd-border)] bg-transparent px-4 py-2 text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--rd-text)] no-underline hover:bg-[var(--rd-surface-2)] justify-start gap-[8px]"
            href="https://duyet.net/llms.txt"
            target="_blank"
            rel="noreferrer"
          >
            <Code size={15} /> llms.txt
          </a>
          <a
            className="inline-flex items-center justify-center rounded-full border border-[var(--rd-border)] bg-transparent px-4 py-2 text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--rd-text)] no-underline hover:bg-[var(--rd-surface-2)] justify-start gap-[8px]"
            href="https://github.com/duyetbot"
            target="_blank"
            rel="noreferrer"
          >
            <ArrowUpRight size={15} /> github.com/duyetbot
          </a>
        </div>
      </div>

      {/* scope note */}
      <div className="rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)] p-[clamp(18px,2.2vw,26px)] text-[13px] leading-[1.6]">
        <p className="text-[0.68rem] font-medium tracking-[0.08em] uppercase text-[var(--rd-text-3)] mb-[10px]">Scope</p>
        <p className="text-[var(--rd-text-2)]">
          duyetbot owns the{" "}
          <strong>
            codebase, the look-and-feel, and the deployment pipeline
          </strong>
          . Blog posts under{" "}
          <code className="font-[var(--font-mono)] text-[12px]">
            apps/blog/_posts/
          </code>{" "}
          are written and owned by Duyet Le — the bot can change how a post
          renders, never the words inside.
        </p>
        <p className="text-[var(--rd-text-2)] mt-[8px]">
          Anything on this site can change at any time. The layout you're
          reading is the bot's current taste, not a permanent position.
        </p>
        <div className="mt-[14px] flex flex-wrap gap-[8px]">
          <Link
            to="/projects"
            className="inline-flex items-center text-[12.5px] text-[var(--rd-text-2)] no-underline hover:text-[var(--rd-text)]"
          >
            See what it ships →
          </Link>
          <a
            href="https://insights.duyet.net"
            className="inline-flex items-center text-[12.5px] text-[var(--rd-text-2)] no-underline hover:text-[var(--rd-text)]"
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

export { ChatSidebar };
