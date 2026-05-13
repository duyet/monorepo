# Public App Design Direction

Use this note when refreshing public apps such as `apps/home` and `apps/blog`.
Keep the product content, routes, data loading, auth, and app workflows intact.

## Direction

- Keep the interface simple, editorial, and quiet.
- Prefer white backgrounds with near-black text.
- Use one primary sans font stack: `Inter, ui-sans-serif, system-ui, sans-serif`.
- Avoid serif/display font pairings unless the app already depends on them.
- Avoid Anthropic-style cream surfaces, oversized bento blocks, and decorative
  warm palettes.
- Avoid shadcn-looking UI: no generic rounded cards, soft shadows, heavy
  component chrome, or nested card layouts.
- Use restrained borders and line-based grouping before boxed panels.
- Use compact controls with 8px radius where a bordered control is needed.
- Keep accent color rare. Primary actions should usually be black or near-black.

## Layout

- Start with the real app content, not a marketing landing page.
- Use left-aligned page headers with clear hierarchy.
- Keep sections full-width or simply constrained. Do not place cards inside
  cards.
- For lists, prefer rows separated by thin borders.
- For grids, prefer simple bordered tiles with no shadow and minimal padding.
- Keep copy short and scannable. Do not use large feature-card descriptions.

## Mobile

- Test around 390px width before finishing.
- No horizontal overflow. Check:
  `document.documentElement.scrollWidth - document.documentElement.clientWidth`.
- Use `min-w-0`, `break-words`, `truncate`, or responsive wrapping for long
  titles, tags, URLs, dates, and labels.
- Keep grids as one column on mobile, then add columns only where content stays
  readable.
- Avoid fixed-height blocks that can clip translated or long text.

## App Notes

- `apps/home`: minimal editorial homepage, simple app/project lists, black
  controls, restrained spacing, and mobile-safe navigation.
- `apps/blog`: white page, single sans typography, line-based post lists,
  bordered topic/category tiles, and no card-heavy archive/search surfaces.
