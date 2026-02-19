/**
 * Lazy-loaded CodeBlock component for better performance
 *
 * The CodeBlock component uses React hooks and clipboard API which makes it
 * client-side only. We lazy load it to reduce initial bundle size.
 */

import { lazy, Suspense } from "react";
import type { ComponentProps } from "react";

const CodeBlockImpl = lazy(() =>
  import("./CodeBlock").then((module) => ({
    default: module.CodeBlock,
  }))
);

export function LazyCodeBlock(props: ComponentProps<typeof CodeBlockImpl>) {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-[100px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
      }
    >
      <CodeBlockImpl {...props} />
    </Suspense>
  );
}

// Export as default for MDX compatibility
export default LazyCodeBlock;
