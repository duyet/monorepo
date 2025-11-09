---
title: Detect robots in koa
date: '2016-02-21'
author: Duyet
tags:
  - Node.js
  - Javascript Framework
modified_time: '2025-11-09T00:00:00.000+07:00'
slug: /2016/02/detect-robots-in-koa.html
category: Javascript
description: Plugin for Koa.js to detect crawler bots and user agents
---

Koa detect robots. Fast Middleware detect bot crawler for Koa.
[![](https://nodei.co/npm/koa-isbot.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/koa-isbot)

> **Note (2025)**: This guide covers the `koa-isbot` middleware for Koa v1 and v2. The plugin approach is still valid for Koa applications. For modern alternatives, consider checking the User-Agent header directly using libraries like `ua-parser-js` or checking if newer bot detection packages are actively maintained.

## Installation

```bash
npm install koa-isbot --save
```

## Usage

```js
const Koa = require('koa');
const isBot = require('koa-isbot');
const app = new Koa();

app.use(isBot());

app.use(function* (next) {
  console.log('isBot? ', this.state.isBot);
  // null or 'googlebot', 'bingbot', ...
});

app.listen(3000);
```

Update for Koa2

```js
const Koa = require('koa');
const isBot = require('koa-isbot');
const app = new Koa();

app.use(isBot());

app.use(async (ctx, next) => {
  console.log('isBot? ', ctx.isBot);
  // null or 'googlebot', 'bingbot', ...
});

app.listen(3000);
```

## Support list

- Google bot - googlebot
- Baidu - baiduspider
- Guruji - gurujibot
- Yandex - yandexbot
- Slurp- slurp
- MSN - msnbot
- Bing - bingbot
- Facebook - facebookexternalhit
- Linkedin - linkedinbot
- Twitter - twitterbot
- Slack - slackbot
- Telegram - telegrambot
- Apple - applebot
- Pingdom - pingdom
- tumblr - tumblr

## Source code

- GitHub: [https://github.com/duyet/koa-isbot](https://github.com/duyet/koa-isbot)
- NPM: [https://www.npmjs.com/package/koa-isbot](https://www.npmjs.com/package/koa-isbot)

## How to contribute

1. Fork the project on Github ([https://github.com/duyet/koa-isbot/fork](https://github.com/duyet/koa-isbot/fork))
2. Create a topic branch for your changes
3. Ensure that you provide documentation and test coverage for your changes (patches won’t be accepted without)
4. Create a pull request on Github (these are also a great place to start a conversation around a patch as early as possible)
