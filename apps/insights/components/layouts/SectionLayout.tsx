import { type ReactNode, Suspense } from "react";
import { SkeletonCard } from "../SkeletonCard";

interface SectionLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Shared section layout component for consistent styling across all pages
 * Provides consistent spacing, typography, and Suspense boundaries
 */
export function SectionLayout({
  title,
  description,
  children,
  className = "",
}: SectionLayoutProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Suspense fallback={<SkeletonCard />}>{children}</Suspense>
    </section>
  );
}
