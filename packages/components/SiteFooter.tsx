import { cn } from "@duyet/libs/utils";
import {
  PROJECT_BACKLINKS,
  referralRel,
  referralTarget,
  withReferral,
} from "@duyet/urls/referral";
import type { ReactNode } from "react";
import { SocialHandles } from "./SocialHandles";

export interface SiteFooterLink {
  label: string;
  href: string;
}

export interface SiteFooterProps {
  /** Legacy escape hatch — appended as an extra group when present. */
  links?: SiteFooterLink[];
  owner?: string;
  className?: string;
  children?: ReactNode;
  /** utm_source / ref for outbound project backlinks. */
  referralSource?: string;
}

interface FooterGroup {
  heading: string;
  items: SiteFooterLink[];
}

function tagged(
  items: SiteFooterLink[],
  source: string,
  campaign: string,
): SiteFooterLink[] {
  return items.map((item) => ({
    ...item,
    href: withReferral(item.href, { source, campaign, content: item.label }),
  }));
}

const FOOTER_PROJECT_LABELS = new Set([
  "AnyRouter",
  "ClickHouse Monitor",
  "AI;DR",
  "Templatebot",
  "Agent State",
  "OMA",
]);

function footerGroups(source: string): FooterGroup[] {
  return [
  {
    heading: "Apps",
    items: tagged(
      [
        { label: "Home", href: "https://duyet.net" },
        { label: "Blog", href: "https://blog.duyet.net" },
        { label: "Insights", href: "https://insights.duyet.net" },
        { label: "Homelab", href: "https://homelab.duyet.net" },
        { label: "Photos", href: "https://photos.duyet.net" },
        { label: "CV", href: "https://cv.duyet.net" },
      ],
      source,
      "footer-apps",
    ),
  },
  {
    heading: "Projects",
    items: tagged(
      PROJECT_BACKLINKS.filter((p) => FOOTER_PROJECT_LABELS.has(p.label)).map(
        (p) => ({ label: p.label, href: p.href }),
      ),
      source,
      "footer-projects",
    ),
  },
  {
    heading: "About",
    items: tagged(
      [
        { label: "About", href: "https://duyet.net/about" },
        { label: "Projects", href: "https://duyet.net/projects" },
        { label: "GitHub", href: "https://github.com/duyet" },
        { label: "RSS", href: "https://blog.duyet.net/rss.xml" },
        { label: "Newsletter", href: "https://aidr.today/subscribe" },
      ],
      source,
      "footer-about",
    ),
  },
  {
    heading: "For agents",
    items: tagged(
      [
        { label: "duyetbot", href: "https://duyet.net/about-duyetbot" },
        { label: "MCP server", href: "https://mcp.duyet.net" },
        { label: "llms.txt", href: "https://duyet.net/ls" },
      ],
      source,
      "footer-agents",
    ),
  },
];
}

function FooterCol({ group }: { group: FooterGroup }) {
  return (
    <div>
      <h4
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase" as const,
          color: "var(--rd-accent-ink)",
          margin: "0 0 13px",
          fontWeight: 500,
        }}
      >
        {group.heading}
      </h4>
      {group.items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          target={referralTarget(item.href)}
          rel={referralRel(item.href)}
          style={{
            display: "block",
            fontSize: 14,
            color: "var(--rd-text-2)",
            padding: "4px 0",
            transition: "color .15s",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.color = "var(--rd-accent-ink)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.color = "var(--rd-text-2)";
          }}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}

export function SiteFooter({
  links,
  className,
  children,
  referralSource = "duyet.net",
}: SiteFooterProps) {
  const base = footerGroups(referralSource);
  const groups =
    links && links.length > 0
      ? [...base, { heading: "Links", items: links }]
      : base;

  return (
    <footer
      className={cn("border-t", className)}
      style={{
        background: "var(--rd-bg-sub)",
        borderColor: "var(--rd-border)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--rd-maxw)",
          margin: "0 auto",
          padding: "54px var(--rd-pad) 40px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "40px 64px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 300 }}>
            <SocialHandles className="mb-3" />
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "-0.03em",
              }}
            >
              duyet<span style={{ color: "var(--rd-accent)" }}>.net</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 56,
              flexWrap: "wrap",
            }}
          >
            {groups.map((group) => (
              <FooterCol key={group.heading} group={group} />
            ))}
          </div>
        </div>
        {children ? (
          <div style={{ marginTop: 32 }}>{children}</div>
        ) : null}
      </div>
    </footer>
  );
}

export default SiteFooter;
