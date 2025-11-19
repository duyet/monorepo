import { cn } from '@duyet/libs/utils'
import Link from 'next/link'

interface LinkCardProps {
  title: string
  href: string
  description: string
  color?: 'ivory' | 'oat' | 'cream' | 'cactus' | 'sage' | 'lavender' | 'terracotta' | 'coral' | 'white'
  className?: string
  featured?: boolean
  backgroundImage?: string
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
  white: 'border border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300',
}

export function LinkCard({
  title,
  href,
  description,
  color = 'white',
  className,
  featured = false,
  backgroundImage,
}: LinkCardProps) {
  const isExternal = href.startsWith('http')

  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md',
        colorClasses[color],
        featured && 'sm:col-span-2 lg:col-span-2',
        className
      )}
    >
      {backgroundImage && (
        <>
          {/* Background image on hover */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              backgroundImage: `url(${backgroundImage})`,
            }}
          />
          {/* Overlay to maintain text readability */}
          <div className="absolute inset-0 bg-white/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </>
      )}

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
