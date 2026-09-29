import { cn } from "@duyet/libs/utils";

/**
 * Professional loading states for photo components
 */

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

/**
 * Full-page loading grid used while photo data is being fetched.
 */
export function LoadingGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="w-full px-4 py-8">
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="mb-4 break-inside-avoid">
            <ImageSkeleton
              aspectRatio={i % 3 === 0 ? "4/5" : i % 3 === 1 ? "3/4" : "1/1"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
