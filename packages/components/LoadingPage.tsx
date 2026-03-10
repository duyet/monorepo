import { Skeleton } from "./skeleton";

/**
 * Loading page component for Next.js static generation.
 * Provides a consistent loading skeleton UI across all apps.
 *
 * Usage in app/loading.tsx:
 * ```tsx
 * import { LoadingPage } from "@duyet/components"
 * export default function Page() { return <LoadingPage /> }
 * ```
 *
 * @example
 * // Default variant - full page loading skeleton
 * <LoadingPage variant="default" />
 *
 * // Card variant - centered card loading
 * <LoadingPage variant="card" />
 *
 * // List variant - feed-style loading
 * <LoadingPage variant="list" />
 *
 * // Minimal variant - minimal loading bar
 * <LoadingPage variant="minimal" />
 */
export function LoadingPage({
  variant = "default",
}: {
  variant?: "default" | "card" | "list" | "minimal";
}) {
  if (variant === "minimal") {
    return <MinimalLoading />;
  }

  if (variant === "card") {
    return <CardLoading />;
  }

  if (variant === "list") {
    return <ListLoading />;
  }

  return <DefaultLoading />;
}

function DefaultLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header skeleton */}
        <div className="mb-8 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

function CardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

function ListLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MinimalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
    </div>
  );
}
