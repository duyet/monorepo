import {
  Activity,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  Camera,
  Code2,
  Coffee,
  FileText,
  Flame,
  List,
  Newspaper,
  Percent,
  Plug,
  Server,
  Share2,
  Sparkles,
  User,
} from "lucide-react";
import { APP_REGISTRY } from "@duyet/urls/app-registry";
import { DuyetMark } from "./DuyetMark";
import type { AppCategory, AppDef, GlobalNavItem } from "./types";

const registryById = Object.fromEntries(
  APP_REGISTRY.map((entry) => [entry.id, entry] as const)
);

function appUrls(id: keyof typeof registryById) {
  const entry = registryById[id];
  return { href: entry.href, subdomain: entry.host };
}

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
    ...appUrls("home"),
    Icon: DuyetMark,
    category: "Personal",
    blurb: "Profile & projects",
  },
  {
    key: "blog",
    name: "Blog",
    ...appUrls("blog"),
    Icon: BookOpen,
    category: "Personal",
    blurb: "Notes & posts",
  },
  {
    key: "photos",
    name: "Photos",
    ...appUrls("photos"),
    Icon: Camera,
    category: "Personal",
    blurb: "Photography",
  },
  {
    key: "about",
    name: "About",
    ...appUrls("about"),
    Icon: User,
    category: "Personal",
    blurb: "Bio & background",
  },
  {
    key: "projects",
    name: "Projects",
    ...appUrls("projects"),
    Icon: Briefcase,
    category: "Personal",
    blurb: "Work & experiments",
  },
  {
    key: "ls",
    name: "ls",
    ...appUrls("ls"),
    Icon: List,
    category: "Personal",
    blurb: "Directory listing",
  },
  {
    key: "cv",
    name: "CV",
    ...appUrls("cv"),
    Icon: FileText,
    category: "Personal",
    blurb: "Resume",
  },
  {
    key: "insights",
    name: "Insights",
    ...appUrls("insights"),
    Icon: Activity,
    category: "AI & Data",
    blurb: "Usage analytics",
  },
  {
    key: "llm-timeline",
    name: "LLM Timeline",
    ...appUrls("llm-timeline"),
    Icon: Sparkles,
    category: "AI & Data",
    blurb: "3,900+ models",
  },
  {
    key: "ai-percentage",
    name: "AI Percentage",
    ...appUrls("ai-percentage"),
    Icon: Percent,
    category: "AI & Data",
    blurb: "AI-written share",
  },
  {
    key: "x-algo",
    name: "X Algo",
    ...appUrls("x-algo"),
    Icon: Share2,
    category: "AI & Data",
    blurb: "For You weights",
  },
  {
    key: "burn",
    name: "Burn",
    ...appUrls("burn"),
    Icon: Flame,
    category: "AI & Data",
    blurb: "Token spend",
  },
  {
    key: "tip",
    name: "Tip",
    ...appUrls("tip"),
    Icon: Coffee,
    category: "Personal",
    blurb: "Buy me a coffee",
  },
  {
    key: "news",
    name: "News",
    ...appUrls("news"),
    Icon: Newspaper,
    category: "AI & Data",
    blurb: "AI news, ranked by LLMs",
  },
  {
    key: "agents",
    name: "Agents",
    ...appUrls("agents"),
    Icon: Bot,
    category: "Build",
    blurb: "AI chat & tools",
  },
  {
    key: "kb",
    name: "Knowledge base",
    ...appUrls("kb"),
    Icon: Brain,
    category: "Build",
    blurb: "Second brain",
  },
  {
    key: "html",
    name: "HTML",
    ...appUrls("html"),
    Icon: Code2,
    category: "Build",
    blurb: "HTML artifacts",
  },
  {
    key: "mcp",
    name: "MCP",
    ...appUrls("mcp"),
    Icon: Plug,
    category: "Build",
    blurb: "MCP server",
  },
  {
    key: "homelab",
    name: "Homelab",
    ...appUrls("homelab"),
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
    onlyApp: "blog",
  },
  {
    label: "Note",
    href: "https://blog.duyet.net/notes",
    match: { app: "blog", path: "/notes" },
    onlyApp: "blog",
  },
  {
    label: "More",
    href: "https://blog.duyet.net/archives",
    match: { app: "blog", path: "/more-menu" },
    onlyApp: "blog",
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
    label: "Tip",
    href: "https://ko-fi.com/duyet",
    match: { app: "tip" },
    external: true,
    Icon: Coffee,
  },
  {
    label: "About",
    href: "https://duyet.net/about",
    match: { path: "/about" },
    // news and kb shadow this with their own /about entries below —
    // hidden here so it doesn't also render.
    hideOnApps: ["blog", "home", "news", "kb"],
  },
  {
    label: "News",
    href: "/",
    match: { app: "news", path: "/" },
    onlyApp: "news",
  },
  {
    label: "About",
    href: "/about",
    match: { app: "news", path: "/about" },
    onlyApp: "news",
  },
  {
    label: "Chrome tab",
    href: "/extension",
    match: { app: "news", path: "/extension" },
    onlyApp: "news",
  },
  {
    label: "MCP",
    href: "/mcp",
    match: { app: "news", path: "/mcp" },
    onlyApp: "news",
  },
  {
    label: "Data",
    href: "/data",
    match: { app: "news", path: "/data" },
    onlyApp: "news",
  },
  {
    label: "Submit",
    href: "/submit",
    match: { app: "news", path: "/submit" },
    onlyApp: "news",
  },
  {
    label: "KB",
    href: "/",
    match: { app: "kb", path: "/" },
    onlyApp: "kb",
    children: [
      {
        label: "Home",
        href: "/",
        match: { app: "kb", path: "/" },
      },
      {
        label: "Search",
        href: "/search",
        match: { app: "kb", path: "/search" },
      },
      {
        label: "Memory",
        href: "/m",
        match: { app: "kb", path: "/m" },
      },
      {
        label: "Daily",
        href: "/d",
        match: { app: "kb", path: "/d" },
      },
      {
        label: "About",
        href: "/about",
        match: { app: "kb", path: "/about" },
      },
      {
        label: "Dream",
        href: "/dream",
        match: { app: "kb", path: "/dream" },
      },
    ],
  },
];
