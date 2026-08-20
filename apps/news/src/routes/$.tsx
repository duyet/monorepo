import { createFileRoute } from "@tanstack/react-router";
import { NotFoundPage } from "../components/NotFoundPage";
import { loadNotFoundLang } from "../lib/not-found-fn";
import { notFoundCopy } from "../lib/not-found";
import { NOT_FOUND_HEADER } from "../lib/not-found-status";
import { notFoundHead } from "../lib/seo";
import type { Lang } from "../lib/types";

// Catch-all owns head() so the FIRST <title> is the localized 404 title.
// Do not throw notFound() here: TanStack skips head() when beforeLoad throws.
// Start's HTML stream is 200 unless notFound() is thrown; the Worker
// rewrites status when this header is present.
export const Route = createFileRoute("/$")({
  loader: async (): Promise<{ lang: Lang }> => ({
    lang: await loadNotFoundLang(),
  }),
  headers: (): Record<string, string> => ({
    [NOT_FOUND_HEADER]: "1",
    "Cache-Control": "private, no-store",
  }),
  head: ({ loaderData }) =>
    notFoundHead(
      notFoundCopy((loaderData?.lang ?? "vi") as Lang).documentTitle
    ),
  component: NotFoundPage,
});
