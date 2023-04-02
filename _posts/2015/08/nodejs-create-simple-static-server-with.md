---
template: post
title: Nodejs - Create simple static server with Nodejs
date: "2015-08-09"
author: Van-Duyet Le
tags:
- Nodejs
- Tutorial
- English
- simple
modified_time: '2018-09-10T17:29:34.941+07:00'
thumbnail: https://2.bp.blogspot.com/-6e-BntuJcuY/VccJShY74fI/AAAAAAAACtQ/AEgG4pJeriE/s1600/test-html-server.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1803496770055106930
blogger_orig_url: https://blog.duyet.net/2015/08/nodejs-create-simple-static-server-with.html
slug: /2015/08/nodejs-create-simple-static-server-with.html
category: Javascript
description: With this simple package, you can create your own static server simply by Nodejs.
fbCommentUrl: none
---

With this simple package, you can create your own static server simply by Nodejs.
Vietnamese version: [https://blog.duyet.net/2015/08/tao-server-static-don-gian-bang-nodejs.html](https://blog.duyet.net/2015/08/tao-server-static-don-gian-bang-nodejs.html)

## Installation ##

```
$ npm install static-html-server -g
```

## Folder tree structure ##

I created a project directory structure is as follows:

- index.html
- style.css 

With path is: ~/project/test-static-server 

![](https://2.bp.blogspot.com/-6e-BntuJcuY/VccJShY74fI/AAAAAAAACtQ/AEgG4pJeriE/s1600/test-html-server.png)

## Start server ##

I started server by using:

```
$ static-html-server -p 8888 -r ~/project/test-static-server 
```

And with:

- -p 8888 is the port of static server, by default is 7788.
- -r ~/project/test-static-server is the path to root folder project, default is current folder location.

Open your browser and enter to location: http://localhost:8888

Result is: 

![](https://2.bp.blogspot.com/-FiaZHjDZeWQ/VccLGm3k_BI/AAAAAAAACtc/0qxhWNca8Bw/s1600/test-simple-server-view.png)

## Github Project ##

Github repo: [https://github.com/duyet/static-html-server](https://github.com/duyet/static-html-server)

Issues: [https://github.com/duyet/static-html-server/issues](https://github.com/duyet/static-html-server/issues)
