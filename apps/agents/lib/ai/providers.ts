/**
 * AI provider configuration
 *
 * Uses OpenRouter as the LLM provider via @openrouter/ai-sdk-provider.
 * Resolves the "openrouter/free" alias to actual free model IDs.
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/**
 * Create an OpenRouter language model instance.
 *
 * @param apiKey - OpenRouter API key
 * @param modelId - Model identifier (e.g. "openai/gpt-oss-20b:free")
 * @returns The AI SDK language model and resolved model ID
 */
export function getLanguageModel(apiKey: string, modelId: string) {
  if (!apiKey) {
    throw new Error(
      "Missing OPENROUTER_API_KEY. Configure the OpenRouter secret."
    );
  }

  // Resolve the "openrouter/free" alias to actual model
  const resolvedModelId =
    !modelId || modelId === "openrouter/free"
      ? "openai/gpt-oss-20b:free"
      : modelId;

  const openrouter = createOpenRouter({ apiKey });

  return {
    model: openrouter.chat(resolvedModelId),
    resolvedModelId,
  };
}
