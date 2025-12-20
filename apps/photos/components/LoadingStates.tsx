"use client";

import { cn } from "@duyet/libs/utils";

/**
 * Professional loading states for photo components
 */

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "white" | "gray" | "primary";
}

export function LoadingSpinner({
  size = "md",
  className,
  color = "white",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const colorClasses = {
    white: "border-white border-t-transparent",
    gray: "border-gray-400 border-t-transparent",
    primary: "border-blue-600 border-t-transparent",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      aria-label="Loading..."
      role="status"
    />
  );
}

interface ImageSkeletonProps {
  aspectRatio: string;
  className?: string;
  animated?: boolean;
}

export function ImageSkeleton({
  aspectRatio,
  className,
  animated = true,
}: ImageSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-gray-200 dark:bg-gray-700",
        animated && "animate-pulse",
        className
      )}
      style={{ aspectRatio }}
      aria-label="Loading image..."
      role="status"
    />
  );
}

interface PhotoCardSkeletonProps {
  className?: string;
  showMetadata?: boolean;
}

export function PhotoCardSkeleton({
  className,
  showMetadata = true,
}: PhotoCardSkeletonProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg bg-gray-100 shadow-sm dark:bg-gray-800",
        "mb-4 break-inside-avoid sm:mb-6 lg:mb-8",
        className
      )}
    >
      {/* Image skeleton with random aspect ratio for variety */}
      <ImageSkeleton
        aspectRatio={`${Math.floor(Math.random() * 200) + 200}/${Math.floor(Math.random() * 200) + 200}`}
        className="w-full"
      />

      {/* Optional metadata skeleton */}
      {showMetadata && (
        <div className="space-y-2 p-3">
          <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      )}
    </div>
  );
}

interface PhotoGridSkeletonProps {
  count?: number;
  columns?: number;
  className?: string;
}

export function PhotoGridSkeleton({
  count = 12,
  columns = 3,
  className,
}: PhotoGridSkeletonProps) {
  return (
    <div className={cn("grid gap-4 sm:gap-6 lg:gap-8", className)}>
      <div
        className="grid gap-4 sm:gap-6 lg:gap-8"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {Array.from({ length: count }, (_, i) => (
          <PhotoCardSkeleton key={i} showMetadata={false} />
        ))}
      </div>
    </div>
  );
}

interface LightboxLoadingProps {
  message?: string;
  className?: string;
}

export function LightboxLoading({
  message = "Loading image...",
  className,
}: LightboxLoadingProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-black/20",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3 text-white">
        <LoadingSpinner size="lg" color="white" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] items-center justify-center text-center",
        "rounded-lg border-2 border-dashed border-gray-300 bg-gray-50",
        "dark:border-gray-600 dark:bg-gray-800",
        className
      )}
    >
      <div className="max-w-md space-y-4">
        {icon && <div className="mx-auto w-fit text-gray-400">{icon}</div>}

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {action && <div className="pt-2">{action}</div>}
      </div>
    </div>
  );
}

interface ProgressiveLoadingProps {
  isLoading: boolean;
  hasError: boolean;
  isEmpty: boolean;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ProgressiveLoading({
  isLoading,
  hasError,
  isEmpty,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
  className,
}: ProgressiveLoadingProps) {
  if (isLoading) {
    return <div className={className}>{loadingComponent}</div>;
  }

  if (hasError) {
    return <div className={className}>{errorComponent}</div>;
  }

  if (isEmpty) {
    return <div className={className}>{emptyComponent}</div>;
  }

  return <div className={className}>{children}</div>;
}
