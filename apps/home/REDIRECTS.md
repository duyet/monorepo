# URL Redirects Documentation

This app uses Cloudflare Pages `_redirects` and `_headers` files for URL shortening, redirects, and custom headers.

## How It Works

When deployed to Cloudflare Pages:
- The `public/_redirects` file is automatically processed and all redirect rules are applied at the edge
- The `public/_headers` file is automatically processed to set custom HTTP headers for specific paths

## File Locations

### Redirects
- **Source**: `public/_redirects`
- **Build Output**: `out/_redirects` (automatically copied during build)

### Headers
- **Source**: `public/_headers`
- **Build Output**: `out/_headers` (automatically copied during build)
- **Purpose**: Ensures static files like `llms.txt` are served with correct content types

## Format

### Redirects Format

Each line in the `_redirects` file follows this format:

```
/source-path https://destination-url status-code
```

Example:

```
/blog https://blog.duyet.net 302
/mcp https://mcp.duyet.net 302
```

### Headers Format

The `_headers` file uses this format:

```
/path
  Header-Name: header-value
  Another-Header: another-value
```

Example:

```
/llms.txt
  Content-Type: text/plain; charset=utf-8
  X-Content-Type-Options: nosniff
```

## Available Redirects

All available redirects can be viewed at:

- **Production**: https://duyet.net/ls
- **Local**: http://localhost:3000/ls

## Adding New Redirects

1. Edit `public/_redirects` file
2. Add new redirect rule in format: `/path https://destination 302`
3. Update `app/config/urls.ts` to display on `/ls` page
4. Build and deploy

## Limitations (Cloudflare Pages)

- Maximum 2,000 static redirects
- Maximum 100 dynamic redirects (with wildcards)
- Combined total: 2,100 redirects
- Each redirect line has 1,000 character limit

## Testing Locally

Cloudflare Pages `_redirects` only work in production. To test locally:

1. Use Next.js development server: `yarn dev`
2. Test redirect links will show in `/ls` page
3. Deploy to Cloudflare Pages preview to test actual redirects

## Documentation

- [Cloudflare Pages Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Cloudflare Pages Headers](https://developers.cloudflare.com/pages/configuration/headers/)
- [Next.js Static Export](https://nextjs.org/docs/advanced-features/static-html-export)
