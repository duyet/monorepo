# 25 — CV automated PDF export

**Area:** Content · **Effort:** M · **Impact:** Med · **Conflict group:** apps/cv (isolated) · **Depends on:** none.

## Problem

`apps/cv/public/duyet.cv.pdf` is a **manually committed file** served via `<object>`/pdf.js. There is no generation from the live CV data (`config/cv.data.tsx`), so the PDF and the HTML CV can silently drift. The CV is intentionally Computer Modern serif — the generated PDF must preserve that fidelity.

## Outcome / acceptance criteria

- [ ] `duyet.cv.pdf` is generated at build time from the live prerendered CV (headless print) — single source of truth is `config/cv.data.tsx`.
- [ ] A dedicated print stylesheet keeps Computer Modern + clean pagination (page breaks, margins, no nav chrome).
- [ ] CI regenerates the PDF on CV changes; the committed PDF stays in sync (or is generated fresh and uploaded on deploy).
- [ ] `/pdf` route still serves it; `og:image` for `/` optionally added.

## Scope

**In:** headless PDF generation + print CSS + CI wiring. **Out:** CV content/design changes (serif kept).

## Key files

- `apps/cv/src/routes/{index,pdf}.tsx`, `apps/cv/config/cv.data.tsx`, new `apps/cv/scripts/generate-pdf.ts`, print stylesheet
- `.github/workflows/*` (or the app's `cf:deploy:prod`) to run generation in CI

## Approach

1. Add a print stylesheet (`@media print`) preserving Computer Modern, setting page size/margins, hiding nav/footer, and controlling page breaks per section.
2. Add a build script using headless Chromium (Playwright/Puppeteer) to load the prerendered `/` (or a `/print` route) and print-to-PDF into `public/duyet.cv.pdf`.
3. Wire it into the CV build/deploy so the PDF regenerates when data changes; keep `/pdf` serving the file.
4. Deploy; verify the generated PDF matches the HTML CV (content + fonts) and prints cleanly.

## Verification

```
pnpm --filter @duyet/cv run build   # public/duyet.cv.pdf regenerated from live data
# Manual: diff the PDF content against the HTML CV; check pagination + Computer Modern render.
```

## Risks

- Headless Chromium in CI — use Playwright's bundled browser; keep it in the CV build only.
- Font embedding — ensure Computer Modern is embedded in the PDF.

## Kickoff Prompt

> You are running plan `plans/25-cv-auto-pdf.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md`, then the plan. The CV's Computer Modern serif is intentional — preserve it.
>
> Deliver: (1) a `@media print` stylesheet for `apps/cv` preserving Computer Modern with clean pagination (page size, margins, section breaks, no nav/footer). (2) A build script using headless Chromium (Playwright) that loads the prerendered CV and prints to `public/duyet.cv.pdf`, so the PDF derives from `config/cv.data.tsx` and can't drift. (3) Wire generation into the CV build/deploy; keep `/pdf` serving the file; optionally add `og:image` for `/`.
>
> Verify the regenerated PDF matches the HTML CV (content, fonts, pagination), deploy, and confirm `/pdf` renders. Keep Playwright/Chromium scoped to the CV build only. Semantic commits (`feat(cv)`). Update the plan Status.
