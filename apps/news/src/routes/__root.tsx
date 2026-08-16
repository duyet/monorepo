import "../styles.css";

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
        <h1 className="text-6xl font-bold tracking-tight">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">Page not found</p>
        <a
          href="/"
          className="mt-6 inline-block text-sm underline underline-offset-4"
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
        rel: "stylesheet",
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
        <script
          // Apply persisted dark mode before paint
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='dark'||(!localStorage.getItem('theme')&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </head>
      <body>
        <LangContext.Provider value={lang}>
          <div className="min-h-screen bg-background text-foreground">
            <HeaderBar lang={lang} onLangChange={handleLangChange} />
            <main className="mx-auto w-full max-w-[1200px] px-4 pb-16 md:px-6">
              <Outlet />
            </main>
            <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
              news.duyet.net — AI news, rated and ranked by LLMs ·{" "}
              <a
                href="https://duyet.net"
                className="underline underline-offset-2"
              >
                duyet.net
              </a>
            </footer>
          </div>
        </LangContext.Provider>
        <Scripts />
      </body>
    </html>
  );
}
