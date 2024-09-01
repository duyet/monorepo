---
title: Using ExpressJS to Display Static HTML File Content
date: '2015-01-23'
category: Javascript
tags:
  - Nodejs
  - ExpressJs
slug: /2015/01/expressjs-static-html.html
description: 'In ExpressJs, there is a very simple way to send an HTML file to the browser using the method: res.sendfile(), which reads the content of the .html file and sends it to the browser, allowing us to quickly display the content of a page or some static page.'
---

In ExpressJs, there is a very simple way to send an HTML file to the browser using the method: `res.sendfile()`, which reads the content of the .html file and sends it to the browser, allowing us to quickly display the content of a page or some static page.

## How to Use res.sendFile()

Using the `sendFile()` method is very simple, you just need to pass the only parameter which is the path to the HTML file you want to display.

## Example

Create a directory

```bash
$ mkdir express-sendfile
$ cd express-sendfile
```

Initialize a Nodejs and ExpressJs application

```bash
$ npm init
$ npm install express --save
```

Create two files `server.js` and `index.html`

```bash
$ touch server.js index.html
```

Now, in our directory, we will have two files. Open `server.js` with some text editor, with the following content:

```js
var express = require('express');
var app = express();
var path = require('path');

// viewed at http://localhost:8080
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(8080);
```

Next is the `index.html` file, this is the content we need to display in the browser:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Sample Site</title>

    <link
      rel="stylesheet"
      href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css"
    />
    <style>
      body {
        padding-top: 50px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="jumbotron">
        <h1>res.sendFile() Works!</h1>
      </div>
    </div>
  </body>
</html>
```

Ok, now let's check it out by running the command:

```bash
$ node server.js
```

Open the browser and go to: [http://localhost:8080](http://localhost:8080/)

We will see the content as follows:

## Conclusion

`res.sendFile()` is a very easy-to-use and useful method in ExpressJs, you can make SinglePage applications, load content using AngularJs, static pages, etc. Additionally, ExpressJs provides many other tools to read and download files on the server.
