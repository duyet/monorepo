# monorepo

## What this codebase does

Personal Bun/Turborepo for duyet.net — multiple public apps (homepage, blog with Auth0, CV, analytics dashboard, photo gallery, LLM timeline, AI chat, AI percentage tracker), a Hono API on Cloudflare Workers, data-sync CLI jobs to ClickHouse, and shared packages. Frontend apps use React 19 + TanStack Start/Router + Tailwind CSS 4, deployed to Cloudflare Pages. Rust crates compile to WASM for performance-critical tasks (markdown rendering, diff, EXIF). AI chat app uses Workers AI + AI SDK with Clerk auth.

## Auth shape

- `getUserFromRequest` — verifies Clerk JWT via custom JWKS verification in `apps/agents/lib/auth.ts`
- `useClerkAuthToken` — client-side hook returning Clerk session token from `window.Clerk` in `apps/agents/lib/hooks/use-clerk-auth.ts`
- `ClerkAuthProvider` — dynamic Clerk React provider loader with publishable key validation in `packages/components/ClerkAuthProvider.tsx`
- `useClerkComponents` — lazy-loaded Clerk components (SignedIn, SignedOut, SignInButton, UserButton) in `apps/agents/lib/hooks/use-clerk-components.ts`
- `hashIp` — SHA-256 IP hashing with server-side pepper for rate limiting in `apps/agents/lib/auth.ts`

## Threat model

Attacker wants: (1) API keys or ClickHouse credentials exposed via non-standard headers, (2) Clerk JWT bypass via custom verification flaws, (3) Rate limit evasion via IP spoofing or missing pepper config. Admin/moderator actions limited to AI chat app — no bulk data access paths. Client-side Clerk publishable keys are intentionally public; focus on backend token verification and rate limit enforcement.

## Project-specific patterns to flag

- `auth.ts` fallback to hardcoded pepper `"duyet-agents-default-pepper"` when `RATE_LIMIT_PEPPER` missing — weakens IP hashing security
- Custom JWT verification in `apps/agents/lib/auth.ts` instead of Clerk SDK — crypto implementation may have subtle bugs (algorithm confusion, missing claim checks)
- ClickHouse credentials sent via `X-ClickHouse-Key` / `X-ClickHouse-User` headers in `apps/api/src/routes/insights.ts` — non-standard, could be logged by intermediaries
- WakaTime API key Base64-encoded in Basic auth header (not encrypted) in `apps/api/src/routes/insights.ts`
- CORS allows `http://localhost:*` origins in API insights route — development config could leak to production

## Known false-positives

- `benchmarks/wasm/fixtures/` — contains fake JWT tokens and passwords for WASM benchmarking, not real credentials
- `scripts/sync-app-secrets.test.ts` — uses obviously fake Clerk keys (`sk_test_abc123`) for testing sync logic
- `packages/components/ClerkAuthProvider.tsx` — regex validates publishable key format (`pk_test_*`, `pk_live_*`) which are meant to be public
- `apps/data-sync/src/syncers/github.syncer.ts` — optional auth token since GitHub contributions data is public
- `apps/blog/_posts/` — historical security education posts may contain example payloads or vulnerability discussions
