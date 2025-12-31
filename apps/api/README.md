# API Application

Lightweight API built with Hono and deployed to Cloudflare Workers.

## Features

- **Hono Framework**: Fast, lightweight web framework for edge runtime
- **Cloudflare Workers**: Serverless deployment with global edge network
- **AI-Powered Descriptions**: Generate witty blog descriptions using OpenRouter API
- **TypeScript**: Full type safety with strict mode
- **Testing**: Built-in test support with Bun test runner

## Endpoints

### Health Check

```bash
GET /health
```

Returns API health status.

### AI Description

```bash
GET /api/ai-description?source=blog|featured
```

Generates AI-powered descriptions for blog content.

**Query Parameters:**
- `source` (required): `blog` or `featured`
- `posts` (optional for `source=featured`): Comma-separated list of post titles

**Example:**
```bash
curl "https://api.duyet.net/api/ai-description?source=blog"
curl "https://api.duyet.net/api/ai-description?source=featured&posts=post1,post2"
```

**Response:**
```json
{
  "description": "A witty, engaging description..."
}
```

## Development

```bash
# Install dependencies
bun install

# Run type checking
bun run check-types

# Run tests
bun run test

# Start local development server
bun run dev

# Deploy to Cloudflare Workers
bun run deploy
```

## Environment Variables

Set these in your `.env` file or Cloudflare Workers secrets:

- `OPENROUTER_API_KEY`: API key for OpenRouter (for AI descriptions)

## Cloudflare Deployment

```bash
# Login to Cloudflare
npx wrangler login

# Set environment variable
npx wrangler secret put OPENROUTER_API_KEY

# Deploy
bun run deploy
```

## Project Structure

```
apps/api/
├── src/
│   ├── index.ts              # Main app entry point
│   ├── routes/
│   │   └── ai-description.ts # AI description endpoint
│   └── lib/
│       └── openrouter.ts     # OpenRouter API client
├── wrangler.toml             # Cloudflare Workers config
├── package.json
└── tsconfig.json
```

## License

MIT

---

**This repository is maintained by [@duyetbot](https://github.com/duyetbot).**

