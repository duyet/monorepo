import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PhotoGallery from "@/components/PhotoGallery";
import { getAllPhotos, type Photo } from "@/lib/photo-provider";

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
  const yearNum = Number.parseInt(year, 10);
  if (
    Number.isNaN(yearNum) ||
    yearNum < 2000 ||
    yearNum > new Date().getFullYear()
  ) {
    notFound();
  }

  let allPhotos: Photo[] = [];
  let error: string | null = null;

  try {
    allPhotos = await getAllPhotos();
  } catch (_e) {
    error = "Failed to load photos. Please try again later.";
  }

  if (error && allPhotos.length === 0) {
    return (
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
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PhotoGallery photos={allPhotos} />
    </Suspense>
  );
}
