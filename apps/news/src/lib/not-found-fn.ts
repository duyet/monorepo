import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { getClientLang, readLangFromCookie } from "./lang";
import type { Lang } from "./types";

/** news_lang cookie (VI default). Unit-testable without Start. */
export function notFoundLangFromCookie(cookieHeader: string | null): Lang {
  return readLangFromCookie(cookieHeader);
}

/**
 * Cookie lang for the 404 document title. Server imports stay inside
 * createIsomorphicFn.server() so the client graph stays clean.
 */
export const loadNotFoundLang = createIsomorphicFn()
  .client((): Lang => getClientLang())
  .server((): Lang =>
    notFoundLangFromCookie(getRequestHeader("cookie") ?? null)
  );
