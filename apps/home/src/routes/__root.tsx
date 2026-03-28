import "@duyet/components/styles.css";
import "../globals.css";
import "../animations.css";

import ThemeProvider from "@duyet/components/ThemeProvider";
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
      { title: "Duyet Le - Data Engineer" },
      {
        name: "description",
        content:
          "Data Engineer. I build data infrastructure and love Rust, TypeScript, and open source.",
      },
      {
        name: "theme-color",
        content: "#fbf7f0",
        media: "(prefers-color-scheme: light)",
      },
      {
        name: "theme-color",
        content: "#1f1f1f",
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
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap",
      },
    ],
  }),
  notFoundComponent: NotFound,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-neutral-900 dark:text-neutral-100">
          Something went wrong
        </h1>
        <p className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
          {error.message}
        </p>
        <a
          href="/"
          className="rounded-xl bg-neutral-800 px-6 py-2 font-medium text-white transition-all hover:opacity-90 dark:bg-neutral-200 dark:text-neutral-900"
        >
          Go home
        </a>
      </div>
    </div>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Non-blocking Google Fonts: preloaded above, applied here */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap"
          media="print"
          // @ts-expect-error onLoad is valid on link elements
          onLoad="this.media='all'"
        />
      </head>
      <body>
        <ThemeProvider>
          <Outlet />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
