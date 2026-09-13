/** Non-blocking font stylesheets. Do not `@import` these from CSS. */
const GEIST =
  "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap";

const GEIST_AND_DISPLAY =
  "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Libertinus+Serif:ital,wght@0,400;0,600;1,400&family=Noto+Serif:ital,wght@0,400;0,600;1,400&display=swap";

export function duyetFontHeadLinks(opts?: { display?: boolean }): Array<{
  rel: string;
  href: string;
  crossOrigin?: "anonymous";
}> {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href: opts?.display ? GEIST_AND_DISPLAY : GEIST,
    },
  ];
}
