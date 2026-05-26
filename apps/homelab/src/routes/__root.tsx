import "@/app/globals.css";

import Container from "@duyet/components/Container";
import { SiteHeader } from "@duyet/components/SiteHeader";
import { SiteFooter } from "@duyet/components/SiteFooter";
import { homelabConfig } from "@duyet/config";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { z } from "zod";
import ErrorPage from "@/app/error";
import NotFoundPage from "@/app/not-found";
import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";

const rootSearchSchema = z.object({
  tab: z.enum(["infrastructure", "smart-devices"]).optional(),
});

export type RootSearch = z.infer<typeof rootSearchSchema>;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "robots", content: "follow, index" },
      { title: homelabConfig.metadata.title },
      { name: "description", content: homelabConfig.metadata.description },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", sizes: "any" },
      { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
      { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap",
      },
    ],
  }),
  validateSearch: (search) => rootSearchSchema.parse(search),
  errorComponent: ({ error, reset }) => (
    <ErrorPage error={error} reset={reset} />
  ),
  notFoundComponent: () => <NotFoundPage />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <div className="min-h-screen bg-white text-[#1a1a1a] dark:bg-[#0d0e0c] dark:text-[#f8f8f2]">
            <SiteHeader currentApp="homelab" />
            <main className="relative z-10 bg-white pb-16 dark:bg-[#0d0e0c]">
              <Container className="mb-20 max-w-[1280px] px-5 pb-16 pt-8 sm:px-8 lg:px-10">
                <Outlet />
              </Container>
            </main>
            <SiteFooter />
          </div>
          <Analytics />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
