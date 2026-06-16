# Blog Live HTML Widget System

## Overview

The blog now supports rendering live, interactive HTML widgets within markdown posts. Widgets render in sandboxed iframes following Claude's artifact security model.

## Architecture

### Security Model (Claude-Style)
- **Opaque-origin iframes** via `srcDoc` - no `allow-same-origin`
- **Strict sandboxing**: `allow-scripts allow-pointer-lock` only
- **Layered CSP**: `connect-src 'none'` blocks external requests
- **postMessage validation**: Source checking + shape validation

### Widget Pipeline
1. **Authoring**: Add widget fence to markdown
2. **Build**: `extractWidgetFences()` → resolve paths → sanitize → inline HTML
3. **Render**: `LiveWidget` component renders sandboxed iframe
4. **Runtime**: Widget reports height via postMessage, parent adjusts iframe

## Usage

### Adding Widgets to Posts

```markdown
---
title: "My Post with Widget"
slug: /2026/06/my-post
date: "2026-06-16"
category: "Development"
---

## Interactive Chart

```widget
path: ./widgets/example-chart.html
```
```

### Widget Resolution

Widgets support a hybrid resolution strategy:

1. **Post-local** (priority): `_posts/2026/06/widgets/widget.html`
2. **Global** (fallback): `apps/blog/public/widgets/widget.html`

Example:
```markdown
# Uses post-local widget if exists, otherwise global
```widget
path: ./widgets/my-chart.html
```

```

### Widget HTML Requirements

Every widget must include:

1. **CSP Meta Tag** (required):
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob: https:; connect-src 'none';">
```

2. **Height Synchronization** (required):
```javascript
function reportHeight() {
  window.parent.postMessage({
    type: 'height',
    value: document.body.scrollHeight
  }, '*')
}

const ro = new ResizeObserver(() => reportHeight())
ro.observe(document.body)
reportHeight()
```

3. **No External Dependencies**:
- All CSS must be inline (`<style>` tags)
- All JS must be inline (`<script>` tags)
- No `<script src="...">` or `<link href="...">`
- Images must be `data:`, `blob:`, or trusted `https:` origins

### Example Widget

See `apps/blog/public/widgets/example-chart.html` for a complete working example.

## Security Guarantees

Widgets render with the following security guarantees:

✅ **Origin isolation** - Cannot access parent cookies, localStorage, or sessionStorage
✅ **Network isolation** - Cannot make external requests (CSP `connect-src 'none'`)
✅ **Navigation isolation** - Cannot redirect parent page
✅ **DOM isolation** - Cannot access parent DOM or scripts
✅ **Message validation** - Parent validates all postMessage sources and shapes

## Build Process

The widget processing happens during `pnpm run prebuild`:

1. **Extract**: `extractWidgetFences()` scans markdown for widget fences
2. **Resolve**: `resolveWidgetHtml()` resolves widget paths (post-local → global)
3. **Sanitize**: Widget HTML sanitized using `sanitize-html` (same config as markdown)
4. **Inline**: Sanitized widget HTML stored in `post.widgets[widgetId]`
5. **Placeholder**: `<div data-widget-id>` inserted into markdown content

## Files Created/Modified

### Created
- `apps/blog/src/components/LiveWidget.tsx` - Core widget renderer
- `apps/blog/public/widgets/_template.html` - Widget template
- `apps/blog/public/widgets/example-chart.html` - Example chart widget
- `apps/blog/public/widgets/README.md` - Widget authoring guide

### Modified
- `packages/libs/markdownToHtml.ts` - Added `extractWidgetFences()` function
- `apps/blog/scripts/generate-posts-data.ts` - Widget HTML inlining
- `apps/blog/src/routes/$year/$month/-content.tsx` - Widget rendering
- `apps/blog/public/_headers` - Added `frame-src` to CSP

## Testing

### Manual Testing
```bash
# From apps/blog or monorepo root
pnpm run build    # Verify widget processing
pnpm run dev      # Test widget rendering
```

Visit: http://localhost:3000/2026/06/widget-test

### Verification Checklist
- [ ] Widget renders in iframe
- [ ] Height adjusts automatically (no scrollbars)
- [ ] No CSP violations in browser console
- [ ] Widget content is interactive (hover, click, etc.)
- [ ] Widget cannot access `window.parent` (test via devtools)

## Troubleshooting

### Widget shows scrollbars
- Verify ResizeObserver script is present in widget HTML
- Check that `reportHeight()` is called after content updates
- Ensure no fixed `height` CSS conflicts

### Widget content not interactive
- Verify `sandbox` attribute includes `allow-scripts`
- Check CSP meta tag allows `script-src 'unsafe-inline'`

### CSP violations in console
- Remove any external script/style references
- Ensure all code is inline
- Check image sources are `data:`, `blob:`, or `https:`

### Widget not found during build
- Verify path is correct (check for typos)
- Ensure widget file exists in post-local or global directory
- Check build logs for resolution errors

## Future Enhancements

Potential improvements for future iterations:

1. **Widget parameters** - Pass data from post frontmatter to widget
2. **Widget sizing controls** - Additional `width` and `aspect-ratio` options
3. **Widget themes** - Support light/dark mode variants
4. **Dynamic widgets** - Optional runtime data fetching (relax CSP per-widget)
5. **Widget library** - Shared chart components, data visualizers

## References

- Plan: `/Users/duet/.claude/plans/update-apps-blog-to-support-velvety-pumpkin.md`
- Claude Artifact Security Model: [Anthropic Documentation](https://docs.anthropic.com)
- iframe sandbox spec: [HTML Living Standard](https://html.spec.whatwg.org/#attr-iframe-sandbox)
- CSP Level 3: [W3C Spec](https://w3c.github.io/webappsec-csp/)
