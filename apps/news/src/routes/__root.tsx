import "@duyet/components/styles.css";
import "../styles.css";

import { ErrorBoundary, SiteFooter, SiteHeader } from "@duyet/components";
import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { HeaderBar } from "../components/HeaderBar";
import { ClerkModuleContext, useClerkModuleLoader } from "../lib/clerk-user";
import { getClientLang, setClientLang } from "../lib/lang";
import { LangContext } from "../lib/lang-context";
import {
  DEFAULT_PREFS,
  loadPrefs,
  type Prefs,
  PrefsContext,
  readerCssVars,
  savePrefs,
} from "../lib/prefs";
import type { Lang } from "../lib/types";

/**
 * Mounts the ONE app-wide <ClerkProvider>, dynamically imported, so every
 * consumer (AuthButtons via wrapWithProvider={false}, SuggestTranslation,
 * the submit page) shares it instead of each mounting its own — a second
 * <ClerkProvider> crashes the whole app. If Clerk itself fails to
 * initialize (bad key, network), the ErrorBoundary here degrades to
 * rendering children with no Clerk context at all rather than losing the
 * rest of the page; each individual Clerk consumer has its own boundary
 * on top of that for a fully-signed-out fallback.
 */
function ClerkRootProvider({ children }: { children: ReactNode }) {
  const clerkState = useClerkModuleLoader();
  const withoutProvider = (
    <ClerkModuleContext.Provider value={clerkState}>
      {children}
    </ClerkModuleContext.Provider>
  );

  if (!clerkState.mod || !clerkState.publishableKey) return withoutProvider;

  return (
    <ErrorBoundary fallback={withoutProvider}>
      <ClerkModuleContext.Provider value={clerkState}>
        <clerkState.mod.ClerkProvider
          publishableKey={clerkState.publishableKey}
        >
          {children}
        </clerkState.mod.ClerkProvider>
      </ClerkModuleContext.Provider>
    </ErrorBoundary>
  );
}

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

  // Render defaults on the server / first client paint to avoid a hydration
  // mismatch, then apply anything persisted in localStorage once mounted.
  const [prefs, setPrefsState] = useState<Prefs>(DEFAULT_PREFS);
  const prefsLoadedRef = useRef(false);

  useEffect(() => {
    setPrefsState(loadPrefs());
    prefsLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!prefsLoadedRef.current) return;
    savePrefs(prefs);
  }, [prefs]);

  const setPrefs = (update: Partial<Prefs>) =>
    setPrefsState((p) => ({ ...p, ...update }));

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
          <PrefsContext.Provider value={{ prefs, setPrefs }}>
            <ThemeProvider>
              <ClerkRootProvider>
                <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-background text-foreground selection:bg-foreground selection:text-background">
                  <div className="relative z-20 flex w-full flex-col">
                    <SiteHeader currentApp="news" />
                  </div>

                  {/* Our amber brand accent + compact reader typography are
                      scoped to .news-content (HeaderBar + main) only, so they
                      never leak into the shared SiteHeader/SiteFooter chrome
                      above/below. */}
                  <div
                    className="news-content relative z-10 flex flex-grow flex-col"
                    style={readerCssVars(prefs)}
                    data-reader-font={prefs.font}
                    data-reader-bg={prefs.bg}
                    suppressHydrationWarning
                  >
                    <HeaderBar lang={lang} onLangChange={handleLangChange} />

                    <main className="mx-auto w-full max-w-[1080px] flex-grow px-4 pb-16 sm:px-6 lg:px-8">
                      <Outlet />
                    </main>
                  </div>

                  <SiteFooter owner="Duyet Le" />
                </div>
              </ClerkRootProvider>
            </ThemeProvider>
          </PrefsContext.Provider>
        </LangContext.Provider>
        <Analytics />
        <Scripts />
      </body>
    </html>
  );
}
