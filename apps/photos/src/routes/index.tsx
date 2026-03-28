import { createFileRoute } from "@tanstack/react-router";
import PhotoGallery from "@/components/PhotoGallery";
import { loadPhotos } from "@/lib/load-photos";

export const Route = createFileRoute("/")({
  loader: () => loadPhotos(),
  head: () => ({
    meta: [
      { title: "Photos | Duyệt" },
      {
        name: "description",
        content:
          "A curated collection of photography by Duyệt. Explore landscapes, portraits, and street photography.",
      },
    ],
  }),
  component: PhotosPage,
});

function PhotosPage() {
  const photos = Route.useLoaderData();
  return <PhotoGallery photos={photos} />;
}
