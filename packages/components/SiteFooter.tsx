import { cn } from "@duyet/libs/utils";
import type { ReactNode } from "react";
import { Button } from "./ui/button";

export interface SiteFooterLink {
  label: string;
  href: string;
}

export interface SiteFooterProps {
  /** Legacy escape hatch — appended as an extra "Links" column when present. */
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
    heading: "Product",
    items: [
      { label: "Blog", href: "https://blog.duyet.net" },
      { label: "Insights", href: "https://insights.duyet.net" },
      { label: "LLM Timeline", href: "https://llm-timeline.duyet.net" },
      { label: "Homelab", href: "https://homelab.duyet.net" },
      { label: "Photos", href: "https://photos.duyet.net" },
    ],
  },
  {
    heading: "Resources",
    items: [
      { label: "GitHub", href: "https://github.com/duyet" },
      { label: "ClickHouse Monitor", href: "https://chmonitor.dev" },
      { label: "AnyRouter", href: "https://anyrouter.dev" },
      { label: "Knowledge base", href: "https://kb.duyet.net" },
      { label: "RSS feed", href: "https://blog.duyet.net/rss.xml" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About", href: "https://duyet.net/about" },
      { label: "CV", href: "https://cv.duyet.net" },
      { label: "DuyetBot", href: "https://duyet.net/about-duyetbot" },
      { label: "Email", href: "mailto:me@duyet.net" },
    ],
  },
];

export function SiteFooter({
  links,
  owner = "duyet",
  className,
  children,
}: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_repeat(3,1fr)] gap-10 lg:gap-12">
          <div className="max-w-md">
            <p className="text-base font-semibold tracking-tight">duyet.net</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Notes from the workshop.
            </p>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              I build AI agents and the data platforms that keep them honest —
              open-source tools, telemetry dashboards, and writing on what
              actually ships to production.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-6">
              <a href="https://blog.duyet.net">Read the blog</a>
            </Button>
          </div>
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                {section.heading}
              </p>
              <ul className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-sm transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {links && links.length > 0 && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Links
              </p>
              <ul className="mt-4 space-y-3">
                {links.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-sm transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            © {year} {owner}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </a>
            {children}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
