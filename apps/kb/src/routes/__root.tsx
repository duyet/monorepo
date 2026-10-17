import "../styles.css";

import {
  duyetFaviconHeadLinks,
  duyetFontHeadLinks,
  THEME_BOOT_SCRIPT,
  SiteFooter,
  SiteHeader,
} from "@duyet/components";
import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { ogMeta } from "@duyet/config/og";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import {
  SITE_DESCRIPTION,
  SITE_OG_IMAGE,
  SITE_TITLE,
  SITE_URL,
} from "../../lib/site";

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
      { title: `${SITE_TITLE} | duyet.net` },
      { name: "description", content: SITE_DESCRIPTION },
      // The site-wide card, written by `scripts/generate-og.ts`. `meta` dedups
      // by property/name with the deepest match winning, so per-route `ogMeta()`
      // overrides just the tags it passes (notably og:url/og:title).
      ...ogMeta({
        url: SITE_URL,
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        image: SITE_OG_IMAGE,
        imageAlt: `${SITE_TITLE} — ${SITE_DESCRIPTION}`,
      }),
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
      ...duyetFontHeadLinks(),
      ...duyetFaviconHeadLinks(),
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
      if (pathname === "/" || pathname === "") {
        document.getElementById("graph-search")?.focus();
        return;
      }
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
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
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
