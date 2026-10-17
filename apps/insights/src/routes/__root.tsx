import "../styles/globals.css";

import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";
import {
  duyetFaviconHeadLinks,
  duyetFontHeadLinks,
  THEME_BOOT_SCRIPT,
  ExploreApps,
  SiteFooter,
  SiteHeader,
} from "@duyet/components";
import { ogHeadLinks, ogMeta } from "@duyet/config/og";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import {
  SITE_DESCRIPTION,
  SITE_OG_IMAGE,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";

function NotFoundComponent() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[1040px] flex-col items-start justify-center px-6 md:px-8">
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight">
        Page not found.
      </h1>
      <a
        href="/"
        className="mt-6 text-sm underline underline-offset-4 hover:text-foreground"
      >
        Return home
      </a>
    </main>
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
      ...ogMeta({
        url: SITE_URL,
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        image: SITE_OG_IMAGE,
        imageAlt: `${SITE_TITLE} — ${SITE_DESCRIPTION}`,
      }),
    ],
    links: [
      ...duyetFontHeadLinks(),
      ...ogHeadLinks({ url: SITE_URL }),
      ...duyetFaviconHeadLinks(),
    ],
  }),
  notFoundComponent: NotFoundComponent,
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
            <SiteHeader currentApp="insights" />

            <main className="mx-auto w-full max-w-[1040px] px-6 py-12 md:py-16 md:px-8 flex-grow">
              <Outlet />
            </main>

            <ExploreApps currentApp="insights" />
            <SiteFooter owner="Duyet Le" />
          </div>

          <Analytics />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
