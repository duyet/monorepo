import { cn } from "@duyet/libs/utils";
import type { ReactNode } from "react";

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
}

interface FooterGroup {
  heading: string;
  items: SiteFooterLink[];
}

const GROUPS: FooterGroup[] = [
  {
    heading: "Apps",
    items: [
      { label: "Home", href: "https://duyet.net" },
      { label: "Blog", href: "https://blog.duyet.net" },
      { label: "Insights", href: "https://insights.duyet.net" },
      { label: "Homelab", href: "https://homelab.duyet.net" },
      { label: "Photos", href: "https://photos.duyet.net" },
    ],
  },
  {
    heading: "Projects",
    items: [
      { label: "GitHub", href: "https://github.com/duyet" },
      { label: "ClickHouse Monitor", href: "https://chmonitor.dev" },
      { label: "AnyRouter", href: "https://anyrouter.dev" },
      { label: "Knowledge base", href: "https://kb.duyet.net" },
    ],
  },
  {
    heading: "About",
    items: [
      { label: "About", href: "https://duyet.net/about" },
      { label: "CV", href: "https://cv.duyet.net" },
      { label: "Projects", href: "https://duyet.net/projects" },
      { label: "RSS", href: "https://blog.duyet.net/rss.xml" },
    ],
  },
  {
    heading: "For agents",
    items: [
      { label: "DuyetBot", href: "https://duyet.net/about-duyetbot" },
      { label: "MCP server", href: "https://mcp.duyet.net" },
      { label: "llms.txt", href: "https://duyet.net/ls" },
    ],
  },
];

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
          target={item.href.startsWith("http") ? "_blank" : undefined}
          rel={item.href.startsWith("http") ? "noreferrer" : undefined}
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
  owner = "Duyet Le",
  className,
  children,
}: SiteFooterProps) {
  const year = new Date().getFullYear();
  const groups =
    links && links.length > 0
      ? [...GROUPS, { heading: "Links", items: links }]
      : GROUPS;

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
        {/* Top: brand + column grid */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "40px 64px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 300 }}>
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

        {/* Bottom bar */}
        <div
          style={{
            marginTop: 44,
            paddingTop: 22,
            borderTop: "1px solid var(--rd-border)",
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            fontSize: 13,
            color: "var(--rd-text-3)",
          }}
        >
          <span>© {year} {owner}</span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
          >
            Continuously maintained by{" "}
            <a
              href="https://duyet.net/about-duyetbot"
              style={{
                color: "var(--rd-accent-ink)",
                textDecoration: "none",
              }}
            >
              duyetbot
            </a>
            .
          </span>
          {children && <div>{children}</div>}
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
