---
template: post
title: natural - NLTK cho Javascript
date: "2017-08-06"
author: Van-Duyet Le
tags:
- Data Engineer
- Nodejs
- intro-js
- Javascript
- NLP
- Intro-library
- Machine Learning
modified_time: '2018-09-10T17:20:37.866+07:00'
thumbnail: https://4.bp.blogspot.com/-7UyZjfbL--g/WYadFDYvEfI/AAAAAAAAmc4/x-jU5zgVZz8BsBM5VP5zkZA5Y8c79XIBQCK4BGAYYCw/s1600/nlp_js.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-9038693001571481876
blogger_orig_url: https://blog.duyet.net/2017/08/natural-nltk.html
slug: /2017/08/natural-nltk.html
category: Machine Learning
description: "NaturalJS được ví như nltk cho Node. natural có nhiều chức năng xử lý ngôn ngữ tự nhiên như: Tokenizing, stemming, classification, phonetics, tf-idf, WordNet, string similarity, ..."
fbCommentUrl: none
---

"[Natural](https://github.com/NaturalNode/natural)" được ví như nltk cho Node. [natural](https://github.com/NaturalNode/natural) có nhiều chức năng xử lý ngôn ngữ tự nhiên như: Tokenizing, stemming, classification, phonetics, tf-idf, WordNet, string similarity, ...

Nếu bạn là người yêu thích cả NLP và Javascript/Node, thì đây là một thư viện thú vị nên thử qua.

[![](https://4.bp.blogspot.com/-7UyZjfbL--g/WYadFDYvEfI/AAAAAAAAmc4/x-jU5zgVZz8BsBM5VP5zkZA5Y8c79XIBQCK4BGAYYCw/s640/nlp_js.png)](https://4.bp.blogspot.com/-7UyZjfbL--g/WYadFDYvEfI/AAAAAAAAmc4/x-jU5zgVZz8BsBM5VP5zkZA5Y8c79XIBQCK4BGAYYCw/s1600/nlp_js.png)

Github: [https://github.com/NaturalNode/natural](https://github.com/NaturalNode/natural)

## Cài đặt ##
Sử dụng npm để cài package

```
npm install natural
```

Mình sẽ ví dụ một số tác vụ xử lý ngôn ngữ tự nhiên mà natural có thể làm được.

## Tokenizers ##
Word, Regexp, and [Treebank tokenizers](http://www.cis.upenn.edu/~treebank/tokenization.html)

```
var natural = require('natural');
var tokenizer = new natural.WordTokenizer();
console.log(tokenizer.tokenize("your dog has fleas."));
// [ 'your', 'dog', 'has', 'fleas' ]

tokenizer = new natural.TreebankWordTokenizer();
console.log(tokenizer.tokenize("my dog hasn't any fleas."));
// [ 'my', 'dog', 'has', 'n\'t', 'any', 'fleas', '.' ]

tokenizer = new natural.RegexpTokenizer({pattern: /\-/});
console.log(tokenizer.tokenize("flea-dog"));
// [ 'flea', 'dog' ]

tokenizer = new natural.WordPunctTokenizer();
console.log(tokenizer.tokenize("my dog hasn't any fleas."));
// [ 'my',  'dog',  'hasn',  '\'',  't',  'any',  'fleas',  '.' ]
```

## String Distance ##
Natural sử dụng thuật toán [Jaro–Winkler](http://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance), Levenshtein và Dice's co-efficient để tính khoảng cách giữa 2 string.

```
var natural = require('natural');

// JaroWinklerDistance (0 = not at all, 1 = exact match)
console.log(natural.JaroWinklerDistance("dixon","dicksonx")) // -> 0.7466666666666666
console.log(natural.JaroWinklerDistance('not', 'same')); // -> 0

console.log(natural.LevenshteinDistance("ones","onez")); // -> 1
console.log(natural.LevenshteinDistance('one', 'one')); // -> 0
```

## Classifiers ##
Để phân lớp văn bản, natural hỗ trợ 2 thuật toán là [Naive Bayes](http://en.wikipedia.org/wiki/Naive_Bayes_classifier) và [logistic regression](http://en.wikipedia.org/wiki/Logistic_regression). Ví dụ sau sử dụng BayesClassifier.

```
var natural = require('natural');
var classifier = new natural.BayesClassifier();
```

Training dữ liệu:

```
classifier.addDocument('i am long qqqq', 'buy');
classifier.addDocument('buy the q\'s', 'buy');
classifier.addDocument('short gold', 'sell');
classifier.addDocument('sell gold', 'sell');

classifier.train();
```

Classify một đoạn văn bản mới:

```
console.log(classifier.classify('i am short silver')); // sell
console.log(classifier.classify('i am long copper')); // buy 
```

## N-Grams ##

```
var NGrams = natural.NGrams;
```

### bigrams ###

```
console.log(NGrams.bigrams('some words here'));
console.log(NGrams.bigrams(['some',  'words',  'here']));
```

Cả 2 đoạn trên đều cho kết quả `[ [ 'some', 'words' ], [ 'words', 'here' ] ]`

### trigrams ###

```
console.log(NGrams.trigrams('some other words here'));
console.log(NGrams.trigrams(['some',  'other', 'words',  'here']));
```

Cả 2 đoạn trên đều cho kết quả `[ [ 'some', 'other', 'words' ], [ 'other', 'words', 'here' ] ]`

## Kết ##
[natural](https://github.com/NaturalNode/natural) còn khá nhiều chức năng và thuật toán khác hay cho xử lý ngôn ngữ tự nhiên. Nếu bạn là người yêu thích Javascript và NLP như mình, thay vì Python có NLTK, thì Natural là một sự lựa chọn khá hay và thú vị.
