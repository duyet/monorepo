# 24 — Syndication (feeds) + newsletter + llm-timeline auto-deploy

**Area:** Content · **Effort:** M · **Impact:** Med · **Conflict group:** blog scripts + CI · **Depends on:** none.

## Problem

Feed coverage is partial: blog has one RSS feed (no Atom, no per-tag/category/series feeds); kb has **no feed at all**; there's no newsletter/subscribe capture anywhere. The llm-timeline daily sync **commits data but never redeploys**, so updates are invisible until a manual build.

## Outcome / acceptance criteria

- [ ] Blog: per-tag/category/series RSS (`/tag/<t>/rss.xml` etc.) + an Atom variant + JSON Feed of the main feed.
- [ ] kb: `feed.xml` (RSS/Atom) + JSON Feed, with `<link rel=alternate>` in head.
- [ ] Newsletter subscribe form (Buttondown/ListMonk/CF Worker) on blog + home, privacy-respecting; RSS-to-email optional.
- [ ] llm-timeline sync workflow triggers a deploy after the data commit + posts a failure alert.

## Scope

**In:** feeds + newsletter + llm-timeline auto-deploy. **Out:** photos feeds (`22`), search (`21`).

## Key files

- `apps/blog/scripts/generate-static-files.ts`, `apps/blog/src/routes/__root.tsx`
- `apps/kb/scripts/generate-static-files.ts`, `apps/kb/src/routes/__root.tsx`
- new subscribe component in `packages/components`, consumed by blog + home; optional `apps/api` endpoint
- `.github/workflows/data-sync-llm-timeline.yml`

## Approach

1. Extend the blog static generator to emit per-tag/category/series RSS + an Atom + JSON Feed (mirror llm-timeline's existing fan-out pattern); add alternate links.
2. Add kb feeds (reuse the blog `rss` dep); wire alternate links.
3. Add a subscribe component (pick a provider; a CF Worker + KV list is the zero-dependency option); place on blog + home; handle double-opt-in/privacy.
4. Extend `data-sync-llm-timeline.yml` to run `cf:deploy:prod` for llm-timeline after the data commit, guarded against deploy loops, with a failure alert (Slack webhook already used elsewhere).
5. Deploy; validate feeds; QA subscribe flow.

## Verification

```
pnpm --filter @duyet/blog run build && rg -n "rss|atom|feed.json" apps/blog/dist -l
# Validate a per-tag feed + kb feed in a validator; submit the subscribe form end-to-end.
```

## Risks

- Feed fan-out output count can balloon — cap sensibly (top tags/series).
- Newsletter provider choice + privacy — prefer a self-hosted/CF option; document data handling.

## Kickoff Prompt

> You are running plan `plans/24-syndication-newsletter.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md`, then the plan. Mirror the existing llm-timeline RSS fan-out for patterns.
>
> Deliver: (1) blog per-tag/category/series RSS + an Atom feed + JSON Feed, with alternate links in the head (`apps/blog/scripts/generate-static-files.ts`). (2) kb `feed.xml` + JSON Feed + alternate links. (3) A privacy-respecting newsletter subscribe component in `packages/components` on blog + home (prefer a CF Worker + KV list to avoid a third-party dependency; double-opt-in). (4) Extend `.github/workflows/data-sync-llm-timeline.yml` to deploy llm-timeline after the data commit (guard against loops) + a failure alert.
>
> shadcn-only. Verify feeds land in `dist` and validate a per-tag + kb feed, deploy, and QA the subscribe flow end-to-end. Semantic commits (`feat(blog)`, `feat(kb)`, `ci`). Update the plan Status.
