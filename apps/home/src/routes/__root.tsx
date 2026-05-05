import "@duyet/components/styles.css";
import "../globals.css";
import "../animations.css";

import ThemeProvider from "@duyet/components/ThemeProvider";
import { ClerkAuthProvider } from "@duyet/components";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { NotFound } from "../components/NotFound";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "UTF-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "robots", content: "follow, index" },
      { title: "Duyet Le - Data & AI Engineer" },
      {
        name: "description",
        content:
          "Data & AI Engineer. I build data infrastructure, AI-powered systems, and love Rust, TypeScript, and open source.",
      },
      {
        name: "theme-color",
        content: "#f5f5f4",
        media: "(prefers-color-scheme: light)",
      },
      {
        name: "theme-color",
        content: "#000000",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    links: [
      { rel: "icon", href: "/icon.svg", sizes: "any" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap",
      },
    ],
  }),
  notFoundComponent: NotFound,
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ClerkAuthProvider>
          <ThemeProvider>
            <Outlet />
          </ThemeProvider>
        </ClerkAuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
