"use client";

import Container from "@duyet/components/Container";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { filterPhotos, getPhotosByYear, groupPhotosByYear, sortPhotos, type SortOption } from "@/lib/photo-utils";
import type { Photo } from "@/lib/types";
import PhotoGrid from "./PhotoGrid";
import { PhotoSearchBar } from "./PhotoSearchBar";

interface PhotoGalleryProps {
  photos: Photo[];
}

/**
 * Client component that handles photo filtering, sorting, and display
 * Manages URL state for search query and sort option
 */
export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const searchParams = useSearchParams();

  // Get URL parameters
  const query = searchParams.get("q") || "";
  const sort = (searchParams.get("sort") as SortOption) || "newest";
  const yearParam = searchParams.get("year");

  // Determine which year to filter by
  const activeYear = yearParam || null;

  // Memoize filtered and sorted photos
  const displayPhotos = useMemo(() => {
    let result = photos;

    // Filter by year if specified
    if (activeYear) {
      result = getPhotosByYear(result, activeYear);
    }

    // Filter by search query
    if (query) {
      result = filterPhotos(result, query);
    }

    // Sort photos
    result = sortPhotos(result, sort);

    return result;
  }, [photos, activeYear, query, sort]);

  // Get all available years for navigation
  const photosByYear = useMemo(() => {
    return groupPhotosByYear(photos);
  }, [photos]);

  const years = Object.keys(photosByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const totalPhotos = photos.length;
  const isFallback =
    photos.length > 0 && photos.some((p) => p.id.startsWith("fallback-"));

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="bg-terracotta hover:bg-terracotta-medium sr-only z-50 rounded-lg px-4 py-2 text-white shadow-lg transition-all focus:not-sr-only focus:absolute focus:left-4 focus:top-20"
      >
        Skip to main content
      </a>

      <div>
        <Container className="py-12">
          <section className="mb-8 text-center" aria-labelledby="intro-heading">
            <h1
              id="intro-heading"
              className="mb-4 font-serif text-4xl font-bold leading-tight text-neutral-900 dark:text-neutral-100 md:text-5xl"
            >
              Photography Collection
            </h1>
            <p className="mx-auto mb-6 max-w-2xl text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
              {isFallback ? (
                <>
                  A selection of{" "}
                  <span className="font-semibold">
                    {totalPhotos} sample photos
                  </span>{" "}
                  to showcase the gallery. Configure your photo providers to
                  display your own collection.
                </>
              ) : (
                <>
                  A curated selection of {totalPhotos} photos from{" "}
                  <a
                    href="https://unsplash.com/@_duyet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terracotta hover:text-terracotta-medium dark:text-terracotta-light font-medium underline underline-offset-4 transition-colors"
                  >
                    Unsplash
                  </a>{" "}
                  and Cloudinary. Explore landscapes, architecture, and moments
                  captured through the lens.
                </>
              )}{" "}
              Prefer a narrative experience?{" "}
              <Link
                href="/feed"
                className="text-terracotta hover:text-terracotta-medium dark:text-terracotta-light font-medium underline underline-offset-4 transition-colors"
              >
                View the photo stream
              </Link>
              .
            </p>

            {/* Year Navigation */}
            {years.length > 0 && (
              <div className="mb-6 flex flex-wrap justify-center gap-2">
                <Link
                  href="/"
                  className={`hover:bg-terracotta-light rounded-full px-4 py-1.5 text-sm font-medium shadow-sm transition-all ${
                    !activeYear
                      ? "bg-terracotta text-white hover:text-white dark:bg-terracotta-dark"
                      : "bg-white text-neutral-700 hover:text-neutral-900 hover:shadow dark:bg-slate-800 dark:text-neutral-300 dark:hover:bg-slate-700"
                  }`}
                >
                  All
                </Link>
                {years.map((year) => (
                  <Link
                    key={year}
                    href={`/${year}`}
                    className={`hover:bg-terracotta-light rounded-full px-4 py-1.5 text-sm font-medium shadow-sm transition-all hover:text-white ${
                      activeYear === year.toString()
                        ? "bg-terracotta text-white dark:bg-terracotta-dark"
                        : "bg-white text-neutral-700 hover:text-neutral-900 hover:shadow dark:bg-slate-800 dark:text-neutral-300 dark:hover:bg-slate-700"
                  }`}
                  >
                    {year}
                  </Link>
                ))}
              </div>
            )}

            {/* Search and Sort Controls */}
            <PhotoSearchBar />

            {/* Results count */}
            {(query || sort !== "newest") && (
              <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                Showing {displayPhotos.length} photo
                {displayPhotos.length !== 1 ? "s" : ""}
                {query && ` matching "${query}"`}
                {sort !== "newest" && `, sorted by ${
                  SORT_LABELS[sort]
                }`}
                {activeYear && ` from ${activeYear}`}
              </p>
            )}
          </section>
        </Container>
      </div>

      {/* Photo grid - full width with padding */}
      <section
        className="w-full py-8"
        aria-labelledby="photos-heading"
        id="main-content"
      >
        <h2 id="photos-heading" className="sr-only">
          Photo Gallery
        </h2>
        <PhotoGrid photos={displayPhotos} />
      </section>
    </>
  );
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: "newest first",
  oldest: "oldest first",
  liked: "most liked",
  viewed: "most viewed",
};
