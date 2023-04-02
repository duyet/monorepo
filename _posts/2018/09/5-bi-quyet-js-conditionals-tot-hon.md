---
template: post
title: 5 bí quyết viết JS conditionals tốt hơn
date: "2018-09-20"
author: Van-Duyet Le
tags:
- ES6
- Tutorials
- Javascript
- Thủ thuật
modified_time: '2018-09-20T23:59:04.102+07:00'
thumbnail: https://2.bp.blogspot.com/-RRyHHS4eNUw/W6PRc6rcpWI/AAAAAAAAzqM/FQvD9qNV-c4PuNUrvoSZnZfSqk2EdMZxwCLcBGAs/s1600/udpahiv8rqlemvz0x3wc.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-5941256232051212398
blogger_orig_url: https://blog.duyet.net/2018/09/5-bi-quyet-js-conditionals-tot-hon.html
slug: /2018/09/5-bi-quyet-js-conditionals-tot-hon.html
category: Web
description: Trong Javascript, chúng ta phải sử dụng nhiều loại lệnh điều kiện (if ... else ...) khác nhau, sau đây là 5 bí quyết để viết lệnh if else nhanh hơn và chuyên nghiệp hơn.
fbCommentUrl: none
---

Trong Javascript, chúng ta phải sử dụng nhiều loại lệnh điều kiện (if ... else ...) khác nhau, sau đây là 5 bí quyết để viết lệnh if else nhanh hơn và chuyên nghiệp hơn.

