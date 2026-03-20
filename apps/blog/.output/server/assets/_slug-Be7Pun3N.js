import { jsx } from "react/jsx-runtime";
import { j as Route, k as getSeries } from "./router-BL7fPxbg.js";
import { S as SeriesBox } from "./SeriesBox-j_R2Uixp.js";
import "@tanstack/react-router";
import "react";
import "fs";
import "remark-math";
import "react-dom";
import "lucide-react";
import "next-themes";
function SeriesDetailPage() {
  const {
    slug
  } = Route.useParams();
  const series = getSeries({
    slug
  });
  if (!series) {
    return /* @__PURE__ */ jsx("div", { className: "py-12 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-lg text-neutral-600", children: "Series not found." }) });
  }
  return /* @__PURE__ */ jsx(SeriesBox, { className: "mt-0 border-0 pb-10 pt-10", series });
}
export {
  SeriesDetailPage as component
};
