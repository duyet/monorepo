---
template: post
title: Cách sử dụng Destructuring trong Javascript ES6
date: "2016-05-27"
author: Van-Duyet Le
tags:
- Nodejs
- Destructuring
- ES6
- Javascript
modified_time: '2016-05-27T13:11:33.464+07:00'
thumbnail: https://2.bp.blogspot.com/-6CbJccfAv4A/V0fdpvOadvI/AAAAAAAAWEM/Z7TwERT_aAgcV-HfBQZfq-yXOCOBqomtQCK4B/s1600/es6-destructuring.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4201318662127059437
blogger_orig_url: https://blog.duyet.net/2016/05/cach-su-dung-destructuring-javascript-es6.html
slug: /2016/05/cach-su-dung-destructuring-javascript-es6.html
category: Javascript
description: Destructuring là chức năng mới trong ES6 của Javascript. Giúp extract dữ liệu (có thể lồng nhau) từ Array hoặc Object.
fbCommentUrl: none
---

Destructuring là chức năng mới trong ES6 của Javascript. Giúp extract dữ liệu (có thể lồng nhau) từ Array hoặc Object.

![](https://2.bp.blogspot.com/-6CbJccfAv4A/V0fdpvOadvI/AAAAAAAAWEM/Z7TwERT_aAgcV-HfBQZfq-yXOCOBqomtQCK4B/s1600/es6-destructuring.png)

## 1. Object destructuring ##

```js
const obj = { first: 'Jane', last: 'Doe' };
const {first: f, last: l} = obj;
    // f = 'Jane'; l = 'Doe'

// {prop} is short for {prop: prop}
const {first, last} = obj;
    // first = 'Jane'; last = 'Doe'
```

## 2. Array destructuring ##
Destructuring giá trị từ mảng

```js
const iterable = ['a', 'b'];
const [x, y] = iterable;
    // x = 'a'; y = 'b'
```
Destructuring cũng giúp xử lý giá trị được trả về

```js
const [all, year, month, day] =
    /^(\d\d\d\d)-(\d\d)-(\d\d)$/
    .exec('2999-12-31');
```

## 3. Khi nào cần sử dụng destructuring ##
Cơ bản, destructuring có thể được sử dụng ở 1 số trường hợp sau:

```js
// Khai báo giá trị
const [x] = ['a'];
let [x] = ['a'];
var [x] = ['a'];

// Gán giá trị
[x] = ['a'];

// Định nghĩa các tham số
function f([x]) { ··· }
f(['a']);
```

Sử dụng với vòng lặp `for-of`

```js
const arr1 = ['a', 'b'];
for (const [index, element] of arr1.entries()) {
    console.log(index, element);
}
// Output:
// 0 a
// 1 b

const arr2 = [
    {name: 'Duyệt', age: 21},
    {name: 'Hoa', age: 19},
];
for (const {name, age} of arr2) {
    console.log(name, age);
}
// Output:
// Duyệt 41
// Hoa 40
```

## 4. Các Patterns  ##
Một số patterns sử dụng sâu hơn chức năng này:

#### 4.1 Pick what you need ####

Chỉ bóc tách lấy giá trị trong Object mà bạn cần

```js
const { x: x } = { x: 7, y: 3 }; // x = 7

// Array
const [x,y] = ['a', 'b', 'c']; // x='a'; y='b';

// Hoặc khó hơn, và "sâu" hơn như thế này
const obj = { a: [{ foo: 123, bar: 'abc' }, {}], b: true };
const { a: [{foo: f}] } = obj; // f = 123
```

#### 4.2 Object patterns coerce values to objects ####
Pattern này ép giá trị nguồn (bên phải) thành object trước, khó để giải thích cái này, bạn xem ví dụ bên dưới<br />

```js
const {length : len} = 'abc'; // len = 3
const {toString: s} = 123; // s = Number.prototype.toString
```

#### 4.3 Array patterns work with iterables ####

```js
// Strings are iterable:
const [x,...y] = 'abc'; // x='a'; y=['b', 'c']
```

#### 4.4 Sử dụng với Generator function (yield) ####

```js
function* allNaturalNumbers() {
  for (let n = 0; ; n++) {
    yield n;
  }
}

const [x, y, z] = allNaturalNumbers(); // x=0; y=1; z=2
```

#### 4.5 Default values ####

```js
const [x=3, y] = []; // x = 3; y = undefined
const {foo: x=3, bar: y} = {}; // x = 3; y = undefined
const [x=1] = [undefined]; // x = 1
const {prop: y=2} = {prop: undefined}; // y = 2

const [x=3, y=x] = [];     // x=3; y=3
const [x=3, y=x] = [7];    // x=7; y=7
const [x=3, y=x] = [7, 2]; // x=7; y=2

// Khó hơn 
const [{ prop: x } = {}] = [];
```

#### 4.6 Khuyết tham số ####

```js
const [,, x, y] = ['a', 'b', 'c', 'd']; // x = 'c'; y = 'd'
```

#### 4.7. Load module Node.js  ####

```js
const { Loader, main } = require('toolkit/loader');
```

## 5. Tham khảo  ##

- [http://exploringjs.com/es6/ch_destructuring.html](http://exploringjs.com/es6/ch_destructuring.html)
- [https://gist.github.com/mikaelbr/9900818](https://gist.github.com/mikaelbr/9900818)
