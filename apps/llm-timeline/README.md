# LLM Timeline

Interactive timeline of Large Language Model releases from 2017 to present.

- **Live**: https://llm-timeline.duyet.net (official) | https://duyet-llm-timeline.pages.dev (Cloudflare)

## Features

- **50+ Models**: Comprehensive timeline of major LLM releases
- **Search & Filter**: Search by name, organization, description; filter by license, type, organization
- **Year Grouping**: Models organized chronologically by year
- **Dark Mode**: Full dark/light theme support
- **Color Coding**: Visual indicators for license types (open/closed/partial)
- **Responsive**: Mobile-friendly design

## Tech Stack

- Vite + TanStack Start with React 19
- Tailwind CSS for styling
- Lucide React for icons
- TypeScript for type safety

## Development

```bash
cd apps/llm-timeline
bun run dev      # Start dev server on port 3005
bun run build    # Build for production
bun run lint     # Run linter
bun run check-types  # TypeScript type check
```

## Adding Models

Edit `lib/data.ts` and add models to the `models` array following the type structure:

```typescript
{
  name: 'Model Name',
  date: '2025-03-15',      // YYYY-MM-DD format
  org: 'Organization',
  params: '70B',           // or null for unknown
  type: 'model',           // 'model' | 'milestone'
  license: 'open',         // 'open' | 'closed' | 'partial'
  desc: 'Brief description of the model.'
}
```

## Deployment

```bash
bun run cf:deploy:prod  # Deploy to Cloudflare Pages production
```

GitHub Actions automatically deploy on push to `master`.
