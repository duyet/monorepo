import { ReactNode } from 'react'

interface PageLayoutProps {
  title: string
  description: string
  footer?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Shared page layout component for consistent page structure
 * Provides standard header with title/description and optional footer
 */
export function PageLayout({
  title,
  description,
  footer,
  children,
  className = '',
}: PageLayoutProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">{children}</div>

      {/* Optional Footer */}
      {footer && <div className="pt-4">{footer}</div>}
    </div>
  )
}
