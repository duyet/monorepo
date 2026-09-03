/**
 * Hand-written OpenAPI 3.1 document describing the public API surface.
 *
 * Dependency-free by design: keep this file in sync with src/index.ts and the
 * route handlers, then re-generate the static mirror at
 * apps/home/public/openapi.json (identical JSON, pretty-printed).
 */

type Schema = Record<string, unknown>;

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

const unauthorizedResponse = jsonResponse(
  "Missing or invalid bearer token.",
  errorSchema()
);

const honeypotProperty: Schema = {
  description:
    "Honeypot field for bots; must be left empty. A non-empty value is silently discarded.",
  type: "string",
};

const emailProperty: Schema = {
  format: "email",
  maxLength: 254,
  type: "string",
};

const contactRequestSchema: Schema = {
  additionalProperties: false,
  properties: {
    email: emailProperty,
    message: { maxLength: 8000, minLength: 1, type: "string" },
    name: { maxLength: 200, minLength: 1, type: "string" },
    website: honeypotProperty,
  },
  required: ["name", "email", "message"],
  type: "object",
};

const jdRequestSchema: Schema = {
  description:
    "Job description as raw text or as an https URL; exactly one of text or url must be present.",
  oneOf: [
    {
      additionalProperties: false,
      properties: {
        company: { maxLength: 200, type: "string" },
        note: { maxLength: 2000, type: "string" },
        text: {
          description: "Job description text, at most 32 KB (UTF-8 bytes).",
          minLength: 1,
          type: "string",
        },
        website: honeypotProperty,
      },
      required: ["text"],
      type: "object",
    },
    {
      additionalProperties: false,
      properties: {
        company: { maxLength: 200, type: "string" },
        note: { maxLength: 2000, type: "string" },
        url: {
          description: "Link to the job description; must use https.",
          format: "uri",
          maxLength: 2048,
          type: "string",
        },
        website: honeypotProperty,
      },
      required: ["url"],
      type: "object",
    },
  ],
};

const commentRequestSchema: Schema = {
  additionalProperties: false,
  properties: {
    author: { maxLength: 100, minLength: 1, type: "string" },
    body: { maxLength: 4000, minLength: 1, type: "string" },
    email: emailProperty,
    post: {
      description:
        'Blog post slug such as "/2026/08/grok-bot" (leading slash and trailing .html are normalized). Must match a published post.',
      type: "string",
    },
    website: honeypotProperty,
  },
  required: ["post", "author", "body"],
  type: "object",
};

const submissionAcceptedSchema: Schema = {
  additionalProperties: false,
  properties: {
    id: { format: "uuid", type: "string" },
    status: { enum: ["pending"], type: "string" },
  },
  required: ["id", "status"],
  type: "object",
};

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

const serviceInfoSchema: Schema = {
  additionalProperties: false,
  properties: {
    endpoints: {
      additionalProperties: false,
      properties: {
        aiPercentage: { type: "string" },
        cardDescription: { type: "string" },
        comments: { type: "string" },
        contact: { type: "string" },
        health: { type: "string" },
        insights: { type: "string" },
        jd: { type: "string" },
      },
      required: [
        "health",
        "cardDescription",
        "aiPercentage",
        "insights",
        "contact",
        "jd",
        "comments",
      ],
      type: "object",
    },
    name: { type: "string" },
    status: { type: "string" },
    version: { type: "string" },
  },
  required: ["name", "version", "status", "endpoints"],
  type: "object",
};

const healthSchema: Schema = {
  additionalProperties: false,
  properties: {
    status: { type: "string" },
    timestamp: { format: "date-time", type: "string" },
  },
  required: ["status", "timestamp"],
  type: "object",
};

const aiPercentageCurrentSchema: Schema = {
  additionalProperties: false,
  properties: {
    ai_percentage: { type: "number" },
    ai_lines_added: { type: "integer" },
    human_lines_added: { type: "integer" },
    total_lines_added: { type: "integer" },
  },
  required: [
    "ai_percentage",
    "total_lines_added",
    "human_lines_added",
    "ai_lines_added",
  ],
  type: "object",
};

const aiPercentageHistoryPointSchema: Schema = {
  additionalProperties: false,
  properties: {
    ai_commits: { type: "integer" },
    ai_percentage: { type: "number" },
    ai_lines_added: { type: "integer" },
    date: { type: "string" },
    human_commits: { type: "integer" },
    human_lines_added: { type: "integer" },
    total_commits: { type: "integer" },
    total_lines_added: { type: "integer" },
  },
  required: [
    "date",
    "ai_percentage",
    "total_lines_added",
    "human_lines_added",
    "ai_lines_added",
    "total_commits",
    "human_commits",
    "ai_commits",
  ],
  type: "object",
};

