import "@/app/globals.css";

import Container from "@duyet/components/Container";
import Footer from "@duyet/components/Footer";
import Header from "@duyet/components/Header";
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
import ThemeProvider from "@/components/ThemeProvider";

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
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;700&display=swap",
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
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="light">
          <Header
            longText={homelabConfig.header.longText}
            shortText={homelabConfig.header.shortText}
          />
          <main>
            <Container className="mb-20 max-w-[1280px] px-4 sm:px-6 lg:px-8">
              <Outlet />
            </Container>
          </main>
          <Footer />
          <Analytics />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
