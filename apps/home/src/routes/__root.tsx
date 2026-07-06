import "@duyet/components/styles.css";
import "../globals.css";

import { ClerkAuthProvider, SiteFooter, SiteHeader } from "@duyet/components";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { useEffect } from "react";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { NotFound } from "../components/NotFound";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "UTF-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "robots", content: "follow, index" },
      { title: "Duyet — building AI agents and data platforms" },
      {
        name: "description",
        content:
          "I build AI agents and the data platforms that keep them honest — end-to-end, obsessing over the small details that make software feel right to use.",
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
    links: [{ rel: "icon", href: "/icon.svg", sizes: "any" }],
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
        <HeadContent />
      </head>
      <body>
        <ClerkAuthProvider>
          <ThemeProvider>
            <SiteHeader
              currentApp="home"
              localNav={homeLocalNav}
              activeHref={pathname}
            />
            <Outlet />
            <SiteFooter />
          </ThemeProvider>
        </ClerkAuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
