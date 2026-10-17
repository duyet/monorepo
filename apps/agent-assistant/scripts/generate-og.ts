/**
 * Render the duyetbot Open Graph card to `public/og.png`.
 *
 * Run with `pnpm run og:card` from `apps/agent-assistant`. The output is
 * committed rather than generated during `build`: the card is fully static (no
 * per-page data), and a committed PNG guarantees the URL referenced by
 * `og:image` in the SSR'd head resolves from Workers static assets immediately
 * after deploy instead of depending on a build step succeeding.
 *
 * Content is imported from `../src/lib/site` rather than duplicated here, so
 * the card cannot drift from the `<meta name="description">` and the OG tags in
 * `src/routes/__root.tsx`.
 *
 * A `meta` line is always supplied — see the note in
 * `apps/homelab/scripts/generate-og.ts`: without one, `cardToSvg`'s accent
 * hairline is drawn on top of the description.
 */

import { fileURLToPath } from "node:url";
import { renderOgCard } from "@duyet/config/og-card";
import { SITE_DESCRIPTION, SITE_TITLE } from "../src/lib/site";

const outPath = fileURLToPath(new URL("../public/og.png", import.meta.url));

const { path, usedImage } = await renderOgCard(
  {
    eyebrow: "AI assistant",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    meta: "agent-assistant.duyet.net",
    siteName: "duyet.net",
  },
  outPath
);

console.log(`og card -> ${path} (type-only: ${!usedImage})`);
