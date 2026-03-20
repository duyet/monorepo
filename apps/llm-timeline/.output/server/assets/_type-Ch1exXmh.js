import { jsx } from "react/jsx-runtime";
import { b as Route, L as LICENSE_DESCRIPTIONS, c as LICENSE_LABELS } from "./router-Dyrqdy-I.js";
import { P as PageLayout } from "./page-layout-CEU_p7x_.js";
import { T as TimelinePage } from "./timeline-page-q_PWyGX0.js";
import "@tanstack/react-router";
import "next-themes";
import "fs";
import "react";
import "lucide-react";
import "./static-view-CuFmBPEv.js";
import "./utils-BYY1hTdF.js";
import "@tanstack/react-virtual";
function LicensePage() {
  const {
    type
  } = Route.useParams();
  const licenseType = type;
  return /* @__PURE__ */ jsx(PageLayout, { title: `${LICENSE_LABELS[licenseType]} Models`, description: LICENSE_DESCRIPTIONS[licenseType], children: /* @__PURE__ */ jsx(TimelinePage, { view: "models", license: licenseType }) });
}
export {
  LicensePage as component
};
