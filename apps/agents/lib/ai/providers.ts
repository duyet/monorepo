/**
 * AI provider configuration.
 *
 * Uses the Cloudflare Workers AI binding and routes requests through AI Gateway
 * for observability, caching, and gateway policy enforcement.
 */

import { createWorkersAI } from "workers-ai-provider";
import { DEFAULT_CHAT_MODEL, resolveModelId } from "./models";

interface CloudflareAiEnv {
  AI?: Ai;
  AI_GATEWAY?: string;
  CF_AIG_GATEWAY_ID?: string;
  CF_AIG_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
}

/**
 * Create a Workers AI language model instance.
 */
export function getLanguageModel(env: CloudflareAiEnv, modelId: string) {
  const gateway = {
    id: env.CF_AIG_GATEWAY_ID || env.AI_GATEWAY || "default",
  };
  const apiKey = env.CF_AIG_TOKEN || env.CLOUDFLARE_API_TOKEN;

  if (!env.AI && !(env.CLOUDFLARE_ACCOUNT_ID && apiKey)) {
    throw new Error(
      "Missing Cloudflare AI configuration. Configure the AI binding or Cloudflare AI Gateway credentials."
    );
  }

  const resolvedModelId = resolveModelId(modelId);
  const workersai =
    env.CLOUDFLARE_ACCOUNT_ID && apiKey
      ? createWorkersAI({
          accountId: env.CLOUDFLARE_ACCOUNT_ID,
          apiKey,
          gateway,
        })
      : createWorkersAI({
          binding: env.AI as Ai,
          gateway,
        });

  return {
    model: workersai.chat(resolvedModelId || DEFAULT_CHAT_MODEL),
    resolvedModelId,
  };
}
