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
    console.error('Failed to fetch photos:', e)
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
      {/* Header and intro text - contained */}
      <Container>
        <div className="mb-8">
          <div className="text-lg text-gray-600 dark:text-gray-300">
            A collection of {totalPhotos} photographs from my{' '}
            <a
              href="https://unsplash.com/@_duyet"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-gray-900 dark:hover:text-white"
            >
              Unsplash profile
            </a>
            . All photos are powered by{' '}
            <a
              href="https://unsplash.com/?utm_source=duyet_photo_gallery&utm_medium=referral"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-gray-900 dark:hover:text-white"
            >
              Unsplash
            </a>
            .
          </div>

          {years.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {years.map((year) => (
                <Link
                  key={year}
                  href={`/${year}`}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  {year} ({photosByYear[year.toString()].length})
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>

      {/* Photo grid - full width */}
      <div className="w-full">
        {photos.length > 0 ? (
          <div className="px-4 sm:px-6 lg:px-8">
            <PhotoGrid photos={photos} className="gap-4 sm:gap-6 lg:gap-8" />
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
      </div>
    </>
  )
}
