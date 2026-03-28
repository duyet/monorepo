/**
 * Model definitions for OpenRouter
 *
 * Defines available chat models, capabilities, and defaults.
 * Uses OpenRouter as the provider (not Vercel AI Gateway).
 */

export const DEFAULT_CHAT_MODEL = "openrouter/free";

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
    id: "openrouter/free",
    name: "Free (GPT OSS 20B)",
    provider: "openrouter",
    description: "Free tier model via OpenRouter",
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "GPT OSS 20B",
    provider: "openai",
    description: "Compact reasoning model (free)",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    description: "Fast and capable model with tool use",
  },
  {
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "anthropic",
    description: "Balanced performance and capability",
  },
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek V3",
    provider: "deepseek",
    description: "Open-weight model with tool use (free)",
  },
];

/**
 * Static capability map for known models.
 * OpenRouter models generally support tools; vision/reasoning vary.
 */
export const modelCapabilities: Record<string, ModelCapabilities> = {
  "openrouter/free": { tools: true, vision: false, reasoning: false },
  "openai/gpt-oss-20b:free": { tools: true, vision: false, reasoning: true },
  "google/gemini-2.5-flash": { tools: true, vision: true, reasoning: false },
  "anthropic/claude-sonnet-4": { tools: true, vision: true, reasoning: false },
  "deepseek/deepseek-chat-v3-0324:free": {
    tools: true,
    vision: false,
    reasoning: false,
  },
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
