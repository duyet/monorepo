import { jsxs, jsx } from "react/jsx-runtime";
import { DownloadIcon } from "@radix-ui/react-icons";
const file = "https://cv.duyet.net/duyet.cv.pdf";
function Page() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "mb-10 flex flex-col items-center justify-center", children: /* @__PURE__ */ jsxs("a", { className: "flex flex-row items-center gap-2 px-4 py-2 font-bold underline-offset-2 hover:underline", download: true, href: file, children: [
      /* @__PURE__ */ jsx(DownloadIcon, { className: "h-4 w-4" }),
      "PDF Download"
    ] }) }),
    /* @__PURE__ */ jsx("object", { className: "min-h-[1000px] w-full border-0", data: "/duyet.cv.pdf", type: "application/pdf", children: /* @__PURE__ */ jsx("iframe", { src: `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(file)}#zoom=100`, title: "cv", className: "min-h-[1000px] w-full border-0" }) })
  ] });
}
export {
  Page as component
};
