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
      { label: "LLM Timeline", href: "https://llm-timeline.duyet.net" },
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
      { label: "DuyetBot", href: "https://duyet.net/about-duyetbot" },
      { label: "RSS", href: "https://blog.duyet.net/rss.xml" },
    ],
  },
];

function FooterGroupRow({ group }: { group: FooterGroup }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground/70">
        {group.heading}
      </span>
      {group.items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
    <footer className={cn("border-t bg-background", className)}>
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8 py-8">
        {/* Single compact row: brand · Apps · Projects · About */}
        <div className="flex flex-col gap-x-8 gap-y-4 lg:flex-row lg:flex-wrap lg:items-baseline">
          <a
            href="https://duyet.net"
            className="text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-muted-foreground"
          >
            duyet.net
          </a>
          {groups.map((group) => (
            <FooterGroupRow key={group.heading} group={group} />
          ))}
        </div>

        <div className="mt-6 flex flex-col-reverse items-start gap-2 border-t pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono">
            © {year} {owner}
          </p>
          <p className="leading-relaxed sm:text-right">
            Continuously maintained by{" "}
            <a
              href="https://duyet.net/about-duyetbot"
              className="underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground"
            >
              duyetbot
            </a>
            , an autonomous agent.
          </p>
          {children && <div className="flex items-center gap-5">{children}</div>}
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
