---
template: post
title: copy.js - simple copy text to clipboard in the browser
date: "2016-02-17"
author: Van-Duyet Le
tags:
- Nodejs
- copy.js
- Bower
- NPM
- Javascript
modified_time: '2016-02-21T01:41:52.268+07:00'
thumbnail: https://3.bp.blogspot.com/-qnoZylNW4-g/VsizR9xBEPI/AAAAAAAAQAw/fR-qHa0ccjk/s1600/copyjs.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-5649667418340185075
blogger_orig_url: https://blog.duyet.net/2016/02/copyjs-simple-copy-text-to-clipboard-in.html
slug: /2016/02/copyjs-simple-copy-text-to-clipboard-in.html
category: Javascript
description: Simple copy to clipboard. No Flash.
fbCommentUrl: none
---

Simple copy to clipboard. No Flash.

![](https://3.bp.blogspot.com/-qnoZylNW4-g/VsizR9xBEPI/AAAAAAAAQAw/fR-qHa0ccjk/s1600/copyjs.png)

## Install ##
You can get it on bower. 

```bash
bower install copy --save
```

Or npm, too.

```bash
npm install copy-js --save
```

If you're not into package management, just [[download a ZIP]](https://github.com/duyet/copy.js/archive/master.zip) file.

## Setup ##
First, include the script located on the dist folder.

```html
<script src="dist/copy.min.js"></script>
```

Or load it from CDN provider.

```html
<script src="//cdn.rawgit.com/duyetdev/copy.js/master/dist/copy.min.js"></script>
```

## Usage ##
Just copy:

```js
copy('hello world.');
```

With `callback`:

```js
copy('hello world', function(err) {
 if (err) console.log('Some thing went wrong!');

 console.log('Copied!');
});
```

That's it!

Visit project source code here: [https://github.com/duyet/copy.js](https://github.com/duyet/copy.js)
