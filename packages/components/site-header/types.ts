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
  | "agents"
  | "burn"
  | "cv"
  | "html"
  | "mcp";

export type AppCategory = "Personal" | "AI & Data" | "Build" | "Infra";

export type AppDef = {
  key: AppKey;
  name: string;
  href: string;
  subdomain: string;
  Icon: LucideIcon;
  category: AppCategory;
  blurb: string;
};

export type NavMatch = { app?: AppKey; path?: string };

export type GlobalNavChild = {
  label: string;
  href: string;
  match: NavMatch;
};

export type GlobalNavItem = {
  label: string;
  href: string;
  match: NavMatch;
  children?: GlobalNavChild[];
  blogOnly?: boolean;
  hideOnApps?: AppKey[];
};

export type LocalNavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export interface SiteHeaderProps {
  /** @deprecated use currentApp instead */
  brand?: string;
  /** @deprecated use currentApp instead */
  brandHref?: string;
  currentApp?: AppKey;
  localNav?: LocalNavItem[];
  activeHref?: string;
  className?: string;
}
