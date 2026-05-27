---
title: "TanStack Start SSG Migration"
category: "infrastructure"
tags: ["tanstack", "ssg", "vite", "cloudflare"]
links: ["cloudflare-rocket-loader", "blog-wasm-prerender-ci", "deploy-workflow", "blog-app"]
summary: "All apps migrated from Vite SPA to TanStack Start static pre-rendering in March 2026 to survive Cloudflare Rocket Loader."
updated: "2026-03-24"
---

# TanStack Start SSG Migration

All production apps except `agents` were migrated from Vite SPA to TanStack Start with static pre-rendering. The work started 2026-03-23 with the blog and insights apps, then completed 2026-03-24 via parallel worktree agents for the remaining six apps.

**Root cause:** Cloudflare Rocket Loader rewrites `type="module"` script attributes, preventing Vite SPA initialization and producing blank pages.

## Migration pattern (~8 files per app)

### 1. `vite.config.ts`

Replace `TanStackRouterVite()` plugin with `tanstackStart()`:

```ts
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

tanstackStart({
  router: {
    routesDirectory: "./routes",
    generatedRouteTree: "./routeTree.gen.ts",
  },
  prerender: { enabled: true, crawlLinks: true, failOnError: false },
})
```

Remove `@vitejs/plugin-react` — TanStack Start handles React transforms internally. Do NOT pass `autoCodeSplitting` (it's not in the Start schema and causes a config error).

### 2. Delete `index.html` + `src/main.tsx`

These are replaced by the Start entry points.

### 3. `src/entry-client.tsx`

```tsx
import { StartClient } from "@tanstack/react-start/client";
import { hydrateRoot } from "react-dom/client";
hydrateRoot(document, <StartClient />);
```

### 4. `src/entry-server.tsx`

```tsx
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
export default createStartHandler(defaultStreamHandler);
```

### 5. `src/router.tsx`

Must export a `getRouter()` function — not a const export. Start calls this factory function.

### 6. `src/routes/__root.tsx`

Render the full HTML document:

```tsx
<html>
  <head><HeadContent /></head>
  <body>
    <Outlet />
    <Scripts />
  </body>
</html>
```

Move `<meta>` and `<link>` tags that were in `index.html` into the route's `head()` config. Remove any `Head` component import — it conflicts with the document root structure.

### 7. `package.json`

- Add `@tanstack/react-start` to dependencies
- Remove `@tanstack/router-plugin` and `@vitejs/plugin-react` from devDependencies
- Change deploy output path: `dist` → `dist/client`

### 8. `wrangler.toml`

```toml
pages_build_output_dir = "dist/client"
```

## Key gotchas

- CSS imports in `__root.tsx` are relative to `src/routes/` because Start's `srcDirectory` defaults to `src`
- `routesDirectory` and `generatedRouteTree` paths are relative to `srcDirectory`, not the project root
- Local file fetches (`fetch('/data.json')`) need isomorphic handling — they fail during SSR because there's no server to handle relative URLs. The blog uses `readPublicJson()` which switches between `fs.readFile` (SSR) and `fetch()` (client navigation)
- External API fetches with absolute URLs work in both SSR and client contexts without changes
- Google Fonts: use `rel="preload" as="style"` to avoid render blocking during prerender

## Deployed page counts

| App | Pages |
|-----|-------|
| blog | 393 |
| insights | 22 |
| llm-timeline | 3700+ |
| home | 4 |
| cv | 2 |
| photos | 2 |
| homelab | 1 |
| ai-percentage | 1 |
| agents | ⏳ still Vite SPA |
