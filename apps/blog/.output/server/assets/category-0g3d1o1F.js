import { jsx, jsxs } from "react/jsx-runtime";
import { e as getAllCategories, C as Container, a as getSlug } from "./router-BL7fPxbg.js";
import { g as getCategoryMetadata } from "./category-metadata-Dp4woSsm.js";
import { C as ContentCard } from "./ContentCard-BHQW94QK.js";
import "@tanstack/react-router";
import "react";
import "fs";
import "remark-math";
import "react-dom";
import "lucide-react";
import "next-themes";
function Categories() {
  const categories = getAllCategories();
  const categoryEntries = Object.entries(categories).sort(([, a], [, b]) => b - a);
  const totalPosts = Object.values(categories).reduce((sum, count) => sum + count, 0);
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen", children: /* @__PURE__ */ jsxs(Container, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("h1", { className: "mb-6 font-serif text-5xl font-bold text-neutral-900 md:text-6xl lg:text-7xl", children: "Categories" }),
      /* @__PURE__ */ jsxs("p", { className: "max-w-2xl text-lg leading-relaxed text-neutral-700", children: [
        "Explore my writing organized by",
        " ",
        /* @__PURE__ */ jsxs("strong", { className: "font-semibold text-neutral-900", children: [
          categoryEntries.length,
          " main categories"
        ] }),
        ", covering everything from data engineering and machine learning to web development and career insights. ",
        totalPosts,
        " posts and counting."
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: categoryEntries.map(([category, count], index) => {
      const metadata = getCategoryMetadata(category, count, index);
      return /* @__PURE__ */ jsx(ContentCard, { title: category, href: `/category/${getSlug(category)}`, description: metadata.description, color: metadata.color, illustration: metadata.illustration, tags: [`${count} ${count === 1 ? "post" : "posts"}`] }, category);
    }) })
  ] }) });
}
export {
  Categories as component
};
