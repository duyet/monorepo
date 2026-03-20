import { jsx, jsxs } from "react/jsx-runtime";
import { g as getAllTags, C as Container, a as getSlug } from "./router-BL7fPxbg.js";
import { g as getTagMetadata } from "./tag-metadata-8HYtApf5.js";
import { C as ContentCard } from "./ContentCard-BHQW94QK.js";
import "@tanstack/react-router";
import "react";
import "fs";
import "remark-math";
import "react-dom";
import "lucide-react";
import "next-themes";
function Tags() {
  const tags = getAllTags();
  const tagEntries = Object.entries(tags).sort(([, a], [, b]) => b - a);
  const totalPosts = Object.values(tags).reduce((sum, count) => sum + count, 0);
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen", children: /* @__PURE__ */ jsxs(Container, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("h1", { className: "mb-6 font-serif text-5xl font-bold text-neutral-900 md:text-6xl lg:text-7xl", children: "Topics" }),
      /* @__PURE__ */ jsxs("p", { className: "max-w-2xl text-lg leading-relaxed text-neutral-700", children: [
        "Explore my writing organized by",
        " ",
        /* @__PURE__ */ jsxs("strong", { className: "font-semibold text-neutral-900", children: [
          tagEntries.length,
          " diverse topics"
        ] }),
        ", spanning programming languages, frameworks, data engineering, cloud infrastructure, and career development. ",
        totalPosts,
        " posts tagged and organized for you."
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: tagEntries.map(([tag, count], index) => {
      const metadata = getTagMetadata(tag, count, index);
      return /* @__PURE__ */ jsx(ContentCard, { title: tag, href: `/tag/${getSlug(tag)}`, description: metadata.description, color: metadata.color, illustration: metadata.illustration, tags: [`${count} ${count === 1 ? "post" : "posts"}`] }, tag);
    }) })
  ] }) });
}
export {
  Tags as component
};
