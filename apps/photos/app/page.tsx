import PhotoGrid from '@/components/PhotoGrid'
import { getAllUserPhotos } from '@/lib/unsplash'
import { scanLocalPhotos, mergePhotos } from '@/lib/localPhotos'
import Container from '@duyet/components/Container'
import Link from 'next/link'
import { Photo, UnsplashPhoto } from '@/lib/types'

export const revalidate = 86400 // Revalidate daily for static export

export default async function PhotosPage() {
  let photos: Photo[] = []
  let photosByYear: { [year: string]: Photo[] } = {}
  let error: string | null = null

  try {
    // Load Unsplash photos
    const unsplashPhotos = await getAllUserPhotos()

    // Mark Unsplash photos with source
    const unsplashPhotosWithSource: Photo[] = unsplashPhotos.map((photo: UnsplashPhoto) => ({
      ...photo,
      source: 'unsplash' as const,
    }))

    // Scan local photos at build time
    const localPhotos = await scanLocalPhotos()

    // Merge both sources
    photos = mergePhotos(unsplashPhotosWithSource, localPhotos)

    // Group by year
    photosByYear = {}
    photos.forEach((photo) => {
      const date = new Date(photo.created_at)
      const year = date.getFullYear().toString()
      if (!photosByYear[year]) {
        photosByYear[year] = []
      }
      photosByYear[year].push(photo)
    })
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
        className="sr-only z-50 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-lg transition-all hover:bg-blue-700 focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>

      {/* Header and intro text - contained */}
      <Container>
        <section className="mb-8" aria-labelledby="intro-heading">
          <h1 id="intro-heading" className="sr-only">
            Photography Portfolio
          </h1>
          <div className="text-lg text-gray-600 dark:text-gray-300">
            Photography collection from my{' '}
            <a
              href="https://unsplash.com/@_duyet"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-gray-900 dark:hover:text-white"
            >
              Unsplash profile
            </a>
            {' '}and local photos.
          </div>

          {years.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              {years.map((year) => (
                <Link
                  key={year}
                  href={`/${year}`}
                  className="bg-gray-100 px-2 py-1 text-sm transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  {year}
                </Link>
              ))}
            </div>
          )}
        </section>
      </Container>

      {/* Photo grid - full width */}
      <section
        className="w-full"
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
