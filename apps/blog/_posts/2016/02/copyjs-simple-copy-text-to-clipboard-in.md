---
title: copy.js - simple copy text to clipboard in the browser
date: '2016-02-17'
author: Duyet
tags:
  - Node.js
  - NPM
  - Javascript
modified_time: '2016-02-21T01:41:52.268+07:00'
thumbnail: https://3.bp.blogspot.com/-qnoZylNW4-g/VsizR9xBEPI/AAAAAAAAQAw/fR-qHa0ccjk/s1600/copyjs.png
slug: /2016/02/copyjs-simple-copy-text-to-clipboard-in.html
category: Javascript
description: Simple copy to clipboard. No Flash.
---

> **DEPRECATED (2025)**: This article describes an unmaintained library from 2016. For modern copy-to-clipboard functionality, use the native [`navigator.clipboard` API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) instead, which is supported in all modern browsers and requires no dependencies.

Simple copy to clipboard. No Flash.

![](https://3.bp.blogspot.com/-qnoZylNW4-g/VsizR9xBEPI/AAAAAAAAQAw/fR-qHa0ccjk/s1600/copyjs.png)

## Install

You can get it on bower.

```bash
bower install copy --save
```

Or npm, too.

```bash
npm install copy-js --save
```

If you're not into package management, just [download a ZIP](https://github.com/duyet/copy.js/archive/master.zip) file.

## Setup

First, include the script located on the dist folder.

```html
<script src="dist/copy.min.js"></script>
```

Or load it from CDN provider.

```html
<script src="//cdn.rawgit.com/duyetdev/copy.js/master/dist/copy.min.js"></script>
```

## Usage

Just copy:

```js
copy('hello world.')
```

With `callback`:

```js
copy('hello world', function (err) {
  if (err) console.log('Some thing went wrong!')

  console.log('Copied!')
})
```

That's it!

## Modern Alternative (2025)

Instead of using copy.js, use the native Clipboard API:

```js
// Copy text to clipboard
navigator.clipboard.writeText('hello world')
  .then(() => console.log('Copied!'))
  .catch((err) => console.error('Failed to copy:', err))
```

The native API is supported in all modern browsers and requires no external dependencies.

Visit project source code here: [https://github.com/duyet/copy.js](https://github.com/duyet/copy.js)
