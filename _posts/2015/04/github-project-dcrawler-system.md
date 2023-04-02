---
template: post
title: 'Github project - DCrawler - Crawler System base on Nodejs and MongoDB '
date: "2015-04-10"
author: Van-Duyet Le
tags:
- Nodejs
- MongoDb
- DCrawler
- project
modified_time: '2015-08-02T17:33:50.208+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-3272086302003907110
blogger_orig_url: https://blog.duyet.net/2015/04/github-project-dcrawler-system.html
slug: /2015/04/github-project-dcrawler-system.html
category: Project
description: "DCrawler is Nodejs Crawler, multi-module-spider, jQuery query page content, multi thread support.
Design by Van-Duyet Le (@lvduit), one of module for my DSS Project."
fbCommentUrl: none

---

DCrawler is Nodejs Crawler, multi-module-spider, jQuery query page content, multi thread support.
Design by Van-Duyet Le (@lvduit), one of module for my DSS Project.

## DCrawler ##
DCrawler is Nodejs Crawler, multi-module-spider, jQuery query page content, multi thread support.

Project: DCrawler ([https://github.com/lvduit/DCrawler](https://github.com/lvduit/DCrawler))
Version: 0.0.1
Author: Van-Duyet Le ([@lvduit](http://twitter.com/lvduit))
Home: [http://lvduit.com](http://lvduit.com/)

## Features ##
Current features:

- Content parser like jQuery.
- Multi-modules spider parse.
- MongoDb Store.
- Queues stack on Database, you can stop and resume anytime.

## Usage ##

Make sure your Nodejs and MongoDb are installed.

### To install: ###

1. Clone the script from Github

```
git clone https://github.com/lvduit/DCrawler.git
cd ./DCrawler
```

2. Install Node modules

```
npm install
```

### Config your spider ###
Config your spider, the sample spider is located at modules/tinhte.js

To run:

```
node index
```

For multi thread base on your CPU Core

```
node multithread
```

### To view your data ###
Using [https://github.com/lvduit/mongo-express](https://github.com/lvduit/mongo-express) for GUI MongoDb Data view.  

## License ##
MIT License

Copyright (c) 2015 Van-Duyet Le

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
