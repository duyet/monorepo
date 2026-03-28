import { createFileRoute, Link } from "@tanstack/react-router";
import Container from "@duyet/components/Container";
import PhotoFeed from "@/components/PhotoFeed";
import { loadPhotos } from "@/lib/load-photos";

export const Route = createFileRoute("/feed")({
  loader: () => loadPhotos(),
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
  const photos = Route.useLoaderData();

  return (
    <>
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
              <Link
                to="/"
                className="text-terracotta hover:text-terracotta-medium dark:text-terracotta-light font-medium underline underline-offset-4 transition-colors"
              >
                full gallery
              </Link>
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
