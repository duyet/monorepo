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
    <section className={className}>
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-[#1a1a1a]/60">{description}</p>
        )}
      </div>
      <Suspense fallback={<SkeletonCard />}>{children}</Suspense>
    </section>
  );
}
