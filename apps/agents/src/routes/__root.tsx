import "@duyet/components/styles.css";
import "../../app/globals.css";

import { StrictMode } from "react";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import Analytics from "@duyet/components/Analytics";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import NotFound from "@/app/not-found";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "robots", content: "follow, index" },
      { title: "@duyetbot | duyet.net" },
      {
        name: "description",
        content:
          "Chat with @duyetbot - a virtual version of Duyet. Ask about blog, CV, GitHub activity, or analytics.",
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", sizes: "any" },
      { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
      { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
      { rel: "dns-prefetch", href: "https://avatars.githubusercontent.com" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Geist+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  notFoundComponent: NotFound,
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <StrictMode>
          <ThemeProvider>
            <Providers>
              <Outlet />
            </Providers>
            <Analytics />
          </ThemeProvider>
        </StrictMode>
        <Scripts />
      </body>
    </html>
  );
}
