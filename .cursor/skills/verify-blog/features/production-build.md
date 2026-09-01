# Production build

The blog ships as static HTML from a Vite/TanStack production build. A reader only sees new posts after that build succeeds and Cloudflare Pages publishes `dist/client`.

## Sub-features

- `build-cli` runs the same production command Pages CI uses.
- `build-clerk` completes without `MISSING_EXPORT` from `@clerk/shared`.
- `build-output` writes `apps/blog/dist/client/index.html`.

## How to get to it (user POV)

- Push to `master` so `.github/workflows/cf-deploy.yml` deploys `duyet-blog`.
- Open a PR so preview Pages runs the same `pnpm --filter blog build`.
- Run the production build locally before merge.

## Driving it with verify-blog

Preconditions:

- `verify-blog doctor` reports `clerkAligned: true` and override `3.47.8`.
- Workspace dependencies are installed (`pnpm install`).

- **Doctor pin.** Confirm Clerk shared is 3.x. Run `.cursor/skills/verify-blog/bin/verify-blog doctor`. JSON has `"clerkAligned": true` and `"override": "3.47.8"`.
- **Build.** Produce the Pages artifact. Run `.cursor/skills/verify-blog/bin/verify-blog build` (or `prove --feature production-build`). Exit code `0`, `"missingExport": false`, `"indexHtml": true`.
- **Log.** Open `evidenceDir/build.log`. It must not contain `MISSING_EXPORT`, `ClientContext`, or `OrganizationProvider is not exported`.
- **Proof.** `apps/blog/dist/client/index.html` exists after the command returns.

## Gotchas

- `pnpm --filter blog check-types` can pass while `vite build` fails on Clerk exports. The outage was rolldown, not tsc.
- `@clerk/shared` 4.x looks like a valid Renovate major bump. It is not compatible with `@clerk/clerk-react` 5.x (`^3.47`).
- `failOnError: false` on prerender crawl errors does not hide a bundler `MISSING_EXPORT`. If Vite exits non-zero, Pages stays on the previous deploy.
