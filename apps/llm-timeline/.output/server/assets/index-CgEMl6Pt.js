import { jsx } from "react/jsx-runtime";
import { P as PageLayout } from "./page-layout-CEU_p7x_.js";
import { S as StaticView } from "./static-view-CuFmBPEv.js";
import { y as years, m as models } from "./router-Dyrqdy-I.js";
import { b as getStats } from "./utils-BYY1hTdF.js";
import "react";
import "@tanstack/react-router";
import "lucide-react";
import "next-themes";
import "@tanstack/react-virtual";
import "fs";
const stats = getStats(models);
const firstYear = years[years.length - 1];
const latestYear = years[0];
function LLMTimelinePage() {
  return /* @__PURE__ */ jsx(PageLayout, { description: `Interactive timeline of Large Language Model releases (${firstYear}–${latestYear})`, children: /* @__PURE__ */ jsx(StaticView, { models, stats: {
    models: stats.models,
    organizations: stats.organizations
  }, sourceStats: stats.sources, view: "models", license: "all" }) });
}
export {
  LLMTimelinePage as component
};
