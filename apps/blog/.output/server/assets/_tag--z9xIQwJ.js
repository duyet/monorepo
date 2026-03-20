import { jsx, jsxs } from "react/jsx-runtime";
import { R as Route, i as getPostsByTag, g as getAllTags, a as getSlug, C as Container } from "./router-BL7fPxbg.js";
import { H as HeroBanner } from "./HeroBanner-BAGxuMrA.js";
import { Y as YearPost } from "./YearPost-C3UuWmbo.js";
import { g as getTagMetadata, a as getTagColorClass } from "./tag-metadata-8HYtApf5.js";
import "@tanstack/react-router";
import "react";
import "fs";
import "remark-math";
import "react-dom";
import "lucide-react";
import "next-themes";
import "./PostBadges-DtIPJPGt.js";
function PostsByTag() {
  const {
    tag
  } = Route.useParams();
  const posts = getPostsByTag(tag, ["slug", "date", "title", "category", "featured"]);
  const tags = getAllTags();
  const tagName = Object.keys(tags).find((t) => getSlug(t) === tag) || tag;
  const tagIndex = Object.keys(tags).sort((a, b) => tags[b] - tags[a]).indexOf(tagName);
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
  const metadata = getTagMetadata(tagName, postCount, tagIndex);
  const colorClass = getTagColorClass(metadata.color, "light");
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen", children: /* @__PURE__ */ jsxs(Container, { children: [
    /* @__PURE__ */ jsx(HeroBanner, { title: tagName, description: metadata.description, colorClass, postCount, yearCount, backLinkHref: "/tags", backLinkText: "All Topics" }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-12", children: Object.entries(postsByYear).sort(([a], [b]) => Number.parseInt(b, 10) - Number.parseInt(a, 10)).map(([year, yearPosts]) => /* @__PURE__ */ jsx(YearPost, { year: Number.parseInt(year, 10), posts: yearPosts }, year)) }),
    posts.length === 0 && /* @__PURE__ */ jsx("div", { className: "py-12 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-lg text-neutral-600", children: "No posts found with this tag yet." }) })
  ] }) });
}
export {
  PostsByTag as component
};
