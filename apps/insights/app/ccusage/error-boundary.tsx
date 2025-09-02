/**
 * Error boundary component for CCUsage components
 * Provides graceful error handling with consistent UI
 */

'use client'

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { useErrorHandler } from './hooks'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: unknown) => void
  className?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: unknown
}

export class CCUsageErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('CCUsage Error Boundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          className={this.props.className}
        />
      )
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null
  onRetry: () => void
  className?: string
}

function DefaultErrorFallback({ error, onRetry, className }: DefaultErrorFallbackProps) {
  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950 ${className || ''}`}>
      <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-3" />
      <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
        Something went wrong
      </h3>
      <p className="text-sm text-red-600 dark:text-red-300 mb-4">
        {error?.message || 'An unexpected error occurred while loading the data.'}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:text-red-200 dark:bg-red-800 dark:border-red-700 dark:hover:bg-red-700"
      >
        <RotateCcw className="h-4 w-4" />
        Try again
      </button>
    </div>
  )
}

/**
 * Hook-based error boundary for functional components
 */
export function useCCUsageErrorBoundary() {
  const { getErrorMessage, isRetryableError } = useErrorHandler()
  
  return {
    wrapWithErrorBoundary: (component: ReactNode, errorProps?: Partial<ErrorBoundaryProps>) => (
      <CCUsageErrorBoundary {...errorProps}>
        {component}
      </CCUsageErrorBoundary>
    ),
    getErrorMessage,
    isRetryableError,
  }
}

/**
 * Simplified error display component for inline errors
 */
export function CCUsageErrorDisplay({ 
  error, 
  onRetry, 
  className 
}: { 
  error: string | Error
  onRetry?: () => void
  className?: string 
}) {
  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <div className={`rounded-lg border bg-card p-4 text-center ${className || ''}`}>
      <p className="text-sm text-muted-foreground mb-3">
        {errorMessage}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
        >
          <RotateCcw className="h-3 w-3" />
          Retry
        </button>
      )}
    </div>
  )
}