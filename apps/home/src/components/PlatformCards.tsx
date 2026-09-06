import { ArrowUpRight } from "lucide-react";
import { artFor } from "../data/ascii-art";

const PLATFORMS = {
  featured: [
    {
      name: "AI Agents",
      domain: "agents.duyet.net",
      href: "https://agents.duyet.net",
      body: "Chat with agents that use your tools — streaming on Cloudflare Workers, open by default.",
      cta: "Open agents",
      art: artFor("agents", 0),
    },
    {
      name: "Knowledge base",
      domain: "kb.duyet.net",
      href: "https://kb.duyet.net",
      body: "A public second brain — durable notes on engineering and life, openly indexed.",
      cta: "Browse KB",
      art: artFor("kb", 2),
    },
  ],
  secondary: [
    {
      name: "MCP server",
      body: "Connect Claude, Cursor, and other agents to duyet.net tools.",
      href: "https://mcp.duyet.net/mcp",
      link: "View MCP endpoint →",
      icon: "mcp",
    },
    {
      name: "Public API",
      body: "Stats, contact, and machine-readable indexes for builders.",
      href: "/developers",
      link: "Developer resources →",
      icon: "api",
    },
    {
      name: "Blog",
      body: "Long-form notes on data platforms, agents, and shipping.",
      href: "https://blog.duyet.net",
      link: "Read the blog →",
      icon: "blog",
    },
  ],
} as const;

function PlatformIcon({ kind }: { kind: string }) {
  if (kind === "mcp") {
    return (
      <span className="home-plat-glyph home-plat-glyph-mcp" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    );
  }
  if (kind === "api") {
    return (
      <span className="home-plat-glyph home-plat-glyph-api" aria-hidden="true">
        {"{ }"}
      </span>
    );
  }
  return (
    <span className="home-plat-glyph home-plat-glyph-blog" aria-hidden="true">
      ¶
    </span>
  );
}

export function PlatformCards() {
  return (
    <div className="home-plat">
      <div className="home-plat-featured">
        {PLATFORMS.featured.map((card) => (
          <article key={card.name} className="home-plat-card home-plat-card-lg">
            <div className="home-plat-visual">
              <img src={card.art} alt="" loading="lazy" />
              <div className="home-plat-visual-shade" />
            </div>
            <div className="home-plat-foot">
              <h3 className="home-plat-title">{card.name}</h3>
              <p className="home-plat-body">{card.body}</p>
              <a
                href={card.href}
                target={card.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  card.href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                className="rd-btn rd-btn-primary no-underline text-[13px] px-4 py-2.5 mt-4 inline-flex"
              >
                {card.cta}
                <ArrowUpRight size={14} />
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="home-plat-secondary">
        {PLATFORMS.secondary.map((card) => (
          <article key={card.name} className="home-plat-card home-plat-card-sm">
            <PlatformIcon kind={card.icon} />
            <h3 className="home-plat-title">{card.name}</h3>
            <p className="home-plat-body">{card.body}</p>
            <a
              href={card.href}
              target={card.href.startsWith("http") ? "_blank" : undefined}
              rel={
                card.href.startsWith("http") ? "noopener noreferrer" : undefined
              }
              className="home-plat-link"
            >
              {card.link}
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
