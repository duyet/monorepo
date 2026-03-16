/**
 * Shared test fixtures for llm-timeline component tests
 */

export const testModel = {
  name: "GPT-4",
  date: "2023-03-14",
  org: "OpenAI",
  params: "1.8T",
  type: "model" as const,
  license: "closed" as const,
  desc: "A large multimodal model",
  source: "curated" as const,
} as const;

export const testModel2 = {
  name: "Claude 2",
  date: "2023-07-11",
  org: "Anthropic",
  params: null,
  type: "model" as const,
  license: "closed" as const,
  desc: "A helpful assistant model",
  source: "curated" as const,
} as const;

export const filterInfoBaseProps = {
  resultCount: 42,
  view: "models" as const,
  models: [],
} as const;
