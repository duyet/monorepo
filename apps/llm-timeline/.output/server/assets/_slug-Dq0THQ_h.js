import { jsx } from "react/jsx-runtime";
import { P as PageLayout } from "./page-layout-C5Y2h_Np.js";
import { T as TimelinePage } from "./timeline-page-Kuv39F2h.js";
import { a as Route, o as organizations, g as getSlug } from "./router-CuHdCRg8.js";
import "react";
import "@tanstack/react-router";
import "lucide-react";
import "next-themes";
import "./static-view-DhxXR80Y.js";
import "./utils-B-o2Gk5e.js";
import "@tanstack/react-virtual";
import "fs";
function OrgPage() {
  const {
    slug
  } = Route.useParams();
  const org = organizations.find((o) => getSlug(o) === slug);
  if (!org) return null;
  return /* @__PURE__ */ jsx(PageLayout, { title: `${org} LLM Models`, description: `Timeline of Large Language Model releases from ${org}`, children: /* @__PURE__ */ jsx(TimelinePage, { view: "models", license: "all", orgSlug: slug }) });
}
export {
  OrgPage as component
};