const insightsOverviewSchema: Schema = {
  additionalProperties: true,
  properties: {
    aiActivity: {
      items: {
        additionalProperties: false,
        properties: {
          "Total Cost": { type: "number" },
          "Total Tokens": { type: "integer" },
          date: { type: "string" },
        },
        required: ["date", "Total Tokens", "Total Cost"],
        type: "object",
      },
      type: "array",
    },
    aiMetrics: {
      additionalProperties: false,
      properties: {
        activeDays: { type: "integer" },
        cacheTokens: { type: "integer" },
        dailyAverage: { type: "integer" },
        topModel: { type: "string" },
        totalCost: { type: "number" },
        totalTokens: { type: "integer" },
      },
      required: [
        "totalTokens",
        "cacheTokens",
        "totalCost",
        "activeDays",
        "dailyAverage",
        "topModel",
      ],
      type: "object",
    },
    aiModels: {
      items: {
        additionalProperties: false,
        properties: {
          cost: { type: "number" },
          name: { type: "string" },
          percent: { type: "integer" },
          tokens: { type: "integer" },
          usageCount: { type: "integer" },
        },
        required: ["name", "tokens", "cost", "percent", "usageCount"],
        type: "object",
      },
      type: "array",
    },
    cloudflare: {
      additionalProperties: false,
      properties: {
        data: {
          additionalProperties: true,
          properties: {
            viewer: {
              additionalProperties: true,
              properties: {
                zones: {
                  items: {
                    additionalProperties: true,
                    properties: {
                      httpRequests1dGroups: {
                        items: {
                          additionalProperties: true,
                          properties: {
                            date: {
                              properties: { date: { type: "string" } },
                              required: ["date"],
                              type: "object",
                            },
                            sum: {
                              properties: {
                                bytes: { type: "integer" },
                                cachedBytes: { type: "integer" },
                                pageViews: { type: "integer" },
                                requests: { type: "integer" },
                              },
                              required: ["requests", "pageViews"],
                              type: "object",
                            },
                            uniq: {
                              properties: { uniques: { type: "integer" } },
                              required: ["uniques"],
                              type: "object",
                            },
                          },
                          required: ["date", "sum", "uniq"],
                          type: "object",
                        },
                        type: "array",
                      },
                    },
                    required: ["httpRequests1dGroups"],
                    type: "object",
                  },
                  type: "array",
                },
              },
              required: ["zones"],
              type: "object",
            },
          },
          required: ["viewer"],
          type: "object",
        },
        days: { type: "integer" },
        generatedAt: { format: "date-time", type: "string" },
        totalPageviews: { type: "integer" },
        totalRequests: { type: "integer" },
      },
      required: [
        "data",
        "days",
        "generatedAt",
        "totalPageviews",
        "totalRequests",
      ],
      type: "object",
    },
    posthog: {
      additionalProperties: false,
      properties: {
        avgVisitorsPerPage: { type: "number" },
        blogUrl: { type: "string" },
        paths: {
          items: {
            additionalProperties: false,
            properties: {
              path: { type: "string" },
              views: { type: "integer" },
              visitors: { type: "integer" },
            },
            required: ["path", "views", "visitors"],
            type: "object",
          },
          type: "array",
        },
        totalViews: { type: "integer" },
        totalVisitors: { type: "integer" },
      },
      required: [
        "totalVisitors",
        "totalViews",
        "avgVisitorsPerPage",
        "paths",
        "blogUrl",
      ],
      type: "object",
    },
    wakaLanguages: {
      items: {
        additionalProperties: true,
        properties: {
          name: { type: "string" },
          percent: { type: "number" },
          total_seconds: { type: "number" },
        },
        required: ["name", "percent", "total_seconds"],
        type: "object",
      },
      type: "array",
    },
    wakaMetrics: {
      additionalProperties: false,
      properties: {
        avgDailyHours: { type: "number" },
        daysActive: { type: "integer" },
        topLanguage: { type: "string" },
        totalHours: { type: "number" },
      },
      required: ["totalHours", "avgDailyHours", "daysActive", "topLanguage"],
      type: "object",
    },
    wakaTrend: {
      items: {
        additionalProperties: false,
        properties: {
          displayDate: { type: "string" },
          hours: { type: "number" },
          yearMonth: { type: "string" },
        },
        required: ["yearMonth", "displayDate", "hours"],
        type: "object",
      },
      type: "array",
    },
  },
  required: [
    "aiActivity",
    "aiMetrics",
    "aiModels",
    "cloudflare",
    "posthog",
    "wakaLanguages",
    "wakaMetrics",
    "wakaTrend",
  ],
  type: "object",
};

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
          data: { items: { $ref: "#/components/schemas/AiPercentageHistoryPoint" }, type: "array" },
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
          "500": jsonResponse("ClickHouse not configured or query failed.", errorSchema()),
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
          "500": jsonResponse("ClickHouse not configured or query failed.", errorSchema()),
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
          "Generates a short card description with an LLM. Requires authentication and is limited to 10 requests/min/IP on top of the global limit. The prompt must mention a supported card type (\"blog card\" or \"featured posts card\").",
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
