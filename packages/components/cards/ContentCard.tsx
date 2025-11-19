import {
  GeometricPattern,
  OrganicBlob,
  WavyLines,
} from '../illustrations/AbstractShapes'
import { cn } from '@duyet/libs/utils'
import Link from 'next/link'

interface ContentCardProps {
  title: string
  href: string
  category?: string
  description?: string
  tags?: string[]
  date?: string
  color?: 'ivory' | 'oat' | 'cream' | 'cactus' | 'sage' | 'lavender' | 'terracotta' | 'coral'
  illustration?: 'wavy' | 'geometric' | 'blob' | 'none'
  className?: string
}

const colorClasses = {
  ivory: 'bg-ivory text-neutral-900',
  oat: 'bg-oat-light text-neutral-900',
  cream: 'bg-cream text-neutral-900',
  cactus: 'bg-cactus-light text-neutral-900',
  sage: 'bg-sage-light text-neutral-900',
  lavender: 'bg-lavender-light text-neutral-900',
  terracotta: 'bg-terracotta-light text-neutral-900',
  coral: 'bg-coral-light text-neutral-900',
}

const illustrationColorClasses = {
  ivory: 'text-neutral-400',
  oat: 'text-neutral-400',
  cream: 'text-neutral-400',
  cactus: 'text-cactus',
  sage: 'text-sage',
  lavender: 'text-lavender',
  terracotta: 'text-terracotta',
  coral: 'text-coral',
}

const illustrations = {
  wavy: WavyLines,
  geometric: GeometricPattern,
  blob: OrganicBlob,
  none: null,
}

export function ContentCard({
  title,
  href,
  category,
  description,
  tags,
  date,
  color = 'ivory',
  illustration = 'none',
  className,
}: ContentCardProps) {
  const IllustrationComponent = illustrations[illustration]

  return (
    <Link
      href={href}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md',
        colorClasses[color],
        className,
      )}
    >
      <div className="relative z-10 flex min-h-[200px] flex-col gap-3">
        {category && (
          <div className="inline-flex items-center">
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-wide">
              {category}
            </span>
          </div>
        )}

        <h3 className="font-serif text-xl font-bold leading-snug md:text-2xl">
          {title}
        </h3>

        {description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-neutral-700">
            {description}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium text-neutral-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {date && (
            <time className="text-xs font-medium text-neutral-600">{date}</time>
          )}
        </div>
      </div>

      {IllustrationComponent && (
        <div className="absolute bottom-0 right-0 h-32 w-32 opacity-20 transition-opacity group-hover:opacity-30">
          <IllustrationComponent
            className={cn('h-full w-full', illustrationColorClasses[color])}
          />
        </div>
      )}
    </Link>
  )
}
