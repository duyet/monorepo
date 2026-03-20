import { jsx } from "react/jsx-runtime";
import { n as dateFormat } from "./router-BL7fPxbg.js";
function IsNewPost({ date }) {
  const today = /* @__PURE__ */ new Date();
  if (!date || dateFormat(date, "yyyy-MM") !== dateFormat(today, "yyyy-MM")) {
    return null;
  }
  return /* @__PURE__ */ jsx("span", { className: "ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800", children: "New" });
}
function IsFeatured({ featured }) {
  if (!featured) {
    return null;
  }
  return /* @__PURE__ */ jsx("span", { className: "ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800", children: "Featured" });
}
export {
  IsNewPost as I,
  IsFeatured as a
};
