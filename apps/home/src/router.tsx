import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

type LegacyStores = {
  matches?: { get: () => unknown };
  activeMatchesSnapshot?: { state?: unknown };
};

function shimMatchesStore(router: { stores?: LegacyStores; update: (opts: object) => unknown }) {
  const stores = router.stores;
  if (stores && !stores.matches && stores.activeMatchesSnapshot) {
    stores.matches = {
      get: () => stores.activeMatchesSnapshot?.state ?? [],
    };
  }
}

export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultStaleTime: Number.POSITIVE_INFINITY,
  });
  const originalUpdate = router.update.bind(router);
  router.update = ((opts: object) => {
    const result = originalUpdate(opts);
    shimMatchesStore(router);
    return result;
  }) as typeof router.update;
  shimMatchesStore(router);
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
