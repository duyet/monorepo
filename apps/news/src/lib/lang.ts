import type { Lang } from "./types";

const COOKIE = "news_lang";

export function readLangFromCookie(cookieHeader: string | null): Lang {
  const m = cookieHeader?.match(/(?:^|;\s*)news_lang=(vi|en)/);
  // Default to Vietnamese when no explicit choice was made
  return m?.[1] === "en" ? "en" : "vi";
}

export function getClientLang(): Lang {
  if (typeof document === "undefined") return "vi";
  return readLangFromCookie(document.cookie);
}

export function setClientLang(lang: Lang) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
  try {
    localStorage.setItem(COOKIE, lang);
  } catch {
    // localStorage unavailable (private mode) — cookie is enough
  }
}

export function timeAgo(
  epochSec: number,
  now = Date.now(),
  lang: Lang = "en"
): string {
  const diff = Math.max(0, Math.floor(now / 1000) - epochSec);
  if (lang === "vi") {
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  }
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const CATEGORY_LABELS_VI: Record<string, string> = {
  Regulation: "Chính sách",
  Research: "Nghiên cứu",
  Releases: "Phát hành",
  Funding: "Gọi vốn",
  Legal: "Pháp lý",
  Industry: "Doanh nghiệp",
  Products: "Sản phẩm",
  Infra: "Hạ tầng",
};

export function categoryLabel(name: string, lang: Lang): string {
  if (lang !== "vi") return name;
  return CATEGORY_LABELS_VI[name] ?? name;
}

const STATUS_LABELS_VI: Record<string, string> = {
  new: "Mới",
  published: "Đã đăng",
  rejected: "Từ chối",
  pending: "Đang chờ",
  accepted: "Đã duyệt",
};

/** Localizes an items.status value (used by /system's "items by status"
 * chart) — unrecognized statuses fall back to the raw DB value rather than
 * guessing a translation. */
export function statusLabel(name: string, lang: Lang): string {
  if (lang !== "vi") return name;
  return STATUS_LABELS_VI[name] ?? name;
}

export function formatDayHeading(date: string, lang: Lang): string {
  const d = new Date(`${date}T00:00:00Z`);
  return d.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
