---
template: post
title: calc.js - evaluate expressions for Math
date: "2016-03-27"
author: Van-Duyet Le
tags:
- Calculator
- Nodejs
- NPM
- Javascript
- math
modified_time: '2016-05-02T19:39:16.320+07:00'
thumbnail: https://1.bp.blogspot.com/-vmFjdMDVRok/Vvek0fYiwmI/AAAAAAAASas/iUUHSjQAWYUcWK6F5tx8qq3nfP_sVozOg/s1600/calc.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-1083746582557969295
blogger_orig_url: https://blog.duyet.net/2016/03/calcjs-evaluate-expressions-for-math.html
slug: /2016/03/calcjs-evaluate-expressions-for-math.html
category: Javascript
description: Flexible expression parser and offers an integrated solution to work with numbers, big numbers, complex numbers, units, and matrices. Powerful and easy to use.
fbCommentUrl: none
---

Flexible expression parser and offers an integrated solution to work with numbers, big numbers, complex numbers, units, and matrices. Powerful and easy to use.

[![](https://1.bp.blogspot.com/-vmFjdMDVRok/Vvek0fYiwmI/AAAAAAAASas/iUUHSjQAWYUcWK6F5tx8qq3nfP_sVozOg/s1600/calc.png)](https://github.com/duyet/calc.js)

## Install ##

```
npm install calc.js
```

## Usage ##

```js
var calc = require('calc.js');

calc('12 / (2.3 + 0.7)');    // 4
calc('5.08 cm to inch');     // 2 inch
calc('sin(45 deg) ^ 2');     // 0.5
calc('9 / 3 + 2i');          // 3 + 2i
calc('det([-1, 2; 3, 1])');  // -7
```

## Credit ##
Thanks to [mathjs](https://github.com/josdejong/mathjs) eval.

## Source  ##

- [calc.js](https://github.com/duyet/calc.js) | Github
- [calc.js](https://www.npmjs.com/package/calc.js) | NPM
