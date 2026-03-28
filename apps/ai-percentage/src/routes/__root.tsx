import "../styles.css";

import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <a href="/" className="mt-4 inline-block text-sm underline">
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
      { title: "AI Code Usage | duyet.net" },
      {
        name: "description",
        content:
          "Percentage of code written by AI across all repositories, detected via co-author signatures and email patterns.",
      },
    ],
    links: [{ rel: "icon", href: "/favicon.ico" }],
  }),
  notFoundComponent: NotFoundComponent,
  errorComponent: ({ error }) => (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Error</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <a href="/" className="mt-4 inline-block text-sm underline">
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
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
