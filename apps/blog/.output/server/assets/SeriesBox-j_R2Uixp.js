import { jsxs, jsx } from "react/jsx-runtime";
import { c as cn } from "./router-BL7fPxbg.js";
import { NewspaperIcon } from "lucide-react";
function SeriesBox({
  series,
  current,
  className
}) {
  if (!series) return null;
  const { name, posts } = series;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "bg-oat dark:bg-claude-gray-800 rounded-3xl p-8 md:p-12",
        className
      ),
      children: [
        /* @__PURE__ */ jsxs("h2", { className: "mb-8 flex flex-row items-center gap-3 font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100 md:text-3xl", children: [
          /* @__PURE__ */ jsx(NewspaperIcon, { size: 28, strokeWidth: 2 }),
          "Series:",
          " ",
          /* @__PURE__ */ jsx(
            "a",
            {
              className: "underline-offset-4 hover:underline",
              href: `/series/${series.slug}`,
              children: name
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-2", children: posts.map(({ slug, title, excerpt }, i) => {
          const isCurrent = current === slug;
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: cn(
                "flex items-center gap-6 rounded-2xl p-4 transition-all",
                isCurrent ? "bg-white dark:bg-claude-gray-700" : ""
              ),
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: cn(
                      "font-serif text-5xl font-bold md:text-6xl",
                      "text-neutral-900 dark:text-neutral-100"
                    ),
                    children: i + 1
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                  isCurrent ? /* @__PURE__ */ jsx("span", { className: "line-clamp-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100", children: title }) : /* @__PURE__ */ jsx(
                    "a",
                    {
                      className: "line-clamp-1 text-lg font-medium text-neutral-800 dark:text-neutral-200 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 hover:underline hover:underline-offset-4",
                      href: slug,
                      children: title
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      className: cn(
                        "line-clamp-1 text-sm",
                        isCurrent ? "text-neutral-700 dark:text-neutral-300" : "text-neutral-600 dark:text-neutral-400"
                      ),
                      children: excerpt
                    }
                  )
                ] })
              ]
            },
            slug
          );
        }) })
      ]
    }
  );
}
export {
  SeriesBox as S
};
