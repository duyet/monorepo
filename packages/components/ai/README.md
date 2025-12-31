# AI Card Components

Client-side React components that display AI-generated descriptions with a "thinking" animation.

## Components

### `AiContentCard`

Extends the standard `ContentCard` with AI-powered description generation.

**Features:**
- Shows "Thinking..." animation on mount
- Fetches AI description from API
- Smooth crossfade transition
- Falls back to provided description on error
- Configurable source parameter

**Usage:**

```tsx
import { AiContentCard } from "@duyet/components";

<AiContentCard
  title="My Blog Post"
  href="/blog/my-post"
  category="Technology"
  fallbackDescription="Original static description"
  tags={["react", "nextjs"]}
  date="2025-01-15"
  color="terracotta"
  illustration="wavy"
  source="blog"
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Card title |
| `href` | `string` | required | Link destination |
| `category` | `string` | optional | Category badge |
| `fallbackDescription` | `string` | optional | Fallback text if AI fails |
| `tags` | `string[]` | optional | Tag labels |
| `date` | `string` | optional | Display date |
| `color` | Color enum | optional | Card color theme |
| `illustration` | `"wavy" \| "geometric" \| "blob" \| "none"` | `"none"` | Background illustration |
| `featured` | `boolean` | `false` | Featured layout |
| `source` | `"blog" \| "featured"` | `"blog"` | API source parameter |
| `className` | `string` | optional | Additional CSS classes |

---

### `AiFeaturedCard`

Larger featured card variant with AI description generation.

**Features:**
- Same animation pattern as AiContentCard
- Larger typography and spacing
- Always fetches from `source=featured`

**Usage:**

```tsx
import { AiFeaturedCard } from "@duyet/components";

<AiFeaturedCard
  title="Featured Article"
  href="/featured"
  category="Featured"
  fallbackDescription="Featured content description"
  date="2025-01-15"
  color="sage"
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Card title |
| `href` | `string` | required | Link destination |
| `category` | `string` | optional | Category badge |
| `fallbackDescription` | `string` | optional | Fallback text if AI fails |
| `date` | `string` | optional | Display date |
| `color` | `"terracotta" \| "sage" \| "coral" \| "lavender"` | `"terracotta"` | Card color theme |
| `className` | `string` | optional | Additional CSS classes |

---

### `ThinkingAnimation`

Standalone thinking animation component.

**Features:**
- Animated ellipsis (0-3 dots)
- Pulsing opacity effect
- Bouncing indicator dot
- Customizable className

**Usage:**

```tsx
import { ThinkingAnimation } from "@duyet/components";

<ThinkingAnimation className="text-neutral-600" />
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | optional | Additional CSS classes |

---

## Environment Setup

Ensure `NEXT_PUBLIC_API_BASE_URL` is set in your environment:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api.com
```

The components will fetch from:
```
${NEXT_PUBLIC_API_BASE_URL}/api/ai-description?source={source}
```

Expected response:
```json
{
  "description": "AI-generated description text"
}
```

---

## Animation Timing

- **Minimum thinking time:** 1.5 seconds
- **API timeout:** 5 seconds
- **Crossfade duration:** 300ms

The animation ensures users see at least 1.5s of "thinking" before showing results, even if the API responds faster.

---

## Error Handling

- Network timeout after 5 seconds
- Falls back to `fallbackDescription` on any error
- Graceful degradation (shows original content)
- No console errors in production
- Silent failure for better UX

---

## Styling

Components inherit all styling from parent `ContentCard` and `FeaturedCard` components:
- Tailwind CSS classes
- Responsive design
- Hover effects
- Color themes
- Illustration support

---

## Examples

### Blog Post Card with AI Enhancement

```tsx
<AiContentCard
  title="Getting Started with Next.js 15"
  href="/blog/nextjs-15"
  category="Tutorial"
  fallbackDescription="Learn how to build modern web applications with Next.js 15, React 19, and Turbopack."
  tags={["nextjs", "react", "webdev"]}
  date="2025-01-15"
  color="terracotta"
  illustration="wavy"
  source="blog"
/>
```

### Featured Article with AI Description

```tsx
<AiFeaturedCard
  title="The Future of Web Development"
  href="/articles/future-of-web"
  category="Featured"
  fallbackDescription="Explore emerging trends and technologies shaping the future of web development."
  date="2025-01-15"
  color="sage"
/>
```

### Custom Colored Cards

```tsx
<AiContentCard
  title="React Server Components"
  href="/blog/rsc"
  color="cactus"
  illustration="geometric"
  fallbackDescription="Understanding the new paradigm in React development"
  source="blog"
/>
```
