import { createServerFn } from "@tanstack/react-start";
import {
  getRequestHeader,
  setResponseHeader,
  setResponseStatus,
} from "@tanstack/react-start/server";
import { readLangFromCookie } from "./lang";
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
 * Runs on the server (RPC from client nav). setResponseStatus only sticks
 * from createServerFn, not from an isomorphic loader body.
 * Do not throw notFound(): that skips this route's head().
 */
export const loadNotFoundLang = createServerFn({ method: "GET" }).handler(
  (): Lang => {
    setResponseHeader("Cache-Control", "private, no-store");
    return notFoundLangOnServer(
      getRequestHeader("cookie") ?? null,
      setResponseStatus
    );
  }
);
