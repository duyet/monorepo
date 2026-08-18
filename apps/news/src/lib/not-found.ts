import type { Lang } from "./types";

export interface NotFoundCopy {
  heading: string;
  body: string;
  home: string;
  documentTitle: string;
}

/** Localized 404 chrome. Reuses existing UI strings; does not invent new ones. */
export function notFoundCopy(lang: Lang): NotFoundCopy {
  if (lang === "vi") {
    return {
      heading: "404",
      body: "Không tìm thấy trang.",
      home: "Về trang chính",
      documentTitle: "Không tìm thấy trang | AI News",
    };
  }
  return {
    heading: "404",
    body: "Page not found",
    home: "Go home",
    documentTitle: "Page not found | AI News",
  };
}
