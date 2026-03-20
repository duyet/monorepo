import { jsxs, jsx } from "react/jsx-runtime";
function RobotsPage() {
  const siteUrl = "https://blog.duyet.net";
  const robotsContent = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/sitemap`;
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-4xl", children: [
    /* @__PURE__ */ jsx("h1", { className: "mb-8 text-3xl font-bold", children: "Robots.txt" }),
    /* @__PURE__ */ jsx("div", { className: "mb-8 rounded-lg bg-gray-100 p-6", children: /* @__PURE__ */ jsx("pre", { className: "whitespace-pre-wrap font-mono text-sm", children: robotsContent }) }),
    /* @__PURE__ */ jsxs("div", { className: "prose max-w-none", children: [
      /* @__PURE__ */ jsx("h2", { children: "What is robots.txt?" }),
      /* @__PURE__ */ jsx("p", { children: "The robots.txt file tells web crawlers which pages or files the crawler can or can not request from your site." }),
      /* @__PURE__ */ jsx("h2", { children: "Our Configuration" }),
      /* @__PURE__ */ jsxs("ul", { children: [
        /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("strong", { children: "User-agent: *" }),
          " - Applies to all web crawlers"
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Allow: /" }),
          " - Allows crawling of all pages"
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Sitemap" }),
          " - Links to our XML and HTML sitemaps"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-8 border-t pt-4 text-sm text-gray-500", children: /* @__PURE__ */ jsxs("p", { children: [
        "This robots.txt is also available in text format at",
        " ",
        /* @__PURE__ */ jsx("a", { href: "/robots.txt", className: "underline", children: "/robots.txt" })
      ] }) })
    ] })
  ] });
}
export {
  RobotsPage as component
};
