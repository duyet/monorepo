import { jsx } from "react/jsx-runtime";
import { P as PageLayout } from "./page-layout-AG6sMC_3.js";
import { T as TimelinePage } from "./timeline-page-BdggPdJF.js";
import { R as Route } from "./router-8qeuaoTQ.js";
import "react";
import "@tanstack/react-router";
import "lucide-react";
import "next-themes";
import "./static-view-BKcu-o28.js";
import "./utils-DRorGYoO.js";
import "@tanstack/react-virtual";
import "fs";
function YearPage() {
  const {
    year
  } = Route.useParams();
  const yearNum = parseInt(year, 10);
  return /* @__PURE__ */ jsx(PageLayout, { title: `LLM Models Released in ${year}`, description: `Timeline of Large Language Model releases from ${year}`, children: /* @__PURE__ */ jsx(TimelinePage, { view: "models", license: "all", year: yearNum }) });
}
export {
  YearPage as component
};
