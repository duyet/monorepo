# Blog Widgets

This directory contains HTML widgets that can be embedded in blog posts.

## Widget Structure

Every widget must include:

1. **CSP Meta Tag** - Restrictive Content Security Policy
   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob: https:; connect-src 'none';">
   ```

2. **Height Synchronization Script** - Reports widget height to parent
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

3. **No External Requests** - All scripts and styles must be inline
   - No `<script src="...">`
   - No `<link href="...">` for styles
   - All images must be `data:` or `blob:` URLs (or trusted `https:` origins)

## Using Widgets in Posts

Add a widget to any blog post:

```markdown
---
title: My Post with Widget
---

## Interactive Chart

```widget
path: ./widgets/example-chart.html
```
```

For post-local widgets:
```markdown
```widget
path: ./widgets/my-custom-widget.html
```
```

## Widget Resolution

1. **Post-local paths** - `./widgets/widget.html` looks in `_posts/year/month/widgets/`
2. **Global paths** - `./widgets/widget.html` falls back to `apps/blog/public/widgets/`

## Security Model

Widgets render in sandboxed iframes with:
- **Opaque origin** - No `allow-same-origin`, prevents cookie/storage access
- **Strict CSP** - `connect-src 'none'` blocks external requests
- **No navigation tokens** - Cannot redirect parent page

**Critical:** Never add `allow-same-origin` to the sandbox attribute.

## Examples

- **example-chart.html** - Simple interactive bar chart
- **example-dashboard.html** - Interactive dashboard with filters

## Development

1. Copy `_template.html` as a starting point
2. Add your widget HTML/CSS/JS
3. Test locally: `pnpm run dev`
4. Verify height adjustment works
5. Check browser console for CSP violations

## Testing Checklist

Before deploying a widget:

- [ ] Includes CSP meta tag with `connect-src 'none'`
- [ ] Has ResizeObserver script for height sync
- [ ] No external script/style dependencies
- [ ] No `eval()` or `Function()` calls
- [ ] Height adjusts automatically
- [ ] No CSP violations in browser console
- [ ] Interactive elements work (hover, click, etc.)
- [ ] Widget cannot access `window.parent`

## Troubleshooting

**Widget shows scrollbars:**
- Check that ResizeObserver script is present
- Verify `reportHeight()` is called after content updates
- Ensure no fixed height is set via CSS

**Widget content not interactive:**
- Check `sandbox` attribute includes `allow-scripts`
- Verify CSP meta tag allows `script-src 'unsafe-inline'`

**CSP violations in console:**
- Remove any external script/style references
- Ensure all code is inline
- Check image sources are `data:`, `blob:`, or `https:`
