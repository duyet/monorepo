/**
 * Render the duyet.net Open Graph card to `public/og.png`.
 *
 * Run with `pnpm run og:card` from `apps/home`. The output is committed rather
 * than generated during `build`: the card is fully static (one site-wide
 * image, no per-page data), and a committed PNG guarantees the URL referenced
 * by the prerendered HTML resolves on the CDN immediately after deploy instead
 * of depending on a build step succeeding.
 *
 * A `meta` line is always supplied — see the note in
 * `apps/homelab/scripts/generate-og.ts`: without one, `cardToSvg`'s accent
 * hairline is drawn on top of the description.
 */

import { renderOgCard } from "@duyet/config/og-card";
import { fileURLToPath } from "node:url";
import { SITE_DESCRIPTION, SITE_TITLE } from "../src/lib/og";

const outPath = fileURLToPath(new URL("../public/og.png", import.meta.url));

const { path, usedImage } = await renderOgCard(
  {
    eyebrow: "Data & AI Engineer",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    meta: "duyet.net",
    // No `siteName`: every other app's card pairs a subdomain meta line with
    // the apex as `siteName`. Home *is* the apex, and both render as
    // left-aligned mono lines stacked on each other — which printed
    // "duyet.net" twice. `og:site_name` is set by `ogMeta()`, not here.
  },
  outPath
);

console.log(`og card -> ${path} (type-only: ${!usedImage})`);
