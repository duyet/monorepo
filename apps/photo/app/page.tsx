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
.
          </div>

          {years.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Browse by year:</span>
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
        </div>
      </Container>

      {/* Photo grid - full width */}
      <div className="w-full">
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
      </div>
    </>
  )
}
