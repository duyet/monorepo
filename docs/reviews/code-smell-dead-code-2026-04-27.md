# Code Smell & Dead Code Review - 2026-04-27

Scope: recent changes in `duyet/monorepo` since the previous automation run, focused on `apps/llm-timeline` redesign files.

## Findings Fixed

### Warning: unused static app client export

- File: `apps/llm-timeline/components/app-client.tsx`
- Evidence:
  - `rg -n "StaticAppClient" apps/llm-timeline --glob '!**/__tests__/**'`
  - Only the local export/comment matched before removal.
- Fix: removed `StaticAppClient`; the live route still imports `AppClient` through `components/search-params-wrapper.tsx`.
- Confidence: confident.

### Warning: unused timeline client file

- File: `apps/llm-timeline/components/timeline-client.tsx`
- Evidence:
  - `rg -n "TimelineClient|components/timeline-client" apps/llm-timeline --glob '!**/__tests__/**'`
  - Only the local export matched before removal.
- Fix: deleted the unused file.
- Confidence: confident.

### Warning: unused dialog component file

- File: `apps/llm-timeline/components/ui/dialog.tsx`
- Evidence:
  - `rg -n "components/ui/dialog|from \"@/components/ui/dialog\"|<Dialog|Dialog\\(" apps/llm-timeline --glob '!**/__tests__/**'`
  - Only the local component definition matched before removal.
- Fix: deleted the unused file.
- Confidence: confident.

### Info: no-op `FilterInfo` props

- File: `apps/llm-timeline/components/filter-info.tsx`
- Evidence:
  - `rg -n "year=\\{year\\}|org=\\{orgFilter|models=\\{allModels\\}" apps/llm-timeline --glob '!**/__tests__/**'`
  - `year`, `org`, and `models` were passed by `StaticView` but not read by `FilterInfo`.
- Fix: removed the unused props and the unused `Model` type import.
- Confidence: confident.

### Info: stale imports and suppression comments

- Files:
  - `apps/llm-timeline/components/filter-info.tsx`
  - `apps/llm-timeline/components/filters.tsx`
  - `apps/llm-timeline/components/static-view.tsx`
  - `apps/llm-timeline/components/stats-cards.tsx`
  - `apps/llm-timeline/components/__tests__/stats-cards.test.tsx`
- Evidence:
  - `bun run lint` reported unused imports in the touched component files and an unused Biome suppression in the touched test file.
- Fix: removed only the unused imports and stale suppression.
- Confidence: confident.

## Dead Code Notes

No test-only evidence was used for the removals above. The deleted exports had zero non-test references in the app, and the remaining changed files still have live imports from routes or sibling components.
