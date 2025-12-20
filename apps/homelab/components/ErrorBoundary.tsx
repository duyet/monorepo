"use client";

import { Component, type ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // In production, you could send this to an error reporting service
    // Example: Sentry, LogRocket, etc.
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              Something went wrong
            </CardTitle>
            <CardDescription>
              An error occurred while rendering this component. Please try
              refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-4 rounded-md bg-muted p-4">
                <p className="text-sm font-mono text-destructive">
                  {this.state.error.toString()}
                </p>
                {this.state.error.stack && (
                  <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-48">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
