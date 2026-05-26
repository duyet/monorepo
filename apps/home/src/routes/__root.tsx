import "@duyet/components/styles.css";
import "../globals.css";

import ThemeProvider from "@duyet/components/ThemeProvider";
import {
  ClerkAuthProvider,
  SiteFooter,
  SiteHeader,
  SiteSubnav,
} from "@duyet/components";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { NotFound } from "../components/NotFound";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "UTF-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "robots", content: "follow, index" },
      { title: "Duyet — building AI agents and data platforms" },
      {
        name: "description",
        content:
          "I build AI agents and the data platforms that keep them honest — end-to-end, obsessing over the small details that make software feel right to use.",
      },
      {
        name: "theme-color",
        content: "#ffffff",
        media: "(prefers-color-scheme: light)",
      },
      {
        name: "theme-color",
        content: "#0a0a0a",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    links: [
      { rel: "icon", href: "/icon.svg", sizes: "any" },
    ],
  }),
  notFoundComponent: NotFound,
  component: RootComponent,
});

const homeSubnavLinks = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "About DuyetBot", href: "/about-duyetbot" },
  { label: "LS", href: "/ls" },
];

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ClerkAuthProvider>
          <ThemeProvider>
            <SiteHeader />
            <SiteSubnav links={homeSubnavLinks} activeHref={pathname} />
            <Outlet />
            <SiteFooter />
          </ThemeProvider>
        </ClerkAuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
