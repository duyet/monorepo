import { jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { P as PageLayout } from "./page-layout-CEU_p7x_.js";
import { o as organizations, g as getSlug } from "./router-Dyrqdy-I.js";
import "react";
import "lucide-react";
import "next-themes";
import "fs";
function OrgIndexPage() {
  return /* @__PURE__ */ jsx(PageLayout, { description: "Browse LLM models by organization", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4", children: organizations.map((org) => /* @__PURE__ */ jsx(Link, { to: "/org/$slug", params: {
    slug: getSlug(org)
  }, className: "rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2", children: org }, org)) }) });
}
export {
  OrgIndexPage as component
};
