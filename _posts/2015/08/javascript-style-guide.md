---
template: post
title: JavaScript Style Guide
date: "2015-08-01"
author: Van-Duyet Le
tags:
- style guide
- Javascript
modified_time: '2015-08-01T10:25:33.996+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-7540331680687269417
blogger_orig_url: https://blog.duyet.net/2015/08/javascript-style-guide.html
slug: /2015/08/javascript-style-guide.html
category: Javascript
description: A mostly reasonable approach to JavaScript.
fbCommentUrl: none

---

A mostly reasonable approach to JavaScript.
See full: [https://github.com/duyet/javascript](https://github.com/duyet/javascript)

## Table of Contents ##

1. [Types](#types)
2. [Objects](#objects)
3. [Arrays](#arrays)
4. [Strings](#strings)
5. [Functions](#functions)
6. [Properties](#properties)
7. [Variables](#variables)
8. [Hoisting](#hoisting)
9. [Comparison Operators & Equality](#comparison-operators--equality)
10. [Blocks](#blocks)
11. [Comments](#comments)
12. [Whitespace](#whitespace)
13. [Commas](#commas)
14. [Semicolons](#semicolons)
15. [Type Casting & Coercion](#type-casting--coercion)
16. [Naming Conventions](#naming-conventions)
17. [Accessors](#accessors)
18. [Constructors](#constructors)
19. [Events](#events)
20. [Modules](#modules)
21. [jQuery](#jquery)
22. [ECMAScript 5 Compatibility](#ecmascript-5-compatibility)
23. [Testing](#testing)
24. [Performance](#performance)
25. [Resources](#resources)
26. [In the Wild](#in-the-wild)
27. [Translation](#translation)
28. [The JavaScript Style Guide Guide](#the-javascript-style-guide-guide)
29. [Chat With Us About Javascript](#chat-with-us-about-javascript)
30. [Contributors](#contributors)
31. [License](#license)

## Types ##

- Primitives: When you access a primitive type you work directly on its value.

- `string`
- `number`
- `boolean`
- `null`
- `undefined`

```
var foo =1;
var bar = foo;

bar =9;

console.log(foo, bar); // => 1, 9
```

- Complex: When you access a complex type you work on a reference to its value.

- `object`
- `array`
- `function`

```
var foo = [1, 2];
var bar = foo;

bar[0] =9;

console.log(foo[0], bar[0]); // => 9, 9
```

[⬆ back to top](#table-of-contents)

## Objects ##

- Use the literal syntax for object creation.

```
// bad
var item =newObject();

// good
var item = {};
```

- Don't use [reserved words](http://es5.github.io/#x7.6.1) as keys. It won't work in IE8. [More info](https://github.com/airbnb/javascript/issues/61).

```
// bad
var superman = {
default: { clark:'kent' },
  private:true
};

// good
var superman = {
  defaults: { clark:'kent' },
  hidden:true
};
```

- Use readable synonyms in place of reserved words.

```
// bad
var superman = {
  class:'alien'
};

// bad
var superman = {
  klass:'alien'
};

// good
var superman = {
  type:'alien'
};
```

[⬆ back to top](#table-of-contents)

## Arrays ##

- Use the literal syntax for array creation.

```
// bad
var items =newArray();

// good
var items = [];
```

- Use Array#push instead of direct assignment to add items to an array.

```
var someStack = [];

// bad
someStack[someStack.length] ='abracadabra';

// good
someStack.push('abracadabra');
```

- When you need to copy an array use Array#slice. [jsPerf](http://jsperf.com/converting-arguments-to-an-array/7)

```
var len = items.length;
var itemsCopy = [];
var i;

// bad
for (i =0; i < len; i++) {
  itemsCopy[i] = items[i];
}

// good
itemsCopy = items.slice();
```

- To convert an array-like object to an array, use Array#slice.

```
functiontrigger() {
var args =Array.prototype.slice.call(arguments);
  ...
}
```

[⬆ back to top](#table-of-contents)

## Strings ##

- Use single quotes `''` for strings.

```
// bad
var name ="Bob Parr";

// good
var name ='Bob Parr';

// bad
var fullName ="Bob "+this.lastName;

// good
var fullName ='Bob '+this.lastName;
```

- Strings longer than 80 characters should be written across multiple lines using string concatenation.
- Note: If overused, long strings with concatenation could impact performance. [jsPerf](http://jsperf.com/ya-string-concat) & [Discussion](https://github.com/airbnb/javascript/issues/40).

```
// bad
var errorMessage ='This is a super long error that was thrown because of Batman. When you stop to think about how Batman had anything to do with this, you would get nowhere fast.';

// bad
var errorMessage ='This is a super long error that was thrown because \
of Batman. When you stop to think about how Batman had anything to do \
with this, you would get nowhere \
fast.';

// good
var errorMessage ='This is a super long error that was thrown because '+
'of Batman. When you stop to think about how Batman had anything to do '+
'with this, you would get nowhere fast.';
```

- When programmatically building up a string, use Array#join instead of string concatenation. Mostly for IE: [jsPerf](http://jsperf.com/string-vs-array-concat/2).

```
var items;
var messages;
var length;
var i;

messages = [{
  state:'success',
  message:'This one worked.'
}, {
  state:'success',
  message:'This one worked as well.'
}, {
  state:'error',
  message:'This one did not work.'
}];

length = messages.length;

// bad
functioninbox(messages) {
  items ='<ul>';

for (i =0; i < length; i++) {
    items +='<li>'+ messages[i].message +'</li>';
  }

return items +'</ul>';
}

// good
functioninbox(messages) {
  items = [];

for (i =0; i < length; i++) {
    items[i] ='<li>'+ messages[i].message +'</li>';
  }

return'<ul>'+ items.join('') +'</ul>';
}
```

[⬆ back to top](#table-of-contents)

## Functions ##

- Function expressions:

```
// anonymous function expression
varanonymous=function() {
returntrue;
};

// named function expression
varnamed=functionnamed() {
returntrue;
};

// immediately-invoked function expression (IIFE)
(function() {
console.log('Welcome to the Internet. Please follow me.');
})();
```

- Never declare a function in a non-function block (if, while,  etc). Assign the function to a variable instead. Browsers will allow you  to do it, but they all interpret it differently, which is bad news  bears.
- Note: ECMA-262 defines a `block` as a list of statements. A function declaration is not a statement. [Read ECMA-262's note on this issue](http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf#page=97).

```
// bad
if (currentUser) {
functiontest() {
console.log('Nope.');
  }
}

// good
var test;
if (currentUser) {
test=functiontest() {
console.log('Yup.');
  };
}
```

- Never name a parameter `arguments`. This will take precedence over the `arguments` object that is given to every function scope.

```
// bad
functionnope(name, options, arguments) {
// ...stuff...
}

// good
functionyup(name, options, args) {
// ...stuff...
}
```

[⬆ back to top](#table-of-contents)

## Properties ##

- Use dot notation when accessing properties.

```
var luke = {
  jedi:true,
  age:28
};

// bad
var isJedi = luke['jedi'];

// good
var isJedi = luke.jedi;
```

- Use subscript notation `[]` when accessing properties with a variable.

```
var luke = {
  jedi:true,
  age:28
};

functiongetProp(prop) {
return luke[prop];
}

var isJedi = getProp('jedi');
```

[⬆ back to top](#table-of-contents)

## Variables ##

- Always use `var` to declare variables. Not doing so  will result in global variables. We want to avoid polluting the global  namespace. Captain Planet warned us of that.

```
// bad
superPower =newSuperPower();

// good
var superPower =newSuperPower();
```

- Use one `var` declaration per variable. It's easier to add new variable declarations this way, and you never have to worry about swapping out a `;` for a `,` or introducing punctuation-only diffs.

```
// bad
var items = getItems(),
    goSportsTeam =true,
    dragonball ='z';

// bad
// (compare to above, and try to spot the mistake)
var items = getItems(),
    goSportsTeam =true;
    dragonball ='z';

// good
var items = getItems();
var goSportsTeam =true;
var dragonball ='z';
```

- Declare unassigned variables last. This is helpful when later on  you might need to assign a variable depending on one of the previous  assigned variables.

```
// bad
var i, len, dragonball,
    items = getItems(),
    goSportsTeam =true;

// bad
var i;
var items = getItems();
var dragonball;
var goSportsTeam =true;
var len;

// good
var items = getItems();
var goSportsTeam =true;
var dragonball;
var length;
var i;
```

- Assign variables at the top of their scope. This helps avoid  issues with variable declaration and assignment hoisting related issues.

```
// bad
function() {
test();
console.log('doing stuff..');

//..other stuff..

var name = getName();

if (name ==='test') {
returnfalse;
  }

return name;
}

// good
function() {
var name = getName();

test();
console.log('doing stuff..');

//..other stuff..

if (name ==='test') {
returnfalse;
  }

return name;
}

// bad
function() {
var name = getName();

if (!arguments.length) {
returnfalse;
  }

returntrue;
}

// good
function() {
if (!arguments.length) {
returnfalse;
  }

var name = getName();

returntrue;
}
```

[⬆ back to top](#table-of-contents)

## Hoisting ##

- Variable declarations get hoisted to the top of their scope, but their assignment does not.

```
// we know this wouldn't work (assuming there
// is no notDefined global variable)
functionexample() {
console.log(notDefined); // => throws a ReferenceError
}

// creating a variable declaration after you
// reference the variable will work due to
// variable hoisting. Note: the assignment
// value of `true` is not hoisted.
functionexample() {
console.log(declaredButNotAssigned); // => undefined
var declaredButNotAssigned =true;
}

// The interpreter is hoisting the variable
// declaration to the top of the scope,
// which means our example could be rewritten as:
functionexample() {
var declaredButNotAssigned;
console.log(declaredButNotAssigned); // => undefined
  declaredButNotAssigned =true;
}
```

- Anonymous function expressions hoist their variable name, but not the function assignment.

```
functionexample() {
console.log(anonymous); // => undefined

  anonymous(); // => TypeError anonymous is not a function

varanonymous=function() {
console.log('anonymous function expression');
  };
}
```

- Named function expressions hoist the variable name, not the function name or the function body.

```
functionexample() {
console.log(named); // => undefined

  named(); // => TypeError named is not a function

  superPower(); // => ReferenceError superPower is not defined

varnamed=functionsuperPower() {
console.log('Flying');
  };
}

// the same is true when the function name
// is the same as the variable name.
functionexample() {
console.log(named); // => undefined

  named(); // => TypeError named is not a function

varnamed=functionnamed() {
console.log('named');
  }
}
```

- Function declarations hoist their name and the function body.

```
functionexample() {
  superPower(); // => Flying

functionsuperPower() {
console.log('Flying');
  }
}
```

- For more information refer to [JavaScript Scoping & Hoisting](http://www.adequatelygood.com/2010/2/JavaScript-Scoping-and-Hoisting) by [Ben Cherry](http://www.adequatelygood.com/).

[⬆ back to top](#table-of-contents)

## Comparison Operators & Equality ##

- Use `===` and `!==` over `==` and `!=`.
- Comparison operators are evaluated using coercion with the `ToBoolean` method and always follow these simple rules:

- Objects evaluate to true
- Undefined evaluates to false
- Null evaluates to false
- Booleans evaluate to the value of the boolean
- Numbers evaluate to false if +0, -0, or NaN, otherwise true
- Strings evaluate to false if an empty string `''`, otherwise true

```
if ([0]) {
// true
// An array is an object, objects evaluate to true
}
```

- Use shortcuts.

```
// bad
if (name !=='') {
// ...stuff...
}

// good
if (name) {
// ...stuff...
}

// bad
if (collection.length>0) {
// ...stuff...
}

// good
if (collection.length) {
// ...stuff...
}
```

- For more information see [Truth Equality and JavaScript](http://javascriptweblog.wordpress.com/2011/02/07/truth-equality-and-javascript/#more-2108) by Angus Croll.

[⬆ back to top](#table-of-contents)

## Blocks ##

- Use braces with all multi-line blocks.

```
// bad
if (test)
returnfalse;

// good
if (test) returnfalse;

// good
if (test) {
returnfalse;
}

// bad
function() { returnfalse; }

// good
function() {
returnfalse;
}
```

- If you're using multi-line blocks with `if` and `else`, put `else` on the same line as your `if` block's closing brace.

```
// bad
if (test) {
  thing1();
  thing2();
}
else {
  thing3();
}

// good
if (test) {
  thing1();
  thing2();
} else {
  thing3();
}
```

[⬆ back to top](#table-of-contents)

## Comments ##

- Use `/** ... */` for multi-line comments. Include a description, specify types and values for all parameters and return values.

```
// bad
// make() returns a new element
// based on the passed in tag name
//
// @param {String} tag
// @return {Element} element
functionmake(tag) {

// ...stuff...

return element;
}

// good
/**
 * make() returns a new element
 * based on the passed in tag name
 *
 * @param {String} tag
 * @return {Element} element
 */
functionmake(tag) {

// ...stuff...

return element;
}
```

- Use `//` for single line comments. Place single line  comments on a newline above the subject of the comment. Put an empty  line before the comment.

```
// bad
var active =true;  // is current tab

// good
// is current tab
var active =true;

// bad
functiongetType() {
console.log('fetching type...');
// set the default type to 'no type'
var type =this._type ||'no type';

return type;
}

// good
functiongetType() {
console.log('fetching type...');

// set the default type to 'no type'
var type =this._type ||'no type';

return type;
}
```

- Prefixing your comments with `FIXME` or `TODO` helps other developers quickly understand if you're pointing out a  problem that needs to be revisited, or if you're suggesting a solution  to the problem that needs to be implemented. These are different than  regular comments because they are actionable. The actions are `FIXME -- need to figure this out` or `TODO -- need to implement`.
- Use `// FIXME:` to annotate problems.

```
functionCalculator() {

// FIXME: shouldn't use a global here
  total =0;

returnthis;
}
```

- Use `// TODO:` to annotate solutions to problems.

```
functionCalculator() {

// TODO: total should be configurable by an options param
this.total =0;

returnthis;
}
```

[⬆ back to top](#table-of-contents)

## Whitespace ##

- Use soft tabs set to 2 spaces.

```
// bad
function() {
∙∙∙∙var name;
}

// bad
function() {
∙var name;
}

// good
function() {
∙∙var name;
}
```

- Place 1 space before the leading brace.

```
// bad
functiontest(){
console.log('test');
}

// good
functiontest() {
console.log('test');
}

// bad
dog.set('attr',{
  age:'1 year',
  breed:'Bernese Mountain Dog'
});

// good
dog.set('attr', {
  age:'1 year',
  breed:'Bernese Mountain Dog'
});
```

- Place 1 space before the opening parenthesis in control statements (`if`, `while` etc.). Place no space before the argument list in function calls and declarations.

```
// bad
if(isJedi) {
  fight ();
}

// good
if (isJedi) {
  fight();
}

// bad
functionfight () {
console.log ('Swooosh!');
}

// good
functionfight() {
console.log('Swooosh!');
}
```

- Set off operators with spaces.

```
// bad
var x=y+5;

// good
var x = y +5;
```

- End files with a single newline character.

```
// bad
(function(global) {
// ...stuff...
})(this);
```

```
// bad
(function(global) {
// ...stuff...
})(this);↵
↵
```

```
// good
(function(global) {
// ...stuff...
})(this);↵
```

- Use indentation when making long method chains. Use a leading dot, which emphasizes that the line is a method call, not a new statement.

```
// bad
$('#items').find('.selected').highlight().end().find('.open').updateCount();

// bad
$('#items').
find('.selected').
    highlight().
    end().
find('.open').
    updateCount();

// good
$('#items')
  .find('.selected')
    .highlight()
    .end()
  .find('.open')
    .updateCount();

// bad
var leds = stage.selectAll('.led').data(data).enter().append('svg:svg').classed('led', true)
    .attr('width',  (radius + margin) *2).append('svg:g')
    .attr('transform', 'translate('+ (radius + margin) +','+ (radius + margin) +')')
    .call(tron.led);

// good
var leds = stage.selectAll('.led')
    .data(data)
  .enter().append('svg:svg')
    .classed('led', true)
    .attr('width',  (radius + margin) *2)
  .append('svg:g')
    .attr('transform', 'translate('+ (radius + margin) +','+ (radius + margin) +')')
    .call(tron.led);
```

- Leave a blank line after blocks and before the next statement

```
// bad
if (foo) {
return bar;
}
return baz;

// good
if (foo) {
return bar;
}

return baz;

// bad
var obj = {
foo:function() {
  },
bar:function() {
  }
};
return obj;

// good
var obj = {
foo:function() {
  },

bar:function() {
  }
};

return obj;
```

[⬆ back to top](#table-of-contents)

## Commas ##

- Leading commas: Nope.

```
// bad
var story = [
    once
  , upon
  , aTime
];

// good
var story = [
  once,
  upon,
  aTime
];

// bad
var hero = {
    firstName:'Bob'
  , lastName:'Parr'
  , heroName:'Mr. Incredible'
  , superPower:'strength'
};

// good
var hero = {
  firstName:'Bob',
  lastName:'Parr',
  heroName:'Mr. Incredible',
  superPower:'strength'
};
```

- Additional trailing comma: Nope. This can cause  problems with IE6/7 and IE9 if it's in quirksmode. Also, in some  implementations of ES3 would add length to an array if it had an  additional trailing comma. This was clarified in ES5 ([source](http://es5.github.io/#D)):

> Edition 5 clarifies the fact that a trailing comma at the end of an  ArrayInitialiser does not add to the length of the array. This is not a  semantic change from Edition 3 but some implementations may have  previously misinterpreted this.

```
// bad
var hero = {
    firstName:'Kevin',
    lastName:'Flynn',
  };

var heroes = [
'Batman',
'Superman',
  ];

// good
var hero = {
    firstName:'Kevin',
    lastName:'Flynn'
  };

var heroes = [
'Batman',
'Superman'
  ];
```

[⬆ back to top](#table-of-contents)

## Semicolons ##

- Yup.

```
// bad
(function() {
var name ='Skywalker'
return name
})()

// good
(function() {
var name ='Skywalker';
return name;
})();

// good (guards against the function becoming an argument when two files with IIFEs are concatenated)
;(function() {
var name ='Skywalker';
return name;
})();
```

[Read more](http://stackoverflow.com/a/7365214/1712802).

[⬆ back to top](#table-of-contents)

## Type Casting & Coercion ##

- Perform type coercion at the beginning of the statement.
- Strings:

```
//  => this.reviewScore = 9;

// bad
var totalScore =this.reviewScore +'';

// good
var totalScore =''+this.reviewScore;

// bad
var totalScore =''+this.reviewScore +' total score';

// good
var totalScore =this.reviewScore +' total score';
```

- Use `parseInt` for Numbers and always with a radix for type casting.

```
var inputValue ='4';

// bad
var val =newNumber(inputValue);

// bad
var val =+inputValue;

// bad
var val = inputValue >>0;

// bad
var val =parseInt(inputValue);

// good
var val =Number(inputValue);

// good
var val =parseInt(inputValue, 10);
```

- If for whatever reason you are doing something wild and `parseInt` is your bottleneck and need to use Bitshift for [performance reasons](http://jsperf.com/coercion-vs-casting/3), leave a comment explaining why and what you're doing.

```
// good
/**
 * parseInt was the reason my code was slow.
 * Bitshifting the String to coerce it to a
 * Number made it a lot faster.
 */
var val = inputValue >>0;
```

- Note: Be careful when using bitshift operations. Numbers are represented as [64-bit values](http://es5.github.io/#x4.3.19), but Bitshift operations always return a 32-bit integer ([source](http://es5.github.io/#x11.7)). Bitshift can lead to unexpected behavior for integer values larger than 32 bits. [Discussion](https://github.com/airbnb/javascript/issues/109). Largest signed 32-bit Int is 2,147,483,647:

```
2147483647>>0//=> 2147483647
2147483648>>0//=> -2147483648
2147483649>>0//=> -2147483647
```

- Booleans:

```
var age =0;

// bad
var hasAge =newBoolean(age);

// good
var hasAge =Boolean(age);

// good
var hasAge =!!age;
```

[⬆ back to top](#table-of-contents)

## Naming Conventions ##

- Avoid single letter names. Be descriptive with your naming.

```
// bad
functionq() {
// ...stuff...
}

// good
functionquery() {
// ..stuff..
}
```

- Use camelCase when naming objects, functions, and instances.

```
// bad
var OBJEcttsssss = {};
var this_is_my_object = {};
functionc() {}
var u =newuser({
  name:'Bob Parr'
});

// good
var thisIsMyObject = {};
functionthisIsMyFunction() {}
var user =newUser({
  name:'Bob Parr'
});
```

- Use PascalCase when naming constructors or classes.

```
// bad
functionuser(options) {
this.name= options.name;
}

var bad =newuser({
  name:'nope'
});

// good
functionUser(options) {
this.name= options.name;
}

var good =newUser({
  name:'yup'
});
```

- Use a leading underscore `_` when naming private properties.

```
// bad
this.__firstName__ ='Panda';
this.firstName_ ='Panda';

// good
this._firstName ='Panda';
```

- When saving a reference to `this` use `_this`.

```
// bad
function() {
var self =this;
returnfunction() {
console.log(self);
  };
}

// bad
function() {
var that =this;
returnfunction() {
console.log(that);
  };
}

// good
function() {
var _this =this;
returnfunction() {
console.log(_this);
  };
}
```

- Name your functions. This is helpful for stack traces.

```
// bad
varlog=function(msg) {
console.log(msg);
};

// good
varlog=functionlog(msg) {
console.log(msg);
};
```

- Note: IE8 and below exhibit some quirks with named function expressions.  See [http://kangax.github.io/nfe/](http://kangax.github.io/nfe/) for more info.
- If your file exports a single class, your filename should be exactly the name of the class.

```
// file contents
classCheckBox {
// ...
}
module.exports = CheckBox;

// in some other file
// bad
var CheckBox =require('./checkBox');

// bad
var CheckBox =require('./check_box');

// good
var CheckBox =require('./CheckBox');
```

[⬆ back to top](#table-of-contents)

## Accessors ##

- Accessor functions for properties are not required.
- If you do make accessor functions use getVal() and setVal('hello').

```
// bad
dragon.age();

// good
dragon.getAge();

// bad
dragon.age(25);

// good
dragon.setAge(25);
```

- If the property is a boolean, use isVal() or hasVal().

```
// bad
if (!dragon.age()) {
returnfalse;
}

// good
if (!dragon.hasAge()) {
returnfalse;
}
```

- It's okay to create get() and set() functions, but be consistent.

```
functionJedi(options) {
  options || (options = {});
var lightsaber = options.lightsaber ||'blue';
this.set('lightsaber', lightsaber);
}

Jedi.prototype.set=function(key, val) {
this[key] = val;
};

Jedi.prototype.get=function(key) {
returnthis[key];
};
```

[⬆ back to top](#table-of-contents)

## Constructors ##

- Assign methods to the prototype object, instead of overwriting  the prototype with a new object. Overwriting the prototype makes  inheritance impossible: by resetting the prototype you'll overwrite the  base!

```
functionJedi() {
console.log('new jedi');
}

// bad
Jedi.prototype= {
fight:functionfight() {
console.log('fighting');
  },

block:functionblock() {
console.log('blocking');
  }
};

// good
Jedi.prototype.fight=functionfight() {
console.log('fighting');
};

Jedi.prototype.block=functionblock() {
console.log('blocking');
};
```

- Methods can return `this` to help with method chaining.

```
// bad
Jedi.prototype.jump=function() {
this.jumping =true;
returntrue;
};

Jedi.prototype.setHeight=function(height) {
this.height= height;
};

var luke =newJedi();
luke.jump(); // => true
luke.setHeight(20); // => undefined

// good
Jedi.prototype.jump=function() {
this.jumping =true;
returnthis;
};

Jedi.prototype.setHeight=function(height) {
this.height= height;
returnthis;
};

var luke =newJedi();

luke.jump()
  .setHeight(20);
```

- It's okay to write a custom toString() method, just make sure it works successfully and causes no side effects.

```
functionJedi(options) {
  options || (options = {});
this.name= options.name||'no name';
}

Jedi.prototype.getName=functiongetName() {
returnthis.name;
};

Jedi.prototype.toString=functiontoString() {
return'Jedi - '+this.getName();
};
```

[⬆ back to top](#table-of-contents)

## Events ##

- When attaching data payloads to events (whether DOM events or  something more proprietary like Backbone events), pass a hash instead of  a raw value. This allows a subsequent contributor to add more data to  the event payload without finding and updating every handler for the  event. For example, instead of:

```
// bad
$(this).trigger('listingUpdated', listing.id);

...

$(this).on('listingUpdated', function(e, listingId) {
// do something with listingId
});
```

prefer:

```
// good
$(this).trigger('listingUpdated', { listingId : listing.id });

...

$(this).on('listingUpdated', function(e, data) {
// do something with data.listingId
});
```

[⬆ back to top](#table-of-contents)

## Modules ##

- The module should start with a `!`. This ensures that if a  malformed module forgets to include a final semicolon there aren't  errors in production when the scripts get concatenated. [Explanation](https://github.com/airbnb/javascript/issues/44#issuecomment-13063933)
- The file should be named with camelCase, live in a folder with the same name, and match the name of the single export.
- Add a method called `noConflict()` that sets the exported module to the previous version and returns this one.
- Always declare `'use strict';` at the top of the module.

```
// fancyInput/fancyInput.js

!function(global) {
'use strict';

var previousFancyInput =global.FancyInput;

functionFancyInput(options) {
this.options= options || {};
  }

FancyInput.noConflict=functionnoConflict() {
global.FancyInput = previousFancyInput;
return FancyInput;
  };

global.FancyInput = FancyInput;
}(this);
```

[⬆ back to top](#table-of-contents)

## jQuery ##

- Prefix jQuery object variables with a `$`.

```
// bad
var sidebar = $('.sidebar');

// good
var $sidebar = $('.sidebar');
```

- Cache jQuery lookups.

```
// bad
functionsetSidebar() {
  $('.sidebar').hide();

// ...stuff...

  $('.sidebar').css({
'background-color':'pink'
  });
}

// good
functionsetSidebar() {
var $sidebar = $('.sidebar');
  $sidebar.hide();

// ...stuff...

  $sidebar.css({
'background-color':'pink'
  });
}
```

- For DOM queries use Cascading `$('.sidebar ul')` or parent > child `$('.sidebar > ul')`. [jsPerf](http://jsperf.com/jquery-find-vs-context-sel/16)
- Use `find` with scoped jQuery object queries.

```
// bad
$('ul', '.sidebar').hide();

// bad
$('.sidebar').find('ul').hide();

// good
$('.sidebar ul').hide();

// good
$('.sidebar > ul').hide();

// good
$sidebar.find('ul').hide();
```

[⬆ back to top](#table-of-contents)

## ECMAScript 5 Compatibility ##

- Refer to [Kangax](https://twitter.com/kangax/)'s ES5 [compatibility table](http://kangax.github.com/es5-compat-table/).

[⬆ back to top](#table-of-contents)

## Testing ##

- Yup.

```
function() {
returntrue;
}
```

[⬆ back to top](#table-of-contents)

## Performance ##

- [On Layout & Web Performance](http://kellegous.com/j/2013/01/26/layout-performance/)
- [String vs Array Concat](http://jsperf.com/string-vs-array-concat/2)
- [Try/Catch Cost In a Loop](http://jsperf.com/try-catch-in-loop-cost)
- [Bang Function](http://jsperf.com/bang-function)
- [jQuery Find vs Context, Selector](http://jsperf.com/jquery-find-vs-context-sel/13)
- [innerHTML vs textContent for script text](http://jsperf.com/innerhtml-vs-textcontent-for-script-text)
- [Long String Concatenation](http://jsperf.com/ya-string-concat)
- Loading...

[⬆ back to top](#table-of-contents)

## Resources ##
Read This

- [Annotated ECMAScript 5.1](http://es5.github.com/)

Tools

- Code Style Linters  
- [JSHint](http://www.jshint.com/) - [Airbnb Style .jshintrc](https://github.com/airbnb/javascript/blob/master/linters/jshintrc)
- [JSCS](https://github.com/jscs-dev/node-jscs) - [Airbnb Style Preset](https://github.com/jscs-dev/node-jscs/blob/master/presets/airbnb.json)

Other Styleguides

- [Google JavaScript Style Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml)
- [jQuery Core Style Guidelines](http://docs.jquery.com/JQuery_Core_Style_Guidelines)
- [Principles of Writing Consistent, Idiomatic JavaScript](https://github.com/rwldrn/idiomatic.js/)
- [JavaScript Standard Style](https://github.com/feross/standard)

Other Styles

- [Naming this in nested functions](https://gist.github.com/4135065) - Christian Johansen
- [Conditional Callbacks](https://github.com/airbnb/javascript/issues/52) - Ross Allen
- [Popular JavaScript Coding Conventions on Github](http://sideeffect.kr/popularconvention/#javascript) - JeongHoon Byun
- [Multiple var statements in JavaScript, not superfluous](http://benalman.com/news/2012/05/multiple-var-statements-javascript/) - Ben Alman

Further Reading

- [Understanding JavaScript Closures](http://javascriptweblog.wordpress.com/2010/10/25/understanding-javascript-closures/) - Angus Croll
- [Basic JavaScript for the impatient programmer](http://www.2ality.com/2013/06/basic-javascript.html) - Dr. Axel Rauschmayer
- [You Might Not Need jQuery](http://youmightnotneedjquery.com/) - Zack Bloom & Adam Schwartz
- [ES6 Features](https://github.com/lukehoban/es6features) - Luke Hoban
- [Frontend Guidelines](https://github.com/bendc/frontend-guidelines) - Benjamin De Cock

Books

- [JavaScript: The Good Parts](http://www.amazon.com/JavaScript-Good-Parts-Douglas-Crockford/dp/0596517742) - Douglas Crockford
- [JavaScript Patterns](http://www.amazon.com/JavaScript-Patterns-Stoyan-Stefanov/dp/0596806752) - Stoyan Stefanov
- [Pro JavaScript Design Patterns](http://www.amazon.com/JavaScript-Design-Patterns-Recipes-Problem-Solution/dp/159059908X)  - Ross Harmes and Dustin Diaz
- [High Performance Web Sites: Essential Knowledge for Front-End Engineers](http://www.amazon.com/High-Performance-Web-Sites-Essential/dp/0596529309) - Steve Souders
- [Maintainable JavaScript](http://www.amazon.com/Maintainable-JavaScript-Nicholas-C-Zakas/dp/1449327680) - Nicholas C. Zakas
- [JavaScript Web Applications](http://www.amazon.com/JavaScript-Web-Applications-Alex-MacCaw/dp/144930351X) - Alex MacCaw
- [Pro JavaScript Techniques](http://www.amazon.com/Pro-JavaScript-Techniques-John-Resig/dp/1590597273) - John Resig
- [Smashing Node.js: JavaScript Everywhere](http://www.amazon.com/Smashing-Node-js-JavaScript-Everywhere-Magazine/dp/1119962595) - Guillermo Rauch
- [Secrets of the JavaScript Ninja](http://www.amazon.com/Secrets-JavaScript-Ninja-John-Resig/dp/193398869X) - John Resig and Bear Bibeault
- [Human JavaScript](http://humanjavascript.com/) - Henrik Joreteg
- [Superhero.js](http://superherojs.com/) - Kim Joar Bekkelund, Mads Mobæk, & Olav Bjorkoy
- [JSBooks](http://jsbooks.revolunet.com/) - Julien Bouquillon
- [Third Party JavaScript](http://manning.com/vinegar/) - Ben Vinegar and Anton Kovalyov
- [Effective JavaScript: 68 Specific Ways to Harness the Power of JavaScript](http://amzn.com/0321812182) - David Herman
- [Eloquent JavaScript](http://eloquentjavascript.net/) - Marijn Haverbeke
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS) - Kyle Simpson

Blogs

- [DailyJS](http://dailyjs.com/)
- [JavaScript Weekly](http://javascriptweekly.com/)
- [JavaScript, JavaScript...](http://javascriptweblog.wordpress.com/)
- [Bocoup Weblog](http://weblog.bocoup.com/)
- [Adequately Good](http://www.adequatelygood.com/)
- [NCZOnline](http://www.nczonline.net/)
- [Perfection Kills](http://perfectionkills.com/)
- [Ben Alman](http://benalman.com/)
- [Dmitry Baranovskiy](http://dmitry.baranovskiy.com/)
- [Dustin Diaz](http://dustindiaz.com/)
- [nettuts](http://net.tutsplus.com/?s=javascript)

Podcasts

- [JavaScript Jabber](http://devchat.tv/js-jabber/)
