import { createFileRoute, notFound } from "@tanstack/react-router";
import { NotFoundPage } from "../components/NotFoundPage";
import { notFoundCopy } from "../lib/not-found";
import { notFoundHead } from "../lib/seo";

// Catch-all so unmatched paths get a 404 document title during SSR.
// beforeLoad throws notFound() so the HTTP status stays 404 (a matching
// splat would otherwise 200). Copy defaults to VI to match the chrome.
export const Route = createFileRoute("/$")({
  beforeLoad: () => {
    throw notFound();
  },
  head: () => notFoundHead(notFoundCopy("vi").documentTitle),
  component: NotFoundPage,
});
