/**
 * Hand-written OpenAPI 3.1 document describing the public API surface.
 *
 * Dependency-free by design: keep this file in sync with src/index.ts and the
 * route handlers, then re-generate the static mirror at
 * apps/home/public/openapi.json (identical JSON, pretty-printed).
 */

import {
  aiPercentageCurrentSchema,
  aiPercentageHistoryPointSchema,
  commentRequestSchema,
  contactRequestSchema,
  healthSchema,
  insightsOverviewSchema,
  jdRequestSchema,
  serviceInfoSchema,
  submissionAcceptedSchema,
  type Schema,
} from "./openapi-schemas.js";

interface Operation {
  content?: Record<string, unknown>;
  description: string;
  headers?: Record<string, unknown>;
}

function jsonResponse(description: string, schema: Schema): Operation {
  return {
    content: { "application/json": { schema } },
    description,
  };
}

function errorSchema(): Schema {
  return {
    additionalProperties: false,
    properties: { error: { type: "string" } },
    required: ["error"],
    type: "object",
  };
}

function rateLimitHeaders(): Record<string, unknown> {
  return {
    "RateLimit-Limit": { $ref: "#/components/headers/RateLimit-Limit" },
    "RateLimit-Remaining": { $ref: "#/components/headers/RateLimit-Remaining" },
    "RateLimit-Reset": { $ref: "#/components/headers/RateLimit-Reset" },
  };
}

function okResponse(description: string, schema: Schema): Operation {
  return { ...jsonResponse(description, schema), headers: rateLimitHeaders() };
}

function tooManyRequestsResponse(): Operation {
  return {
    ...okResponse(
      "Rate limit exceeded. The response includes a Retry-After header with the number of seconds until the quota resets.",
      errorSchema()
    ),
    headers: {
      ...rateLimitHeaders(),
      "Retry-After": { $ref: "#/components/headers/Retry-After" },
    },
  };
}

function submissionResponses(
  extra: Record<string, Operation> = {}
): Record<string, Operation> {
  return {
    "202": okResponse("Submission accepted and queued for review.", {
      $ref: "#/components/schemas/SubmissionAccepted",
    }),
    "400": jsonResponse(
      "Malformed JSON, unknown field, or a field outside its documented bounds.",
      errorSchema()
    ),
    ...extra,
    "413": jsonResponse("Request body exceeds the size limit.", errorSchema()),
    "415": jsonResponse("Content-Type is not application/json.", errorSchema()),
    "429": tooManyRequestsResponse(),
    "503": jsonResponse(
      "Submission store or upstream post index unavailable.",
      errorSchema()
    ),
  };
}

const submissionRateLimitNote =
  "Limited to 5 requests per IP per 10 minutes on this route; the RateLimit-* headers reflect that bucket.";

const unauthorizedResponse = jsonResponse(
  "Missing or invalid bearer token.",
  errorSchema()
);

