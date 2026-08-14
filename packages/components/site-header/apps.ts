import {
  Activity,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  Camera,
  Code2,
  FileText,
  Flame,
  House,
  List,
  Percent,
  Plug,
  Share2,
  Server,
  Sparkles,
  User,
} from "lucide-react";
import type {
  AppCategory,
  AppDef,
  AppKey,
  GlobalNavItem,
  NavMatch,
} from "./types";

export const CATEGORY_ORDER: AppCategory[] = [
  "Personal",
  "AI & Data",
  "Build",
  "Infra",
];

export const APPS: AppDef[] = [
  {
    key: "home",
    name: "Home",
    href: "https://duyet.net",
    subdomain: "duyet.net",
    Icon: House,
    category: "Personal",
    blurb: "Profile & projects",
  },
  {
    key: "blog",
    name: "Blog",
    href: "https://blog.duyet.net",
    subdomain: "blog.duyet.net",
    Icon: BookOpen,
    category: "Personal",
    blurb: "Notes & posts",
  },
  {
    key: "photos",
    name: "Photos",
    href: "https://photos.duyet.net",
    subdomain: "photos.duyet.net",
    Icon: Camera,
    category: "Personal",
    blurb: "Photography",
  },
  {
    key: "about",
    name: "About",
    href: "https://duyet.net/about",
    subdomain: "duyet.net",
    Icon: User,
    category: "Personal",
    blurb: "Bio & background",
  },
  {
    key: "projects",
    name: "Projects",
    href: "https://duyet.net/projects",
    subdomain: "duyet.net",
    Icon: Briefcase,
    category: "Personal",
    blurb: "Work & experiments",
  },
  {
    key: "ls",
    name: "ls",
    href: "https://duyet.net/ls",
    subdomain: "duyet.net",
    Icon: List,
    category: "Personal",
    blurb: "Directory listing",
  },
  {
    key: "cv",
    name: "CV",
    href: "https://cv.duyet.net",
    subdomain: "cv.duyet.net",
    Icon: FileText,
    category: "Personal",
    blurb: "Resume",
  },
  {
    key: "insights",
    name: "Insights",
    href: "https://insights.duyet.net",
    subdomain: "insights.duyet.net",
    Icon: Activity,
    category: "AI & Data",
    blurb: "Usage analytics",
  },
  {
    key: "llm-timeline",
    name: "LLM Timeline",
    href: "https://llm-timeline.duyet.net",
    subdomain: "llm-timeline.duyet.net",
    Icon: Sparkles,
    category: "AI & Data",
    blurb: "3,900+ models",
  },
  {
    key: "ai-percentage",
    name: "AI Percentage",
    href: "https://ai-percentage.duyet.net",
    subdomain: "ai-percentage.duyet.net",
    Icon: Percent,
    category: "AI & Data",
    blurb: "AI-written share",
  },
  {
    key: "x-algo",
    name: "X Algo",
    href: "https://x-algo.duyet.net",
    subdomain: "x-algo.duyet.net",
    Icon: Share2,
    category: "AI & Data",
    blurb: "For You weights",
  },
  {
    key: "burn",
    name: "Burn",
    href: "https://burn.duyet.net",
    subdomain: "burn.duyet.net",
    Icon: Flame,
    category: "AI & Data",
    blurb: "Token spend",
  },
  {
    key: "agents",
    name: "Agents",
    href: "https://agents.duyet.net",
    subdomain: "agents.duyet.net",
    Icon: Bot,
    category: "Build",
    blurb: "AI chat & tools",
  },
  {
    key: "kb",
    name: "Knowledge base",
    href: "https://kb.duyet.net",
    subdomain: "kb.duyet.net",
    Icon: Brain,
    category: "Build",
    blurb: "Second brain",
  },
  {
    key: "html",
    name: "HTML",
    href: "https://html.duyet.net",
    subdomain: "html.duyet.net",
    Icon: Code2,
    category: "Build",
    blurb: "HTML artifacts",
  },
  {
    key: "mcp",
    name: "MCP",
    href: "https://mcp.duyet.net",
    subdomain: "mcp.duyet.net",
    Icon: Plug,
    category: "Build",
    blurb: "MCP server",
  },
  {
    key: "homelab",
    name: "Homelab",
    href: "https://homelab.duyet.net",
    subdomain: "homelab.duyet.net",
    Icon: Server,
    category: "Infra",
    blurb: "Cluster status",
  },
];

export const GLOBAL_NAV: GlobalNavItem[] = [
  {
    label: "Home",
    href: "https://duyet.net",
    match: { app: "home", path: "/" },
  },
  {
    label: "Projects",
    href: "https://duyet.net/projects",
    match: { app: "home", path: "/projects" },
  },
  {
    label: "About",
    href: "https://duyet.net/about",
    match: { app: "home", path: "/about" },
  },
  {
    label: "Blog",
    href: "https://blog.duyet.net",
    match: { app: "blog", path: "/" },
  },
  {
    label: "Series",
    href: "https://blog.duyet.net/series",
    match: { app: "blog", path: "/series" },
    blogOnly: true,
  },
  {
    label: "Note",
    href: "https://blog.duyet.net/notes",
    match: { app: "blog", path: "/notes" },
    blogOnly: true,
  },
  {
    label: "More",
    href: "https://blog.duyet.net/archives",
    match: { app: "blog", path: "/more-menu" },
    blogOnly: true,
    children: [
      {
        label: "Archives",
        href: "https://blog.duyet.net/archives",
        match: { app: "blog", path: "/archives" },
      },
      {
        label: "Categories",
        href: "https://blog.duyet.net/categories",
        match: { app: "blog", path: "/categories" },
      },
      {
        label: "Tags",
        href: "https://blog.duyet.net/tags",
        match: { app: "blog", path: "/tags" },
      },
      {
        label: "About",
        href: "https://duyet.net/about",
        match: { path: "/about" },
      },
    ],
  },
  { label: "CV", href: "https://cv.duyet.net", match: { app: "cv" } },
  {
    label: "Photos",
    href: "https://photos.duyet.net",
    match: { app: "photos" },
    children: [
      {
        label: "Gallery",
        href: "https://photos.duyet.net",
        match: { app: "photos", path: "/" },
      },
      {
        label: "Feed",
        href: "https://photos.duyet.net/feed",
        match: { app: "photos", path: "/feed" },
      },
    ],
  },
  {
    label: "About",
    href: "https://duyet.net/about",
    match: { path: "/about" },
    hideOnApps: ["blog", "home"],
  },
];

export function filterGlobalNav(
  items: GlobalNavItem[],
  currentApp: AppKey,
): GlobalNavItem[] {
  return items.filter((item) => {
    if (item.hideOnApps?.includes(currentApp)) return false;
    if (item.blogOnly) return currentApp === "blog";
    if (currentApp === "home") return true;
    return item.match.app === currentApp || !item.match.app;
  });
}

function matchesPath(path: string, pathname: string | null): boolean {
  if (pathname == null) return false;
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

export function isNavActive(
  m: NavMatch,
  currentApp: AppKey,
  pathname: string | null,
): boolean {
  if (m.app && m.app === currentApp) {
    if ((m.app === "blog" || m.app === "home") && m.path) {
      return matchesPath(m.path, pathname);
    }
    return true;
  }
  return Boolean(
    m.path && currentApp === "home" && matchesPath(m.path, pathname),
  );
}
