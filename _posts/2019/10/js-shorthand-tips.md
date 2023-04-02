---
template: post
title: Javascript Shorthands Tips
date: "2019-10-20"
category: Web
tags:
- Web
- Javascript
slug: /2019/10/js-shorthand-tips.html
thumbnail: 
description: These Javascript shorthand tips will make your code look more cool and clean.
fbCommentUrl: none
---

These Javascript shorthand tips will make your code look more cool and clean. Let's begin.

<!-- toc -->

# 1. '+': Integer typecasting

Most of use do not known that "+" can be use for Integer typecasting. Like this example:

```js
// longhand
let num = parseInt("69")
let float = parseFloat("69.69")

// shorthand
let num = +"69"
let float = +"69.69"
```

# 2. Merge array, object by Spread Operator

ES6 intro us the most powerful syntax is Spread Operator, I think. It can be used to replace centain array, object functions. The spread operator is simply a series of three dots.

```js
const a = [1, 2, 3]

// longhand 
const x = [4, 5, 6].concat(b)

// shorthand 
const x = [4, 5, 6, ...b]
const y = [4, ...b, 5, 6] // you can use it anywhere inside an array

// Merge two object
const k = { hi: 'there', val: 100 }
const o = { ...k, foo: 'baz' }

// Copy
const aa = [...a]
```

# 3. Function Return

To return a value from a function we use the `return` keyword, but we can skip that with arrow function with a single statement.


```js
// longhand
const mul = (a, b) => {
    return a * b
}

// shorthand
const mul = (a, b) => a * b
```

# 4. Decimal Values

We can write the long number without trailing zeroes, like this

```js
// longhand
const max = 1000000

// shorthand
const max = 1e6

1e0 === 1
1e1 === 10
1e2 === 100
1e3 === 1000
1e4 === 10000
1e5 === 100000
```

Bonus:
```js
const max = 1_000_000  
const num = 1_246_357  // cool, lah?
```

# 5. '~': Bitwise IndexOf

`~` (bitwise NOT) takes one number and inverts all bits of it.
The usage of `~` and `indexOf` is, 

```js
// longhand
if (arr.indexOf(item) > -1) { /* Confirm item IS found */ }
if (arr.indexOf(item) === -1) { /* Confirm item IS NOT found */ }

// shorthand
if (~arr.indexOf(item)) { /* Confirm item IS found */ }
if (!~arr.indexOf(item)) { /* Confirm item IS NOT found */ }
```

You can use it as a replacement for `Math.floor()`

```js
// longhand
Math.floor(4.9) === 4  // true

// shorthand
~~4.9 === 4  //true
```

# 6. Object Property Value 

If you want to define an object who's keys have the same name as variables pass-in as properties, try this tip.

```js
const cat = 'Miaow'
const dog = 'Woof'

// longhand
const obj = {
    cat: cat,
    dog: dog,
    bird: 'Peet'
}

// shorthand
const obj = {
    cat,
    dog,
    bird: 'Peet'
}
```

source: https://alligator.io/js/object-property-shorthand-es6/

# 7. String template

Aren't you tired of using `+` to concatenate multiple variables into a string?

```js
// longhand 
const url = 'http://' + host + ':' + port + '/' category + '?' + params

// shorthand
const url = `http://${host}:${port}/${category}?${params}`
```

Writing multi-line strings in code, just use the backticks

```js
// longhand
const long_text = 'Lorem ipsum dolor sit amet, consectetur'
    + 'adipisicing elit, sed do eiusmod tempor incididunt'
    + 'ut labore et dolore magna aliqua. Ut enim ad minim'

// shorthand
const long_text = `Lorem ipsum dolor sit amet, consectetur
adipisicing elit, sed do eiusmod tempor incididunt
ut labore et dolore magna aliqua. Ut enim ad minim`
```

# 8. Exponent Power Shorthand

Like python

```js
// longhand
Math.pow(2,3) // 2^3 = 8

// shorthand 
2**3 // 2^3 = 8
```

----

Thanks for reading, happy coding <3