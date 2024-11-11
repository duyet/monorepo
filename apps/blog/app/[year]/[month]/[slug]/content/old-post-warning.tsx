import type { Post } from '@duyet/interfaces'
import { cn } from '@duyet/libs'
import { AlertTriangle } from 'lucide-react'

export function OldPostWarning({
  post,
  year,
  className,
}: {
  post: Post
  year: number
  className?: string
}) {
  const publishDate = new Date(post.date)
  const currentDate = new Date()

  const diff = currentDate.getTime() - publishDate.getTime()

  // 365.25 (days to years, including leap years)
  const postYear = Math.ceil(diff / (1000 * 60 * 60 * 24 * 365.25))

  if (postYear < year) {
    return null
  }

  const warningText = `This post is over ${postYear} years old. The information may be outdated.`

  return (
    <div
      className={cn('border-l-4 border-yellow-400 bg-yellow-50 p-4', className)}
    >
      <div className="flex items-center">
        <AlertTriangle
          className="mr-3 h-5 w-5 text-yellow-400"
          aria-hidden="true"
        />
        <p className="text-sm text-yellow-700">
          <span className="font-medium">Note:</span> {warningText}
        </p>
      </div>
    </div>
  )
}
