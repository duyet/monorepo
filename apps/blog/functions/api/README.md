# Cloudflare Pages Functions - Blog API

This directory contains Cloudflare Pages Functions for the blog application.

## Chat Endpoint: `/api/chat`

Streaming AI chat endpoint powered by OpenRouter via Cloudflare AI Gateway.

### Request

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "messages": [
    { "role": "user", "content": "What is this post about?" },
    { "role": "assistant", "content": "..." }
  ],
  "context": "Full post content/markdown (optional)",
  "mode": "chat" | "tldr" (optional, default: "chat")
}
```

### Response

**Streaming Server-Sent Events (SSE)**

**Headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**SSE Data Format:**
```
data: {"content":"streamed text chunk"}

data: {"done":true,"reason":"stop"}
```

### Modes

#### Chat Mode (default)
- System prompt: Helpful AI assistant contextual to blog post
- Max tokens: 1000
- Suitable for Q&A about post content

**Request:**
```json
{
  "messages": [{"role": "user", "content": "Explain this concept"}],
  "context": "post content here",
  "mode": "chat"
}
```

#### TLDR Mode
- System prompt: Summarize in 4-5 bullet points (max 15 words each)
- Max tokens: 400
- Suitable for quick summaries

**Request:**
```json
{
  "messages": [{"role": "user", "content": "Summarize"}],
  "context": "full post content here",
  "mode": "tldr"
}
```

### Environment Variables

Required in `wrangler.toml` or `.env`:
- `OPENROUTER_API_KEY`: OpenRouter API key
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID

### Error Handling

#### 405 Method Not Allowed
Only POST requests are accepted.

#### 400 Bad Request
```json
{"error": "Invalid messages format"}
```
Messages must be an array with `role` and `content` fields.

#### 500 Missing Environment Variables
```json
{"error": "Missing environment variables"}
```
Ensure `OPENROUTER_API_KEY` and `CLOUDFLARE_ACCOUNT_ID` are set.

#### 500 API Error
```json
{
  "error": "OpenRouter API error: ...",
  "details": "..."
}
```

### Example Usage

```typescript
// Chat with blog post context
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      { role: "user", content: "What is the main topic?" }
    ],
    context: postContent,
    mode: "chat"
  })
});

// Stream response
const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value);
  const lines = text.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.content) {
        console.log(data.content);
      }
      if (data.done) {
        console.log("Streaming complete");
      }
    }
  }
}
```

### Technical Details

- **Model:** `xiaomi/mimo-v2-flash:free` (free tier via OpenRouter)
- **Gateway:** Cloudflare AI Gateway (reduces costs via caching)
- **Streaming:** ReadableStream-based implementation for efficient memory usage
- **Temperature:** 0.7 (balanced creativity)
- **Error Handling:** Comprehensive try-catch with detailed error messages

### Implementation

The endpoint is implemented in `chat.ts` with:
- Full TypeScript type safety
- SSE (Server-Sent Events) streaming
- Graceful error handling and fallbacks
- Proper cleanup of stream readers
- Support for partial JSON parsing from chunked responses
