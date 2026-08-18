import { createFileRoute, notFound } from "@tanstack/react-router";
import { NotFoundPage } from "../components/NotFoundPage";

// Throw notFound() so TanStack sets HTTP 404 (setResponseStatus is ignored
// once SSR already opened a 200 stream). head() is skipped, so root emits
// the localized 404 title when this splat matches.
export const Route = createFileRoute("/$")({
  beforeLoad: () => {
    throw notFound();
  },
  component: NotFoundPage,
});
