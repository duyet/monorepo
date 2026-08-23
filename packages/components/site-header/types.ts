import type { LucideIcon } from "lucide-react";

export type AppKey =
  | "home"
  | "about"
  | "projects"
  | "ls"
  | "blog"
  | "insights"
  | "llm-timeline"
  | "homelab"
  | "photos"
  | "kb"
  | "ai-percentage"
  | "x-algo"
  | "agents"
  | "burn"
  | "tip"
  | "cv"
  | "html"
  | "mcp"
  | "news";

export type AppCategory = "Personal" | "AI & Data" | "Build" | "Infra";

export interface AppDef {
  key: AppKey;
  name: string;
  href: string;
  subdomain: string;
  Icon: LucideIcon;
  category: AppCategory;
  blurb: string;
}

export interface NavMatch {
  app?: AppKey;
  path?: string;
}

export interface GlobalNavChild {
  label: string;
  href: string;
  match: NavMatch;
  Icon?: LucideIcon;
}

export interface GlobalNavItem {
  label: string;
  href: string;
  match: NavMatch;
  /** External link opened in a new tab (e.g. ko-fi.com). */
  external?: boolean;
  Icon?: LucideIcon;
  children?: GlobalNavChild[];
  /** Only rendered when currentApp matches — excluded even from the home
   * app's "show everything" fallback, unlike a plain `match.app`. */
  onlyApp?: AppKey;
  hideOnApps?: AppKey[];
}

export interface LocalNavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface SiteHeaderProps {
  /** @deprecated use currentApp instead */
  brand?: string;
  /** @deprecated use currentApp instead */
  brandHref?: string;
  currentApp?: AppKey;
  localNav?: LocalNavItem[];
  activeHref?: string;
  className?: string;
  hideThemeToggle?: boolean;
}
