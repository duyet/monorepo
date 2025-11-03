'use client'

import { cn } from '@duyet/libs/utils'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface NavItem {
  name: string
  href: string
  external?: boolean
}

const BLOG_URL =
  process.env.NEXT_PUBLIC_DUYET_BLOG_URL || 'https://blog.duyet.net'
const INSIGHTS_URL =
  process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL || 'https://insights.duyet.net'
const CV_URL = process.env.NEXT_PUBLIC_DUYET_CV_URL || 'https://cv.duyet.net'
const HOME_URL = process.env.NEXT_PUBLIC_DUYET_HOME_URL || 'https://duyet.net'

const navigationItems: NavItem[] = [
  { name: 'Home', href: HOME_URL },
  { name: 'Blog', href: BLOG_URL },
  { name: 'Insights', href: INSIGHTS_URL },
  { name: 'CV', href: CV_URL },
  { name: 'About', href: `${HOME_URL}/about` },
]

export default function PhotoNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md transition-all dark:border-neutral-800/80 dark:bg-slate-900/80"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-center">
          {/* Desktop Navigation - Centered */}
          <div className="hidden items-center gap-1 md:flex">
            {navigationItems.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="focus:ring-terracotta absolute right-4 inline-flex items-center justify-center rounded-lg p-2 text-neutral-700 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset dark:text-neutral-300 dark:hover:bg-neutral-800 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <span className="sr-only">
              {mobileMenuOpen ? 'Close menu' : 'Open menu'}
            </span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-neutral-200/80 bg-white dark:border-neutral-800/80 dark:bg-slate-900 md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigationItems.map((item) => (
              <MobileNavLink
                key={item.name}
                item={item}
                onClick={() => setMobileMenuOpen(false)}
              />
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLink({ item }: { item: NavItem }) {
  const className = cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition-all',
    'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
    'dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
    'focus:ring-terracotta focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
  )

  if (item.external) {
    return (
      <a
        href={item.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {item.name}
      </a>
    )
  }

  return (
    <Link href={item.href} className={className}>
      {item.name}
    </Link>
  )
}

function MobileNavLink({
  item,
  onClick,
}: {
  item: NavItem
  onClick: () => void
}) {
  const className = cn(
    'block rounded-lg px-3 py-2 text-base font-medium transition-all',
    'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
    'dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
  )

  if (item.external) {
    return (
      <a
        href={item.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
      >
        {item.name}
      </a>
    )
  }

  return (
    <Link href={item.href} className={className} onClick={onClick}>
      {item.name}
    </Link>
  )
}
