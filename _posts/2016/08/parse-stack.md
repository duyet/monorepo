---
template: post
title: 'Parse Stack '
date: "2016-08-18"
author: Van-Duyet Le
tags:
- Nodejs
- Parse Server
- Parse Dashboard
- intro-js
- Parse Stack
- Parse
- Dashboard
modified_time: '2017-08-06T11:41:14.269+07:00'
thumbnail: https://4.bp.blogspot.com/-juqpy4uQn4M/V7VU_YXVo9I/AAAAAAAAbtU/39gqxQzjBFwFYm26fip_pKI35hPVTSrcACLcB/s1600/parse-stack-logo.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-2387224023544643975
blogger_orig_url: https://blog.duyet.net/2016/08/parse-stack.html
slug: /2016/08/parse-stack.html
category: Project
description: Parse Server is an open source version of the Parse backend that can be deployed to any infrastructure that can run Node.js.
fbCommentUrl: none
---

Parse Server is an open source version of the Parse backend that can be deployed to any infrastructure that can run Node.js.

Parse Server works with the Express web application framework. It can be added to existing web applications, or run by itself.

[![](https://4.bp.blogspot.com/-juqpy4uQn4M/V7VU_YXVo9I/AAAAAAAAbtU/39gqxQzjBFwFYm26fip_pKI35hPVTSrcACLcB/s1600/parse-stack-logo.png)](http://saveto.co/JGY2Wm)

[Parse Stack](http://saveto.co/JGY2Wm) = Parse server + Parse Dashboard

## Installation ##

1. Clone and install the Parse Stack

```bash
git clone https://github.com/duyet/parse-stack.git
cd parse-stack
npm install
```

2. Install MongoDB or simply by

```bash
npm install -g mongodb-runner
mongodb-runner start
```

3. Start Parse Stack

```bash
npm start
```

## Using it ##

- Access to endpoint

- Parse API: http://localhost:8080/parse
- Parse Dashboard: http://localhost:8080/dashboard

- Connect your app to Parse Server: Parse provides SDKs for all the major platforms. Refer to the [Parse Server guide to learn how to connect your app to Parse Server.](https://github.com/ParsePlatform/parse-server/wiki/Parse-Server-Guide#using-parse-sdks-with-parse-server)
- Read the full Parse Server guide here: [https://github.com/ParsePlatform/parse-server/wiki/Parse-Server-Guide](https://github.com/ParsePlatform/parse-server/wiki/Parse-Server-Guide)

[![](https://4.bp.blogspot.com/-kktJEVTPL80/V7VWTvViP6I/AAAAAAAAbtk/q0UPwaZocJA5CaMjMyPFcZY9jJ6lrbwMgCK4B/s1600/Screen-Shot-2016-03-30-at-12.33.34-PM-1-1024x508.png)](https://4.bp.blogspot.com/-kktJEVTPL80/V7VWTvViP6I/AAAAAAAAbtk/q0UPwaZocJA5CaMjMyPFcZY9jJ6lrbwMgCK4B/s1600/Screen-Shot-2016-03-30-at-12.33.34-PM-1-1024x508.png)

Parse Dashboard

## Resources ##
Project homepage: [https://github.com/duyet/parse-stack](http://saveto.co/JGY2Wm)
Parse Server: [https://github.com/ParsePlatform/parse-server](https://github.com/ParsePlatform/parse-server)
