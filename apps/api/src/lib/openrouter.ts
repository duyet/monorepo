/**
 * OpenRouter API client for AI-powered content generation
 * @module lib/openrouter
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "z-ai/glm-4.5-air:free";
const OPENROUTER_REFERER = "https://api.duyet.net";
const MAX_TOKENS = 200;

interface OpenRouterChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
  content?: string;
}

export interface CardDescriptionInput {
  apiKey: string;
  content: string;
  systemPrompt: string;
}

/**
 * Ask OpenRouter for a short description of `content`.
 * @throws Error when OpenRouter responds with a non-2xx status
 */
export async function generateCardDescription({
  apiKey,
  content,
  systemPrompt,
}: CardDescriptionInput): Promise<string> {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": OPENROUTER_REFERER,
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Content to describe:\n\n${content}` },
      ],
      max_tokens: MAX_TOKENS,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as OpenRouterChatResponse;

  // OpenRouter has returned both shapes over time; `||` keeps the original
  // falsy-fallthrough (an empty choices[0] content falls back to data.content).
  const description = data.choices?.[0]?.message?.content || data.content || "";

  // Remove special tokens
  return description.replace(/<s>|\[OUT\]|<INS>/g, "").trim();
}
