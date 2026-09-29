/**
 * Render the photos Open Graph card to `public/og.png`.
 *
 * Run with `pnpm run og:card` from `apps/photos`. Output is committed, not
 * built — see the note in `apps/homelab/scripts/generate-og.ts`.
 *
 * Type-only on purpose: `public/photos/` holds only a placeholder and the
 * gallery itself is fetched at runtime from Unsplash/CDN URLs, so there is no
 * local still to dither. A per-photo card would need a build-time generator
 * walking `photos-data.json`; that is deliberately out of scope here because
 * there is no per-photo route to hang the tags on yet.
 *
 * A `meta` line is always supplied so `cardToSvg`'s accent hairline has the
 * 26px band it is positioned for.
 */

import { renderOgCard } from "@duyet/config/og-card";
import { fileURLToPath } from "node:url";

const outPath = fileURLToPath(new URL("../public/og.png", import.meta.url));

const { path, usedImage } = await renderOgCard(
  {
    eyebrow: "Photography",
    title: "Photos",
    description:
      "Landscapes, portraits, and street photography — a curated collection.",
    meta: "photos.duyet.net",
    siteName: "duyet.net",
  },
  outPath,
);

console.log(`og card -> ${path} (type-only: ${!usedImage})`);
