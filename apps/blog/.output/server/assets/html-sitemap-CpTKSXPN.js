import { jsxs, jsx } from "react/jsx-runtime";
import { d as getAllPosts, e as getAllCategories, a as getSlug } from "./router-BL7fPxbg.js";
import "@tanstack/react-router";
import "react";
import "fs";
import "remark-math";
import "react-dom";
import "lucide-react";
import "next-themes";
function HtmlSitemapPage() {
  const posts = getAllPosts(["slug", "title", "excerpt", "date"], 1e5);
  const categories = Object.keys(getAllCategories());
  const HOME_URL = "https://duyet.net";
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-4xl", children: [
    /* @__PURE__ */ jsx("h1", { className: "mb-8 text-3xl font-bold", children: "HTML Sitemap" }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-8 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "mb-4 text-2xl font-semibold", children: [
          "Blog Posts (",
          posts.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: posts.map((post) => /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("a", { href: post.slug, className: "text-blue-600 underline hover:text-blue-800", children: post.title }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: new Date(post.date).toLocaleDateString() })
        ] }, post.slug)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "mb-4 text-2xl font-semibold", children: [
          "Categories (",
          categories.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: categories.map((category) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: `/category/${getSlug(category)}`, className: "text-blue-600 underline hover:text-blue-800", children: category }) }, category)) }),
        /* @__PURE__ */ jsx("h2", { className: "mb-4 mt-8 text-2xl font-semibold", children: "Pages" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/", className: "text-blue-600 underline hover:text-blue-800", children: "Home" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: `${HOME_URL}/about`, className: "text-blue-600 underline hover:text-blue-800", target: "_blank", rel: "noopener noreferrer", children: "About" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/archives", className: "text-blue-600 underline hover:text-blue-800", children: "Archives" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/featured", className: "text-blue-600 underline hover:text-blue-800", children: "Featured" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/tags", className: "text-blue-600 underline hover:text-blue-800", children: "Tags" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/series", className: "text-blue-600 underline hover:text-blue-800", children: "Series" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 border-t pt-4 text-sm text-gray-500", children: /* @__PURE__ */ jsxs("p", { children: [
      "This sitemap is also available in XML format at",
      " ",
      /* @__PURE__ */ jsx("a", { href: "/sitemap.xml", className: "underline", children: "/sitemap.xml" })
    ] }) })
  ] });
}
export {
  HtmlSitemapPage as component
};
