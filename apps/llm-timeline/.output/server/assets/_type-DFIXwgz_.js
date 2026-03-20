import { jsx } from "react/jsx-runtime";
import { b as Route, L as LICENSE_DESCRIPTIONS, c as LICENSE_LABELS } from "./router-CuHdCRg8.js";
import { P as PageLayout } from "./page-layout-C5Y2h_Np.js";
import { T as TimelinePage } from "./timeline-page-Kuv39F2h.js";
import "@tanstack/react-router";
import "next-themes";
import "fs";
import "react";
import "lucide-react";
import "./static-view-DhxXR80Y.js";
import "./utils-B-o2Gk5e.js";
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
