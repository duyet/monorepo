import { cn } from '@duyet/libs/utils'
import Link from 'next/link'

interface LinkCardProps {
  title: string
  href: string
  description: string
  color?: string
  className?: string
  featured?: boolean
}

export function LinkCard({
  title,
  href,
  description,
  color,
  className,
  featured = false,
}: LinkCardProps) {
  const isExternal = href.startsWith('http')

  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md',
        color,
        featured && 'sm:col-span-2 lg:col-span-2',
        className
      )}
    >
      <div className="relative z-10 flex min-h-[120px] flex-col gap-3">
        <h3
          className={cn(
            'font-serif font-bold leading-snug text-neutral-900',
            featured ? 'text-2xl md:text-3xl' : 'text-xl'
          )}
        >
          {title}
        </h3>

        <p className="text-sm leading-relaxed text-neutral-700">
          {description}
        </p>
      </div>
    </Link>
  )
}
