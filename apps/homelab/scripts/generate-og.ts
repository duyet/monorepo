/**
 * Render the homelab Open Graph card to `public/og-image.png`.
 *
 * Run with `pnpm run og:card` from `apps/homelab`. The output is committed, so
 * this is a maintenance script, not a build step — prerendered HTML can only
 * reference a card that already exists under `public/` at deploy time.
 *
 * Two deliberate choices:
 *
 * - Dark theme: the app forces `dark` via ThemeProvider, so a light card would
 *   flash against a dark dashboard when unfurled.
 * - A `meta` line is always supplied. `cardToSvg` anchors the accent hairline
 *   to `metaY - (metaH ? 34 : 26)`, i.e. to the meta line's slot. With no
 *   description *and* no meta line the hairline lands on the title; with a
 *   description but no meta line it lands on the description. Passing `meta`
 *   reserves the 26px band the rule was positioned for.
 */

import { DARK_THEME, renderOgCard } from "@duyet/config/og-card";
import { fileURLToPath } from "node:url";

const outPath = fileURLToPath(
  new URL("../public/og-image.png", import.meta.url),
);

const { path, usedImage } = await renderOgCard(
  {
    eyebrow: "MicroK8s cluster",
    title: "Homelab Dashboard",
    description:
      "Real-time metrics, service status, and network analytics for a 5-node heterogeneous homelab.",
    meta: "homelab.duyet.net",
    siteName: "duyet.net",
  },
  outPath,
  { theme: DARK_THEME },
);

console.log(`og card -> ${path} (type-only: ${!usedImage})`);
