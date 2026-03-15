import Container from "@duyet/components/Container";
import PhotoGallery from "@/components/PhotoGallery";
import { RetryButton } from "@/components/RetryButton";
import type { PhotoFetchError } from "@/lib/errors";
import {
  AuthError,
  NetworkError,
  RateLimitError,
  UnknownPhotoError,
} from "@/lib/errors";

export const dynamic = "force-static";

import { getAllPhotos, type Photo } from "@/lib/photo-provider";

type PageProps = {
  searchParams: { fallback?: string };
};

export default async function PhotosPage({
  searchParams: _searchParams,
}: PageProps) {
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
                  aria-hidden="true"
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
                  aria-hidden="true"
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

  return <PhotoGallery photos={photos} />;
}
