import Container from "@duyet/components/Container";
import type { Metadata } from "next";
import Link from "next/link";
import PhotoFeed from "@/components/PhotoFeed";
import { RetryButton } from "@/components/RetryButton";
import type { PhotoFetchError } from "@/lib/errors";
import {
  AuthError,
  NetworkError,
  RateLimitError,
  UnknownPhotoError,
} from "@/lib/errors";
import { getAllPhotos, type Photo } from "@/lib/photo-provider";

export const revalidate = 86400; // Revalidate daily

export const metadata: Metadata = {
  title: "Photo Stream | Photos",
  description:
    "A chronological stream of my photography. One image at a time, each with its story.",
  openGraph: {
    title: "Photo Stream",
    description:
      "A chronological stream of my photography. One image at a time, each with its story.",
    type: "website",
  },
};

export default async function FeedPage() {
  let photos: Photo[] = [];
  let photoError: PhotoFetchError | null = null;

  try {
    photos = await getAllPhotos();
  } catch (e) {
    photoError =
      e instanceof RateLimitError ||
      e instanceof AuthError ||
      e instanceof NetworkError ||
      e instanceof UnknownPhotoError
        ? e
        : new UnknownPhotoError(e);
  }

  // Only show error state if we have no photos at all
  // If we have fallback photos, proceed normally
  if (photoError && photos.length === 0) {
    return (
      <Container>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-slate-800">
            <div className="mb-4 flex justify-center">
              {photoError instanceof RateLimitError ? (
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
              {photoError instanceof RateLimitError
                ? "API Rate Limit Reached"
                : photoError instanceof NetworkError
                  ? "Network Error"
                  : photoError instanceof AuthError
                    ? "Service Configuration Error"
                    : "Unable to Load Photos"}
            </h3>
            <p className="mb-6 text-neutral-600 dark:text-neutral-400">
              {photoError.userMessage}
            </p>
            {photoError.retryable && <RetryButton />}
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
        className="bg-terracotta hover:bg-terracotta-medium sr-only z-50 rounded-lg px-4 py-2 text-white shadow-lg transition-all focus:not-sr-only focus:absolute focus:left-4 focus:top-20"
      >
        Skip to photo stream
      </a>

      <div className="w-full">
        {/* Header Section */}
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
              <Link
                href="/"
                className="text-terracotta hover:text-terracotta-medium dark:text-terracotta-light font-medium underline underline-offset-4 transition-colors"
              >
                full gallery
              </Link>
              .
            </p>
          </header>
        </Container>

        {/* Feed Content */}
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
