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
} from "@tanstack/react-router";
import { useState } from "react";
import { HeaderBar } from "../components/HeaderBar";
import { getClientLang, setClientLang } from "../lib/lang";
import { LangContext } from "../lib/lang-context";
import type { Lang } from "../lib/types";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-serif text-6xl tracking-tight">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">Page not found</p>
        <a
          href="/"
          className="mt-6 inline-block text-sm underline underline-offset-4 decoration-accent hover:decoration-2"
        >
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
      { title: "AI News | news.duyet.net" },
      {
        name: "description",
        content:
          "AI news aggregated from many sources, rated and ranked by LLMs, translated to Vietnamese. Updated hourly.",
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap",
      },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  notFoundComponent: NotFoundComponent,
  component: RootComponent,
});

function RootComponent() {
  const [lang, setLang] = useState<Lang>(() => getClientLang());

  const handleLangChange = (next: Lang) => {
    setClientLang(next);
    setLang(next);
  };

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <HeadContent />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap"
          media="print"
          // @ts-expect-error onLoad is valid on link elements
          onLoad="this.media='all'"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap"
          media="print"
          // @ts-expect-error onLoad is valid on link elements
          onLoad="this.media='all'"
        />
      </head>
      <body>
        <LangContext.Provider value={lang}>
          <ThemeProvider>
            <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-background text-foreground selection:bg-foreground selection:text-background">
              <div className="pointer-events-none absolute inset-0 z-0 bg-grid-pattern opacity-[0.8] dark:opacity-[0.4]" />

              <div className="relative z-20 flex w-full flex-col">
                <SiteHeader />
                <HeaderBar lang={lang} onLangChange={handleLangChange} />
              </div>

              <main className="news-content relative z-10 mx-auto w-full max-w-[1040px] flex-grow px-4 pb-16 md:px-6">
                <Outlet />
              </main>

              <SiteFooter owner="Duyet Le" />
            </div>
          </ThemeProvider>
        </LangContext.Provider>
        <Analytics />
        <Scripts />
      </body>
    </html>
  );
}
