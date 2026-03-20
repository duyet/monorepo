import { jsx, jsxs } from "react/jsx-runtime";
import { l as Route, m as getPostsByCategory, e as getAllCategories, a as getSlug, C as Container } from "./router-BL7fPxbg.js";
import { H as HeroBanner } from "./HeroBanner-BAGxuMrA.js";
import { Y as YearPost } from "./YearPost-C3UuWmbo.js";
import { g as getCategoryMetadata, a as getCategoryColorClass } from "./category-metadata-Dp4woSsm.js";
import "@tanstack/react-router";
import "react";
import "fs";
import "remark-math";
import "react-dom";
import "lucide-react";
import "next-themes";
import "./PostBadges-DtIPJPGt.js";
function PostsByCategory() {
  const {
    category
  } = Route.useParams();
  const posts = getPostsByCategory(category, ["slug", "date", "title", "category", "featured"]);
  const categories = getAllCategories();
  const categoryName = Object.keys(categories).find((cat) => getSlug(cat) === category) || category;
  const categoryIndex = Object.keys(categories).sort((a, b) => categories[b] - categories[a]).indexOf(categoryName);
  const postsByYear = posts.reduce((acc, post) => {
    const year = new Date(post.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(post);
    return acc;
  }, {});
  const postCount = posts.length;
  const yearCount = Object.keys(postsByYear).length;
  const metadata = getCategoryMetadata(categoryName, postCount, categoryIndex);
  const colorClass = getCategoryColorClass(metadata.color, "light");
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen", children: /* @__PURE__ */ jsxs(Container, { children: [
    /* @__PURE__ */ jsx(HeroBanner, { title: categoryName, description: metadata.description, colorClass, postCount, yearCount, backLinkHref: "/category", backLinkText: "All Categories" }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-12", children: Object.entries(postsByYear).sort(([a], [b]) => Number.parseInt(b, 10) - Number.parseInt(a, 10)).map(([year, yearPosts]) => /* @__PURE__ */ jsx(YearPost, { year: Number.parseInt(year, 10), posts: yearPosts }, year)) }),
    posts.length === 0 && /* @__PURE__ */ jsx("div", { className: "py-12 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-lg text-neutral-600", children: "No posts found in this category yet." }) })
  ] }) });
}
export {
  PostsByCategory as component
};
