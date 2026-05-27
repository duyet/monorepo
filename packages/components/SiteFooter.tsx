import { cn } from "@duyet/libs/utils";
import type { ReactNode } from "react";

export interface SiteFooterLink {
  label: string;
  href: string;
}

export interface SiteFooterProps {
  /** Legacy escape hatch — appended as an extra column when present. */
  links?: SiteFooterLink[];
  owner?: string;
  className?: string;
  children?: ReactNode;
}

interface FooterSection {
  heading: string;
  items: SiteFooterLink[];
}

const SECTIONS: FooterSection[] = [
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

function FooterColumn({ section }: { section: FooterSection }) {
  return (
    <div>
      <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
        {section.heading}
      </p>
      <ul className="mt-4 space-y-2.5">
        {section.items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
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

  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:gap-12">
          <div className="col-span-2 md:col-span-1 max-w-sm">
            <p className="text-sm font-semibold tracking-tight text-foreground">
              duyet.net
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Personal site of Duyet Le — Data &amp; AI Engineer in Ho Chi
              Minh City. Writing, side projects, and open source.
            </p>
            <a
              href="mailto:me@duyet.net"
              className="mt-4 inline-block font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              me@duyet.net
            </a>
          </div>

          {SECTIONS.map((section) => (
            <FooterColumn key={section.heading} section={section} />
          ))}

          {links && links.length > 0 && (
            <FooterColumn
              section={{ heading: "Links", items: links }}
            />
          )}
        </div>

        <div className="mt-14 flex flex-col-reverse items-start gap-4 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono">
            © {year} {owner}
          </p>
          <p className="max-w-md leading-relaxed sm:text-right">
            This site is continuously maintained by{" "}
            <a
              href="https://duyet.net/about-duyetbot"
              className="underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground"
            >
              duyetbot
            </a>
            , an autonomous agent — UI &amp; copy may change at any time.
          </p>
          {children && (
            <div className="flex items-center gap-5">{children}</div>
          )}
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
