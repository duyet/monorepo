/**
 * Reusable JSON Schema fragments for the OpenAPI document.
 * Kept beside the document so responses and schemas can reference each other
 * without a circular import.
 * @module lib/openapi/schemas
 */

export type Schema = Record<string, unknown>;

export const honeypotProperty: Schema = {
  description:
    "Honeypot field for bots; must be left empty. A non-empty value is silently discarded.",
  type: "string",
};

export const emailProperty: Schema = {
  format: "email",
  maxLength: 254,
  type: "string",
};

export const contactRequestSchema: Schema = {
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

export const jdRequestSchema: Schema = {
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

export const commentRequestSchema: Schema = {
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

export const submissionAcceptedSchema: Schema = {
  additionalProperties: false,
  properties: {
    id: { format: "uuid", type: "string" },
    status: { enum: ["pending"], type: "string" },
  },
  required: ["id", "status"],
  type: "object",
};

export const serviceInfoSchema: Schema = {
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

export const healthSchema: Schema = {
  additionalProperties: false,
  properties: {
    status: { type: "string" },
    timestamp: { format: "date-time", type: "string" },
  },
  required: ["status", "timestamp"],
  type: "object",
};

export const aiPercentageCurrentSchema: Schema = {
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

export const aiPercentageHistoryPointSchema: Schema = {
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

export const insightsOverviewSchema: Schema = {
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
