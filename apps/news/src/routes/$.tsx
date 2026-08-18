import { createFileRoute } from "@tanstack/react-router";
import { NotFoundPage } from "../components/NotFoundPage";
import { loadNotFoundLang } from "../lib/not-found-fn";
import { notFoundCopy } from "../lib/not-found";
import { notFoundHead } from "../lib/seo";
import type { Lang } from "../lib/types";

// Catch-all owns head() so the FIRST <title> is the localized 404 title.
// Do not throw notFound() here: TanStack skips head() when beforeLoad throws.
// HTTP 404 + news_lang live in loadNotFoundLang (createServerFn).
export const Route = createFileRoute("/$")({
  loader: async () => ({ lang: await loadNotFoundLang() }),
  head: ({ loaderData }) =>
    notFoundHead(
      notFoundCopy((loaderData?.lang ?? "vi") as Lang).documentTitle
    ),
  component: NotFoundPage,
});
