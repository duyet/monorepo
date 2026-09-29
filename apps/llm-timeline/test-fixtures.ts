/**
 * Shared test fixtures for llm-timeline component tests.
 *
 * Only `filterInfoBaseProps` is still used — by `filter-info.test.tsx`.
 * `testModel` and `testModel2` were used by `model-card.test.tsx`, which went with
 * the unreachable `model-card.tsx`; they are removed rather than left as
 * unreferenced fixtures that read as coverage.
 */

export const filterInfoBaseProps = {
  resultCount: 42,
  view: "models" as const,
  models: [],
} as const;