![](https://2.bp.blogspot.com/-RRyHHS4eNUw/W6PRc6rcpWI/AAAAAAAAzqM/FQvD9qNV-c4PuNUrvoSZnZfSqk2EdMZxwCLcBGAs/s1600/udpahiv8rqlemvz0x3wc.png)

## 1. Sử dụng Array.includes thay cho điều kiện so sánh bằng (==) ##
Hãy xem ví dụ:

```js
// condition
function test(fruit) {
  if (fruit == 'apple' || fruit == 'strawberry') {
    console.log('red');
  }
}
```

Nhìn sơ qua, ví dụ trên có vẻ không vấn đề gì. Tuy nhiên, sẽ có vấn đề gì khi chúng ta có thêm 50 cái so sánh bằng liên tiếp thì sao?

Bạn có thể viết lại câu điều kiện trên dưới dạng:

```javascript
function test(fruit) {
  // extract conditions to array
  const redFruits = ['apple', 'strawberry', 'cherry', 'cranberries'];

  if (redFruits.includes(fruit)) {
    console.log('red');
  }
}
```

## 2. Less Nesting, Return Early ##
Ý nghĩa của Less Nesting, Return Early là hạn chế việc lồng quá nhiều câu điều kiện, mà hãy return sớm nhất ngay khi có thể.

Ví dụ đoạn chương trình như sau:

```js
function test(fruit, quantity) {
  const redFruits = ['apple', 'strawberry', 'cherry', 'cranberries'];

  // condition 1: fruit must has value
  if (fruit) {
    // condition 2: must be red
    if (redFruits.includes(fruit)) {
      console.log('red');

      // condition 3: must be big quantity
      if (quantity > 10) {
        console.log('big quantity');
      }
    }
  } else {
    throw('No fruit!');
  }
}

// test results
test(null); // error: No fruits
test('apple'); // print: red
test('apple', 20); // print: red, big quantity
```

Với đoạn code trên, 1 quy luật đơn giản là hãy return ngay khi có thể:

```js
function test(fruit, quantity) {
  const redFruits = ['apple', 'strawberry', 'cherry', 'cranberries'];

  if (!fruit) throw('No fruit!'); // condition 1: throw error early
  if (!redFruits.includes(fruit)) return; // condition 2: stop when fruit is not red

  console.log('red');

  // condition 3: must be big quantity
  if (quantity > 10) {
    console.log('big quantity');
  }
}
```

## 3. Sử dụng tham số mặc định trong function (default function parameters) và Detructuring ##
Ví dụ với đoạn code sau, trong ES5 chắc hẳn bạn đã từng phải rất khó chịu khi luôn phải check xem giá trị của tham số trong function có phải là null / undefined hay không.

```js
function test(fruit, quantity) {
  if (!fruit) return;
  const q = quantity || 1; // if quantity not provided, default to one

  console.log(`We have ${q} ${fruit}!`);
}

//test results
test('banana'); // We have 1 banana!
test('apple', 2); // We have 2 apple!
```

Với ES6 về sau, bạn đã có thể gán [giá trị mặc định cho params](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters), như sau:

```js
function test(fruit, quantity = 1) { // if quantity not provided, default to one
  if (!fruit) return;
  console.log(`We have ${quantity} ${fruit}!`);
}

//test results
test('banana'); // We have 1 banana!
test('apple', 2); // We have 2 apple!
```

Chúng ta cũng có thể gán default cho `fruit`, như sau: `function test(fruit = "unknown", quantity = 1) {...}`

Nhưng trong trường hợp muốn `fruit` là object thì sao? Chúng ta có thể gán giá trị default cho nó hay không?

```js
function test(fruit) { 
  // printing fruit name if value provided
  if (fruit && fruit.name)  {
    console.log (fruit.name);
  } else {
    console.log('unknown');
  }
}

//test results
test(undefined); // unknown
test({ }); // unknown
test({ name: 'apple', color: 'red' }); // apple
```

Trong ví dụ trên, chúng ta muốn in fruit name ra nếu tồn tại, ngược lại in `'unknown'`. Chúng ta có thể tránh việc sử dụng `fruit && fruit.name` bằng cách sử dụng default function parameter và destructing.

```js
// destructing - get name property only
// assign default empty object {}
function test({name} = {}) {
  console.log (name || 'unknown');
}

//test results
test(undefined); // unknown
test({ }); // unknown
test({ name: 'apple', color: 'red' }); // apple
```

Khi cần thuộc tính name trong object `fruit`, ta destruct sử dụng `{name}`, sau đó sử dụng biến `name` trong function thay vì `fruit.name`

## 4. Sử dụng Map / Object Literal thay vì lệnh switch ##
Xem ví dụ sau, chúng ta muốn in tên fruit thông qua màu sắc:

```js
function test(color) {
  // use switch case to find fruits in color
  switch (color) {
    case 'red':
      return ['apple', 'strawberry'];
    case 'yellow':
      return ['banana', 'pineapple'];
    case 'purple':
      return ['grape', 'plum'];
    default:
      return [];
  }
}

//test results
test(null); // []
test('yellow'); // ['banana', 'pineapple']
```

Code trên không có gì sai, nhưng nó quá dài dòng try hard, mình viết lại dưới dạng trí tuệ hơn 1 chút:

```js
function test(color) {
  // use object literal to find fruits in color
  const fruitColor = {
    red: ['apple', 'strawberry'],
    yellow: ['banana', 'pineapple'],
    purple: ['grape', 'plum']
  };

  return fruitColor[color] || [];
}
```

Mặc khác bạn có thể sử dụng [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) trong Javascript ES2015 (cho phép lưu trữ key-value):

```js
function test(color) {
  // use Map to find fruits in color
  const fruitColor = new Map()
    .set('red', ['apple', 'strawberry'])
    .set('yellow', ['banana', 'pineapple'])
    .set('purple', ['grape', 'plum']);

  return fruitColor.get(color) || [];
}
```

Còn 1 cách khác nữa là sử dụng `Array.filter`:

```js
function test(color) {
  // use Array filter to find fruits in color
  const fruits = [
    { name: 'apple', color: 'red' }, 
    { name: 'strawberry', color: 'red' }, 
    { name: 'banana', color: 'yellow' }, 
    { name: 'pineapple', color: 'yellow' }, 
    { name: 'grape', color: 'purple' }, 
    { name: 'plum', color: 'purple' }   ];

  return fruits.filter(f => f.color == color);
}
```

## 5. Sử dụng Array.every & Array.some ##
Một tip nữa là JS hỗ trợ nhiều thao tác trên array giúp giảm thiểu rất nhiều số dòng code. Ví dụ bên dưới kiểm tra có phải mọi `fruit` đều là màu đỏ hay không:

```js
function test(fruits) {
  const fruits = [
    { name: 'apple', color: 'red' },
    { name: 'banana', color: 'yellow' },
    { name: 'grape', color: 'purple' }
  ];

  let isAllRed = true;

  // condition: all fruits must be red
  for (let f of fruits) {
    if (!isAllRed) break;
    isAllRed = (f.color == 'red');
  }

  console.log(isAllRed); // false
}
```

Ngắn gọn hơn, mình sử dụng `Array.every`

```js
function test(fruits) {
  const fruits = [
    { name: 'apple', color: 'red' },
    { name: 'banana', color: 'yellow' },
    { name: 'grape', color: 'purple' }
  ];

  // condition: short way, all fruits must be red
  const isAllRed = fruits.every(f => f.color == 'red');

  console.log(isAllRed); // false
}
```

`Array.some` kiểm tra array xem có ít nhất 1 phần tử nào đó điều kiện hay không.

```js
function test(fruits) {
  const fruits = [
    { name: 'apple', color: 'red' },
    { name: 'banana', color: 'yellow' },
    { name: 'grape', color: 'purple' }
  ];

  // condition: if any fruit is red
  const isAnyRed = fruits.some(f => f.color == 'red');

  console.log(isAnyRed); // true
}
```

Hy vọng với các bí quyết trên sẽ giúp code JS của các bạn sẽ clean & clear hơn. Bài viết dịch từ bài viết gốc từ: https://scotch.io/tutorials/5-tips-to-write-better-conditionals-in-javascript
