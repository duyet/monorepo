import { createFileRoute } from "@tanstack/react-router";
import { NotFoundPage } from "../components/NotFoundPage";
import { getClientLang } from "../lib/lang";
import { notFoundCopy } from "../lib/not-found";
import { notFoundLang } from "../lib/not-found-lang.server";
import { notFoundHead } from "../lib/seo";
import type { Lang } from "../lib/types";

// Catch-all owns head() so the FIRST <title> is the localized 404 title.
// Do not throw notFound() here: TanStack skips head() when beforeLoad throws.
// Copy follows the news_lang cookie (VI default).
// Server-only status/cookie work is in not-found-lang.server.ts.
export const Route = createFileRoute("/$")({
  loader: async () => {
    if (typeof window !== "undefined") return { lang: getClientLang() };
    return { lang: notFoundLang() };
  },
  head: ({ loaderData }) =>
    notFoundHead(
      notFoundCopy((loaderData?.lang ?? "vi") as Lang).documentTitle
    ),
  component: NotFoundPage,
});
