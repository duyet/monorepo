# Code Smell and Dead Code Review - 2026-04-26

Scope: changes since `2026-04-25T21:00:52Z`.

Recently changed files:

- `CLAUDE.md`
- `apps/home/src/routes/about.tsx`
- `apps/photos/__tests__/photos-data.test.ts`
- `apps/photos/public/photos-data.json`

## Warning

### Repeated experience value in about page metadata

- File: `apps/home/src/routes/about.tsx:23`
- File: `apps/home/src/routes/about.tsx:70`
- File: `apps/home/src/routes/about.tsx:360`
- Finding: the same `8+ years` value appeared in JSON-LD, meta description, and visible copy. The recent change fixed two stale metadata strings while the visible page already had the newer value, which shows the repetition can drift.
- Fix: introduced one `experienceYears` constant and reused it in all three strings.

## Dead Code

No dead-code removals were made.

Search evidence:

- `rg "ResumeIcon|GithubIcon|LinkedInIcon|BlogIcon" apps/home/src/routes/about.tsx -n` found definitions at lines 89, 134, 174, and 207 plus usages in the `links` data at lines 270, 278, 290, and 302.
- `rg "photos-data.json|photosDataPath|generated gallery dataset" apps packages -n --glob '!**/__tests__/**' --glob '!**/*.test.*'` found runtime and generation references in `apps/photos/hooks/usePhotos.ts`, `apps/photos/scripts/generate-photos-data.ts`, and `apps/photos/CLAUDE.md`.
- `rg "readPublicJson|fetchPhotosData|cachedPhotos|cacheError|fetchPromise" apps/photos -n --glob '!**/__tests__/**' --glob '!**/*.test.*'` found each helper and cache binding referenced by `usePhotos`.
