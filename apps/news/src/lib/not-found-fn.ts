import { createIsomorphicFn } from "@tanstack/react-start";
import {
  getRequestHeader,
  setResponseStatus,
} from "@tanstack/react-start/server";
import { getClientLang, readLangFromCookie } from "./lang";
import type { Lang } from "./types";

/** Pure helper so 404 status + news_lang can be unit-tested without Start. */
export function notFoundLangOnServer(
  cookieHeader: string | null,
  setStatus: (code: number) => void
): Lang {
  setStatus(404);
  return readLangFromCookie(cookieHeader);
}

/**
 * SSR: HTTP 404 + news_lang cookie (VI default).
 * Client nav: cookie only. Server imports are referenced only inside
 * createIsomorphicFn.server() so Vite import-protection can prune them.
 * Do not throw notFound(): that skips this route's head().
 */
export const loadNotFoundLang = createIsomorphicFn()
  .client((): Lang => getClientLang())
  .server((): Lang =>
    notFoundLangOnServer(
      getRequestHeader("cookie") ?? null,
      setResponseStatus
    )
  );
