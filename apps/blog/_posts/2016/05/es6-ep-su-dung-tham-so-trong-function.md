---
title: ES6 - ép sử dụng tham số trong function
date: '2016-05-27'
author: Duyet
tags:
  - Tutorial
  - ES6
  - Javascript
modified_time: '2016-05-27T11:34:39.996+07:00'
slug: /2016/05/es6-ep-su-dung-tham-so-trong-function.html
category: Javascript
description: Các tham số function trong Javascript thực ra không bắt buộc, Javascript chỉ kiểm tra khi nó được sử dụng đến. Một số trường hợp ta muốn bắt buộc người sử dụng hàm phải điền tham số này khi gọi hàm. Thủ thuật sau sử dụng chức năng default param trong ES6
---

Các tham số function trong Javascript thực ra không bắt buộc, Javascript chỉ kiểm tra khi nó được sử dụng đến. Một số trường hợp ta muốn bắt buộc người sử dụng hàm phải điền tham số này khi gọi hàm. Thủ thuật sau sử dụng chức năng default param trong ES6

```js
/**
 * Called if a parameter is missing and
 * the default value is evaluated.
 */
function mandatory() {
  throw new Error('Missing parameter')
}
function foo(mustBeProvided = mandatory()) {
  return mustBeProvided
}
```

Hàm mandotory() sẽ được chạy khi tham số mustBeProvided bị thiếu.

```
> foo()
Error: Missing parameter
> foo(123)
123
```

Tham khảo:

- Sect. ["Required parameters"](http://exploringjs.com/es6/ch_parameter-handling.html#_required-parameters) in "Exploring ES6"
