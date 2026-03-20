import { jsx } from "react/jsx-runtime";
import { b as getAllSeries, c as cn } from "./router-BL7fPxbg.js";
import "remark-math";
import { S as SeriesBox } from "./SeriesBox-j_R2Uixp.js";
import "@tanstack/react-router";
import "react";
import "fs";
import "react-dom";
import "lucide-react";
import "next-themes";
const seriesBackgrounds = ["bg-oat", "bg-sage", "bg-lavender", "bg-cactus-light", "bg-ivory-medium"];
function SeriesPage() {
  const seriesList = getAllSeries();
  return /* @__PURE__ */ jsx("div", { className: "mb-0 mt-10 grid grid-cols-1 gap-8 md:grid-cols-1", children: seriesList.map((series, index) => /* @__PURE__ */ jsx(SeriesBox, { className: cn(seriesBackgrounds[index % seriesBackgrounds.length]), series }, series.slug)) });
}
export {
  SeriesPage as component
};
