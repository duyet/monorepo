/**
 * Render the insights Open Graph card to `public/og.png`.
 *
 * Run with `pnpm run og:card` from `apps/insights`. Output is committed rather
 * than added to the build chain — see the note in
 * `apps/homelab/scripts/generate-og.ts`. Concretely: `build` here is
 * `prebuild` (regenerates the blog post data) followed by `vite build`, so a
 * generator would slot in as `"prebuild": "tsx scripts/generate-og.ts"` ahead
 * of it. That is rejected because the card is 100% static — no KPI numbers, no
 * period labels, nothing read from the ClickHouse/DuckDB caches — so it would
 * add a sharp rasterization pass to every CI build for a byte-identical result,
 * plus a new way for `build` to fail before the data step even runs.
 *
 * Type-only: `public/` holds no imagery worth dithering (the only assets are
 * WakaTime badge/heatmap SVGs and `sw.js`), and the dashboard's charts are
 * rendered client-side from fetched data, so there is no local still.
 *
 * A `meta` line is always supplied so `cardToSvg`'s accent hairline has the
 * 26px band it is positioned for.
 *
 * The description is longer than `SITE_DESCRIPTION` on purpose: that constant
 * is the root route's one-line `<meta name="description">`, which is too short
 * to fill a 1200×630 card. It reuses the overview route's own description copy
 * so the card and the homepage agree on what the app is.
 */

import { renderOgCard } from "@duyet/config/og-card";
import { fileURLToPath } from "node:url";
import { SITE_TITLE } from "../lib/site";

const outPath = fileURLToPath(new URL("../public/og.png", import.meta.url));

const { path, usedImage } = await renderOgCard(
  {
    eyebrow: "Editorial dashboard",
    title: SITE_TITLE,
    description:
      "Traffic, AI usage, coding activity, and content, in one dashboard.",
    meta: "insights.duyet.net",
    siteName: "duyet.net",
  },
  outPath
);

console.log(`og card -> ${path} (type-only: ${!usedImage})`);
