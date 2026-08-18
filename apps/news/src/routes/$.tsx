import { createFileRoute } from "@tanstack/react-router";
import { NotFoundPage } from "../components/NotFoundPage";
import { getClientLang, readLangFromCookie } from "../lib/lang";
import { notFoundCopy } from "../lib/not-found";
import { notFoundHead } from "../lib/seo";
import type { Lang } from "../lib/types";

async function notFoundLang(): Promise<Lang> {
  if (typeof window !== "undefined") return getClientLang();
  try {
    const { getRequestHeader, setResponseStatus } = await import(
      "@tanstack/react-start/server"
    );
    // Own the 404 without throw notFound() — that skips this route's head().
    setResponseStatus(404);
    return readLangFromCookie(getRequestHeader("cookie") ?? null);
  } catch {
    return "vi";
  }
}

// Catch-all owns head() so the FIRST <title> is the localized 404 title.
// Do not throw notFound() here: TanStack skips head() when beforeLoad throws.
// Copy follows the news_lang cookie (VI default).
export const Route = createFileRoute("/$")({
  loader: async () => ({ lang: await notFoundLang() }),
  head: ({ loaderData }) =>
    notFoundHead(
      notFoundCopy((loaderData?.lang ?? "vi") as Lang).documentTitle
    ),
  component: NotFoundPage,
});
