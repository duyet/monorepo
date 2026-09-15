import { Link } from "@tanstack/react-router";
import { TOOLS } from "./chat-data";

function ChatSidebar() {
  return (
    <div className="border-t border-[var(--rd-border)] p-4">
      <p className="m-0 text-[0.68rem] font-medium tracking-[0.08em] uppercase text-[var(--rd-text-3)]">
        MCP tools
      </p>
      <ul className="mt-3 mb-0 flex list-none flex-col gap-2 p-0">
        {TOOLS.map((t) => (
          <li key={t.name} className="text-[13.5px] leading-[1.5]">
            <code className="font-[var(--font-mono)] text-[12.5px]">
              {t.name}
            </code>
            <span className="text-[var(--rd-text-3)]"> — {t.desc}</span>
          </li>
        ))}
      </ul>

      <p className="mt-6 mb-0 text-[14px] leading-[1.6] text-[var(--rd-text-2)]">
        Point an agent at{" "}
        <a
          href="https://mcp.duyet.net"
          className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)]"
          target="_blank"
          rel="noreferrer"
        >
          mcp.duyet.net
        </a>
        , or read{" "}
        <a
          href="https://duyet.net/llms.txt"
          className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)]"
          target="_blank"
          rel="noreferrer"
        >
          llms.txt
        </a>
        . Source:{" "}
        <a
          href="https://github.com/duyetbot"
          className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)]"
          target="_blank"
          rel="noreferrer"
        >
          github.com/duyetbot
        </a>
        .
      </p>

      <p className="mt-4 mb-0 text-[13.5px] leading-[1.6] text-[var(--rd-text-2)]">
        duyetbot owns the codebase, look, and deploy pipeline. Blog copy under{" "}
        <code className="font-[var(--font-mono)] text-[12px]">
          apps/blog/_posts/
        </code>{" "}
        is written by Duyet Le. See{" "}
        <Link
          to="/projects"
          className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)]"
        >
          projects
        </Link>{" "}
        and{" "}
        <a
          href="https://insights.duyet.net"
          className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)]"
          target="_blank"
          rel="noreferrer"
        >
          insights.duyet.net
        </a>
        .
      </p>
    </div>
  );
}

export { ChatSidebar };
