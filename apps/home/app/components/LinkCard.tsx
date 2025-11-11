import Link from 'next/link'
import { LinkCardData, CardVariant } from '../lib/types'

interface LinkCardProps {
  data: LinkCardData
  featured?: boolean
}

const getVariantStyles = (variant: CardVariant = 'default'): string => {
  const variants = {
    default: 'bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700',
    elevated:
      'bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md transition-shadow border border-neutral-200 dark:border-neutral-700',
    outlined:
      'bg-transparent border-2 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-900/50',
    glass:
      'bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 hover:bg-white/80 dark:hover:bg-neutral-800/80',
    gradient:
      'bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 hover:from-neutral-100 hover:to-neutral-200 dark:hover:from-neutral-700 dark:hover:to-neutral-800',
  }
  return variants[variant]
}

export default function LinkCard({ data, featured = false }: LinkCardProps) {
  const Icon = data.icon
  const isExternal = data.url.startsWith('http')
  const colSpan = featured ? 'sm:col-span-2 lg:col-span-2' : ''
  const variantStyles = data.variant
    ? getVariantStyles(data.variant)
    : data.color || getVariantStyles('default')

  return (
    <Link
      href={data.url}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={`group relative flex flex-col overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] ${variantStyles} ${colSpan}`}
    >
      {/* Background image on hover (for special cards like Photos) */}
      {data.backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ backgroundImage: `url(${data.backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-white/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:bg-neutral-900/80" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        <div
          className={`mb-4 transform transition-transform duration-300 group-hover:scale-110 ${
            data.iconColor || 'text-neutral-900 dark:text-neutral-100'
          }`}
        >
          <Icon />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {data.title}
        </h3>
        <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {data.description}
        </p>
      </div>
    </Link>
  )
}
