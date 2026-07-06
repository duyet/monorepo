/**
 * ExploreApps — shared cross-app discovery section.
 *
 * Renders a compact, editorial grid of every public surface in the duyet.net
 * network with a hand-drawn monochrome glyph per app. Styled entirely with the
 * `--rd-*` token layer (see styles.css) so it looks identical across blog,
 * home, insights, and homelab and recolors automatically in light/dark.
 *
 * Pass `currentApp` to drop the app the visitor is already on.
 */
import type { ReactNode } from "react";
import { Eyebrow } from "./redesign";

export type ExploreAppKey =
  | "home"
  | "blog"
  | "cv"
  | "insights"
  | "homelab"
  | "photos"
  | "llm-timeline"
  | "ai-percentage"
  | "agents"
  | "kb";

interface AppEntry {
  key: ExploreAppKey;
  name: string;
  /** Live domain without scheme, e.g. `blog.duyet.net`. */
  domain: string;
  href: string;
  blurb: string;
  glyph: ReactNode;
}

/* --- Pro glyphs: 24×24, currentColor stroke, no external deps --- */
const G = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Glyph = {
  home: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9.5h14V10" />
      <path d="M9.5 19.5v-5h5v5" />
    </svg>
  ),
  blog: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  cv: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <circle cx="9" cy="11" r="2.1" />
      <path d="M6 16c.4-1.6 1.7-2.4 3-2.4s2.6.8 3 2.4M15 9.5h3.5M15 13h3" />
    </svg>
  ),
  insights: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <path d="M4 20h16" />
      <path d="M6.5 20v-5M11 20V9.5M15.5 20v-7.5M20 20V6" />
    </svg>
  ),
  homelab: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <rect x="4" y="4" width="16" height="6" rx="1.5" />
      <rect x="4" y="14" width="16" height="6" rx="1.5" />
      <path d="M7.5 7h.01M7.5 17h.01" />
    </svg>
  ),
  photos: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4 17 4.5-4.5L13 17M12 14l3-3 5 5" />
    </svg>
  ),
  "llm-timeline": (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <path d="M4 12h16" />
      <circle cx="7" cy="12" r="2" />
      <circle cx="13" cy="12" r="2" />
      <circle cx="19" cy="12" r="1.6" />
      <path d="M7 6v4M13 14v4" />
    </svg>
  ),
  "ai-percentage": (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 8.5 15.5 15.5" />
      <circle cx="9" cy="9" r="1.1" />
      <circle cx="15" cy="15" r="1.1" />
    </svg>
  ),
  agents: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <rect x="6" y="8" width="12" height="9" rx="3" />
      <path d="M12 5v3M9.5 12.5h.01M14.5 12.5h.01M4 11v3M20 11v3" />
    </svg>
  ),
  kb: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <path d="M12 6c-1.6-1.2-3.6-1.5-6-1.5V18c2.4 0 4.4.3 6 1.5 1.6-1.2 3.6-1.5 6-1.5V4.5c-2.4 0-4.4.3-6 1.5Z" />
      <path d="M12 6v13.5" />
    </svg>
  ),
};

const APPS: AppEntry[] = [
  {
    key: "blog",
    name: "Blog",
    domain: "blog.duyet.net",
    href: "https://blog.duyet.net",
    blurb: "Long-form notes on data, distributed systems, and AI agents.",
    glyph: Glyph.blog,
  },
  {
    key: "cv",
    name: "Résumé",
    domain: "cv.duyet.net",
    href: "https://cv.duyet.net",
    blurb: "CV and project history — data platforms, AI products, teams.",
    glyph: Glyph.cv,
  },
  {
    key: "insights",
    name: "Insights",
    domain: "insights.duyet.net",
    href: "https://insights.duyet.net",
    blurb: "Live dashboards: coding hours, traffic, and token spend.",
    glyph: Glyph.insights,
  },
  {
    key: "homelab",
    name: "Homelab",
    domain: "homelab.duyet.net",
    href: "https://homelab.duyet.net",
    blurb: "Monitoring for a three-node mini-PC cluster and smart devices.",
    glyph: Glyph.homelab,
  },
  {
    key: "home",
    name: "Home",
    domain: "duyet.net",
    href: "https://duyet.net",
    blurb: "The index — who I am, what I ship, and where to find it.",
    glyph: Glyph.home,
  },
  {
    key: "photos",
    name: "Photos",
    domain: "photos.duyet.net",
    href: "https://photos.duyet.net",
    blurb: "Photo journal with build-time EXIF metadata.",
    glyph: Glyph.photos,
  },
  {
    key: "llm-timeline",
    name: "LLM Timeline",
    domain: "llm-timeline.duyet.net",
    href: "https://llm-timeline.duyet.net",
    blurb: "Interactive timeline of language-model releases since 2017.",
    glyph: Glyph["llm-timeline"],
  },
  {
    key: "ai-percentage",
    name: "AI Percentage",
    domain: "ai-percentage.duyet.net",
    href: "https://ai-percentage.duyet.net",
    blurb: "How much of each repo is co-authored by AI assistants.",
    glyph: Glyph["ai-percentage"],
  },
  {
    key: "agents",
    name: "AI Agents",
    domain: "agents.duyet.net",
    href: "https://agents.duyet.net",
    blurb: "Chat over Workers AI with streaming, artifacts, and tools.",
    glyph: Glyph.agents,
  },
  {
    key: "kb",
    name: "Knowledge base",
    domain: "kb.duyet.net",
    href: "https://kb.duyet.net",
    blurb: "A public second brain — durable notes, openly indexed.",
    glyph: Glyph.kb,
  },
];

export interface ExploreAppsProps {
  /** App the visitor is currently on — excluded from the grid. */
  currentApp?: ExploreAppKey;
  /** Override the section eyebrow. */
  eyebrow?: string;
  /** Override the section title. */
  title?: string;
  className?: string;
}

export function ExploreApps({
  currentApp,
  eyebrow = "The network",
  title = "More from duyet.net",
  className,
}: ExploreAppsProps) {
  const apps = APPS.filter((a) => a.key !== currentApp);

  return (
    <section
      className={className}
      style={{ borderTop: "1px solid var(--rd-border)" }}
    >
      <div className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(28px,4vw,44px)]">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="rd-h-sec mt-[10px]">{title}</h2>
          </div>
          <a
            href="https://duyet.net"
            className="rd-ulink font-[var(--font-mono)] text-[12.5px]"
          >
            duyet.net →
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-[8px] mt-[clamp(16px,2vw,22px)]">
          {apps.map((app) => (
            <a
              key={app.key}
              href={app.href}
              className="rd-explore-card group rd-card flex items-center gap-[8px] px-[10px] py-[8px] no-underline text-inherit"
              title={app.blurb}
            >
              <span className="rd-explore-glyph shrink-0 [&_svg]:w-[15px] [&_svg]:h-[15px]">
                {app.glyph}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-semibold tracking-[-0.01em] leading-tight truncate">
                  {app.name}
                </span>
                <span className="block font-[var(--font-mono)] text-[10px] text-[var(--rd-text-3)] truncate">
                  {app.domain}
                </span>
              </span>
              <span className="rd-explore-arrow font-[var(--font-mono)] text-[var(--rd-text-4)] text-[11px]">
                →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExploreApps;
