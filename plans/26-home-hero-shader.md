# 26 — Home hero redesign with Paper Shaders

**Area:** Content (home) · **Effort:** M · **Impact:** Med · **Conflict group:** apps/home (isolated) · **Depends on:** none. _Requested directly by Duyet._

## Problem / intent

Replace the current static home hero with a large, animated shader background using **Paper Shaders** ([shaders.paper.design](https://shaders.paper.design)) — an open-source, tree-shakeable WebGL/canvas shader library from Paper. Package: `@paper-design/shaders-react@0.0.76` (deps `@paper-design/shaders@0.0.76`; React 18/19 peer; ESM, `sideEffects:false`). Components include `MeshGradient`, `DotOrbit`, `Waves`, etc.

## Design-rule exception (explicit)

`goal.md` mandates shadcn-only, no custom CSS/colors/fonts. A WebGL shader hero is a **deliberate, scoped exception** for the home hero background only. Rules: the exception is confined to the hero band on `apps/home`; all other chrome stays shadcn-only; the hero **content** (title, copy, CTAs) stays shadcn components layered over the shader. Document the exception inline.

## Outcome / acceptance criteria

- [ ] Home hero shows an animated Paper Shaders background (default: `MeshGradient` in warm/near-black tokens consistent with the design system; try 1–2 alternatives).
- [ ] Hero text/CTAs remain crisp, accessible (AA contrast) shadcn components over the shader; a legibility scrim if needed.
- [ ] **`prefers-reduced-motion`: render a static gradient fallback** (no animation) — accessibility non-negotiable.
- [ ] Performant: lazy/dynamic-import the shader, pause when offscreen/tab hidden, cap devicePixelRatio; no layout shift; no measurable LCP regression on mobile.
- [ ] SSR-safe: prerender emits a static poster/gradient; the shader hydrates client-side only (guard `window`/WebGL). No hydration mismatch.
- [ ] Verify the Paper Shaders license permits this use before shipping.

## Scope

**In:** home hero background + fallback + perf/a11y guards. **Out:** other apps, other home sections, global chrome.

## Key files

- `apps/home/src/routes/index.tsx` (hero), new `apps/home/src/components/HeroShader.tsx`, `apps/home/package.json` (add dep)
- possibly a static poster asset in `apps/home/public/`

## Approach

1. `pnpm --filter @duyet/home add @paper-design/shaders-react`. Confirm license.
2. Build `HeroShader.tsx`: dynamic-import the shader, render only after mount (SSR-safe), colors from the design tokens; IntersectionObserver + `visibilitychange` to pause; clamp DPR.
3. Add a static gradient poster as the prerendered/reduced-motion fallback; wire `prefers-reduced-motion`.
4. Layer shadcn hero content over it with a legibility scrim; verify AA contrast.
5. Build home; confirm the prerendered HTML has the static fallback (no blank hero pre-hydration). Deploy; browser-QA desktop + ~390px, light/dark, reduced-motion, and check LCP.

## Verification

```
pnpm --filter @duyet/home run build && rg -n "HeroShader|prefers-reduced-motion" apps/home/src -l
# Manual: DevTools → emulate prefers-reduced-motion → static hero; throttle mobile → no LCP/CLS regression; light/dark.
```

## Risks

- WebGL cost on low-end mobile — pause offscreen, clamp DPR, static fallback. If LCP regresses, ship the static poster as LCP and fade the shader in after load.
- Hydration mismatch — render shader client-only; prerender the poster.
- License — verify before shipping (Paper Shaders is open source; confirm terms).

## Kickoff Prompt

> You are running plan `plans/26-home-hero-shader.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md` (Public App UI Direction + goal.md), then the plan. This is a **deliberate, scoped exception** to the shadcn-only rule — confined to the `apps/home` hero background; keep everything else shadcn-only and document the exception inline.
>
> Deliver: add `@paper-design/shaders-react` to `apps/home` (confirm its license first) and build a `HeroShader.tsx` animated background (start with `MeshGradient` in the warm/near-black design tokens; try 1–2 variants). Requirements: SSR-safe (prerender a static gradient poster, hydrate the shader client-only, no hydration mismatch), `prefers-reduced-motion` renders the static fallback with no animation, lazy/dynamic-import + pause offscreen/tab-hidden + clamp devicePixelRatio, hero text/CTAs stay accessible shadcn components (AA contrast, scrim if needed), and no LCP/CLS regression on mobile.
>
> Verify the prerendered HTML shows the static fallback, deploy, and browser-QA at desktop + ~390px in light/dark and with reduced-motion emulated; check mobile LCP. If LCP regresses, make the static poster the LCP element and fade the shader in after load. Semantic commits (`feat(home)`). Update the plan Status with which shader/variant shipped.
