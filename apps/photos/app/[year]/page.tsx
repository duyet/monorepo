import Container from "@duyet/components/Container";
import Link from "next/link";
import { notFound } from "next/navigation";
import PhotoGrid from "@/components/PhotoGrid";
import {
  getAllPhotos,
  getPhotosByYear,
  type Photo,
} from "@/lib/photo-provider";

interface YearPageProps {
  params: Promise<{
    year: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const photos = await getAllPhotos();
    const yearsFromPhotos = Array.from(
      new Set(
        photos.map((photo) =>
          new Date(photo.created_at).getFullYear().toString()
        )
      )
    );

    // Always include a range of years to ensure navigation works
    // even when some years have no photos yet (e.g., current year early)
    const currentYear = new Date().getFullYear();
    const minYear = 2022; // First year of the photo gallery
    const allYears = [];

    for (let year = minYear; year <= currentYear; year++) {
      allYears.push(year.toString());
    }

    // Dedupe with years that have actual photos
    const uniqueYears = Array.from(new Set([...allYears, ...yearsFromPhotos]));

    return uniqueYears.map((year) => ({ year }));
  } catch (_error) {
    // Return fallback years for build
    const currentYear = new Date().getFullYear();
    const fallbackYears = [
      currentYear,
      currentYear - 1,
      currentYear - 2,
      currentYear - 3,
    ];
    return fallbackYears.map((year) => ({ year: year.toString() }));
  }
}

export async function generateMetadata({ params }: YearPageProps) {
  const { year } = await params;
  return {
    title: `Photos from ${year} | Duyệt`,
    description: `Photography collection from ${year} by Duyệt`,
  };
}

export default async function YearPage({ params }: YearPageProps) {
  const { year } = await params;

  // Validate year format
  const yearNum = Number.parseInt(year);
  if (
    Number.isNaN(yearNum) ||
    yearNum < 2000 ||
    yearNum > new Date().getFullYear()
  ) {
    notFound();
  }

  let allPhotos: Photo[] = [];
  let yearPhotos: Photo[] = [];
  let error: string | null = null;

  try {
    allPhotos = await getAllPhotos();
    yearPhotos = getPhotosByYear(allPhotos, year);
  } catch (_e) {
    error = "Failed to load photos. Please try again later.";
  }

  // If no photos found for this year, show empty state instead of 404
  // This allows the build to succeed even when a year has no photos yet
  // (e.g., early in the current year before photos are added)

  if (error) {
    return (
      <Container>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Back to all photos
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  // Show empty state for years with no photos
  if (yearPhotos.length === 0) {
    return (
      <>
        <a
          href="#main-content"
          className="bg-terracotta hover:bg-terracotta-medium sr-only z-50 rounded-lg px-4 py-2 text-white shadow-lg transition-all focus:not-sr-only focus:absolute focus:left-4 focus:top-20"
        >
          Skip to main content
        </a>

        <div>
          <Container className="py-12">
            <section
              className="mb-8 text-center"
              aria-labelledby="intro-heading"
            >
              <div className="mb-6">
                <Link
                  href="/"
                  className="text-terracotta hover:text-terracotta-medium dark:text-terracotta-light inline-flex items-center text-sm font-medium transition-colors"
                >
                  ← Back to all photos
                </Link>
              </div>

              <h1
                id="intro-heading"
                className="mb-4 font-serif text-4xl font-bold leading-tight text-neutral-900 dark:text-neutral-100 md:text-5xl"
              >
                Photos from {year}
              </h1>
              <p className="mx-auto mb-6 max-w-2xl text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                No photos have been added for {year} yet.
              </p>

              <div className="rounded-lg border border-dashed border-gray-300 p-12 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">
                  Check back soon for new photos from {year}!
                </p>
              </div>
            </section>
          </Container>
        </div>
      </>
    );
  }

  // Get available years for navigation
  const allYears = Array.from(
    new Set(allPhotos.map((photo) => new Date(photo.created_at).getFullYear()))
  ).sort((a, b) => b - a);

  const currentYearIndex = allYears.indexOf(yearNum);
  const _previousYear =
    currentYearIndex > 0 ? allYears[currentYearIndex - 1] : null;
  const _nextYear =
    currentYearIndex < allYears.length - 1
      ? allYears[currentYearIndex + 1]
      : null;

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
            {/* Back navigation */}
            <div className="mb-6">
              <Link
                href="/"
                className="text-terracotta hover:text-terracotta-medium dark:text-terracotta-light inline-flex items-center text-sm font-medium transition-colors"
              >
                ← Back to all photos
              </Link>
            </div>

            <h1
              id="intro-heading"
              className="mb-4 font-serif text-4xl font-bold leading-tight text-neutral-900 dark:text-neutral-100 md:text-5xl"
            >
              Photos from {year}
            </h1>
            <p className="mx-auto mb-6 max-w-2xl text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
              A collection of {yearPhotos.length} photo
              {yearPhotos.length !== 1 ? "s" : ""} captured in {year}.
            </p>

            {/* Year navigation */}
            {allYears.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {allYears.map((y) => (
                  <Link
                    key={y}
                    href={`/${y}`}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium shadow-sm transition-all hover:shadow ${
                      y === yearNum
                        ? "bg-terracotta hover:bg-terracotta-medium dark:bg-terracotta-light text-white"
                        : "hover:bg-terracotta-light bg-white text-neutral-700 hover:text-neutral-900 dark:bg-slate-800 dark:text-neutral-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {y}
                  </Link>
                ))}
              </div>
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
          Photo Gallery from {year}
        </h2>
        <PhotoGrid photos={yearPhotos} />
      </section>
    </>
  );
}
