import { jsx, jsxs } from "react/jsx-runtime";
import { c as cn, d as getAllPosts, C as Container } from "./router-BL7fPxbg.js";
import { Link } from "@tanstack/react-router";
import { H as Header } from "./index-DlIQT2UV.js";
import "react";
import "fs";
import "remark-math";
import "react-dom";
import "lucide-react";
import "next-themes";
function Thumb({
  url,
  alt,
  width = 800,
  height = 300,
  className
}) {
  if (!url) return null;
  return /* @__PURE__ */ jsx(
    "img",
    {
      src: url,
      className: cn("mt-4", className),
      width,
      height,
      alt: alt || ""
    }
  );
}
function Feed({ posts, ...props }) {
  if (!posts) {
    return /* @__PURE__ */ jsx("p", { children: "No blog posted yet :/" });
  }
  return posts.map((post) => /* @__PURE__ */ jsx(FeedItem, { post, ...props }, post.slug));
}
function FeedItem({ post, noThumbnail }) {
  return /* @__PURE__ */ jsxs("article", { className: "mb-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-row gap-2 mb-2 text-gray-400", children: [
      /* @__PURE__ */ jsx("time", { children: post.date.toString() }),
      /* @__PURE__ */ jsx(Link, { to: `/category/${post.category_slug}`, className: "text-gray-400", children: post.category })
    ] }),
    /* @__PURE__ */ jsx(
      Link,
      {
        to: `/${post.slug}`,
        className: cn(
          "inline-block text-4xl font-bold py-2 mt-2 hover:underline",
          "from-gray-900 to-gray-800 bg-clip-text",
          "dark:from-gray-50 dark:to-gray-300",
          "md:text-4xl md:tracking-tighter",
          "lg:text-5xl lg:tracking-tighter"
        ),
        children: post.title
      }
    ),
    /* @__PURE__ */ jsx("p", { className: "mt-4 leading-relaxed", children: post.excerpt }),
    !noThumbnail && /* @__PURE__ */ jsx("div", { className: "mb-16", children: /* @__PURE__ */ jsx(Thumb, { url: post.thumbnail, alt: post.title }) })
  ] });
}
function FeedPage() {
  const posts = getAllPosts(["date", "slug", "title", "excerpt", "thumbnail", "category", "category_slug"], 10);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsx(Header, { center: true, logo: false, longText: "Data Engineering" }),
    /* @__PURE__ */ jsxs(Container, { children: [
      /* @__PURE__ */ jsx(Feed, { posts }),
      /* @__PURE__ */ jsx(Link, { to: "/archives", children: /* @__PURE__ */ jsx("div", { className: "mt-12 rounded-lg py-4 text-center text-base font-medium text-neutral-800 transition-colors hover:bg-neutral-100 hover:text-neutral-900 hover:underline hover:underline-offset-4", children: "See more posts" }) })
    ] })
  ] });
}
export {
  FeedPage as component
};
