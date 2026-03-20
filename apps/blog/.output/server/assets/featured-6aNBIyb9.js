import { jsx, jsxs } from "react/jsx-runtime";
import { f as getPostsByAllYear, C as Container } from "./router-BL7fPxbg.js";
import { Link } from "@tanstack/react-router";
import { Y as YearPost } from "./YearPost-C3UuWmbo.js";
import "react";
import "fs";
import "remark-math";
import "react-dom";
import "lucide-react";
import "next-themes";
import "./PostBadges-DtIPJPGt.js";
function Featured() {
  const postsByYear = getPostsByAllYear(["slug", "title", "date", "category", "featured"], -1, true);
  const postCount = Object.values(postsByYear).reduce((acc, yearPosts) => acc + yearPosts.length, 0);
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen", children: /* @__PURE__ */ jsxs(Container, { children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-cactus-light mb-12 rounded-3xl p-12 md:p-16", children: [
      /* @__PURE__ */ jsx("h1", { className: "mb-8 font-serif text-4xl font-bold text-neutral-900 md:text-5xl lg:text-6xl", children: "Featured" }),
      /* @__PURE__ */ jsxs("p", { className: "max-w-2xl text-lg leading-relaxed text-neutral-700", children: [
        "This page highlights",
        " ",
        /* @__PURE__ */ jsxs("strong", { className: "font-semibold text-neutral-900", children: [
          postCount,
          " featured blog posts"
        ] }),
        ". You can also explore",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/", className: "text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-600", children: "all posts" }),
        " ",
        "or",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/tags", className: "text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-600", children: "by the topics" }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-12", children: Object.entries(postsByYear).sort(([a], [b]) => Number.parseInt(b, 10) - Number.parseInt(a, 10)).map(([year, posts]) => /* @__PURE__ */ jsx(YearPost, { year: Number.parseInt(year, 10), posts }, year)) })
  ] }) });
}
export {
  Featured as component
};
