/**
 * Enhanced Error Boundary with better UX
 * Provides graceful error handling with recovery options
 */

"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import {
  AlertTriangle,
  Bug,
  Home,
  RefreshCw,
  XCircle,
  Info,
} from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * Enhanced error boundary component with retry functionality
 */
export class EnhancedErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Error Boundary] Caught error:", error, errorInfo);
    this.setState({ errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to external service if available
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("error_boundary_triggered", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
      });
    }
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });
    }
  };

  handleReset = () => {
    this.retryCount = 0;
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <EnhancedErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
          onGoHome={this.handleGoHome}
          retryCount={this.retryCount}
          maxRetries={this.maxRetries}
          showErrorDetails={this.props.showErrorDetails ?? false}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

interface EnhancedErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  onRetry: () => void;
  onReset: () => void;
  onGoHome: () => void;
  retryCount: number;
  maxRetries: number;
  showErrorDetails: boolean;
  className?: string;
}

function EnhancedErrorFallback({
  error,
  errorInfo,
  errorId,
  onRetry,
  onReset,
  onGoHome,
  retryCount,
  maxRetries,
  showErrorDetails,
  className,
}: EnhancedErrorFallbackProps) {
  const canRetry = retryCount < maxRetries;
  const isRetryable = isRetryableError(error);

  return (
    <div
      className={`rounded-lg border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6 dark:border-red-800 dark:from-red-950 dark:to-red-900 ${className || ""}`}
    >
      {/* Error Header */}
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
            Something went wrong
          </h3>
          {errorId && (
            <p className="text-xs text-red-600 dark:text-red-400">
              Error ID: {errorId}
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
      <div className="mb-4 rounded-md bg-white/50 p-3 dark:bg-black/20">
        <p className="text-sm text-red-700 dark:text-red-300">
          {error?.message || "An unexpected error occurred while loading this component."}
        </p>
      </div>

      {/* Error Details (collapsible) */}
      {showErrorDetails && (error?.stack || errorInfo) && (
        <details className="mb-4">
          <summary className="mb-2 flex cursor-pointer items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200">
            <Info className="h-4 w-4" />
            Technical Details
          </summary>
          <div className="space-y-2 rounded-md bg-black/5 p-3 text-xs dark:bg-black/30">
            {error?.stack && (
              <div>
                <p className="mb-1 font-semibold">Stack Trace:</p>
                <pre className="overflow-x-auto whitespace-pre-wrap break-all">
                  {error.stack}
                </pre>
              </div>
            )}
            {errorInfo?.componentStack && (
              <div>
                <p className="mb-1 font-semibold">Component Stack:</p>
                <pre className="overflow-x-auto whitespace-pre-wrap break-all">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </details>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {isRetryable && canRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-700 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
            {retryCount > 0 && (
              <span className="text-xs opacity-75">({retryCount}/{maxRetries})</span>
            )}
          </button>
        )}

        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <XCircle className="h-4 w-4" />
          Dismiss
        </button>

        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <Home className="h-4 w-4" />
          Go Home
        </button>
      </div>

      {/* Helpful Hints */}
      {isRetryable && !canRetry && (
        <div className="mt-4 rounded-md bg-blue-50 p-3 dark:bg-blue-950">
          <div className="flex gap-2">
            <Bug className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Multiple retry attempts failed. This might be a persistent issue.
              Please try refreshing the page or contact support if the problem continues.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: Error | null): boolean {
  if (!error) return false;

  const message = error.message.toLowerCase();

  // Network-related errors are typically retryable
  const retryablePatterns = [
    "timeout",
    "connection",
    "network",
    "fetch",
    "loading",
    "chunk",
    "dynamic",
  ];

  return retryablePatterns.some((pattern) => message.includes(pattern));
}

/**
 * Hook-based error boundary for functional components
 */
export function useEnhancedErrorBoundary() {
  const getErrorMessage = (error: unknown): string => {
    if (typeof error === "string") return error;
    if (error instanceof Error) return error.message;
    return "An unexpected error occurred";
  };

  return {
    wrapWithErrorBoundary: (
      component: ReactNode,
      errorProps?: Partial<ErrorBoundaryProps>
    ) => (
      <EnhancedErrorBoundary {...errorProps}>{component}</EnhancedErrorBoundary>
    ),
    getErrorMessage,
    isRetryableError,
  };
}
