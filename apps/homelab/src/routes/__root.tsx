import "@duyet/components/styles.css";
import "@/app/globals.css";

import { SiteHeader } from "@duyet/components/SiteHeader";
import { SiteFooter } from "@duyet/components/SiteFooter";
import { homelabConfig } from "@duyet/config";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { z } from "zod";
import ErrorPage from "@/app/error";
import NotFoundPage from "@/app/not-found";
import ThemeProvider from "@duyet/components/ThemeProvider";

const rootSearchSchema = z.object({
  tab: z.enum(["infrastructure", "k8s", "smart-devices"]).optional(),
});

export type RootSearch = z.infer<typeof rootSearchSchema>;

const localNav = [
  { label: "Overview", href: "/" },
  { label: "Infrastructure", href: "/?tab=infrastructure" },
  { label: "Kubernetes", href: "/?tab=k8s" },
  { label: "Smart Devices", href: "/?tab=smart-devices" },
];

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
  const { search } = useRouterState({ select: (s) => s.location });
  const activeHref = search?.tab ? `/?tab=${search.tab}` : "/";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <SiteHeader
            currentApp="homelab"
            localNav={localNav}
            activeHref={activeHref}
          />
          <Outlet />
          <SiteFooter />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
