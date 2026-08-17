import "@duyet/components/styles.css";
import "../styles.css";

import { SiteFooter, SiteHeader } from "@duyet/components";
import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <a href="/" className="mt-4 inline-block text-sm underline">
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "robots", content: "follow, index" },
      { title: "Knowledge Base | duyet.net" },
      {
        name: "description",
        content:
          "Documentation and knowledge base for duyet.net — apps, architecture, and references.",
      },
      {
        name: "theme-color",
        content: "#ffffff",
        media: "(prefers-color-scheme: light)",
      },
      {
        name: "theme-color",
        content: "#0a0a0a",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    links: [
      { rel: "icon", href: "/icon.svg", sizes: "any" },
      { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
    ],
  }),
  notFoundComponent: NotFoundComponent,
  component: RootComponent,
});

const KB_LOCAL_NAV = [
  { label: "Graph", href: "/" },
  { label: "Search", href: "/search" },
  { label: "Memory", href: "/m" },
  { label: "Daily", href: "/d" },
  { label: "About", href: "/about" },
  { label: "Dream", href: "/dream" },
];

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey) return;
      const goSearch =
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") ||
        (e.key === "/" && !e.metaKey && !e.ctrlKey && !isTypingTarget(e.target));
      if (!goSearch) return;
      e.preventDefault();
      if (pathname === "/search") {
        document.getElementById("kb-search")?.focus();
        return;
      }
      void navigate({ to: "/search" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, pathname]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <div className="min-h-screen bg-background text-foreground">
            <SiteHeader
              currentApp="kb"
              localNav={KB_LOCAL_NAV}
              activeHref={pathname}
            />
            <Outlet />
            {pathname !== "/" && <SiteFooter />}
          </div>
        </ThemeProvider>
        <Analytics />
        <Scripts />
      </body>
    </html>
  );
}
