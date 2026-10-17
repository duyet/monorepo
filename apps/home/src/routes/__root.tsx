import "../globals.css";

import ClerkAuthProvider from "@duyet/components/ClerkAuthProvider";
import { SiteFooter } from "@duyet/components/SiteFooter";
import ThemeProvider, { THEME_BOOT_SCRIPT } from "@duyet/components/ThemeProvider";
import { duyetFaviconHeadLinks } from "@duyet/components/brand/duyet-logo";
import { duyetFontHeadLinks } from "@duyet/components/brand/fonts";
import { SiteHeader } from "@duyet/components/site-header/SiteHeader";
import { ogMeta } from "@duyet/config/og";
import { useEffect } from "react";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { NotFound } from "../components/NotFound";
import {
  SITE_DESCRIPTION,
  SITE_OG_IMAGE,
  SITE_OG_IMAGE_ALT,
  SITE_TITLE,
  SITE_URL,
} from "../lib/og";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "UTF-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "robots", content: "follow, index" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      ...ogMeta({
        url: `${SITE_URL}/`,
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        image: SITE_OG_IMAGE,
        imageAlt: SITE_OG_IMAGE_ALT,
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
      {
        name: "color-scheme",
        content: "light dark",
      },
    ],
    links: [...duyetFontHeadLinks({ display: true }), ...duyetFaviconHeadLinks()],
  }),
  notFoundComponent: NotFound,
  component: RootComponent,
});

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window !== "undefined" && "navigator" in window) {
      const nav = navigator as any;
      if (nav.modelContext) {
        const tools = [
          {
            name: "search_projects",
            description: "Search projects by keyword",
            inputSchema: {
              type: "object",
              properties: {
                query: { type: "string", description: "Search query" },
              },
              required: ["query"],
            },
            execute: async (params: { query: string }) => {
              const q = (params.query || "").toLowerCase();
              window.location.assign(`/projects?q=${encodeURIComponent(q)}`);
              return { success: true, message: `Searching for ${q}` };
            },
          },
          {
            name: "navigate_to",
            description: "Navigate to a specific page on the site",
            inputSchema: {
              type: "object",
              properties: {
                destination: {
                  type: "string",
                  enum: [
                    "home",
                    "projects",
                    "about",
                    "blog",
                    "cv",
                    "insights",
                    "photos",
                  ],
                  description: "The page to navigate to",
                },
              },
              required: ["destination"],
            },
            execute: async (params: { destination: string }) => {
              const dest = params.destination;
              if (dest === "home") window.location.assign("/");
              else if (dest === "projects") window.location.assign("/projects");
              else if (dest === "about") window.location.assign("/about");
              else window.location.assign(`https://${dest}.duyet.net`);
              return { success: true, message: `Navigated to ${dest}` };
            },
          },
        ];

        if (typeof nav.modelContext.provideContext === "function") {
          try {
            nav.modelContext.provideContext({ tools });
          } catch (e) {
            console.warn("WebMCP provideContext failed:", e);
          }
        }

        if (typeof nav.modelContext.registerTool === "function") {
          for (const tool of tools) {
            try {
              nav.modelContext.registerTool(
                {
                  name: tool.name,
                  description: tool.description,
                  inputSchema: tool.inputSchema,
                },
                tool.execute
              );
            } catch (e) {
              console.warn(`WebMCP registerTool failed for ${tool.name}:`, e);
            }
          }
        }
      }
    }
  }, []);


  const homeLocalNav = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <SiteHeader
            currentApp="home"
            variant="slashy"
            cta={{ label: "View projects", href: "/projects" }}
            localNav={homeLocalNav}
            activeHref={pathname}
          />
          <main>
            <ClerkAuthProvider>
              <Outlet />
            </ClerkAuthProvider>
          </main>
          <SiteFooter referralSource="duyet.net" />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
