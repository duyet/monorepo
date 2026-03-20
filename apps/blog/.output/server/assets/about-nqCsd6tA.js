import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
function BlogIcon() {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width: "80",
      height: "80",
      viewBox: "0 0 80 80",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: "24",
            y: "20",
            width: "32",
            height: "40",
            rx: "6",
            stroke: "currentColor",
            strokeWidth: "2.5",
            fill: "none"
          }
        ),
        /* @__PURE__ */ jsx(
          "line",
          {
            x1: "32",
            y1: "32",
            x2: "48",
            y2: "32",
            stroke: "currentColor",
            strokeWidth: "2.5",
            strokeLinecap: "round"
          }
        ),
        /* @__PURE__ */ jsx(
          "line",
          {
            x1: "32",
            y1: "40",
            x2: "48",
            y2: "40",
            stroke: "currentColor",
            strokeWidth: "2.5",
            strokeLinecap: "round"
          }
        ),
        /* @__PURE__ */ jsx(
          "line",
          {
            x1: "32",
            y1: "48",
            x2: "42",
            y2: "48",
            stroke: "currentColor",
            strokeWidth: "2.5",
            strokeLinecap: "round"
          }
        )
      ]
    }
  );
}
function GithubIcon() {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width: "80",
      height: "80",
      viewBox: "0 0 80 80",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ jsx(
          "circle",
          {
            cx: "40",
            cy: "38",
            r: "18",
            stroke: "currentColor",
            strokeWidth: "2.5",
            fill: "none"
          }
        ),
        /* @__PURE__ */ jsx("circle", { cx: "33", cy: "35", r: "2.5", fill: "currentColor" }),
        /* @__PURE__ */ jsx("circle", { cx: "47", cy: "35", r: "2.5", fill: "currentColor" }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M32 48C32 48 34 52 40 52C46 52 48 48 48 48",
            stroke: "currentColor",
            strokeWidth: "2.5",
            strokeLinecap: "round"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M28 44V50C28 52 26 54 24 54",
            stroke: "currentColor",
            strokeWidth: "2.5",
            strokeLinecap: "round"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M52 44V50C52 52 54 54 56 54",
            stroke: "currentColor",
            strokeWidth: "2.5",
            strokeLinecap: "round"
          }
        )
      ]
    }
  );
}
function LinkedInIcon() {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width: "80",
      height: "80",
      viewBox: "0 0 80 80",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: "22",
            y: "22",
            width: "36",
            height: "36",
            rx: "8",
            stroke: "currentColor",
            strokeWidth: "2.5",
            fill: "none"
          }
        ),
        /* @__PURE__ */ jsx("circle", { cx: "32", cy: "34", r: "3", fill: "currentColor" }),
        /* @__PURE__ */ jsx("rect", { x: "28", y: "40", width: "8", height: "14", rx: "1.5", fill: "currentColor" }),
        /* @__PURE__ */ jsx("rect", { x: "40", y: "40", width: "8", height: "14", rx: "1.5", fill: "currentColor" }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M44 40V38C44 36 45 34 48 34C51 34 52 36 52 38V54",
            stroke: "currentColor",
            strokeWidth: "3",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            fill: "none"
          }
        )
      ]
    }
  );
}
function ResumeIcon() {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width: "80",
      height: "80",
      viewBox: "0 0 80 80",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: "24",
            y: "16",
            width: "32",
            height: "48",
            rx: "6",
            stroke: "currentColor",
            strokeWidth: "2.5",
            fill: "none"
          }
        ),
        /* @__PURE__ */ jsx(
          "circle",
          {
            cx: "40",
            cy: "30",
            r: "6",
            stroke: "currentColor",
            strokeWidth: "2.5",
            fill: "none"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M31 46C31 42 34 40 40 40C46 40 49 42 49 46",
            stroke: "currentColor",
            strokeWidth: "2.5",
            strokeLinecap: "round"
          }
        ),
        /* @__PURE__ */ jsx(
          "line",
          {
            x1: "32",
            y1: "54",
            x2: "48",
            y2: "54",
            stroke: "currentColor",
            strokeWidth: "2.5",
            strokeLinecap: "round"
          }
        )
      ]
    }
  );
}
function About() {
  const links = [{
    icon: ResumeIcon,
    title: "Resume",
    description: "Experience building scalable data infrastructure and leading engineering teams.",
    url: "https://cv.duyet.net",
    color: "bg-orange-100/50"
  }, {
    icon: GithubIcon,
    title: "GitHub",
    description: "Open source contributions and personal projects in Python, Rust, and TypeScript.",
    url: "https://github.com/duyet",
    color: "bg-purple-100/50"
  }, {
    icon: LinkedInIcon,
    title: "LinkedIn",
    description: "Professional network and career highlights in data engineering.",
    url: "https://linkedin.com/in/duyet",
    color: "bg-blue-100/50"
  }, {
    icon: BlogIcon,
    title: "Blog Home",
    description: "Technical writings on data engineering, distributed systems, and open source.",
    url: "/",
    color: "bg-amber-100/60"
  }];
  const skills = [{
    name: "Python",
    link: "https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=python"
  }, {
    name: "Rust",
    link: "https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=rust"
  }, {
    name: "Javascript",
    link: "https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=javascript"
  }, {
    name: "Spark"
  }, {
    name: "Airflow",
    link: "https://blog.duyet.net/tag/airflow/"
  }, {
    name: "AWS"
  }, {
    name: "GCP"
  }];
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-neutral-50", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 py-16 sm:py-24", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-12 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "mb-6 font-serif text-5xl font-normal text-neutral-900 sm:text-6xl", children: "About" }),
      /* @__PURE__ */ jsxs("p", { className: "mx-auto max-w-3xl text-lg leading-relaxed text-neutral-700", children: [
        /* @__PURE__ */ jsx("strong", { className: "font-semibold text-neutral-900", children: "Data Engineer" }),
        " ",
        "with 6+ years of experience. I am confident in my knowledge of Data Engineering concepts, best practices and state-of-the-art data and Cloud technologies."
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4", children: links.map((link, index) => {
      const Icon = link.icon;
      return /* @__PURE__ */ jsxs(Link, { to: link.url.startsWith("http") ? void 0 : link.url, href: link.url.startsWith("http") ? link.url : void 0, target: link.url.startsWith("http") ? "_blank" : void 0, rel: link.url.startsWith("http") ? "noopener noreferrer" : void 0, className: `group flex flex-col p-10 ${link.color} rounded-3xl transition-transform duration-200 hover:scale-[1.02]`, children: [
        /* @__PURE__ */ jsx("div", { className: "mb-8 text-neutral-800", children: /* @__PURE__ */ jsx(Icon, {}) }),
        /* @__PURE__ */ jsx("h3", { className: "mb-3 text-xl font-medium text-neutral-900", children: link.title }),
        /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-neutral-700", children: link.description })
      ] }, index);
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-3xl bg-stone-100/70 p-8 sm:p-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-6 font-serif text-3xl font-normal text-neutral-900", children: "Skills & Stacks" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3", children: skills.map(({
        name,
        link
      }) => /* @__PURE__ */ jsx("span", { className: "inline-block rounded-full bg-neutral-50 px-5 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100", children: link ? /* @__PURE__ */ jsx("a", { href: link, target: "_blank", rel: "noopener noreferrer", className: "hover:text-neutral-900", children: name }) : name }, name)) })
    ] })
  ] }) });
}
export {
  About as component
};
