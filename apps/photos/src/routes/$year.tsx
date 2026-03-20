import { createFileRoute, notFound } from "@tanstack/react-router";
import Container from "@duyet/components/Container";
import PhotoGallery from "@/components/PhotoGallery";
import { LoadingGrid } from "@/components/LoadingStates";
import { usePhotos } from "@/hooks/usePhotos";

export const Route = createFileRoute("/$year")({
  beforeLoad: ({ params }) => {
    const yearNum = Number.parseInt(params.year, 10);
    if (
      Number.isNaN(yearNum) ||
      yearNum < 2000 ||
      yearNum > new Date().getFullYear()
    ) {
      throw notFound();
    }
  },
  head: ({ params }) => {
    const year = params.year;
    return {
      meta: [
        { title: `Photos from ${year} | Duyệt` },
        {
          name: "description",
          content: `Photography collection from ${year} by Duyệt`,
        },
      ],
    };
  },
  component: YearPage,
});

function YearPage() {
  const { year } = Route.useParams();
  const { photos, error, isLoading } = usePhotos();

  if (isLoading) {
    return <LoadingGrid />;
  }

  if (error && photos.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Failed to load photos. Please try again later.
          </p>
          <a
            href="/"
            className="mt-4 inline-block rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Back to all photos
          </a>
        </div>
      </div>
    );
  }

  const yearPhotos = photos.filter((photo) => {
    const photoYear = new Date(photo.created_at).getFullYear().toString();
    return photoYear === year;
  });

  if (yearPhotos.length === 0) {
    return (
      <Container>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="mb-2 text-lg font-medium text-neutral-700 dark:text-neutral-300">
              No photos from {year}
            </p>
            <p className="mb-6 text-neutral-500 dark:text-neutral-400">
              There are no photos in the gallery from this year.
            </p>
            <a
              href="/"
              className="inline-block rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Back to all photos
            </a>
          </div>
        </div>
      </Container>
    );
  }

  return <PhotoGallery photos={yearPhotos} />;
}
