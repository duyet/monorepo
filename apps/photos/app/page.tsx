import PhotoGrid from '@/components/PhotoGrid'
import { getAllUserPhotos, groupPhotosByYear } from '@/lib/unsplash'
import Container from '@duyet/components/Container'
import Link from 'next/link'

export const revalidate = 86400 // Revalidate daily for static export

export default async function PhotosPage() {
  let photos: any[] = []
  let photosByYear: { [year: string]: any[] } = {}
  let error: string | null = null

  try {
    photos = await getAllUserPhotos()
    photosByYear = groupPhotosByYear(photos)
  } catch (e) {
    error = 'Failed to load photos. Please try again later.'
  }

  const totalPhotos = photos.length
  const years = Object.keys(photosByYear)
    .map(Number)
    .sort((a, b) => b - a) // Sort years in descending order

  if (error) {
    return (
      <Container>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Container>
    )
  }

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
              A curated selection of {totalPhotos} photos from my{' '}
              <a
                href="https://unsplash.com/@_duyet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta hover:text-terracotta-medium dark:text-terracotta-light font-medium underline underline-offset-4 transition-colors"
              >
                Unsplash profile
              </a>
              . Explore landscapes, architecture, and moments captured through
              the lens. Prefer a narrative experience?{' '}
              <Link
                href="/feed"
                className="text-terracotta hover:text-terracotta-medium dark:text-terracotta-light font-medium underline underline-offset-4 transition-colors"
              >
                View the photo stream
              </Link>
              .
            </p>

            {years.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {years.map((year) => (
                  <Link
                    key={year}
                    href={`/${year}`}
                    className="hover:bg-terracotta-light rounded-full bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:text-neutral-900 hover:shadow dark:bg-slate-800 dark:text-neutral-300 dark:hover:bg-slate-700"
                  >
                    {year}
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
          Photo Gallery
        </h2>
        {photos.length > 0 ? (
          <PhotoGrid photos={photos} />
        ) : (
          <Container>
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-slate-800">
                <p className="text-neutral-600 dark:text-neutral-400">
                  No photos available at the moment.
                </p>
              </div>
            </div>
          </Container>
        )}
      </section>
    </>
  )
}
