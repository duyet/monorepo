import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { c as cn, f as getPostsByAllYear, b as getAllSeries, g as getAllTags, h as duyetUrls, C as Container } from "./router-BL7fPxbg.js";
import { H as Header, c as createDefaultNavigation } from "./index-DlIQT2UV.js";
import "remark-math";
import { Link } from "@tanstack/react-router";
import { A as AbstractShapes, C as ContentCard } from "./ContentCard-BHQW94QK.js";
import { useState, useEffect } from "react";
import { Y as YearPost } from "./YearPost-C3UuWmbo.js";
import "fs";
import "react-dom";
import "lucide-react";
import "next-themes";
import "./PostBadges-DtIPJPGt.js";
function ThinkingAnimation({ className }) {
  return /* @__PURE__ */ jsx("div", { className: cn("animate-pulse", className), children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-0.5 text-sm font-medium text-neutral-600", children: [
    "Thinking",
    /* @__PURE__ */ jsx(
      "span",
      {
        className: "inline-block h-1 w-1 rounded-full bg-neutral-400 animate-bounce [animation-delay:0ms]",
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ jsx(
      "span",
      {
        className: "inline-block h-1 w-1 rounded-full bg-neutral-400 animate-bounce [animation-delay:150ms]",
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ jsx(
      "span",
      {
        className: "inline-block h-1 w-1 rounded-full bg-neutral-400 animate-bounce [animation-delay:300ms]",
        "aria-hidden": "true"
      }
    )
  ] }) });
}
function getPromptForCardType(cardType) {
  if (cardType === "blog") {
    return "Generate a witty description for the blog card that would make someone want to click.";
  }
  return "Generate an engaging description for the featured posts card that highlights the best articles.";
}
function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_DUYET_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.duyet.net";
}
function useCardDescription({
  cardType,
  fallbackDescription
}) {
  const [description, setDescription] = useState(void 0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(void 0);
  useEffect(() => {
    const controller = new AbortController();
    async function fetchDescription() {
      try {
        setIsLoading(true);
        setError(void 0);
        const response = await fetch(`${getApiBaseUrl()}/api/llm/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: getPromptForCardType(cardType)
          }),
          signal: controller.signal
        });
        if (controller.signal.aborted) return;
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        if (controller.signal.aborted) return;
        setDescription(data.description || fallbackDescription);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err);
        setDescription(fallbackDescription);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }
    fetchDescription();
    return () => controller.abort();
  }, [cardType, fallbackDescription]);
  return {
    description,
    isLoading,
    error
  };
}
const colorClasses = {
  terracotta: "bg-terracotta-light text-neutral-900",
  sage: "bg-sage-light text-neutral-900",
  coral: "bg-coral-light text-neutral-900",
  lavender: "bg-lavender-light text-neutral-900"
};
const illustrationColors = {
  terracotta: "text-terracotta",
  sage: "text-sage",
  coral: "text-coral",
  lavender: "text-lavender"
};
function AiFeaturedCard({
  title,
  href,
  category,
  fallbackDescription,
  date,
  color = "terracotta",
  className,
  cardType
}) {
  const { description, isLoading } = useCardDescription({
    cardType,
    fallbackDescription
  });
  const displayDescription = description || fallbackDescription;
  const showThinking = isLoading && !displayDescription;
  const isExternal = href.startsWith("http");
  const sharedClassName = cn(
    "group relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:shadow-lg md:p-12",
    colorClasses[color],
    className
  );
  const inner = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col gap-4", children: [
      category && /* @__PURE__ */ jsx("div", { className: "inline-flex items-center", children: /* @__PURE__ */ jsx("span", { className: "rounded-full bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-wide", children: category }) }),
      /* @__PURE__ */ jsx("h2", { className: "max-w-2xl font-serif text-3xl font-bold leading-tight md:text-4xl", children: title }),
      showThinking ? /* @__PURE__ */ jsx(ThinkingAnimation, {}) : displayDescription ? /* @__PURE__ */ jsx("p", { className: "max-w-xl text-lg leading-relaxed text-neutral-700", children: displayDescription }) : null,
      date && /* @__PURE__ */ jsx("time", { className: "text-sm font-medium text-neutral-600", children: date })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 right-0 h-48 w-48 opacity-30 transition-opacity group-hover:opacity-40 md:h-64 md:w-64", children: /* @__PURE__ */ jsx(
      AbstractShapes,
      {
        className: cn("h-full w-full", illustrationColors[color])
      }
    ) })
  ] });
  if (isExternal) {
    return /* @__PURE__ */ jsx(
      "a",
      {
        href,
        target: "_blank",
        rel: "noopener noreferrer",
        className: sharedClassName,
        children: inner
      }
    );
  }
  return /* @__PURE__ */ jsx(Link, { to: href, className: sharedClassName, children: inner });
}
function HomeCards({ seriesList, topTags }) {
  return /* @__PURE__ */ jsxs("div", { className: "mb-16 flex flex-col gap-6", children: [
    /* @__PURE__ */ jsx(
      AiFeaturedCard,
      {
        title: "Featured Posts",
        href: "/featured",
        category: "Highlights",
        fallbackDescription: "Explore my most popular and impactful articles on data engineering, software architecture, and technology insights.",
        color: "terracotta",
        cardType: "featured"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
      /* @__PURE__ */ jsx(
        ContentCard,
        {
          title: "Explore by Topics",
          href: "/tags",
          category: "Browse",
          description: "Discover content organized by technology, tools, and concepts.",
          tags: topTags,
          color: "oat",
          illustration: "geometric"
        }
      ),
      /* @__PURE__ */ jsx(
        ContentCard,
        {
          title: "Series",
          href: "/series",
          category: "Deep Dives",
          description: "Comprehensive multi-part guides on specific topics and technologies.",
          tags: seriesList.map((s) => s.name),
          color: "sage",
          illustration: "wavy"
        }
      )
    ] })
  ] });
}
function HomePage() {
  const postsByYear = getPostsByAllYear(["slug", "title", "date", "category"]);
  const postCount = Object.values(postsByYear).reduce((acc, yearPosts) => acc + yearPosts.length, 0);
  const years = Object.keys(postsByYear).map(Number);
  const pastYears = (/* @__PURE__ */ new Date()).getFullYear() - Math.min(...years);
  const seriesList = getAllSeries().slice(0, 3);
  const allTags = getAllTags();
  const topTags = Object.entries(allTags).sort(([, a], [, b]) => b - a).slice(0, 5).map(([tag]) => tag);
  return /* @__PURE__ */ jsxs("div", { className: "bg-cream-warm dark:bg-background min-h-screen pb-10", children: [
    /* @__PURE__ */ jsx(Header, { longText: "Data Engineering", urls: duyetUrls, navigationItems: createDefaultNavigation(duyetUrls) }),
    /* @__PURE__ */ jsxs(Container, { children: [
      /* @__PURE__ */ jsx("div", { className: "mb-12 text-center", children: /* @__PURE__ */ jsxs("p", { className: "text-lg leading-relaxed text-neutral-700", children: [
        "Lists all",
        " ",
        /* @__PURE__ */ jsxs("strong", { className: "font-semibold text-neutral-900", children: [
          postCount,
          " posts"
        ] }),
        " ",
        "of the past ",
        pastYears,
        " years of blogging. You can jump straight to the",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/feed", className: "text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-600", children: "/feed" }),
        " ",
        "for latest posts, also explore",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/tags", className: "text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-600", children: "by the topics" }),
        " ",
        "or",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/featured", className: "text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-600", children: "my featured posts" }),
        "."
      ] }) }),
      /* @__PURE__ */ jsx(HomeCards, { seriesList, topTags }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-12", children: Object.entries(postsByYear).sort(([a], [b]) => Number.parseInt(b, 10) - Number.parseInt(a, 10)).map(([year, posts]) => /* @__PURE__ */ jsx(YearPost, { year: Number.parseInt(year, 10), posts }, year)) })
    ] })
  ] });
}
export {
  HomePage as component
};
