import "@duyet/components/styles.css";
import "../styles.css";

import { ErrorBoundary, SiteHeader } from "@duyet/components";
import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import {
  BarChart3,
  ExternalLink,
  GitFork,
  History,
  Info,
  type LucideIcon,
  Plug,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { HeaderBar } from "../components/HeaderBar";
import { ClerkModuleContext, useClerkModuleLoader } from "../lib/clerk-user";
import { fetchFeedOnce, getCachedFeed } from "../lib/feed-cache";
import { getClientLang, setClientLang, timeAgo } from "../lib/lang";
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
  // No provider in this subtree, so consumers must not see a module either —
  // rendering Clerk's SignedIn/SignedOut outside a <ClerkProvider> throws.
  const withoutProvider = (
    <ClerkModuleContext.Provider
      value={{ mod: null, publishableKey: clerkState.publishableKey }}
    >
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

// Footer is always English, regardless of site language.
const FOOTER_LINKS: {
  to: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { to: "/about", label: "About", icon: Info },
  { to: "/mcp", label: "MCP", icon: Plug },
  {
    to: "/system",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    to: "/changelog",
    label: "Changelog",
    icon: History,
  },
];

function NewsFooter() {
  const year = new Date().getFullYear();
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(
    () => getCachedFeed()?.lastFetchedAt ?? null
  );

  useEffect(() => {
    if (lastFetchedAt !== null) return;
    let cancelled = false;
    fetchFeedOnce().then((feed) => {
      if (!cancelled && feed?.lastFetchedAt)
        setLastFetchedAt(feed.lastFetchedAt);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <footer className="border-t border-border py-6 text-xs text-muted-foreground">
      <div className="mx-auto flex w-full max-w-[1080px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 sm:px-6 lg:px-8">
        <span>
          {`© ${year} Duyet Le · news.duyet.net — AI news, rated & ranked by LLMs`}
          {lastFetchedAt !== null && (
            <>
              {" · "}
              Updated {timeAgo(lastFetchedAt, Date.now(), "en")}
            </>
          )}
        </span>
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-1 hover:text-accent hover:underline hover:underline-offset-2"
            >
              <link.icon className="h-3.5 w-3.5" aria-hidden />
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/duyet/monorepo/tree/master/apps/news"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-accent hover:underline hover:underline-offset-2"
          >
            <GitFork className="h-3.5 w-3.5" aria-hidden />
            GitHub
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
          {" · "}
          <a
            href="https://anyrouter.dev/?ref=news.duyet.net"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1 hover:text-accent hover:underline hover:underline-offset-2"
          >
            AnyRouter
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        </nav>
      </div>
    </footer>
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
                <div
                  className="app-shell relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-background text-foreground selection:bg-foreground selection:text-background"
                  data-reader-bg={prefs.bg}
                  suppressHydrationWarning
                >
                  <div className="relative z-20 flex w-full flex-col">
                    <SiteHeader currentApp="news" />
                  </div>

                  {/* Our amber brand accent + compact reader typography are
                      scoped to .news-content (HeaderBar + main) only, so they
                      never leak into the shared SiteHeader/SiteFooter chrome
                      above/below. The reader background swatch, though, is
                      applied on .app-shell above so it paints the whole page
                      (header/footer chrome included), not just this area. */}
                  <div
                    className="news-content relative z-10 flex flex-grow flex-col"
                    style={readerCssVars(prefs)}
                    data-reader-font={prefs.font}
                  >
                    <HeaderBar lang={lang} onLangChange={handleLangChange} />

                    <main className="mx-auto w-full max-w-[1080px] flex-grow px-4 pb-16 sm:px-6 lg:px-8">
                      <Outlet />
                    </main>
                  </div>

                  <NewsFooter />
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
