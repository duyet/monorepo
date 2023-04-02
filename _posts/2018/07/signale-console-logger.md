---
template: post
title: Signale - Hackable console logger for Nodejs
date: "2018-07-19"
author: Van-Duyet Le
tags:
- Nodejs
- Logger
- intro-js
- Javascript
- Intro-library
modified_time: '2018-07-19T21:51:29.517+07:00'
thumbnail: https://3.bp.blogspot.com/-Gj9IxBJacZ4/W1CjcADwEoI/AAAAAAAAxXg/92YNzTR5CXMv9bvrxMU1h-AkCOlPLPn8QCK4BGAYYCw/s1600/68747470733a2f2f63646e2e7261776769742e636f6d2f6b6c617573636668712f7369676e616c652f32643862636666382f6d656469612f6865616465722e706e67.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-3140580361477794474
blogger_orig_url: https://blog.duyet.net/2018/07/signale-console-logger.html
slug: /2018/07/signale-console-logger.html
category: Web
description: Signale là một thư viện thay thế console logger trong Nodejs, cho kết quả đẹp, sexy hơn và nhiều chức năng.
fbCommentUrl: none
---

[Signale](https://github.com/klauscfhq/signale) là một thư viện thay thế console logger trong Nodejs, cho kết quả đẹp, sexy hơn và nhiều chức năng.

[![](https://3.bp.blogspot.com/-Gj9IxBJacZ4/W1CjcADwEoI/AAAAAAAAxXg/92YNzTR5CXMv9bvrxMU1h-AkCOlPLPn8QCK4BGAYYCw/s640/68747470733a2f2f63646e2e7261776769742e636f6d2f6b6c617573636668712f7369676e616c652f32643862636666382f6d656469612f6865616465722e706e67.png)](https://3.bp.blogspot.com/-Gj9IxBJacZ4/W1CjcADwEoI/AAAAAAAAxXg/92YNzTR5CXMv9bvrxMU1h-AkCOlPLPn8QCK4BGAYYCw/s1600/68747470733a2f2f63646e2e7261776769742e636f6d2f6b6c617573636668712f7369676e616c652f32643862636666382f6d656469612f6865616465722e706e67.png) 

## Cài đặt ##

```
npm install signale
```

Import và sử dụng như console.*

```js
const signale = require('signale');

signale.success('Operation successful');
signale.debug('Hello', 'from', 'L59');
signale.pending('Write release notes for %s', '1.2.0');
signale.fatal(new Error('Unable to acquire lock'));
signale.watch('Recursively watching build directory...');
signale.complete({prefix: '[task]', message: 'Fix issue #59', suffix: '(@klauscfhq)'});
```

[![](https://1.bp.blogspot.com/-3aKgu-UjJ10/W1Cj2iJMPVI/AAAAAAAAxXs/s4-59XuR5uUk6Os3qqy-R8JGOr-tFuumgCK4BGAYYCw/s640/default-loggers.png)](https://1.bp.blogspot.com/-3aKgu-UjJ10/W1Cj2iJMPVI/AAAAAAAAxXs/s4-59XuR5uUk6Os3qqy-R8JGOr-tFuumgCK4BGAYYCw/s1600/default-loggers.png)

## Custom Loggers ##
Bạn có thể custom rất nhiều cho logger, bao gồm định nghĩa thêm phương thức log mới:

```js
const {Signale} = require('signale');

const options = {
  disabled: false,
  interactive: false,
  stream: process.stdout,
  scope: 'custom',
  types: {
    remind: {
      badge: '**',
      color: 'yellow',
      label: 'reminder'
    },
    santa: {
      badge: '🎅',
      color: 'red',
      label: 'santa'
    }
  }
};

const custom = new Signale(options);
custom.remind('Improve documentation.');
custom.santa('Hoho! You have an unused variable on L45.');
```

[![](https://2.bp.blogspot.com/-SWyIC-tNnhY/W1CkprmdwZI/AAAAAAAAxX4/ZvAt3X4jxugyNSRxbygjzxGSKTPaAY6CgCK4BGAYYCw/s640/custom-loggers.png)](https://2.bp.blogspot.com/-SWyIC-tNnhY/W1CkprmdwZI/AAAAAAAAxX4/ZvAt3X4jxugyNSRxbygjzxGSKTPaAY6CgCK4BGAYYCw/s1600/custom-loggers.png)
Xem thêm chi tiết và cấu hình tham số tại đây: [https://github.com/klauscfhq/signale](https://github.com/klauscfhq/signale)
