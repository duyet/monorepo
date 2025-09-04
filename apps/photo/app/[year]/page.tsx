import PhotoGrid from '@/components/PhotoGrid'
import { getAllUserPhotos, getPhotosByYear } from '@/lib/unsplash'
import Container from '@duyet/components/Container'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface YearPageProps {
  params: Promise<{
    year: string
  }>
}

export async function generateStaticParams() {
  try {
    const photos = await getAllUserPhotos()
    const years = Array.from(
      new Set(
        photos.map((photo) =>
          new Date(photo.created_at).getFullYear().toString(),
        ),
      ),
    )

    if (years.length > 0) {
      return years.map((year) => ({ year }))
    }

    // Fallback years when no photos are available (for build without API key)
    const currentYear = new Date().getFullYear()
    const fallbackYears = [currentYear, currentYear - 1, currentYear - 2]
    return fallbackYears.map((year) => ({ year: year.toString() }))
  } catch (error) {
    // Return fallback years for build
    const currentYear = new Date().getFullYear()
    const fallbackYears = [currentYear, currentYear - 1, currentYear - 2]
    return fallbackYears.map((year) => ({ year: year.toString() }))
  }
}

export async function generateMetadata({ params }: YearPageProps) {
  const { year } = await params
  return {
    title: `Photos from ${year} | Duyệt`,
    description: `Photography collection from ${year} by Duyệt`,
  }
}

export default async function YearPage({ params }: YearPageProps) {
  const { year } = await params

  // Validate year format
  const yearNum = parseInt(year)
  if (isNaN(yearNum) || yearNum < 2000 || yearNum > new Date().getFullYear()) {
    notFound()
  }

  let allPhotos: any[] = []
  let yearPhotos: any[] = []
  let error: string | null = null

  try {
    allPhotos = await getAllUserPhotos()
    yearPhotos = getPhotosByYear(allPhotos, year)
  } catch (e) {
    error = 'Failed to load photos. Please try again later.'
  }

  // If no photos found for this year, show 404
  if (!error && yearPhotos.length === 0) {
    notFound()
  }

  if (error) {
    return (
      <Container>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Back to all photos
            </Link>
          </div>
        </div>
      </Container>
    )
  }

  // Get available years for navigation
  const allYears = Array.from(
    new Set(allPhotos.map((photo) => new Date(photo.created_at).getFullYear())),
  ).sort((a, b) => b - a)

  const currentYearIndex = allYears.indexOf(yearNum)
  const previousYear =
    currentYearIndex > 0 ? allYears[currentYearIndex - 1] : null
  const nextYear =
    currentYearIndex < allYears.length - 1
      ? allYears[currentYearIndex + 1]
      : null

  return (
    <>
      {/* Header and navigation - contained */}
      <Container>
        <div className="mb-8">
          <div className="mb-4">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ← Back to all photos
            </Link>
          </div>

          <h1 className="mb-2 text-3xl font-bold">Photos from {year}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {yearPhotos.length} photograph{yearPhotos.length !== 1 ? 's' : ''}{' '}
            from {year}
          </p>

          {/* Year navigation */}
          <div className="mt-6 flex items-center gap-4">
            {previousYear && (
              <Link
                href={`/${previousYear}`}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                ← {previousYear}
              </Link>
            )}

            <div className="flex flex-wrap gap-2">
              {allYears.map((y) => (
                <Link
                  key={y}
                  href={`/${y}`}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    y === yearNum
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                  }`}
                >
                  {y}
                </Link>
              ))}
            </div>

            {nextYear && (
              <Link
                href={`/${nextYear}`}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                {nextYear} →
              </Link>
            )}
          </div>
        </div>
      </Container>

      {/* Photo grid - full width */}
      <div className="w-full">
        <div className="px-4 sm:px-6 lg:px-8">
          <PhotoGrid photos={yearPhotos} />
        </div>
      </div>
    </>
  )
}
