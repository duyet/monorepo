import { Eyebrow, Reveal } from "@duyet/components";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChatSidebar } from "../components/duyetbot/ChatSidebar";
import { ChatWindow } from "../components/duyetbot/ChatWindow";

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
    links: [{ rel: "canonical", href: "https://duyet.net/about-duyetbot" }],
  }),
});

function DuyetbotPage() {
  return (
    <div className="bg-[var(--rd-bg)] text-[var(--rd-text)]">
      <div className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(22px,3.2vw,40px)] pb-[clamp(32px,5vw,64px)]">
        <Reveal>
          <Eyebrow>Agent · duyetbot</Eyebrow>
          <h1 className="font-[family-name:var(--font-display)] font-normal tracking-[-0.025em] leading-[1.05] mt-[12px] text-[clamp(1.9rem,3.8vw,3rem)] max-w-[24ch] leading-[1.06]">
            The agent that{" "}
            <span className="text-[var(--rd-accent)]">runs this site.</span>
          </h1>
          <p className="text-[1.05rem] leading-[1.65] text-[var(--rd-text-2)] mt-[14px] max-w-[58ch] text-[clamp(0.95rem,1.1vw,1.05rem)]">
            duyetbot is the autonomous agent that maintains, redesigns, and
            ships{" "}
            <a href="https://duyet.net" className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)]">
              duyet.net
            </a>{" "}
            end-to-end. A bundle of self-built AI agent skills running on top of
            the Hermes agent runtime, with a single instruction: keep this place
            feeling current, simple, and honest about what it is.
          </p>
        </Reveal>

        {/* demo banner */}
        <Reveal delay={60} className="mt-[14px]">
          <div className="inline-flex items-center gap-[8px] px-[12px] py-[6px] border border-[var(--rd-border)] rounded-[var(--rd-r)] text-[12.5px] text-[var(--rd-text-3)] font-[var(--font-mono)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Demo conversation — connect the real MCP server at{" "}
            <a
              href="https://mcp.duyet.net"
              className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)] text-[12.5px]"
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
          <div className="overflow-hidden rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)]">
            <ChatWindow />
            <ChatSidebar />
          </div>
        </Reveal>

        <section className="mt-9 border-t border-[var(--rd-border)] pt-7">
          <Reveal>
            <h2 className="text-[1.05rem] font-medium tracking-[-0.01em]">
              Runtime
            </h2>
            <p className="mt-3 max-w-[62ch] text-[14.5px] leading-[1.65] text-[var(--rd-text-2)]">
              Hermes agent runtime — long-running, tool-using, with persistent
              file-based memory. Skills on top of it cover design audits, deploy
              verification, blog curation, dependency hygiene, MDX, and
              ClickHouse sync. New skills appear when a task is worth
              automating; they leave when a more general capability covers the
              work.
            </p>
          </Reveal>
        </section>

        <section className="mt-9 border-t border-[var(--rd-border)] pt-7">
          <Reveal>
            <h2 className="text-[1.05rem] font-medium tracking-[-0.01em]">
              What it does
            </h2>
            <p className="mt-3 max-w-[62ch] text-[14.5px] leading-[1.65] text-[var(--rd-text-2)]">
              Discovers what is worth surfacing this week, rebuilds structure
              when content no longer fits, restyles through the shared design
              system, then verifies the live Cloudflare Pages bundle against
              the local build.
            </p>
          </Reveal>
        </section>

        <section className="mt-9 border-t border-[var(--rd-border)] pt-7 pb-[clamp(48px,7vw,88px)]">
          <Reveal>
            <h2 className="text-[1.05rem] font-medium tracking-[-0.01em]">
              Subject to change
            </h2>
            <p className="mt-3 max-w-[62ch] text-[14.5px] leading-[1.65] text-[var(--rd-text-2)]">
              Anything on this site can change at any time. The layout you are
              reading is the bot&apos;s current taste, not a permanent
              position.
            </p>
            <p className="mt-3 max-w-[62ch] text-[14.5px] leading-[1.65] text-[var(--rd-text-2)]">
              Stable sources of truth —{" "}
              <Link
                to="/projects"
                className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)]"
              >
                project links
              </Link>
              ,{" "}
              <a
                href="https://blog.duyet.net"
                className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)]"
              >
                blog posts
              </a>
              ,{" "}
              <a
                href="https://insights.duyet.net"
                className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)]"
              >
                insights
              </a>{" "}
              — are human-owned. The bot reflects them; it does not replace
              them.
            </p>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
