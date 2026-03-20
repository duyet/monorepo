import { jsx } from "react/jsx-runtime";
import { P as PageLayout } from "./page-layout-C5Y2h_Np.js";
import { S as StaticView } from "./static-view-DhxXR80Y.js";
import { y as years, m as models } from "./router-CuHdCRg8.js";
import { b as getStats } from "./utils-B-o2Gk5e.js";
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
