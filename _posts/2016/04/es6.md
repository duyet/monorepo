---
template: post
title: ES6 có gì mới?
date: "2016-04-05"
author: Van-Duyet Le
tags:
- Nodejs
- ECMAScript 2015
- ES6
- Javascript
modified_time: '2016-05-02T19:39:07.241+07:00'
thumbnail: https://4.bp.blogspot.com/-oK1U8Mxh0do/VwKkWfHuhzI/AAAAAAAAS2M/nCj-Zc2r7XUmhdjn95pbhyjQ6ISXHYfww/s1600/ecmascript6.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-8979055965923157196
blogger_orig_url: 
slug: /2016/04/es6.html
category: Javascript
description: ES6 là phiên bản mới nhất của bộ tiêu chuẩn ECMAScript. ES6 ra mắt giữa 2015 với rất nhiều những tính năng mới lạ, và cần thiết đối với sự phát triển chóng mặt của Javascript trong những năm gần đây. Cụ thể ES6 sẽ có những điểm mới nào nổi bật?
fbCommentUrl: http://blog.duyetdev.com/2016/04/es6.html
---

ES6 là phiên bản mới nhất của bộ tiêu chuẩn ECMAScript. ES6 ra mắt giữa 2015 với rất nhiều những tính năng mới lạ, và cần thiết đối với sự phát triển chóng mặt của Javascript trong những năm gần đây. Cụ thể ES6 sẽ có những điểm mới nào nổi bật?

