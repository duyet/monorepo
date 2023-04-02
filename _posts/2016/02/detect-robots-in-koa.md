---
template: post
title: Detect robots in koa
date: "2016-02-21"
author: Van-Duyet Le
tags:
- Nodejs
- koa
- middleware
- koajs
- robot
- Framework
modified_time: '2016-05-06T19:17:49.348+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1921884524666147083
blogger_orig_url: https://blog.duyet.net/2016/02/detect-robots-in-koa.html
slug: /2016/02/detect-robots-in-koa.html
category: Javascript
description: Plugin cho KoaJs, nhận diện crawler bot
fbCommentUrl: none
---

Koa detect robots. Fast Middleware detect bot crawler for Koa.  
[![](https://nodei.co/npm/koa-isbot.png?downloads=true&amp;downloadRank=true&amp;stars=true)](https://www.npmjs.com/package/koa-isbot)

## Installation  ##

```bash
npm install koa-isbot --save 
```

## Usage  ##

```js
var koa = require('koa')
  , app = koa.app()
  , isBot = require('koa-isbot');

app.use(isBot());

app.use(function *(next) {
    console.log('isBot? ', this.state.isBot); 
    // null or 'googlebot', 'bingbot', ... 
});

app.listen(3000);
```

Update for Koa2
```js
var koa = require('koa')
  , app = koa.app()
  , isBot = require('koa-isbot');

app.use(isBot());

app.use(aysnc (ctx, next) => {
    console.log('isBot? ', ctx.isBot); 
    // null or 'googlebot', 'bingbot', ... 
});

app.listen(3000);
```

## Support list ##

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

## Source code ##
Github: [https://github.com/duyet/koa-isbot](https://github.com/duyet/koa-isbot)
NPM: [https://www.npmjs.com/package/koa-isbot](https://www.npmjs.com/package/koa-isbot)

## How to contribute ##

1. Fork the project on Github ([https://github.com/duyet/koa-isbot/fork](https://github.com/duyet/koa-isbot/fork))
2. Create a topic branch for your changes
3. Ensure that you provide documentation and test coverage for your changes (patches won’t be accepted without)
4. Create a pull request on Github (these are also a great place to start a conversation around a patch as early as possible)
