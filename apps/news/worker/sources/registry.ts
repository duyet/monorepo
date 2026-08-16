import { hnAdapter } from "./hn.js";
import { huggingNewsAdapter } from "./huggingnews.js";
import type { SourceAdapter } from "./types.js";

export const adapters: Record<string, SourceAdapter> = {
  hn: hnAdapter,
  huggingnews: huggingNewsAdapter,
};
