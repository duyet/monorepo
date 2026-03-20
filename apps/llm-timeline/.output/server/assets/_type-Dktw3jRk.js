import { jsx } from "react/jsx-runtime";
import { b as Route, L as LICENSE_DESCRIPTIONS, c as LICENSE_LABELS } from "./router-8qeuaoTQ.js";
import { P as PageLayout } from "./page-layout-AG6sMC_3.js";
import { T as TimelinePage } from "./timeline-page-BdggPdJF.js";
import "@tanstack/react-router";
import "next-themes";
import "fs";
import "react";
import "lucide-react";
import "./static-view-BKcu-o28.js";
import "./utils-DRorGYoO.js";
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
