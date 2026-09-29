/**
 * Render the tip Open Graph card to `public/og.png`.
 *
 * Run with `pnpm run og:card` from `apps/tip`. The output is committed rather
 * than generated during `build`: the card is fully static (no per-page data),
 * and a committed PNG guarantees the URL referenced by the prerendered HTML
 * resolves on the CDN immediately after deploy instead of depending on a build
 * step succeeding.
 *
 * A `meta` line is always supplied — see the note in
 * `apps/homelab/scripts/generate-og.ts`: without one, `cardToSvg`'s accent
 * hairline is drawn on top of the description.
 */

import { renderOgCard } from "@duyet/config/og-card";
import { fileURLToPath } from "node:url";
import { SITE_DESCRIPTION } from "../src/lib/site";

const outPath = fileURLToPath(new URL("../public/og.png", import.meta.url));

const { path, usedImage } = await renderOgCard(
  {
    eyebrow: "Support",
    title: "Buy me a coffee",
    description: SITE_DESCRIPTION,
    meta: "tip.duyet.net",
    siteName: "duyet.net",
  },
  outPath,
);

console.log(`og card -> ${path} (type-only: ${!usedImage})`);
