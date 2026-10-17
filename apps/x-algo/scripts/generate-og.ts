import { renderOgCard } from "@duyet/config/og-card";
import { fileURLToPath } from "node:url";
import { SITE_DESCRIPTION, SITE_TITLE } from "../src/lib/scoring";

const outPath = fileURLToPath(new URL("../public/og.png", import.meta.url));

const { path, usedImage } = await renderOgCard(
  {
    eyebrow: "Algorithm explainer",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    meta: "x-algo.duyet.net",
    siteName: "duyet.net",
  },
  outPath,
);

console.log(`og card -> ${path} (type-only: ${!usedImage})`);
