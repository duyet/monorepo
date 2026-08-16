# paid-api

Standalone Cloudflare Worker that sells a single chat completion for USDC via [x402](https://x402.org). Live at https://paid.duyet.net.

Payment replaces auth: any client that pays the configured price receives one completion from the Workers AI binding. There is no session or API token.

## Why a separate app

The `@x402` SDK pulls `viem`. Combining that type graph with `apps/agent-api`'s `ai` + `agents` + workers-types stack OOMs `tsc`. This Worker only depends on workers-types and typechecks cleanly.

## Scripts

```bash
pnpm run dev          # wrangler dev on port 8789
pnpm run test         # vitest
pnpm run check-types
pnpm run deploy
```

## Config

Set in `wrangler.toml` `[vars]` (public by design — every 402 response exposes `PAY_TO`):

| Var | Default | Purpose |
| --- | --- | --- |
| `PAY_TO` | required | EVM wallet that receives USDC |
| `X402_NETWORK` | `eip155:84532` | CAIP-2 chain id (Base Sepolia) |
| `X402_FACILITATOR_URL` | `https://x402.org/facilitator` | Facilitator |
| `X402_PRICE` | `$0.01` | Price per chat |

Base mainnet is not supported by the public facilitator. Stay on Sepolia until a self-hosted facilitator exists.

## Related

Documented in the root README and `docs/ai/internal-knowledge.md`.
