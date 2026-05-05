/**
 * Model definitions for Cloudflare Workers AI.
 */

import { FAST_MODEL } from "../agent";

export const DEFAULT_CHAT_MODEL = FAST_MODEL;

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: FAST_MODEL,
    name: "Gemini 3.1 Flash Lite",
    provider: "cloudflare",
    description: "Google Gemini model via Cloudflare Workers AI + AI Gateway",
  },
];

/**
 * Static capability map for known models.
 * Cloudflare Workers AI chat models generally support tools; vision/reasoning vary.
 */
export const modelCapabilities: Record<string, ModelCapabilities> = {
  [FAST_MODEL]: { tools: true, vision: false, reasoning: false },
};

export function getCapabilities(modelId: string): ModelCapabilities {
  return (
    modelCapabilities[modelId] ?? {
      tools: true,
      vision: false,
      reasoning: false,
    }
  );
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

const LEGACY_MODEL_ALIASES: Record<string, string> = {
  "openrouter/free": DEFAULT_CHAT_MODEL,
  "openai/gpt-oss-20b:free": DEFAULT_CHAT_MODEL,
};

export function resolveModelId(modelId?: string): string {
  if (!modelId) return DEFAULT_CHAT_MODEL;
  const resolved = LEGACY_MODEL_ALIASES[modelId] ?? modelId;
  return allowedModelIds.has(resolved) ? resolved : DEFAULT_CHAT_MODEL;
}
