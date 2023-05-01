---
template: post
title: 'Migrate (again) my blog to Next.js from Gatsby'
date: '2023-05-01'
author: Van-Duyet Le
category: Project
tags:
  - Project
  - Web
  - Blog
  - React
  - Rust
  - Vercel
slug: /2023/05/migrate-blog-to-nextjs.html
draft: false
fbCommentUrl: none
thumbnail: https://i.imgur.com/980XhnE.png
twitterCommentUrl: https://twitter.com/search?q=https%3A%2F%2Fblog.duyet.net%2F2023%2F05%2Fmigrate-blog-to-nextjs.html
description: "I've been using Gastby since 2019 and while it's great that I can write my blogs in NeoVim, commit and push to Github, and have Cloudflare Pages build and publish to CDN, but I was becoming frustrated with the slow building times and the overall maintenance requirements."
---

I've been using [Gastby since 2019](https://blog.duyet.net/2019/08/migrate-blogger-to-gatsby) and while it's great that I can write my blogs [in NeoVim](https://blog.duyet.net/2021/06/neovim.html), commit and push to Github, and have Cloudflare Pages build and publish to CDN, but I was becoming frustrated with the slow building times and the overall maintenance requirements.

Old blog took 10 minutes to build:

![Took 10 minutes to build](/media/2023/05/migrate-blog-to-nextjs/migrate-blog-to-nextjs-cloudflare.png)

Last month I decided to spend my Sunday migrate my blog to [Next.js](https://nextjs.org) and host it on [Vercel](https://vercel.com).
Next.js has become the standard for modern web development, and as someone who has worked with it before, I felt confident in my ability to use it effectively. You are now reading on the new Next.js blog:


![Light](/media/2023/05/migrate-blog-to-nextjs/new-blog-light.png)

![Dark](/media/2023/05/migrate-blog-to-nextjs/new-blog-dark.png)

Talk about Vercel instead of Cloudflare Pages or Github Pages,
Vercel is a hosting platform that makes deployment a breeze, with seamless integration with Github.
They are creator of Next.js so they have many opt-in optimization like Turbo Pack build Cache or Vercel Analytics.

![Vercel with Github](/media/2023/05/migrate-blog-to-nextjs/migrate-blog-to-nextjs.png)

I was able to use [rehype and a few plugins](https://github.com/duyet/new-blog/blob/master/lib/markdownToHtml.ts) to parse my old markdown files and convert them to MDX format. My first priority was to make sure that all of the **existing functionality** of my blog remained intact and that the structure was maintained without losing any of the old URLs. After that, I can adding new features like **comments** or **[`/insights`](https://blog.duyet.net/insights)** became much easier with Next.js and React.js. As a data engineer, I believe that it's important to showcase my work, such as data visualizations.

![/insights](/media/2023/05/migrate-blog-to-nextjs/insights.png)

One of the biggest advantages of Next.js is its **[support for MDX](https://nextjs.org/docs/advanced-features/using-mdx)**, which enables me to customize any blog post by using React components instead of being limited to just markdown.

```tsx
import { MyComponent } from 'my-components'

# My MDX Page with a Layout

This is a list in markdown:

- One
- Two
- Three

Checkout my React component:

<MyComponent/>
```

This functionality opens up a world of possibilities for me, allowing me to create more engaging and interactive content for my readers.

But there's another reason why I'm excited about - built with **Rust-based** technology. This includes the [**swc.rs**](https://swc.rs/) compiler or Vercel's **[Turbo build](https://turbo.build/)**.

![Turbopack](/media/2023/05/migrate-blog-to-nextjs/migrate-blog-to-nextjs-1.png)

Last but not least, the Pagespeed Insights score still remains high, as you can see in this analysis: **[https://pagespeed.web.dev/analysis/https-blog-duyet-net/yosvr0e3d0?form_factor=mobile](https://pagespeed.web.dev/analysis/https-blog-duyet-net/yosvr0e3d0?form_factor=mobile)**

![](/media/2023/05/migrate-blog-to-nextjs/migrate-blog-to-nextjs-2.png)

Vercel Speed Insights:

![Vercel Speed Insights](/media/2023/05/migrate-blog-to-nextjs/migrate-blog-to-nextjs-3.png)

Please find the source code of my Next.js blog here: [https://github.com/duyet/new-blog](https://github.com/duyet/new-blog)

# References

- [https://github.com/duyet/new-blog](https://github.com/duyet/new-blog)
- [https://nextjs.org](https://nextjs.org)
- [https://turbo.build](https://turbo.build/)
- [https://swc.rs/](https://swc.rs/)
- [Using MDX with Next.js](https://nextjs.org/docs/advanced-features/using-mdx)
