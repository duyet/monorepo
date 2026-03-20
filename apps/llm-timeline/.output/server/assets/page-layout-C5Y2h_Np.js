import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Sun, Moon, Scale, Lock, Download } from "lucide-react";
import { useTheme } from "next-themes";
import { l as lastSynced } from "./router-CuHdCRg8.js";
const Github = (props) => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 438.549 438.549", ...props, children: /* @__PURE__ */ jsx(
  "path",
  {
    fill: "currentColor",
    d: "M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
  }
) });
const UserEmpty = (props) => /* @__PURE__ */ jsxs(
  "svg",
  {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
    children: [
      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "8", r: "4" }),
      /* @__PURE__ */ jsx("path", { d: "M20 21c0-4.4-3.6-8-8-8s-8 3.6-8 8" })
    ]
  }
);
const Icons = {
  Github,
  UserEmpty
};
let clerkProviderMounted = false;
function AuthButtons({
  urls,
  className = "",
  signInClassName = "h-8 w-8 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors",
  avatarSize = "h-8 w-8",
  signedInContent = null,
  signedOutContent = null,
  wrapWithProvider = true
} = {}) {
  const [clerkModule, setClerkModule] = useState(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const isOwner = useRef(false);
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);
  useEffect(() => {
    if (clerkProviderMounted) return;
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!key) return;
    clerkProviderMounted = true;
    isOwner.current = true;
    import("./index-DJQ_Zslp.js").then((mod) => setClerkModule(mod)).catch(() => {
    });
    return () => {
      if (isOwner.current) {
        clerkProviderMounted = false;
      }
    };
  }, []);
  if (!clerkModule || !isOwner.current) {
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: `${signInClassName} ${className}`.trim(),
        "aria-label": "Sign in",
        children: /* @__PURE__ */ jsx(Icons.UserEmpty, { className: "h-4 w-4" })
      }
    );
  }
  const { ClerkProvider, SignedOut, SignedIn, SignInButton, UserButton } = clerkModule;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey || !ClerkProvider || !SignedOut || !SignedIn || !SignInButton || !UserButton) {
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: `${signInClassName} ${className}`.trim(),
        "aria-label": "Sign in (Unavailable)",
        children: /* @__PURE__ */ jsx(Icons.UserEmpty, { className: "h-4 w-4" })
      }
    );
  }
  const redirectUrl = currentUrl || urls?.apps?.blog || "https://blog.duyet.net";
  const content = /* @__PURE__ */ jsxs(Fragment, { children: [
    signedOutContent && /* @__PURE__ */ jsx(SignedOut, { children: signedOutContent }),
    signedInContent && /* @__PURE__ */ jsx(SignedIn, { children: signedInContent }),
    /* @__PURE__ */ jsx(SignedOut, { children: /* @__PURE__ */ jsx(SignInButton, { mode: "modal", redirectUrl, children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: `${signInClassName} ${className}`.trim(),
        "aria-label": "Sign in",
        children: /* @__PURE__ */ jsx(Icons.UserEmpty, { className: "h-4 w-4" })
      }
    ) }) }),
    /* @__PURE__ */ jsx(SignedIn, { children: /* @__PURE__ */ jsx(
      UserButton,
      {
        appearance: {
          elements: {
            avatarBox: avatarSize
          }
        },
        afterSignOutUrl: redirectUrl
      }
    ) })
  ] });
  return wrapWithProvider ? /* @__PURE__ */ jsx(ClerkProvider, { publishableKey, children: content }) : content;
}
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      className: "rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 text-neutral-600 dark:text-neutral-400 dark:border-white/10 dark:bg-white/5 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2",
      "aria-label": "Toggle theme",
      children: resolvedTheme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Moon, { className: "h-4 w-4" })
    }
  );
}
function PageLayout({ children, description }) {
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#fbf7f0] dark:bg-[#1f1f1f]", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 overflow-hidden", children: [
    /* @__PURE__ */ jsx("header", { className: "mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "animate-fade-in", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 animate-fade-in", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-2 w-2 rounded-full bg-emerald-500" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-mono tracking-wide uppercase text-neutral-500 dark:text-neutral-400", children: "Interactive LLM Release History" })
        ] }),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/",
            className: "group inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2 rounded",
            children: /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight transition-opacity group-hover:opacity-80 font-[family-name:var(--font-display)]", children: "LLM Timeline" })
          }
        ),
        description && /* @__PURE__ */ jsx("p", { className: "mt-3 text-base text-neutral-500 dark:text-neutral-400 max-w-xl animate-fade-in animate-fade-in-delay-1", children: description })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 animate-fade-in animate-fade-in-delay-2", children: [
        /* @__PURE__ */ jsx(ThemeToggle, {}),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/compare",
            search: { models: "" },
            className: "rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 text-neutral-600 dark:text-neutral-400 dark:border-white/10 dark:bg-white/5 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm",
            "aria-label": "Compare models",
            children: /* @__PURE__ */ jsx(Scale, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://github.com/duyet/monorepo",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 text-neutral-600 dark:text-neutral-400 dark:border-white/10 dark:bg-white/5 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm",
            "aria-label": "GitHub",
            children: /* @__PURE__ */ jsx(Icons.Github, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsx(
          AuthButtons,
          {
            className: "rounded-lg p-2.5",
            signInClassName: "rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm",
            signedInContent: /* @__PURE__ */ jsx(
              "a",
              {
                href: "/data.json",
                download: "llm-timeline-data.json",
                className: "rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 text-neutral-600 dark:text-neutral-400 dark:border-white/10 dark:bg-white/5 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm",
                title: "Download all model data as JSON",
                "aria-label": "Download data",
                children: /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" })
              }
            ),
            signedOutContent: /* @__PURE__ */ jsx(
              "button",
              {
                disabled: true,
                className: "rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 text-neutral-600 dark:text-neutral-400 dark:border-white/10 dark:bg-white/5 opacity-50 cursor-not-allowed",
                title: "Sign in to download data",
                "aria-label": "Download requires sign in",
                children: /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4" })
              }
            )
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "mb-8 h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-white/10 to-transparent animate-fade-in animate-fade-in-delay-2" }),
    /* @__PURE__ */ jsx("div", { className: "animate-fade-in animate-fade-in-delay-3", children }),
    /* @__PURE__ */ jsxs("footer", { className: "mt-16 border-t border-neutral-200 dark:border-white/10 pt-8 pb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 text-sm text-neutral-500 dark:text-neutral-400", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "Built by",
          " ",
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://duyet.net",
              className: "font-medium text-neutral-900 dark:text-neutral-100 underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-2 transition-all hover:text-neutral-700 dark:hover:text-white",
              children: "duyet"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "font-[family-name:var(--font-mono)] text-xs", children: [
          "Updated ",
          lastSynced
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-400 dark:text-neutral-500", children: [
        /* @__PURE__ */ jsx("span", { className: "text-neutral-300 dark:text-neutral-600", children: "Data sources:" }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://huggingface.co/models",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-2 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300",
            children: "Hugging Face"
          }
        ),
        /* @__PURE__ */ jsx("span", { children: "·" }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://paperswithcode.com",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-2 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300",
            children: "PapersWithCode"
          }
        ),
        /* @__PURE__ */ jsx("span", { children: "·" }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://en.wikipedia.org/wiki/Large_language_model",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-2 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300",
            children: "Wikipedia"
          }
        ),
        /* @__PURE__ */ jsx("span", { children: "·" }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://github.com",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-2 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300",
            children: "GitHub"
          }
        ),
        /* @__PURE__ */ jsx("span", { children: "·" }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://epoch.ai/data",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-2 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300",
            children: "Epoch AI"
          }
        ),
        /* @__PURE__ */ jsx("span", { children: "·" }),
        /* @__PURE__ */ jsx("span", { className: "text-neutral-400 dark:text-neutral-500", children: "Official announcements" }),
        /* @__PURE__ */ jsx("span", { children: "·" }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/llms.txt",
            className: "underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-2 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300",
            children: "llms.txt"
          }
        ),
        /* @__PURE__ */ jsx("span", { children: "·" }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/rss.xml",
            className: "underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-2 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300",
            children: "RSS"
          }
        )
      ] })
    ] })
  ] }) });
}
export {
  PageLayout as P
};
