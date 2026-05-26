import { cn } from "@duyet/libs/utils";
import type { ReactNode } from "react";

export interface SiteFooterLink {
  label: string;
  href: string;
}

export interface SiteFooterProps {
  links?: SiteFooterLink[];
  owner?: string;
  className?: string;
  children?: ReactNode;
}

interface FooterSection {
  heading: string;
  items: SiteFooterLink[];
}

const DEFAULT_SECTIONS: FooterSection[] = [
  {
    heading: "Menu",
    items: [
      { label: "Home", href: "https://duyet.net" },
      { label: "Projects", href: "https://duyet.net/projects" },
      { label: "About", href: "https://duyet.net/about" },
      { label: "DuyetBot", href: "https://duyet.net/duyetbot" },
      { label: "LS", href: "https://duyet.net/ls" },
    ],
  },
  {
    heading: "Apps",
    items: [
      { label: "Blog", href: "https://blog.duyet.net" },
      { label: "Insights", href: "https://insights.duyet.net" },
      { label: "LLM Timeline", href: "https://llm-timeline.duyet.net" },
      { label: "Homelab", href: "https://homelab.duyet.net" },
      { label: "Photos", href: "https://photos.duyet.net" },
      { label: "AI Percentage", href: "https://ai-percentage.duyet.net" },
      { label: "CV", href: "https://cv.duyet.net" },
    ],
  },
  {
    heading: "Open source",
    items: [
      { label: "ClickHouse Monitor", href: "https://chmonitor.dev" },
      { label: "AnyRouter", href: "https://anyrouter.dev" },
      { label: "ShareHTML", href: "https://html.duyet.net" },
      { label: "Agents", href: "https://agents.duyet.net" },
      { label: "Agent State", href: "https://agentstate.app" },
      { label: "MCP", href: "https://mcp.duyet.net" },
    ],
  },
  {
    heading: "Writing",
    items: [
      { label: "All posts", href: "https://blog.duyet.net" },
      { label: "AI", href: "https://blog.duyet.net/ai" },
      { label: "Series", href: "https://blog.duyet.net/series" },
      { label: "Archives", href: "https://blog.duyet.net/archives" },
      { label: "RSS feed", href: "https://blog.duyet.net/rss.xml" },
    ],
  },
  {
    heading: "Connect",
    items: [
      { label: "GitHub", href: "https://github.com/duyet" },
      { label: "LinkedIn", href: "https://linkedin.com/in/duyet" },
      { label: "X (Twitter)", href: "https://x.com/duyet" },
      { label: "Email", href: "mailto:me@duyet.net" },
    ],
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy", href: "/privacy" },
      { label: "License", href: "/license" },
      { label: "Cookies", href: "/cookies" },
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

  const sections: FooterSection[] = links
    ? [
        ...DEFAULT_SECTIONS,
        { heading: "Links", items: links },
      ]
    : DEFAULT_SECTIONS;

  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Brand */}
        <div>
          <p className="text-sm font-semibold tracking-tight">duyet.net</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Personal site — engineering, data, open source.
          </p>
        </div>

        {/* 4-col link grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10">
          {sections.map((section) => (
            <div key={section.heading}>
              <h3 className="text-sm font-semibold tracking-tight mb-4">
                {section.heading}
              </h3>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            © {year} {owner}
          </p>
          <div className="flex items-center gap-3">
            <span>
              Press{" "}
              <kbd className="rounded border px-1 py-0.5 font-mono text-[10px] bg-muted text-muted-foreground">
                ⌘K
              </kbd>{" "}
              to open apps
            </span>
            {children}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
