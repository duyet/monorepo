# apps/news

## Admin API / MCP

Push news items and manage sources remotely via a token-authenticated REST
API or a hand-rolled MCP server exposing the same operations as tools.

Set the `NEWS_ADMIN_TOKEN` Worker secret first:

```bash
wrangler secret put NEWS_ADMIN_TOKEN
```

### REST API

All routes live under `/api/admin/*` and require
`Authorization: Bearer <token>`.

Push an item:

```bash
curl -X POST https://news.duyet.net/api/admin/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/post","title":"New AI model released"}'
```

Trigger an ingest run:

```bash
curl -X POST https://news.duyet.net/api/admin/ingest \
  -H "Authorization: Bearer <token>"
```

Other routes: `GET /api/admin/sources`, `PUT /api/admin/sources/:id`,
`DELETE /api/admin/sources/:id`, `GET /api/admin/status`.

Item fields: `url`, `title` (required), `summary`, `source_id` (defaults to
`push`), `published_at` (**epoch milliseconds**, defaults to now),
`points`, `comments`, `category`, `tags`, `title_vi`, `summary_vi`,
`relevance`/`importance`/`quality` (supplying any of these marks the item
`published` immediately instead of `new`).

### MCP server

`POST /api/mcp` speaks JSON-RPC 2.0 and exposes `push_items`,
`list_sources`, `upsert_source`, `delete_source`, `trigger_ingest`, and
`get_status` as tools. Every request is authenticated with the same bearer
token (no session state).

MCP client config:

```json
{
  "url": "https://news.duyet.net/api/mcp",
  "headers": { "Authorization": "Bearer <token>" }
}
```

Call a tool directly:

```bash
curl -X POST https://news.duyet.net/api/mcp \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "push_items",
      "arguments": {
        "items": { "url": "https://example.com/post", "title": "New AI model released" }
      }
    }
  }'
```
