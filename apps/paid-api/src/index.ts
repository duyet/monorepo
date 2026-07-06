/**
 * paid-api — x402 agent-native paid chat (standalone Worker).
 *
 * Why a standalone app (not a route on agent-api): the @x402 SDK pulls viem,
 * whose type graph combined with agent-api's `ai` v7 + `agents` + workers-types
 * graph OOMs `tsc`. This Worker pairs the SDK only with workers-types, which
 * typechecks cleanly. agent-api stays untouched.
 *
 * Payment replaces auth: any agent that pays USDC on Base receives one chat
 * completion. No token, no session. After payment the raw `AI` binding answers
 * directly (no `ai` package — keeps the type graph lean).
 *
 * Config (env-driven; no secret in code):
 *   PAY_TO                EVM wallet receiving USDC. REQUIRED or /chat returns 503.
 *   X402_NETWORK          CAIP-2 chain id. Default "eip155:84532" (Base Sepolia).
 *   X402_FACILITATOR_URL  Default the public Coinbase facilitator.
 *   X402_PRICE            Default "$0.01".
 */
import { Hono } from "hono";
import { z } from "zod";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

export interface Env {
  AI: Ai;
  PAY_TO?: string;
  X402_NETWORK?: string;
  X402_FACILITATOR_URL?: string;
  X402_PRICE?: string;
}

type ChainId = `${string}:${string}`; // CAIP-2, e.g. "eip155:8453"

const DEFAULT_NETWORK: ChainId = "eip155:84532"; // Base Sepolia testnet
const DEFAULT_FACILITATOR = "https://x402.org/facilitator";
const DEFAULT_PRICE = "$0.01";
const MODEL = "@cf/moonshotai/kimi-k2.6";

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const chatSchema = z.object({ message: z.string().trim().min(1).max(8000) });

export function isPaidChatEnabled(env: Env): boolean {
  return EVM_ADDRESS.test(env.PAY_TO ?? "");
}

/** Build a per-request Hono app so price/network/payTo track the live env. */
function buildApp(env: Env): Hono<{ Bindings: Env }> {
  const payTo = env.PAY_TO as `0x${string}`;
  const network = (env.X402_NETWORK ?? DEFAULT_NETWORK) as ChainId;
  const facilitatorUrl = env.X402_FACILITATOR_URL ?? DEFAULT_FACILITATOR;
  const price = env.X402_PRICE ?? DEFAULT_PRICE;

  const resourceServer = new x402ResourceServer(
    new HTTPFacilitatorClient({ url: facilitatorUrl }),
  ).register(network, new ExactEvmScheme());

  const app = new Hono<{ Bindings: Env }>();

  // Unpaid → 402 with payment requirements. Valid payment → verify + settle,
  // then fall through to the handler.
  app.use(
    paymentMiddleware(
      {
        "POST /chat": {
          accepts: { scheme: "exact", price, network, payTo },
          description: "duyet paid-api — one chat completion",
          mimeType: "application/json",
        },
      },
      resourceServer,
    ),
  );

  app.post("/chat", async (c) => {
    const parsed = chatSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }

    try {
      const result = await c.env.AI.run(MODEL, {
        messages: [{ role: "user", content: parsed.data.message }],
      });
      const response =
        typeof result === "string"
          ? result
          : (result as { response?: string }).response ?? "";
      return c.json({ ok: true, response });
    } catch (error) {
      console.error("paid chat completion failed", error);
      // Settlement completes before the handler runs; a failure here is after
      // payment. Surface it honestly.
      return c.json({ error: "Paid chat completion failed" }, 500);
    }
  });

  app.get("/", (c) =>
    c.json({
      name: "duyet paid-api",
      status: "healthy",
      paidChat: "/chat (x402, USDC on Base)",
    }),
  );

  return app;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }
    if (!isPaidChatEnabled(env)) {
      return Response.json(
        { error: "x402 not configured — PAY_TO missing" },
        { status: 503 },
      );
    }
    return buildApp(env).fetch(request, env);
  },
} satisfies ExportedHandler<Env>;
