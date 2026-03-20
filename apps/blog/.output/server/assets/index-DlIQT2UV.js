import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { c as cn, h as duyetUrls, I as Icons, L as Logo, t as duyetProfile, C as Container } from "./router-BL7fPxbg.js";
import "remark-math";
import { X, Menu as Menu$1 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
function createDefaultNavigation(urls) {
  return [
    { name: "Home", href: urls.apps.home },
    { name: "About", href: `${urls.apps.home}/about` },
    { name: "Photos", href: urls.apps.photos },
    { name: "Insights", href: urls.apps.insights },
    { name: "CV", href: urls.apps.cv }
  ];
}
({ href: duyetUrls.apps.home });
({ href: `${duyetUrls.apps.home}/about` });
({ href: duyetUrls.apps.insights });
({ href: duyetUrls.apps.photos });
({
  href: `${duyetUrls.apps.blog}/archives`
});
({ href: duyetUrls.apps.blog });
({ href: duyetUrls.apps.blog });
({ href: duyetUrls.apps.cv });
({ href: `${duyetUrls.apps.blog}/search` });
function Menu({
  urls = duyetUrls,
  className,
  navigationItems,
  onItemClick
}) {
  const items = navigationItems ?? createDefaultNavigation(urls);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "flex flex-row gap-3 sm:gap-5 flex-wrap items-center",
        className
      ),
      children: items.map(
        ({ name, href }) => href.startsWith("http") ? /* @__PURE__ */ jsx(
          "a",
          {
            href,
            onClick: onItemClick,
            className: "text-sm sm:text-base text-neutral-900 dark:text-neutral-100 hover:underline underline-offset-8",
            children: name
          },
          name
        ) : /* @__PURE__ */ jsx(
          Link,
          {
            to: href,
            onClick: onItemClick,
            className: "text-sm sm:text-base text-neutral-900 dark:text-neutral-100 hover:underline underline-offset-8",
            children: name
          },
          name
        )
      )
    }
  );
}
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
    import("@clerk/clerk-react").then((mod) => setClerkModule(mod)).catch(() => {
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
function HeaderBranding({
  homeUrl,
  shortText,
  longText,
  logo = true,
  center = false,
  className
}) {
  const linkClassName = cn(
    "font-serif text-xl sm:text-2xl font-normal text-neutral-900 dark:text-neutral-100",
    className
  );
  const textContent = shortText && longText ? /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { className: "block sm:hidden", children: shortText }),
    /* @__PURE__ */ jsx(
      "span",
      {
        className: cn("hidden sm:block", center && "md:text-7xl md:mt-5"),
        children: longText
      }
    )
  ] }) : /* @__PURE__ */ jsx("span", { children: shortText || longText });
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-row items-center gap-2"), children: [
    logo && /* @__PURE__ */ jsx(
      Logo,
      {
        className: center ? "md:flex-col" : "",
        logoClassName: center ? "md:w-40 md:h-40" : ""
      }
    ),
    homeUrl.startsWith("http") ? /* @__PURE__ */ jsx("a", { href: homeUrl, className: linkClassName, children: textContent }) : /* @__PURE__ */ jsx(Link, { to: homeUrl, className: linkClassName, children: textContent })
  ] });
}
function Header({
  profile = duyetProfile,
  urls = duyetUrls,
  logo = true,
  shortText,
  longText,
  center = false,
  navigationItems,
  className,
  containerClassName
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const displayShortText = shortText ?? profile.personal.shortName;
  const displayLongText = longText ?? profile.personal.title;
  return /* @__PURE__ */ jsx(
    "header",
    {
      className: cn(
        "py-10",
        center ? "md:flex md:justify-center md:my-10" : "",
        className
      ),
      children: /* @__PURE__ */ jsxs(Container, { className: cn("mb-0", containerClassName), children: [
        /* @__PURE__ */ jsxs(
          "nav",
          {
            className: cn(
              "flex items-center flex-wrap justify-between transition-all gap-4",
              center && "md:flex-col md:gap-10"
            ),
            children: [
              /* @__PURE__ */ jsx(
                HeaderBranding,
                {
                  homeUrl: urls.apps.home,
                  shortText: displayShortText,
                  longText: displayLongText,
                  logo,
                  center
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "hidden md:flex flex-row gap-3 sm:gap-5 flex-wrap items-center", children: [
                /* @__PURE__ */ jsx(
                  Menu,
                  {
                    urls,
                    navigationItems,
                    className: "gap-3 sm:gap-5"
                  }
                ),
                /* @__PURE__ */ jsx(AuthButtons, { urls })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 md:hidden", children: [
                /* @__PURE__ */ jsx(AuthButtons, { urls }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setMobileMenuOpen((prev) => !prev),
                    "aria-label": mobileMenuOpen ? "Close menu" : "Open menu",
                    "aria-expanded": mobileMenuOpen,
                    className: "p-1 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 rounded",
                    children: mobileMenuOpen ? /* @__PURE__ */ jsx(X, { className: "size-5" }) : /* @__PURE__ */ jsx(Menu$1, { className: "size-5" })
                  }
                )
              ] })
            ]
          }
        ),
        mobileMenuOpen && /* @__PURE__ */ jsx("div", { className: "md:hidden border-t border-neutral-200 dark:border-neutral-700 mt-4 pt-4", children: /* @__PURE__ */ jsx(
          Menu,
          {
            urls,
            navigationItems,
            className: "flex-col gap-3",
            onItemClick: () => setMobileMenuOpen(false)
          }
        ) })
      ] })
    }
  );
}
export {
  Header as H,
  createDefaultNavigation as c
};
