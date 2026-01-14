# Quick Start Guide - Chat API

## 1. Deploy

```bash
cd apps/blog
bun run cf:deploy:prod
```

## 2. Configure Environment Variables

In Cloudflare Pages project settings, add:
```
OPENROUTER_API_KEY=sk_live_...
CLOUDFLARE_ACCOUNT_ID=xxxxx
```

## 3. Test Endpoint

```bash
curl -X POST https://blog.duyet.net/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role":"user","content":"Hello"}],
    "context": "Blog post content here",
    "mode": "chat"
  }'
```

## 4. Integrate into Frontend

### Basic Setup
```typescript
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: "What is this about?" }],
    context: postContent,
    mode: "chat"
  })
});

// Process SSE stream
const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (reader) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value);
  const lines = text.split("\n");

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = JSON.parse(line.slice(6));
      console.log(data.content); // Process streamed content
    }
  }
}
```

### React Component
```typescript
import { useBlogChat } from "@/lib/useChat";

export function ChatWidget({ postContent }: { postContent: string }) {
  const { messages, currentResponse, sendMessage, isStreaming } = useBlogChat(postContent);

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i} className={msg.role}>
          {msg.content}
        </div>
      ))}
      {currentResponse && <div className="streaming">{currentResponse}</div>}

      <form onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements[0] as HTMLInputElement;
        sendMessage(input.value);
        input.value = "";
      }}>
        <input placeholder="Ask a question..." disabled={isStreaming} />
        <button disabled={isStreaming}>Send</button>
      </form>
    </div>
  );
}
```

## 5. Modes

### Chat Mode (Default)
```typescript
{
  "messages": [{ "role": "user", "content": "Explain this concept" }],
  "context": "full post content",
  "mode": "chat"
}
```

### TLDR Mode
```typescript
{
  "messages": [{ "role": "user", "content": "Summarize" }],
  "context": "full post content",
  "mode": "tldr"
}
```

## 6. Error Handling

```typescript
try {
  const response = await fetch("/api/chat", { /* ... */ });

  if (!response.ok) {
    const error = await response.json();
    console.error("API Error:", error.error, error.details);
  }

  // Process stream...
} catch (error) {
  console.error("Request failed:", error);
}
```

## 7. Response Format

Server-Sent Events (SSE):
```
data: {"content":"streamed text chunk"}

data: {"done":true,"reason":"stop"}
```

## Files Reference

| File | Purpose |
|------|---------|
| `chat.ts` | Main Cloudflare Pages Function |
| `README.md` | Full API documentation |
| `client.example.ts` | Example client implementations |
| `QUICK_START.md` | This file |
| `../../CHAT_API_SETUP.md` | Detailed setup guide |

## Common Issues

### 500 - Missing Environment Variables
- Check OPENROUTER_API_KEY is set
- Check CLOUDFLARE_ACCOUNT_ID is set
- Redeploy after adding variables

### 401 - Unauthorized
- Verify API key is correct and not expired
- Check at https://openrouter.ai/keys

### Stream Timeout
- Increase max_tokens if response is cut off
- Check OpenRouter API status

### No Response Data
- Verify SSE format parsing
- Check browser console for errors
- Test with curl first

## Performance Tips

1. Cache post content client-side
2. Stream chunks as they arrive (don't wait for completion)
3. Implement debouncing on user input
4. Use TLDR mode for quick summaries
5. Monitor API usage and costs

## Support Files

- Full setup: See `/CHAT_API_SETUP.md`
- Example code: See `client.example.ts`
- Complete docs: See `README.md`

## Next Steps

1. Copy `client.example.ts` functions to your client code
2. Create chat widget component
3. Add to blog post pages
4. Test and monitor usage
5. Customize system prompts as needed
