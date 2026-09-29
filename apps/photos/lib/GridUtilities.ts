/**
 * Masonry grid configuration for the photo gallery.
 *
 * ## Why this file is so small
 *
 * It used to be 261 lines of "grid utilities": column calculation, sorting,
 * filtering, year grouping, item dimension maths and a preload policy. Measured
 * against the app, **none of it was reachable.** `components/PhotoGrid.tsx`
 * imports exactly two things — `MASONRY_CONFIG.breakpoints` and
 * `getMasonryClasses()` — and the rest was referenced only by
 * `__tests__/lib/GridUtilities.test.ts`.
 *
 * `MASONRY_CONFIG.gutter` and `.animation` are the sharpest example: nothing read
 * them, and the only thing that did was a test asserting
 * `MASONRY_CONFIG.gutter.mobile === "16px"` — a test pinning a literal to
 * itself, which made unread config look configured.
 *
 * `groupPhotosByYear` was duplicated verbatim in `lib/unsplash.ts`, where the
 * live version lives; the copy here had no callers.
 *
 * Git has the rest (`git show <sha>^:apps/photos/lib/GridUtilities.ts`), and the
 * recovery command is in `docs/ai/core-memory.md`.
 */

interface BreakpointConfig {
  [key: string]: number;
}

interface GridConfiguration {
  /**
   * Column count per viewport width, keyed by min-width in px plus a
   * `default` fallback. Passed straight to `react-masonry-css`'s
   * `breakpointCols`, which is why the `default` key matters — it is the
   * column count above the largest breakpoint.
   */
  breakpoints: BreakpointConfig;
}

/**
 * Masonry breakpoints for photo display, widest-first: 7 columns at 1920px+,
 * tapering to 1 on mobile.
 */
export const MASONRY_CONFIG: GridConfiguration = {
  breakpoints: {
    default: 7, // 7 columns on ultra-wide (1920px+)
    1920: 6, // 6 columns on very wide
    1536: 5, // 5 columns on large desktop
    1280: 4, // 4 columns on desktop
    1024: 3, // 3 columns on smaller desktop
    768: 2, // 2 columns on tablet
    640: 1, // 1 column on mobile
  },
};

/**
 * Static class strings for the masonry container and its columns.
 *
 * Hoisted to module scope by `PhotoGrid` — these never change, so there is no
 * reason to rebuild the object on every render.
 */
export function getMasonryClasses(): {
  container: string;
  column: string;
} {
  return {
    container: "flex w-full gap-3 sm:gap-4",
    column: "bg-clip-padding",
  };
}
