import type { Lang } from "./types";

const COOKIE = "news_lang";

export function readLangFromCookie(cookieHeader: string | null): Lang {
  const m = cookieHeader?.match(/(?:^|;\s*)news_lang=(vi|en)/);
  return m?.[1] === "vi" ? "vi" : "en";
}

export function getClientLang(): Lang {
  if (typeof document === "undefined") return "en";
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

export function timeAgo(epochSec: number, now = Date.now()): string {
  const diff = Math.max(0, Math.floor(now / 1000) - epochSec);
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
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
