# AI Gateway Integration Guide

This document explains how the Cloudflare AI Gateway is integrated into the chat API worker for enhanced analytics and control.

## Overview

AI Gateway provides:
- **Analytics**: Request tracking, token usage, response times
- **Rate Limiting**: Control API usage per user/IP
- **Caching**: Cache common responses to reduce costs
- **Logging**: Full request/response logs for debugging
- **Guardrails**: Built-in content safety filters

## Architecture

```
Client Request → Worker → AI Gateway → Workers AI → LLM
                      ↓
                 Analytics
                 Rate Limiting
                 Caching
                 Logging
```

## Files Modified

1. **`chat-api.ts`** - Worker code with AI Gateway binding
2. **`wrangler.toml`** - Configuration with gateway name

## Setup Instructions

### 1. Create AI Gateway

1. Go to [Cloudflare Dashboard > AI Gateway](https://dash.cloudflare.com/?to=/:account/ai/ai-gateway)
2. Click **Create Gateway**
3. Name it `duyetbot-chat-gateway` (or custom name)
4. Select **Workers AI** as provider
5. Click **Create**

### 2. Configure Gateway Settings (Optional)

In your gateway settings, you can enable:

- **Rate Limiting**: Limit requests per minute/hour
- **Caching**: Cache responses for common queries
- **Guardrails**: Enable content safety filters
- **Logging**: Full request/response logging

### 3. Update Worker Configuration

The gateway name is configured in `wrangler.toml`:

```toml
[vars]
AI_GATEWAY_NAME = "duyetbot-chat-gateway"
```

If you used a different name, update this value.

### 4. Deploy the Worker

```bash
cd apps/agents/workers
wrangler deploy
```

## Code Changes

### Before (Direct Workers AI)
```typescript
const aiResponse = await env.AI.run(
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  { messages, stream: true }
);
```

### After (With AI Gateway)
```typescript
const aiResponse = await env.AI.run(
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  { messages, stream: true },
  {
    gateway: {
      id: "duyetbot-chat-gateway",
      metadata: {
        requestId: crypto.randomUUID(),
        endpoint: "chat-api",
        model: "llama-3.3-70b-instruct-fp8-fast",
        messageCount: messages.length,
      },
    },
  }
);
```

## Viewing Analytics

1. Go to [AI Gateway Dashboard](https://dash.cloudflare.com/?to=/:account/ai/ai-gateway)
2. Click on your gateway
3. View analytics:
   - Request count over time
   - Token usage
   - Response times
   - Error rates
   - Cost estimation

## Model Information

- **Model**: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- **Provider**: Cloudflare Workers AI
- **Cost**: FREE tier
- **Features**: Streaming, 70B parameters, fast inference

## Troubleshooting

### Gateway Not Found Error

If you see "gateway not found":
1. Verify the gateway name in `wrangler.toml` matches your dashboard
2. Check the gateway is created in the same Cloudflare account
3. Re-deploy the worker after updating the name

### No Analytics Showing

1. Verify requests are being made to the worker
2. Check the gateway is selected for Workers AI provider
3. Look at worker logs: `wrangler tail`

## Additional Features

### Sending Feedback

You can send feedback for AI responses using the gateway binding:

```typescript
// After getting a response
const logId = env.AI.aiGatewayLogId;

// Send feedback (e.g., from user rating)
await env.AI.gateway("duyetbot-chat-gateway").patchLog(logId, {
  feedback: 1,  // 1 for positive, -1 for negative
  score: 100,   // 0-100
  metadata: { userId: "123" },
});
```

### Universal Requests

Use the gateway's `run` method for other providers:

```typescript
const gateway = env.AI.gateway("duyetbot-chat-gateway");
const response = await gateway.run({
  provider: "openai",
  model: "gpt-4",
  prompt: "Hello",
});
```

## References

- [AI Gateway Documentation](https://developers.cloudflare.com/ai-gateway/)
- [Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Binding Methods](https://developers.cloudflare.com/ai-gateway/integrations/worker-binding-methods/)
