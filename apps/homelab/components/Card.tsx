import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  padding?: 'sm' | 'md' | 'lg'
}

export function Card({ children, className = '', title, padding = 'md' }: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={`rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 ${paddingClasses[padding]} ${className}`}
    >
      {title && <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">{title}</h3>}
      {children}
    </div>
  )
}
