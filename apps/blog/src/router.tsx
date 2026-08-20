import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    trailingSlash: "always",
    // Prerendered HTML is the source of truth. Do not refetch loaders on
    // hydrate (default staleTime is 0) — that pending swap blanks the post.
    defaultStaleTime: Number.POSITIVE_INFINITY,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
