import { createFileRoute, Link } from "@tanstack/react-router";
import { Eyebrow, SecHead, Reveal } from "@duyet/components";
import { ChatWindow } from "../components/duyetbot/ChatWindow";
import { ChatSidebar } from "../components/duyetbot/ChatSidebar";

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

function DuyetbotPage() {
  return (
    <div className="bg-[var(--rd-bg)] text-[var(--rd-text)]">
      <div className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(22px,3.2vw,40px)] pb-[clamp(32px,5vw,64px)]">
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
              className="text-[var(--rd-text-2)] max-w-[62ch] mt-[12px] text-[clamp(0.92rem,1.05vw,1rem)]"
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
                    className="text-[var(--rd-text-2)] text-[13.5px] leading-[1.65] mt-[8px]"
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
              className="text-[var(--rd-text-2)] max-w-[62ch] mt-[12px] text-[clamp(0.92rem,1.05vw,1rem)]"
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
