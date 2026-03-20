import { jsxs, jsx } from "react/jsx-runtime";
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
function Archives() {
  const postsByYear = getPostsByAllYear(["slug", "title", "date", "category"]);
  const postCount = Object.values(postsByYear).reduce((acc, yearPosts) => acc + yearPosts.length, 0);
  const years = Object.keys(postsByYear).map(Number);
  const pastYears = (/* @__PURE__ */ new Date()).getFullYear() - Math.min(...years);
  return /* @__PURE__ */ jsxs(Container, { children: [
    /* @__PURE__ */ jsxs("div", { children: [
      "Lists all ",
      postCount,
      " posts of the past ",
      pastYears,
      " years. You can also explore ",
      /* @__PURE__ */ jsx(Link, { to: "/tags", children: "by the topics" }),
      "."
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-8", children: Object.entries(postsByYear).sort(([a], [b]) => Number.parseInt(b, 10) - Number.parseInt(a, 10)).map(([year, posts]) => /* @__PURE__ */ jsx(YearPost, { year: Number.parseInt(year, 10), posts }, year)) })
  ] });
}
export {
  Archives as component
};
