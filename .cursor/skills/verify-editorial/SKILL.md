---
name: verify-editorial
description: Prove home/blog editorial chrome — featured hero, app-switcher dither that does not cover labels, subscribe dialog. Drive live Vite or prerendered HTML.
---

# Verify editorial chrome (home + blog)

Use this when changing the blog homepage featured card, app switcher hover, or the Get updates dialog. `verify-blog` still owns Clerk/Pages production builds. This lever proves **layout and contrast on the running editorial apps**.

Harness: `.cursor/skills/verify-editorial/bin/verify-editorial`. Always invoke it from the repo root. It prints JSON.

Feature map: [`features/README.md`](features/README.md).

## Launch

Home Vite `:3001`, blog Vite `:3000` (or Tailscale Serve). Do not treat `tsc` as proof.

```bash
.cursor/skills/verify-editorial/bin/verify-editorial doctor
.cursor/skills/verify-editorial/bin/verify-editorial prove-dev
```

Override bases with `BLOG_URL` / `HOME_URL` (defaults `http://127.0.0.1:3000` and `http://127.0.0.1:3001`).

## Doctor

Pass requires:

- `apps/home/src/globals.css` and `apps/blog/app/globals.css` import `@duyet/components/editorial/tokens.css`.
- App switcher hover dither is **not** `hover:after:opacity-100` (labels must stay readable).
- Subscribe dialog still has a dither panel and a heading “Get updates”.

## Drive

| Feature | Proof |
|---|---|
| `featured-hero` | `GET $BLOG_URL/` is 200, HTML contains the display heading `Notes, mostly on` and `Read the post`. Featured image uses `object-cover`. |
| `dither-contrast` | Source: switcher `hover:after:opacity-30` (or lower). Dither has a `mask-image` so dots do not sit on the label. |
| `subscribe-dialog` | Source: `SubscribeDitherPanel` exists; dither `after:opacity` is ≤ 40; form copy lives in a separate column. |
| `post-html` | `GET $BLOG_URL/2026/08/grok-bot/` is 200, contains `<article class="typeset`, body copy (`SuperGrok Heavy`), no `server rendering errored`. |

```bash
.cursor/skills/verify-editorial/bin/verify-editorial drive featured-hero
.cursor/skills/verify-editorial/bin/verify-editorial drive dither-contrast
.cursor/skills/verify-editorial/bin/verify-editorial prove-dev
```

## Proof

- Live HTML for the hero (curl the running blog), not a screenshot alone.
- Source grep for dither opacity/mask — that is the contrast contract.
- Fail if `Cannot destructure` or `isNotFound:!0` appears on `/` or a featured post URL.

## Cleanup

No servers to stop. Do not `pkill vite`.
