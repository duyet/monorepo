import type { Metadata } from 'next'
import PhotoFeed from '@/components/PhotoFeed'
import { getAllUserPhotos } from '@/lib/unsplash'
import Container from '@duyet/components/Container'

export const revalidate = 86400 // Revalidate daily

export const metadata: Metadata = {
  title: 'Photo Stream | Photos',
  description:
    'A chronological stream of my photography. One image at a time, each with its story.',
  openGraph: {
    title: 'Photo Stream',
    description:
      'A chronological stream of my photography. One image at a time, each with its story.',
    type: 'website',
  },
}

export default async function FeedPage() {
  let photos: any[] = []
  let error: string | null = null

  try {
    photos = await getAllUserPhotos()
  } catch (e) {
    error = 'Failed to load photo stream. Please try again later.'
  }

  if (error) {
    return (
      <Container>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-neutral-500 dark:text-neutral-400">{error}</p>
          </div>
        </div>
      </Container>
    )
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
              photos, explore the{' '}
              <a
                href="/"
                className="text-terracotta hover:text-terracotta-medium dark:text-terracotta-light font-medium underline underline-offset-4 transition-colors"
              >
                full gallery
              </a>
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
  )
}
