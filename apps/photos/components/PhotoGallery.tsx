import Container from "@duyet/components/Container";
import type { Photo } from "@/lib/types";
import PhotoGrid from "./PhotoGrid";

interface PhotoGalleryProps {
  photos: Photo[];
}

/**
 * Gallery shell that introduces the collection and renders the photo grid.
 * The page intentionally stays simple so the images can carry the experience.
 */
export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const totalPhotos = photos.length;
  const isFallback =
    photos.length > 0 && photos.some((p) => p.id.startsWith("fallback-"));

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="bg-terracotta hover:bg-terracotta-medium sr-only z-50 rounded-lg px-4 py-2 text-white transition-all focus:not-sr-only focus:absolute focus:left-4 focus:top-20"
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
              <a
                href="/feed"
                className="text-terracotta hover:text-terracotta-medium dark:text-terracotta-light font-medium underline underline-offset-4 transition-colors"
              >
                View the photo stream
              </a>
              .
            </p>
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
        <PhotoGrid photos={photos} />
      </section>
    </>
  );
}
