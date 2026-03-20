import { createFileRoute } from "@tanstack/react-router";
import Container from "@duyet/components/Container";
import PhotoFeed from "@/components/PhotoFeed";
import { RetryButton } from "@/components/RetryButton";
import { LoadingGrid } from "@/components/LoadingStates";
import { usePhotos } from "@/hooks/usePhotos";
import { RateLimitError, NetworkError, AuthError } from "@/lib/errors";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Photo Stream | Photos" },
      {
        name: "description",
        content:
          "A chronological stream of my photography. One image at a time, each with its story.",
      },
    ],
  }),
  component: FeedPage,
});

function FeedPage() {
  const { photos, error, isLoading } = usePhotos();

  if (isLoading) {
    return <LoadingGrid />;
  }

  if (error && photos.length === 0) {
    return (
      <Container>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="max-w-md rounded-2xl bg-white p-8 text-center dark:bg-slate-800">
            <div className="mb-4 flex justify-center">
              {error instanceof RateLimitError ? (
                <svg
                  className="h-12 w-12 text-amber-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-12 w-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {error instanceof RateLimitError
                ? "API Rate Limit Reached"
                : error instanceof NetworkError
                  ? "Network Error"
                  : error instanceof AuthError
                    ? "Service Configuration Error"
                    : "Unable to Load Photos"}
            </h3>
            <p className="mb-6 text-neutral-600 dark:text-neutral-400">
              {error.message}
            </p>
            <RetryButton />
          </div>
        </div>
      </Container>
    );
  }

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#feed-content"
        className="bg-terracotta hover:bg-terracotta-medium sr-only z-50 rounded-lg px-4 py-2 text-white transition-all focus:not-sr-only focus:absolute focus:left-4 focus:top-20"
      >
        Skip to photo stream
      </a>

      <div className="w-full">
        <Container className="py-12">
          <header className="mb-8 text-center" aria-labelledby="feed-heading">
            <h1
              id="feed-heading"
              className="mb-4 font-serif text-4xl font-bold leading-tight text-neutral-900 dark:text-neutral-100 md:text-5xl"
            >
              Photo Stream
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
              My latest photos, newest first. Each image tells a story—a moment
              captured, a place remembered, a feeling preserved. For more
              photos, explore the{" "}
              <a
                href="/"
                className="text-terracotta hover:text-terracotta-medium dark:text-terracotta-light font-medium underline underline-offset-4 transition-colors"
              >
                full gallery
              </a>
              .
            </p>
          </header>
        </Container>

        <section
          className="w-full pb-16"
          aria-labelledby="feed-heading"
          id="feed-content"
        >
          <PhotoFeed photos={photos} />
        </section>
      </div>
    </>
  );
}
