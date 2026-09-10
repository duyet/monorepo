# apps/news-redirect

Tiny Cloudflare Worker (`duyet-news`) that 301/308s `news.duyet.net` to
`https://aidr.today` while keeping path and query. Product lives at aidr.today;
this Worker only restores the redirects lost when `apps/news` was removed.

```bash
pnpm --filter news-redirect test
pnpm --filter news-redirect deploy
```
