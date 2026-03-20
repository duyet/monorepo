import { jsxs, jsx } from "react/jsx-runtime";
import { c as cn, n as dateFormat } from "./router-BL7fPxbg.js";
import { I as IsNewPost, a as IsFeatured } from "./PostBadges-DtIPJPGt.js";
function YearPost({ year, posts, className }) {
  if (!posts.length) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className: cn(className), children: [
    /* @__PURE__ */ jsx(
      "h1",
      {
        className: cn(
          "mb-8 font-serif text-5xl font-bold text-neutral-900",
          "sm:text-6xl",
          "md:mb-10 md:text-7xl"
        ),
        children: year
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4", children: posts.map((post) => /* @__PURE__ */ jsxs(
      "article",
      {
        className: "group flex flex-row items-center gap-4 py-1",
        children: [
          /* @__PURE__ */ jsxs(
            "a",
            {
              className: "cursor-pointer text-base text-neutral-800 transition-colors hover:text-neutral-900 hover:underline hover:underline-offset-4",
              href: post.slug,
              children: [
                post.title,
                /* @__PURE__ */ jsx(IsNewPost, { date: post.date }),
                /* @__PURE__ */ jsx(IsFeatured, { featured: post.featured })
              ]
            }
          ),
          /* @__PURE__ */ jsx("hr", { className: "shrink grow border-dotted border-neutral-300" }),
          /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 flex items-center gap-2 text-sm text-neutral-500", children: /* @__PURE__ */ jsx("time", { className: "whitespace-nowrap", children: dateFormat(post.date, "MMM dd") }) })
        ]
      },
      post.slug
    )) })
  ] });
}
export {
  YearPost as Y
};
