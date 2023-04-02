---
template: post
title: Japanese stopwords package for npm, bower and plaintext
date: "2016-02-27"
author: Van-Duyet Le
tags:
- Bower
- NPM
- Sentiment
- Stopwords
- Github
- Machine Learning
- NLP
modified_time: '2016-03-18T23:29:23.351+07:00'
thumbnail: https://4.bp.blogspot.com/-tKM0wg2Vmqc/VtFheibWiSI/AAAAAAAAQbc/KFhuP43v4lA/s1600/japanese-stopwords.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-5407769601694262724
blogger_orig_url: https://blog.duyet.net/2016/02/japanese-stopwords-package.html
slug: /2016/02/japanese-stopwords-package.html
category: Machine Learning
description: Japanese stopwords, available for npm, bower, plaintext. 日本のストップワード    
fbCommentUrl: none
---

Japanese stopwords, available for npm, bower, plaintext. 日本のストップワード    

[![](https://4.bp.blogspot.com/-tKM0wg2Vmqc/VtFheibWiSI/AAAAAAAAQbc/KFhuP43v4lA/s1600/japanese-stopwords.png)](https://blog.duyet.net/2016/02/japanese-stopwords-package.html)

## Source ##

Github source: [https://github.com/stopwords/japanese-stopwords](https://github.com/stopwords/japanese-stopwords)

## Using ##
1. Nodejs package via npm

```
npm install --save japanese-stopwords
```

app.js

```
var stopwords = require('japanese-stopwords');

console.log(stopwords);
// ["これ","それ","あれ","この","その", ...]
```

2. Browser via bower

```
bower install --save japanese-stopwords
```

3. Via javascript <script> tag.

```
<script src="//cdn.rawgit.com/duyetdev/japanese-stopwords/master/dist/japanese-stopword.min.js"></script>
<script>
    console.log(japanese_stopwords); // or window.japanese_stopwords
</script>
```

## Test ##

```
git clone https://github.com/duyet/japanese-stopwords
cd japanese-stopwords/
npm install
mocha
```

## How to contribute ##

1. Fork the project on Github ([https://github.com/duyet/japanese-stopwords/fork](https://github.com/duyet/japanese-stopwords/fork))
2. Create a topic branch for your changes
3. Ensure that you provide documentation and test coverage for your changes (patches won’t be accepted without)
4. Create a pull request on Github (these are also a great place to start a conversation around a patch as early as possible)

## License ##
[MIT License](https://github.com/duyet/japanese-stopwords/blob/master/LICENSE)
