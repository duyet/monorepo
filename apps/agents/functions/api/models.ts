/**
 * Models API — Cloudflare Pages Function
 *
 * GET /api/models — Return available chat models with capabilities.
 * Cached for 24 hours since model list changes infrequently.
 */

import {
  chatModels,
  getCapabilities,
  type ModelCapabilities,
} from "../../lib/ai/models";

export const onRequestGet: PagesFunction = async () => {
  const capabilities: Record<string, ModelCapabilities> = {};

  for (const model of chatModels) {
    capabilities[model.id] = getCapabilities(model.id);
  }

  return Response.json(
    { models: chatModels, capabilities },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    }
  );
};
