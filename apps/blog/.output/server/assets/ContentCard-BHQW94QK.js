import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { c as cn } from "./router-BL7fPxbg.js";
import { Link } from "@tanstack/react-router";
function AbstractShapes({ className = "" }) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      viewBox: "0 0 200 200",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M50,80 Q60,70 70,80 T90,80",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            fill: "none",
            opacity: "0.6"
          }
        ),
        /* @__PURE__ */ jsx(
          "circle",
          {
            cx: "140",
            cy: "60",
            r: "20",
            stroke: "currentColor",
            strokeWidth: "2",
            fill: "none",
            opacity: "0.5"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M30,120 L50,140 L70,120 Z",
            stroke: "currentColor",
            strokeWidth: "2",
            fill: "none",
            opacity: "0.4"
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: "120",
            y: "120",
            width: "40",
            height: "40",
            rx: "8",
            stroke: "currentColor",
            strokeWidth: "2",
            fill: "none",
            opacity: "0.5"
          }
        )
      ]
    }
  );
}
function WavyLines({ className = "" }) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      viewBox: "0 0 200 120",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M0,40 Q50,20 100,40 T200,40",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            fill: "none",
            opacity: "0.5"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M0,70 Q50,50 100,70 T200,70",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            fill: "none",
            opacity: "0.4"
          }
        )
      ]
    }
  );
}
function GeometricPattern({ className = "" }) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      viewBox: "0 0 200 200",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsxs("g", { opacity: "0.3", children: [
          /* @__PURE__ */ jsx("circle", { cx: "50", cy: "50", r: "8", fill: "currentColor" }),
          /* @__PURE__ */ jsx("circle", { cx: "100", cy: "30", r: "6", fill: "currentColor" }),
          /* @__PURE__ */ jsx("circle", { cx: "150", cy: "60", r: "10", fill: "currentColor" }),
          /* @__PURE__ */ jsx("circle", { cx: "80", cy: "120", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ jsx("circle", { cx: "140", cy: "140", r: "9", fill: "currentColor" })
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M40,100 L60,80 L80,100 L60,120 Z",
            stroke: "currentColor",
            strokeWidth: "1.5",
            fill: "none",
            opacity: "0.4"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M120,90 L140,110 L160,90",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            fill: "none",
            opacity: "0.5"
          }
        )
      ]
    }
  );
}
function OrganicBlob({ className = "" }) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      viewBox: "0 0 200 200",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      children: [
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M100,30 C130,30 160,50 170,80 C180,110 170,140 150,160 C130,180 110,190 80,180 C50,170 30,150 25,120 C20,90 40,50 70,35 C80,30 90,30 100,30 Z",
            stroke: "currentColor",
            strokeWidth: "2",
            fill: "none",
            opacity: "0.4"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M100,60 Q120,60 130,80 T140,120",
            stroke: "currentColor",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            fill: "none",
            opacity: "0.5"
          }
        )
      ]
    }
  );
}
const colorClasses = {
  ivory: "bg-ivory text-neutral-900",
  oat: "bg-oat-light text-neutral-900",
  cream: "bg-cream text-neutral-900",
  cactus: "bg-cactus-light text-neutral-900",
  sage: "bg-sage-light text-neutral-900",
  lavender: "bg-lavender-light text-neutral-900",
  terracotta: "bg-terracotta-light text-neutral-900",
  coral: "bg-coral-light text-neutral-900",
  white: "border border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300"
};
const illustrationColorClasses = {
  ivory: "text-neutral-400",
  oat: "text-neutral-400",
  cream: "text-neutral-400",
  cactus: "text-cactus",
  sage: "text-sage",
  lavender: "text-lavender",
  terracotta: "text-terracotta",
  coral: "text-coral",
  white: "text-neutral-400"
};
const illustrations = {
  wavy: WavyLines,
  geometric: GeometricPattern,
  blob: OrganicBlob,
  none: null
};
const titleSizeClasses = {
  featured: "text-2xl md:text-3xl",
  default: "text-xl md:text-2xl"
};
const descriptionSizeClasses = {
  featured: "text-base md:text-lg",
  default: "text-sm"
};
function ContentCardInner({
  title,
  category,
  description,
  tags,
  date,
  color,
  illustration = "none",
  featured = false
}) {
  const IllustrationComponent = illustrations[illustration];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "relative z-10 flex flex-col gap-3",
          !color || color === "white" ? "min-h-[120px]" : "min-h-[200px]"
        ),
        children: [
          category && /* @__PURE__ */ jsx("div", { className: "inline-flex items-center", children: /* @__PURE__ */ jsx("span", { className: "rounded-full bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-wide", children: category }) }),
          /* @__PURE__ */ jsx(
            "h3",
            {
              className: cn(
                "font-serif font-bold leading-snug",
                featured ? titleSizeClasses.featured : titleSizeClasses.default
              ),
              children: title
            }
          ),
          description && /* @__PURE__ */ jsx(
            "p",
            {
              className: cn(
                "line-clamp-3 leading-relaxed text-neutral-700",
                featured ? descriptionSizeClasses.featured : descriptionSizeClasses.default
              ),
              children: description
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "mt-auto flex flex-col gap-2", children: [
            tags && tags.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: tags.map((tag) => /* @__PURE__ */ jsx(
              "span",
              {
                className: "rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium text-neutral-700",
                children: tag
              },
              tag
            )) }),
            date && /* @__PURE__ */ jsx("time", { className: "text-xs font-medium text-neutral-600", children: date })
          ] })
        ]
      }
    ),
    IllustrationComponent && /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 right-0 h-32 w-32 opacity-20 transition-opacity group-hover:opacity-30", children: /* @__PURE__ */ jsx(
      IllustrationComponent,
      {
        className: cn(
          "h-full w-full",
          color && illustrationColorClasses[color]
        )
      }
    ) })
  ] });
}
function ContentCard({
  title,
  href,
  category,
  description,
  tags,
  date,
  color,
  illustration = "none",
  className,
  featured = false
}) {
  const isExternal = href.startsWith("http");
  const sharedClassName = cn(
    "group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-amber-400 dark:focus:ring-offset-neutral-900",
    color && colorClasses[color],
    featured && "sm:col-span-2 lg:col-span-2",
    className
  );
  const ariaLabel = isExternal ? `${title} (opens in new tab)` : title;
  const inner = /* @__PURE__ */ jsx(
    ContentCardInner,
    {
      title,
      category,
      description,
      tags,
      date,
      color,
      illustration,
      featured
    }
  );
  if (isExternal) {
    return /* @__PURE__ */ jsx(
      "a",
      {
        href,
        target: "_blank",
        rel: "noopener noreferrer",
        className: sharedClassName,
        "aria-label": ariaLabel,
        children: inner
      }
    );
  }
  return /* @__PURE__ */ jsx(Link, { to: href, className: sharedClassName, "aria-label": ariaLabel, children: inner });
}
export {
  AbstractShapes as A,
  ContentCard as C
};
