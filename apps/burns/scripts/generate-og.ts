/**
 * Render the burns Open Graph card to `public/og.png`.
 *
 * Run with `pnpm run og:card` from `apps/burns`. Output is committed rather
 * than added to the build chain.
 *
 * Why not a `prebuild` step: `build` is
 * `tsx scripts/fetch-burns-data.ts && vite build && ...`, so a generator would
 * slot in as `"prebuild": "tsx scripts/generate-og.ts"` (or inline before
 * `fetch-burns-data.ts`). That was rejected because the card is 100% static —
 * no numbers, no dates, nothing read from `token-data.json` — so regenerating
 * it on every build would add a sharp rasterization pass to CI for a
 * byte-identical result and introduce a new way for `build` to fail. If burns
 * ever grows a per-period card the equation flips and it belongs in `prebuild`.
 *
 * A `meta` line is always supplied so `cardToSvg`'s accent hairline has the
 * 26px band it is positioned for.
 */

import { renderOgCard } from "@duyet/config/og-card";
import { fileURLToPath } from "node:url";

const outPath = fileURLToPath(new URL("../public/og.png", import.meta.url));

const { path, usedImage } = await renderOgCard(
  {
    eyebrow: "Token usage",
    title: "Burns",
    description:
      "Total Claude Code token consumption — input, output, cached — visualized.",
    meta: "burns.duyet.net",
    siteName: "duyet.net",
  },
  outPath,
);

console.log(`og card -> ${path} (type-only: ${!usedImage})`);
