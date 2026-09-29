/**
 * Render the ai-percentage Open Graph card to `public/og.png`.
 *
 * Run with `pnpm run og:card` from `apps/ai-percentage`. Output is committed,
 * not built — see the note in `apps/homelab/scripts/generate-og.ts`.
 *
 * Type-only: `public/` had no image assets at all before this, and the hero
 * number is fetched at runtime from `api.duyet.net`, so there is nothing local
 * to dither. A `meta` line is always supplied so `cardToSvg`'s accent hairline
 * has the 26px band it is positioned for.
 */

import { renderOgCard } from "@duyet/config/og-card";
import { fileURLToPath } from "node:url";

const outPath = fileURLToPath(new URL("../public/og.png", import.meta.url));

const { path, usedImage } = await renderOgCard(
  {
    eyebrow: "AI code signal",
    title: "AI Code Usage",
    description:
      "Percentage of code written by AI, detected via co-author signatures.",
    meta: "ai-percentage.duyet.net",
    siteName: "duyet.net",
  },
  outPath,
);

console.log(`og card -> ${path} (type-only: ${!usedImage})`);
