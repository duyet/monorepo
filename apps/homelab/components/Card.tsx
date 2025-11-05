import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`rounded-3xl bg-white p-6 dark:bg-neutral-900 ${className}`}>
      {title && (
        <h3 className="mb-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
