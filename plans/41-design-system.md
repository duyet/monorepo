# 41 — Design-system extraction + playground + decompose God-components

**Area:** Platform · **Effort:** L · **Impact:** High · **Conflict group:** packages/* (big mover — land before other package refactors) · **Depends on:** none, but rebase `10`/`42` after.

## Problem

The 18 shadcn/Radix primitives are trapped inside the app-specific `@duyet/components`, mixed with `SiteHeader.tsx` (**798 LOC**), `ExploreApps`, etc. There's an orphaned `components/components/ui/navigation-menu.tsx`. No component playground/Storybook exists, so there's no visual harness or visual-regression basis. `packages/libs/getPost.ts` is a 407-LOC `if (field===)` chain.

## Outcome / acceptance criteria

- [ ] A dedicated `@duyet/ui` package holding the shadcn primitives, independently importable; the orphaned `navigation-menu.tsx` folded in or deleted.
- [ ] Apps + `@duyet/components` import primitives from `@duyet/ui` (codemod the import paths).
- [ ] A component playground (Ladle or Storybook) with stories for the primitives + key components; basis for visual regression (Chromatic/Playwright screenshots).
- [ ] God-components decomposed: `SiteHeader` split into sub-components; `getPost.ts` frontmatter parsing replaced with a field-handler map.

## Scope

**In:** `@duyet/ui` extraction + playground + component decomposition. **Out:** visual-regression CI wiring can piggyback on `40`'s Playwright; env/dead-code (`42`).

## Key files

- new `packages/ui/**` (from `packages/components/ui/*`), `packages/components/components/ui/navigation-menu.tsx` (orphan), all app import sites (codemod)
- `packages/components/SiteHeader.tsx` (798 LOC), `packages/libs/getPost.ts` (:127-210 if-chain)
- new `*.stories.tsx`, Ladle/Storybook config

## Approach

1. Create `packages/ui`; move the shadcn primitives; keep `@duyet/components` for app-specific composites. Fold/delete the orphan.
2. Codemod imports across apps (`@duyet/components/ui/*` → `@duyet/ui`); run typecheck.
3. Stand up Ladle/Storybook; write stories for primitives + `SiteHeader`, `ExploreApps`, cards.
4. Decompose `SiteHeader` into sub-components; replace `getPost.ts` if-chain with a `Record<field, handler>` map (behavior-preserving — add tests first).
5. Build all; deploy (chrome unchanged visually); QA a couple of apps to confirm no visual regressions.

## Verification

```
pnpm run check-types && pnpm run test
pnpm exec biome lint packages/ui packages/components
# Playground builds; SiteHeader + getPost tests green; apps render identically (screenshot diff).
```

## Risks

- Import churn across 16 apps — do it as a mechanical codemod in one commit; typecheck gates it.
- Behavior-preserving refactor of `getPost` — write tests capturing current frontmatter parsing before refactoring.

## Kickoff Prompt

> You are running plan `plans/41-design-system.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md`, then the plan. This is the big package mover — land it before other `packages/*` refactors.
>
> Deliver: (1) a new `packages/ui` holding the shadcn primitives from `packages/components/ui/*`, independently importable; fold or delete the orphaned `packages/components/components/ui/navigation-menu.tsx`. (2) A codemod updating all app import paths to `@duyet/ui`, gated by typecheck. (3) A component playground (Ladle preferred for speed) with stories for the primitives + `SiteHeader`/`ExploreApps`/cards. (4) Decompose `SiteHeader.tsx` (798 LOC) into sub-components and replace the 407-LOC `if (field===)` frontmatter chain in `packages/libs/getPost.ts` with a field-handler map — write tests capturing current parsing FIRST, then refactor behavior-preserving.
>
> Verify `check-types` + `test` + `biome lint`; the visual chrome must be unchanged. Deploy and screenshot a couple of apps to confirm no visual regression (light/dark). Semantic commits (`refactor(ui)`, `feat(ui)`, `refactor(lib)`). Update the plan Status. If `plans/10` or `42` are mid-flight on `packages/*`, coordinate/rebase.
