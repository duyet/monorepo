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
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-lg transition-all hover:bg-blue-700"
      >
        Skip to main content
      </a>
      
      {/* Header and intro text - contained */}
      <Container>
        <section className="mb-8" aria-labelledby="intro-heading">
          <h1 id="intro-heading" className="sr-only">Photography Portfolio</h1>
          <div className="text-lg text-gray-600 dark:text-gray-300">
            A curated collection of {totalPhotos} photographs from my{' '}
            <a
              href="https://unsplash.com/@_duyet"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-gray-900 dark:hover:text-white"
            >
              Unsplash profile
            </a>
            .
          </div>

          {years.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Browse by Year
              </h2>
              <div className="flex flex-wrap gap-2">
                {years.map((year) => {
                  const count = photosByYear[year.toString()].length
                  return (
                    <Link
                      key={year}
                      href={`/${year}`}
                      className="group rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 text-sm font-medium shadow-sm transition-all hover:from-gray-100 hover:to-gray-200 hover:shadow-md dark:from-gray-800 dark:to-gray-900 dark:hover:from-gray-700 dark:hover:to-gray-800"
                    >
                      <span className="text-gray-900 dark:text-gray-100">{year}</span>
                      <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 transition-colors group-hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:group-hover:bg-gray-600">
                        {count}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      </Container>

      {/* Photo grid - full width */}
      <section className="w-full" aria-labelledby="photos-heading" id="main-content">        <h2 id="photos-heading" className="sr-only">Photo Gallery</h2>
        {photos.length > 0 ? (
          <div className="px-4 sm:px-6 lg:px-8">
            <PhotoGrid photos={photos} />
          </div>
        ) : (
          <Container>
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">
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
