import {
  getRequestHeader,
  setResponseStatus,
} from "@tanstack/react-start/server";
import { readLangFromCookie } from "./lang";
import type { Lang } from "./types";

/**
 * Own the HTTP 404 and resolve copy language from the news_lang cookie.
 * Do not throw notFound() — that skips this route's head().
 *
 * Lives in a `.server.ts` module so Vite/Start never put
 * `@tanstack/react-start/server` in the client graph.
 */
export function notFoundLang(): Lang {
  setResponseStatus(404);
  return readLangFromCookie(getRequestHeader("cookie") ?? null);
}
