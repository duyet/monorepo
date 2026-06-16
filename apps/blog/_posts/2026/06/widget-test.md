---
title: "Widget Test Post"
slug: /2026/06/widget-test
date: "2026-06-16"
category: "Development"
tags: ["widgets", "test"]
excerpt: "Testing the new live HTML widget system"
---

## Widget Test

This is a test post for the new live HTML widget system.

## Example Chart

```widget
path: ./widgets/example-chart.html
```

## How It Works

Widgets are rendered in sandboxed iframes with:
- Opaque origin (no `allow-same-origin`)
- Strict CSP (`connect-src 'none'`)
- Height auto-adjustment via postMessage

## Security

The widget cannot:
- Access parent cookies or storage
- Make external network requests
- Navigate the parent page
- Access parent DOM

This ensures widgets are safe and isolated.
