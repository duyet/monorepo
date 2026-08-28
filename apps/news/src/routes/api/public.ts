import { createFileRoute } from "@tanstack/react-router";
import { servePublicApi } from "../../lib/public-api";

// type alias (not interface): TanStack routeTree.gen must re-export handler
// shapes; a non-exported interface triggers TS4023 on ApiPublicRoute.
type HandlerArgs = { request: Request; context: any };

export const Route = createFileRoute("/api/public")({
  server: {
    handlers: {
      GET: async ({ context }: HandlerArgs) => {
        let env =
          context?.cloudflare?.env ||
          context?.env ||
          (globalThis as any).CF_ENV;
        if (!env?.DB) {
          try {
            env = (await import("cloudflare:workers")).env;
          } catch {
            // not running in a workers runtime
          }
        }
        return servePublicApi(env?.DB);
      },
    },
  },
});
