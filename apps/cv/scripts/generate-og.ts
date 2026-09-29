/**
 * Render the cv Open Graph card to `public/og.png`.
 *
 * Run with `pnpm run og:card` from `apps/cv`. Output is committed, not built —
 * see the note in `apps/homelab/scripts/generate-og.ts`.
 *
 * Type-only on purpose: everything in `public/` is either a customer logo
 * (fossil/fpt/karo/jvn) or the résumé PDF. Dithering a third-party logo as the
 * card background would misrepresent it as imagery of the author.
 *
 * A `meta` line is always supplied so `cardToSvg`'s accent hairline has the
 * 26px band it is positioned for.
 */

import { renderOgCard } from "@duyet/config/og-card";
import { fileURLToPath } from "node:url";

const outPath = fileURLToPath(new URL("../public/og.png", import.meta.url));

const { path, usedImage } = await renderOgCard(
  {
    eyebrow: "Résumé",
    title: "Duyet Le",
    description:
      "Senior Data Engineer — data warehousing, distributed systems, and cloud computing.",
    meta: "cv.duyet.net",
    siteName: "duyet.net",
  },
  outPath,
);

console.log(`og card -> ${path} (type-only: ${!usedImage})`);