export const openApiDocument = {
  components: {
    headers: {
      "RateLimit-Limit": {
        description:
          "Maximum number of requests allowed in the current window (per IP).",
        schema: { type: "integer" },
      },
      "RateLimit-Remaining": {
        description: "Requests remaining in the current window.",
        schema: { type: "integer" },
      },
      "RateLimit-Reset": {
        description: "Seconds until the current window resets.",
        schema: { type: "integer" },
      },
      "Retry-After": {
        description:
          "Seconds to wait before retrying the request (sent with 429 responses).",
        schema: { type: "integer" },
      },
    },
    schemas: {
      AiPercentageAvailable: {
        additionalProperties: false,
        properties: { available: { type: "boolean" } },
        required: ["available"],
        type: "object",
      },
      AiPercentageCurrent: aiPercentageCurrentSchema,
      AiPercentageHistoryPoint: aiPercentageHistoryPointSchema,
      AiPercentageHistoryResponse: {
        additionalProperties: false,
        properties: {
          data: {
            items: { $ref: "#/components/schemas/AiPercentageHistoryPoint" },
            type: "array",
          },
        },
        required: ["data"],
        type: "object",
      },
      CommentRequest: commentRequestSchema,
      ContactRequest: contactRequestSchema,
      Error: errorSchema(),
      GenerateRequest: {
        additionalProperties: false,
        properties: {
          prompt: {
            description:
              'Prompt describing the card to describe, e.g. "generate description for blog card". Must mention a supported card type.',
            type: "string",
          },
        },
        required: ["prompt"],
        type: "object",
      },
      GenerateResponse: {
        additionalProperties: false,
        properties: { description: { type: "string" } },
        required: ["description"],
        type: "object",
      },
      Health: healthSchema,
      InsightsOverview: insightsOverviewSchema,
      JdRequest: jdRequestSchema,
      ServiceInfo: serviceInfoSchema,
      SubmissionAccepted: submissionAcceptedSchema,
    },
    securitySchemes: {
      bearerAuth: {
        description:
          "Static API token issued for agents (API_TOKEN / AGENT_API_TOKEN), passed as `Authorization: Bearer <token>`.",
        scheme: "bearer",
        type: "http",
      },
      oauth2: {
        description:
          "OAuth 2.0 against the authorization server at https://duyet.net (see /.well-known/oauth-protected-resource and /.well-known/oauth-authorization-server).",
        flows: {
          clientCredentials: {
            scopes: {
              "read:profile":
                "Read the authenticated agent's public profile information.",
              chat: "Send prompts to LLM-backed endpoints such as POST /api/llm/generate.",
            },
            tokenUrl: "https://duyet.net/oauth/token",
          },
        },
        type: "oauth2",
      },
    },
  },
  info: {
    description:
      "Public API for duyet.net: AI-generated card descriptions, AI code-usage metrics, site analytics, and submissions (contact messages, job descriptions, blog comments). All endpoints are rate limited per IP and return RateLimit-Limit, RateLimit-Remaining, and RateLimit-Reset headers on every response; exhausted quotas produce a 429 response with a Retry-After header (seconds until reset). Authentication uses either a static bearer token or OAuth 2.0 scopes published in /.well-known/oauth-protected-resource.",
    title: "duyet.net API",
    version: "0.1.0",
  },
  openapi: "3.1.0",
  paths: {
    "/": {
      get: {
        description:
          "Returns the service name, version, health status, and a map of available endpoints.",
        operationId: "getServiceInfo",
        responses: {
          "200": okResponse("Service information.", serviceInfoSchema),
          "429": tooManyRequestsResponse(),
        },
        security: [],
        summary: "Get service info",
        tags: ["Meta"],
      },
    },
    "/api/ai/percentage/available": {
      get: {
        description:
          "Reports whether AI code-percentage data exists in the backing ClickHouse table.",
        operationId: "getAiPercentageAvailability",
        responses: {
          "200": okResponse("Data availability.", {
            $ref: "#/components/schemas/AiPercentageAvailable",
          }),
          "429": tooManyRequestsResponse(),
        },
        security: [],
        summary: "Check AI percentage availability",
        tags: ["AI Percentage"],
      },
    },
    "/api/ai/percentage/current": {
      get: {
        description:
          "Returns the most recent AI code percentage with line counts (total, human, AI) from ClickHouse.",
        operationId: "getCurrentAiPercentage",
        responses: {
          "200": okResponse(
            "Latest AI code percentage snapshot.",
            aiPercentageCurrentSchema
          ),
          "404": jsonResponse("No data available.", errorSchema()),
          "500": jsonResponse(
            "ClickHouse not configured or query failed.",
            errorSchema()
          ),
          "429": tooManyRequestsResponse(),
        },
        security: [],
        summary: "Get current AI percentage",
        tags: ["AI Percentage"],
      },
    },
    "/api/ai/percentage/history": {
      get: {
        description:
          "Returns daily AI code-percentage history ordered ascending, including line and commit splits.",
        operationId: "getAiPercentageHistory",
        parameters: [
          {
            description: "Number of days to look back.",
            in: "query",
            name: "days",
            required: false,
            schema: { default: 365, minimum: 1, type: "integer" },
          },
        ],
        responses: {
          "200": okResponse("Historical AI code percentages.", {
            $ref: "#/components/schemas/AiPercentageHistoryResponse",
          }),
          "500": jsonResponse(
            "ClickHouse not configured or query failed.",
            errorSchema()
          ),
          "429": tooManyRequestsResponse(),
        },
        security: [],
        summary: "Get AI percentage history",
        tags: ["AI Percentage"],
      },
    },
    "/api/comments": {
      post: {
        description: `Submits a blog comment for moderation. The post slug must match a published post (looked up from blog.duyet.net/posts-data.json, cached for one hour); unknown slugs return 404. Bodies over 8 KB are rejected. ${submissionRateLimitNote}`,
        operationId: "submitComment",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CommentRequest" },
            },
          },
          required: true,
        },
        responses: submissionResponses({
          "404": jsonResponse(
            "The post slug does not match a published post.",
            errorSchema()
          ),
        }),
        security: [],
        summary: "Submit a blog comment",
        tags: ["Submissions"],
      },
    },
    "/api/contact": {
      post: {
        description: `Submits a contact message. Bodies over 8 KB are rejected. ${submissionRateLimitNote}`,
        operationId: "submitContact",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ContactRequest" },
            },
          },
          required: true,
        },
        responses: submissionResponses(),
        security: [],
        summary: "Submit a contact message",
        tags: ["Submissions"],
      },
    },
    "/api/insights/overview": {
      get: {
        description:
          "Aggregated dashboard overview combining AI usage metrics, WakaTime coding stats, Cloudflare traffic, and PostHog page analytics. Individual source failures degrade to zeroed defaults instead of erroring.",
        operationId: "getInsightsOverview",
        responses: {
          "200": okResponse("Aggregated overview payload.", {
            $ref: "#/components/schemas/InsightsOverview",
          }),
          "429": tooManyRequestsResponse(),
        },
        security: [],
        summary: "Get insights overview",
        tags: ["Insights"],
      },
    },
    "/api/jd": {
      post: {
        description: `Submits a job description either as text (at most 32 KB) or as an https URL. The JSON envelope may be at most 40 KB. ${submissionRateLimitNote}`,
        operationId: "submitJobDescription",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/JdRequest" },
            },
          },
          required: true,
        },
        responses: submissionResponses(),
        security: [],
        summary: "Submit a job description",
        tags: ["Submissions"],
      },
    },
    "/api/llm/generate": {
      post: {
        description:
          'Generates a short card description with an LLM. Requires authentication and is limited to 10 requests/min/IP on top of the global limit. The prompt must mention a supported card type ("blog card" or "featured posts card").',
        operationId: "generateLlmCardDescription",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GenerateRequest" },
            },
          },
          required: true,
        },
        responses: {
          "200": okResponse("Generated card description.", {
            $ref: "#/components/schemas/GenerateResponse",
          }),
          "400": jsonResponse(
            "Missing/invalid prompt or unsupported card type. May include supportedTypes listing accepted card types.",
            {
              properties: {
                error: { type: "string" },
                supportedTypes: { items: { type: "string" }, type: "array" },
              },
              required: ["error"],
              type: "object",
            }
          ),
          "401": unauthorizedResponse,
          "429": tooManyRequestsResponse(),
          "500": jsonResponse(
            "Upstream generation failed. May include a fallback description.",
            {
              properties: {
                error: { type: "string" },
                fallback: { type: "string" },
              },
              required: ["error"],
              type: "object",
            }
          ),
        },
        security: [{ oauth2: ["chat"] }, { bearerAuth: [] }],
        summary: "Generate LLM card description",
        tags: ["LLM"],
      },
    },
    "/health": {
      get: {
        description:
          "Liveness probe returning an ok status and the current server time. Used by uptime checks and listed in /.well-known/api-catalog.",
        operationId: "getHealth",
        responses: {
          "200": okResponse("Service is healthy.", healthSchema),
          "429": tooManyRequestsResponse(),
        },
        security: [],
        summary: "Health check",
        tags: ["Meta"],
      },
    },
    "/openapi.json": {
      get: {
        description:
          "Returns this OpenAPI document. Mirrored statically at https://duyet.net/openapi.json.",
        operationId: "getOpenApiDocument",
        responses: {
          "200": okResponse("OpenAPI 3.1 document.", { type: "object" }),
          "429": tooManyRequestsResponse(),
        },
        security: [],
        summary: "Get OpenAPI document",
        tags: ["Meta"],
      },
    },
  },
  servers: [
    { url: "https://api.duyet.net" },
    { url: "https://duyet.net/api", description: "Same-origin mirror" },
  ],
};
