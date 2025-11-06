'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'
import React, { Component, type ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: unknown
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }> | ReactNode
  onError?: (error: Error, errorInfo: unknown) => void
  className?: string
}

/**
 * Shared ErrorBoundary component for catching and handling React errors
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * <ErrorBoundary fallback={({ error, retry }) => <div>Error: {error?.message}</div>}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      const { fallback, className } = this.props

      // If fallback is provided
      if (fallback) {
        // Check if it's a component or element
        if (typeof fallback === 'function') {
          const FallbackComponent = fallback
          return <FallbackComponent error={this.state.error ?? undefined} retry={this.handleRetry} />
        }
        return fallback
      }

      // Default fallback
      return (
        <DefaultErrorFallback
          error={this.state.error}
          retry={this.handleRetry}
          className={className}
        />
      )
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null
  retry: () => void
  className?: string
}

function DefaultErrorFallback({
  error,
  retry,
  className,
}: DefaultErrorFallbackProps) {
  return (
    <div
      className={`flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 ${className || ''}`}
    >
      <div className="text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Something went wrong
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {error?.message || 'An unexpected error occurred.'}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={retry}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Refresh Page
          </button>
        </div>

        {/* Development error details */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              Show error details (development only)
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

/**
 * Inline error display component for showing errors without a full boundary
 *
 * @example
 * ```tsx
 * {error && <ErrorDisplay error={error} onRetry={handleRetry} />}
 * ```
 */
export function ErrorDisplay({
  error,
  onRetry,
  className,
}: {
  error: string | Error
  onRetry?: () => void
  className?: string
}) {
  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <div
      className={`rounded-lg border bg-card p-4 text-center ${className || ''}`}
    >
      <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-yellow-500" />
      <p className="mb-3 text-sm text-muted-foreground">{errorMessage}</p>
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

/**
 * Hook for error handling utilities
 */
export function useErrorBoundary() {
  const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'string') return error
    if (error instanceof Error) return error.message
    return 'An unexpected error occurred'
  }

  const isRetryableError = (error: unknown): boolean => {
    const message =
      typeof error === 'string'
        ? error
        : error instanceof Error
          ? error.message
          : ''

    // Network errors are typically retryable
    return (
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('network') ||
      message.includes('fetch')
    )
  }

  return {
    getErrorMessage,
    isRetryableError,
  }
}

export default ErrorBoundary
export { DefaultErrorFallback }