[![](https://4.bp.blogspot.com/-oK1U8Mxh0do/VwKkWfHuhzI/AAAAAAAAS2M/nCj-Zc2r7XUmhdjn95pbhyjQ6ISXHYfww/s640/ecmascript6.png)](https://blog.duyet.net/2016/04/es6.html)

Bài viết có thể sẽ không bao quát được hết những gì có trong ES6, nhưng sẽ nêu ra những điểm mới, điểm hay mà mình tiếp xúc trong quá trình sử dụng. Để xem đầy đủ changelog vui lòng [xem tại đây](http://es6-features.org/).

## let/const ##
ES6 bổ sung thêm cách khai báo biến cục bộ ([Block-scoped variables](http://es6-features.org/#BlockScopedVariables)), let khai báo biến trong block mà không làm ảnh hưởng đến giá trị trong block khác, hoặc const cho các biến không thay đổi giá trị. Ngoài ra let chỉ có giá trị trong phạm vi block code được khai báo.

```js
const koa = require('koa');
if(true) {
  let x = 1;
  console.log(x); // in ra: "1"
}
console.log(x);  // undefined x do x chỉ được khai báo trong khối lệnh if() { ... }
```

## Arrow ##
Arrow là một dạng viết tắt của các function sử dụng dấu =>, giống Java, C# hoặc Coffee Script.

Tạo hàm bằng arrow: `param => returnValue`

```js
(a, b) => a + b;

(a, b) => {
    return a + b;
}

```

Hữu ích khi lập trình hàm `(funtional programing) [1, 2].map(x => x * 2)`

```js
// Expression bodies
var odds = evens.map(v => v + 1);
var nums = evens.map((v, i) => v + i);
var pairs = evens.map(v => ({even: v, odd: v + 1}));

// Statement bodies
nums.forEach(v => {
  if (v % 5 === 0)
    fives.push(v);
});

// Lexical this
var bob = {
  _name: "Bob",
  _friends: [],
  printFriends() {
    this._friends.forEach(f =>
      console.log(this._name + " knows " + f));
  }
}
```

## Class ##
ES5 không hỗ trợ class, mà mô tả các đối tượng thông qua các function và prototype. Hiện ES6 đã hỗ trợ Class, đúng chất của OOP.

```js
class SkinnedMesh extends THREE.Mesh {
  constructor(geometry, materials) {
    super(geometry, materials);

    this.idMatrix = SkinnedMesh.defaultMatrix();
    this.bones = [];
    this.boneMatrices = [];
    //...
  }
  update(camera) {
    //...
    super.update();
  }
  get boneCount() {
    return this.bones.length;
  }
  set matrixType(matrixType) {
    this.idMatrix = SkinnedMesh[matrixType]();
  }
  static defaultMatrix() {
    return new THREE.Matrix4();
  }
}
```

## Enhanced Object Literals ##
Enhanced Object Literals giúp rút gọn quá trình khai báo `foo: foo` trong Object. Ví dụ ngày trước bạn khai báo như thế này:

```js
var obj = {};
obj.theProtoObj = theProtoObj;

var handler = function() { ... }
var obj = {
    handler: handler
};
```

Thì bây giờ có thể viết gọn `handler: handler` lại thành `handler` luôn: 

```js
var obj = {
    // __proto__
    __proto__: theProtoObj,
    // Shorthand for ‘handler: handler’
    handler,
    // Methods
    toString() {
     // Super calls
     return "d " + super.toString();
    },
    // Computed (dynamic) property names
    [ 'prop_' + (() => 42)() ]: 42
};
```

## Exporting ##

ES6 có một chút thay đổi về cú pháp export 

```js
// Nodejs (AMD) ES5 
module.exports = 1
module.exports = { foo: 'bar' }
module.exports = ['foo', 'bar']
module.exports = function bar () {}

// ES6
export default 1
export default { foo: 'bar' }
export default ['foo', 'bar']
export default function bar () {}
```

```js
// ES5 
module.exports.name = 'David';
module.exports.age = 25;

// ES6
export var name = 'David';
export var age  = 25
```

```js
// math/addition.js
function sumTwo(a, b) {
    return a + b;
}
function sumThree(a, b) {
    return a + b + c;
}
export { sumTwo, sumThree };
```

## Importing Modules ##

```js
// ES5
var _ = require('underscore');​

// ES6
import _ from 'underscore';
import { sumTwo, sumThree } from 'math/addition'
import { 
  sumTwo as addTwoNumbers, 
  sumThree as sumThreeNumbers} from
} from 'math/addition'
import * as util from 'math/addition'
```

## Template Strings + Escaping Characters + Multi-line Strings ##
Template Strings: Cái này khá dễ hiểu, giống như C/C++, Python. Template String được bao bởi dấu huyền (`)

```js
// Basic literal string creation
`In JavaScript '\n' is a line-feed.`

// Multiline strings
`In JavaScript this is
 not legal.`

// String interpolation
var name = "Bob", time = "today";
`Hello ${name}, how are you ${time}?`

// Construct an HTTP request prefix is used to interpret the replacements and construction
POST`http://foo.org/bar?a=${a}&b=${b}
     Content-Type: application/json
     X-Credentials: ${credentials}
     { "foo": ${foo},
       "bar": ${bar}}`(myOnReadyStateChangeHandler);
```

Escaping Characters: Không cần phải quan tâm khi string chứa dấu nháy đơn và kép lẫn lộn

```js
// ES5
var text = "This string contains \"double quotes\" which are escaped."

// ES6 
let text = `This string contains "double quotes" which are escaped.`
```

Multi-line Strings: 

```js
// ES5
var text = (
  'cat\n' +
  'dog\n' +
  'nickelodeon'
)
var text = [
  'cat',
  'dog',
  'nickelodeon'
].join('\n')

// ES6 
var text = (
  `cat
  dog
  nickelodeon`
)
```

## Destructuring Assignment ##

```js
function multi_values() {
  return [1, 2, 3, 4, 5, 6];
}
// khi muốn gọi giá trị từ hàm trả về
[x1, x2, , , x5, x6] = multi_values();
console.log(x6);  // 6

var list = [ 1, 2, 3 ];
var [ a, , b ] = list; // a = 1; b = 3
[ b, a ] = [ a, b ]; // a = 3; b = 1
```

## Tham số mặc định ##

ES6 cho thấy sự thông minh trong cách nhận giá trị tham số đầu vào của một function. Bằng cách tự động điền giá trị tham số đầu vào theo thứ tự truyền vào tương ứng.

```js
function  default1 (x = 1, y = 2, z = 3) {
  console.log(x, y, z);
}
default1(5, 6); // 5 6 3
```

```js
function default2 (x = 1, y = 2, z = 3) {
  console.log(x, y, z);
}
default2(undefined, 6, 7); // 1 6 7
```

## Sử dụng "..." cho đa tham số ##

"..." trong ES6 có vai trò như định nghĩa một mảng động khi truyền vào tham số cho một function

```js
function three_dot1 (...args) {
  console.log(args.length); // in ra "4"
  console.log(args);  // in ra "1 2 3 4"
}
three_dot1(1, 2, 3, 4); 
```

## For..Of ##

Giống for..in, for..of dùng để viết vòng lặp trên các iterator function hoặc generator function

```js
let fibonacci = {
  [Symbol.iterator]() {
    let pre = 0, cur = 1;
    return {
      next() {
        [pre, cur] = [cur, pre + cur];
        return { done: false, value: cur }
      }
    }
  }
}

for (var n of fibonacci) {
  // truncate the sequence at 1000
  if (n > 1000)
    break;
  console.log(n);
}
```

## Generators ##

Có 1 bài giải thích chi tiết về generator function tại đây: [function* và yield trong Javascript generator function](http://saveto.co/mdtehe)

## Unicode ##

ES6 hỗ trợ Unicode tốt hơn, không cần phải cài thêm các thư viện nào khác. Ngoài ra RegExp có thêm tham số `u` sử dụng cho unicode string.

## Map + Set + WeakMap + WeakSet ##

Map, Set, WeakMap, WeakSet là các hàm thường thấy trong các ứng dụng về cấu trúc dữ liệu và giải thuật. Ví dụ:

```js
// Sets
var s = new Set();
s.add("hello").add("goodbye").add("hello");
s.size === 2;
s.has("hello") === true;

// Maps
var m = new Map();
m.set("hello", 42);
m.set(s, 34);
m.get(s) == 34;

// Weak Maps
var wm = new WeakMap();
wm.set(s, { extra: 42 });
wm.size === undefined

// Weak Sets
var ws = new WeakSet();
ws.add({ data: 42 });
// Because the added object has no other references, it will not be held in the set
```

## Symbols ##

Các object state sử dụng chuổi để định danh phần tử của mảng, object. Symbols giúp tạo ra để thay thế string. Cái này giống như cú pháp `arr[:name]` trong Ruby.

```js
var MyClass = (function() {

  // module scoped symbol
  var key = Symbol("key");

  function MyClass(privateData) {
    this[key] = privateData;
  }

  MyClass.prototype = {
    doStuff: function() {
      ... this[key] ...
    }
  };

  return MyClass;
})();

var c = new MyClass("hello")
c["key"] === undefined
```

## Kết  ##
ES6 còn khá nhiều chức năng hay, mình sẽ giới thiệu sau.
Tham khảo thêm tại đây: [https://github.com/duyet-collections/es6features](https://github.com/duyet-collections/es6features)
