import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import Container from "@duyet/components/Container";
import PhotoGallery from "@/components/PhotoGallery";
import { loadPhotos } from "@/lib/load-photos";

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
  loader: async ({ params }) => {
    const photos = await loadPhotos();
    return photos.filter(
      (photo) =>
        new Date(photo.created_at).getFullYear().toString() === params.year
    );
  },
  head: ({ params }) => ({
    meta: [
      { title: `Photos from ${params.year} | Duyệt` },
      {
        name: "description",
        content: `Photography collection from ${params.year} by Duyệt`,
      },
    ],
  }),
  component: YearPage,
});

function YearPage() {
  const { year } = Route.useParams();
  const yearPhotos = Route.useLoaderData();

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
            <Link
              to="/"
              className="inline-block rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Back to all photos
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return <PhotoGallery photos={yearPhotos} />;
}
