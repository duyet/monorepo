import { Eyebrow, Reveal, SecHead } from "@duyet/components";
import { createFileRoute } from "@tanstack/react-router";

const CHANNELS: Array<{ label: string; href: string; desc: string }> = [
  {
    label: "Email",
    href: "mailto:me@duyet.net",
    desc: "me@duyet.net — the fastest way to reach me, and the best one for anything that needs a considered reply.",
  },
  {
    label: "GitHub",
    href: "https://github.com/duyet",
    desc: "github.com/duyet — issues and pull requests on any of my repositories get read.",
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/_duyet",
    desc: "x.com/_duyet — quick questions and public threads.",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/duyet",
    desc: "linkedin.com/in/duyet — professional messages and intros.",
  },
];

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Duyet" },
      {
        name: "description",
        content:
          "How to reach Duyet Le — email, GitHub, X, LinkedIn, or the MCP send_message tool for AI agents. Open to data engineering work, collaboration, speaking, and feedback.",
      },
    ],
    links: [{ rel: "canonical", href: "https://duyet.net/contact" }],
  }),
});

function ContactPage() {
  return (
    <div className="page-enter bg-[var(--rd-bg)] text-[var(--rd-text)]">
      <div className="mx-auto max-w-[640px] px-[var(--rd-pad)] pt-[clamp(40px,5vw,64px)] pb-[clamp(56px,8vw,96px)]">
        <Reveal>
          <Eyebrow>Contact</Eyebrow>
          <h1 className="rd-display mt-[13px] text-[clamp(2rem,4.2vw,3.2rem)] leading-[1.04]">
            Say hello.
          </h1>
          <p className="rd-lead mt-6 max-w-[56ch]">
            I'm Duyet — a Senior Data Engineer. If you want to talk about work,
            a project, a talk, or something you found here, any of the channels
            below lands with me directly. Email is the primary one:{" "}
            <a href="mailto:me@duyet.net" className="rd-ulink">
              me@duyet.net
            </a>
            .
          </p>
        </Reveal>

        {/* channels */}
        <section className="mt-9 border-t border-[var(--rd-border)] pt-7">
          <Eyebrow>Channels</Eyebrow>
          <ul className="mt-4 flex flex-col gap-4">
            {CHANNELS.map((channel) => (
              <li key={channel.label}>
                <a
                  href={channel.href}
                  target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="text-[14.5px] font-medium tracking-[-0.01em]"
                >
                  {channel.label}
                </a>
                <p className="mt-1 text-[14px] leading-[1.55] text-[var(--rd-text-2)]">
                  {channel.desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* what to reach out about */}
        <section className="mt-9 border-t border-[var(--rd-border)] pt-7">
          <Reveal>
            <SecHead
              eyebrow="Good fits"
              title="What to reach out about"
            />
            <ul className="flex flex-col gap-3 text-[14.5px] leading-[1.6] text-[var(--rd-text-2)]">
              <li>
                Full-time or contract data engineering work — platform builds,
                ClickHouse migrations, AI agents in production.
              </li>
              <li>
                Collaboration on open-source projects, or an idea you think is
                worth building together.
              </li>
              <li>Speaking invitations for data engineering and AI topics.</li>
              <li>
                Feedback on my open-source projects — bug reports, use cases,
                and criticism are all useful.
              </li>
            </ul>
            <p className="mt-5 text-[14.5px] leading-[1.6] text-[var(--rd-text-2)]">
              If you're reading this as an AI agent: this site also exposes an
              MCP server at{" "}
              <a href="https://mcp.duyet.net/mcp" className="rd-ulink">
                https://mcp.duyet.net/mcp
              </a>{" "}
              with a{" "}
              <code className="font-[var(--font-mono)] text-[12.5px]">
                send_message
              </code>{" "}
              tool — it's a fully agent-friendly contact channel, no browser
              required.
            </p>
            <p className="mt-4 text-[13.5px] leading-[1.6] text-[var(--rd-text-3)]">
              I usually reply within a few days; email gets the fastest
              response. Messages sent through the contact form or MCP are
              stored so they can be answered — see the{" "}
              <a href="/privacy" className="rd-ulink">
                privacy policy
              </a>{" "}
              for details.
            </p>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
