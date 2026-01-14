# AI Chat API Setup Guide

This guide explains how to integrate and use the AI chat endpoint for the blog.

## File Location

```
/apps/blog/functions/api/chat.ts
```

Cloudflare Pages Functions automatically deploy files in this directory when you deploy to Cloudflare Pages.

## Configuration

### 1. Environment Variables

Add these to your `.env` or `.env.local`:

```env
OPENROUTER_API_KEY=sk_live_xxx...
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

Or add to `.env.production` / `.env.production.local` for production:

```env
OPENROUTER_API_KEY=sk_live_xxx...
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

### 2. Get Your Credentials

**OpenRouter API Key:**
- Visit https://openrouter.ai/keys
- Create a new API key
- Copy the key (starts with `sk_live_` or `sk_or_`)

**Cloudflare Account ID:**
- Log in to https://dash.cloudflare.com
- Copy from URL: `dash.cloudflare.com/api/account/tokens`
- Or find in Workers/Pages settings

### 3. Deploy

```bash
cd apps/blog
bun run cf:deploy:prod
```

## API Usage

### Endpoint

```
POST https://[your-blog-domain]/api/chat
```

### JavaScript/TypeScript Client

```typescript
async function chatWithPost(messages, postContent) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages,
      context: postContent,
      mode: "chat"
    })
  });

  // Handle SSE stream
  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines[lines.length - 1];

    for (const line of lines.slice(0, -1)) {
      if (line.startsWith("data: ")) {
        const data = JSON.parse(line.slice(6));
        if (data.content) {
          console.log(data.content);
          // Update UI with streamed content
        }
        if (data.done) {
          console.log("Complete");
        }
      }
    }
  }
}
```

### React Hook Example

```typescript
function useChat(postContent) {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [response, setResponse] = useState("");

  const sendMessage = async (userMessage) => {
    const newMessages = [
      ...messages,
      { role: "user" as const, content: userMessage }
    ];
    setMessages(newMessages);
    setResponse("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          context: postContent,
          mode: "chat"
        })
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullResponse = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines[lines.length - 1];

        for (const line of lines.slice(0, -1)) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullResponse += data.content;
              setResponse(fullResponse);
            }
          }
        }
      }

      setMessages([
        ...newMessages,
        { role: "assistant", content: fullResponse }
      ]);
    } finally {
      setStreaming(false);
    }
  };

  return { messages, response, streaming, sendMessage };
}
```

### TLDR Endpoint

```typescript
async function getTLDR(postContent) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Summarize this" }],
      context: postContent,
      mode: "tldr"
    })
  });

  // Stream response and collect all chunks
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let summary = "";

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = JSON.parse(line.slice(6));
        if (data.content) {
          summary += data.content;
        }
      }
    }
  }

  return summary;
}
```

## Testing

### Local Testing

```bash
# In one terminal
bun run dev

# In another terminal, test the endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "context": "Test post content",
    "mode": "chat"
  }'
```

### Production Testing

After deployment to Cloudflare Pages:

```bash
curl -X POST https://blog.duyet.net/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What is this post about?"}],
    "context": "Post markdown content",
    "mode": "chat"
  }'
```

## Monitoring

### Check Cloudflare Logs

1. Go to https://dash.cloudflare.com
2. Select your Pages project
3. View "Deployments" and "Analytics" tabs

### Debug Issues

Check Cloudflare Pages Function logs:
- Navigate to your Pages project
- View "Functions" tab
- Check error logs and request history

## Costs

- **OpenRouter**: Varies by model, xiaomi/mimo-v2-flash:free is free tier
- **Cloudflare AI Gateway**: Reduces costs by caching requests
- **Cloudflare Pages Functions**: Included in Pages (100k requests/day free)

## Troubleshooting

### 401 Unauthorized
- Check `OPENROUTER_API_KEY` is correct
- Ensure key is not expired on openrouter.ai

### 500 Missing Environment Variables
- Verify `.env` file contains both required variables
- Check `wrangler.toml` is correctly configured
- Try `bun run cf:deploy` with explicit env file

### Stream Timeout
- Default timeout is 30 seconds
- For long responses, consider implementing pagination
- Check OpenRouter API status at openrouter.ai/status

### No Response Data
- Check browser console for network errors
- Verify endpoint returns valid SSE format
- Test with curl to isolate frontend vs backend issues

## Performance Tips

1. **Cache System Prompts**: Build system prompts once, reuse
2. **Stream Processing**: Process chunks as they arrive (don't wait for full response)
3. **Error Recovery**: Implement retry logic with exponential backoff
4. **Batch Requests**: Aggregate multiple requests when possible
5. **Monitor Latency**: Track API response times

## Security Considerations

- Never expose `OPENROUTER_API_KEY` to client
- Validate user input before sending to API
- Implement rate limiting on endpoint
- Use HTTPS only for production
- Consider adding authentication to API endpoint
