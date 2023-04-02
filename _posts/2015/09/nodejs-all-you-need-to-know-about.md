---
template: post
title: Nodejs - All you need to know about Node.js 4.0.0
date: "2015-09-09"
author: Van-Duyet Le
tags:
- Nodejs
- Update
modified_time: '2015-09-09T18:48:56.604+07:00'
thumbnail: https://2.bp.blogspot.com/-h7ljxkRrImE/VfAcZ8U9dlI/AAAAAAAAC4U/wYPnnlhcP3Y/s1600/nodejs_logo_light.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-3739311589347534066
blogger_orig_url: https://blog.duyet.net/2015/09/nodejs-all-you-need-to-know-about.html
slug: /2015/09/nodejs-all-you-need-to-know-about.html
category: Javascript
description: Now – that Node.js 4.0.0 is about to be officially released – you may wonder what it delivers to you and if you should upgrade right away, or not. This post covers the most important changes you need to know, and some key implications you may have to take into account in making your decision.
fbCommentUrl: none
---

Now – that Node.js 4.0.0 is about to be officially released – you may wonder what it delivers to you and if you should upgrade right away, or not. This post covers the most important changes you need to know, and some key implications you may have to take into account in making your decision.

![](https://2.bp.blogspot.com/-h7ljxkRrImE/VfAcZ8U9dlI/AAAAAAAAC4U/wYPnnlhcP3Y/s1600/nodejs_logo_light.png)

## Update 09-08-15 ##
In my initial blog post I came to the conclusion that there is no real difference in performance between 0.12 and 4.0.0. With a last minute enhancement this has now changed and there are significant performance gains now. Read on for more information.

## The Story so far ##
The last few months were really exciting for the Node.js community.

At the start of this year Joyent Inc. handed over the project to the community around io.js, a fork of Node.js. Soon after that, it was decided that there should be only one version that incorporates all current features of io.js and Node.js in the future.

Bringing together two codebases that drifted away from each other for many months is a huge endeavor. When I was told about it at [NodeConf](http://nodeconf.com/) in June, initially I was pessimistic about the planned time frame of about 3 months.

I’m really stunned that actually a new converged Node.js 4.0.0 is round the corner.

![](https://2.bp.blogspot.com/-OUIjmz20GsU/Ve_Or1QJRCI/AAAAAAAAC3g/q6_kYTlsk2s/s1600/600x450xnodeconf-600x450.jpg.pagespeed.ic.t8ry0mwT9n.webp)

io.js, Node.js and npm developers discussing Native modules at NodeConf Adventure at a Ranch somewhere in California :)

## Why "4.0.0"? ##

The io.js project uses semantic versioning (semver) with its first major release being a 1.0.

The current main line of io.js is 3.x. To avoid collisions with the 0.x scheme of Node.js it was decided that the converged version should be a 4.0.0 and will also be following the semver scheme <major>.<minor>.<patch> from now on.

## So … what’s new ##

Node.js 4.0.0 aims to provide an easy update path for current users of io.js and node and so there are no major/breaking API changes. Nevertheless there are many small improvements and changes. I recommend reviewing the changelog and running extensive tests before updating your production environments.

Let’s review the most important changes.

### New V8 Version (and its implications) ###

One reason for creating io.js in the first place were unpredictable and long release cycles.

Node.js and io.js heavily depend on Googles V8 JavaScript engine which is under constant development and improvement and the project was falling behind quickly.

Node.js 4.0.0 now uses a recent version of V8 (4.5 compared to 3.28.x in node 0.12, to be exact)  – this is great because it offers new language features (see below) but comes with a cost:

Node.js projects usually heavily depend on modules. A fraction of them are native – this means that they are written in C++ and are linked against V8.

Without precautions every new V8 version will break all native modules. To remedy this, there is an abstraction library called Nan that provides Macros and an API for different versions of V8. So one module that uses Nan will usually work with all versions from 0.8 to 0.12.

With Node.js 4.0.0 Nan took the chance to do some refactoring and also bumped its version from 1.x to 2.x, introducing breaking changes.

This means that a native module needs to be modified to use Nan 2.x to work with Node.js 4.0.0.

For regular users of Node.js the consequence is that some native modules used their projects may cease to work if there is no update available. This might be a deal breaker for some but maybe this is also a chance to closely review all the modules used and look for actively maintained alternatives.

You are also free to fork modules and port them to Nan2. I just did this with node-gc-profiler. Here’s also a diff that shows the changes that were necessary.

After covering the not-so-exiting implications let’s look at what you get in return:

### Extended ES6 support ###

[ECMA-262](http://www.ecma-international.org/publications/standards/Ecma-262.htm) is the latest version of the JavaScript language specification and – by building on a recent V8 version – Node.js 4.0.0 supports many new language features out of the box.

Here are some examples

- Block scoping using let and const
- Classes. Yes really, JavaScript now supports classes but they are just syntactic sugar built around the prototypical inheritance model of JavaScript. So if you are using CoffeeScript because you just can not live without having a ‘class’ keyword this new feature is for you.
- Generators (function*, next and yield) It makes sense to get used to- and understand them. They will be heavily used in the future. koa.js, for instance, was built by the express folks and heavily depends on them.

Please find a complete list of currently supported ES6 features here: [ES6 in Node.js 4.0.0.](https://nodejs.org/en/docs/es6/)

### Performance ###

This is no longer true. I ran my initial performance tests against an early release candidate and there were no significant performance gains. After release candidate 4 introduced [improved V8 ArrayBuffer](https://github.com/nodejs/node/pull/2732) handling I redid my tests and now … well let’s look at it.

For my tests I used a simple express application and created some load using [ab](http://httpd.apache.org/docs/2.2/programs/ab.html).

First I wanted to know the difference in request performance and collected the number of requests per second and the time a single request took.

![](https://1.bp.blogspot.com/-XHZNq3GGTx8/Ve_P0jZLTiI/AAAAAAAAC3s/9vfHvoG1BBc/s1600/600x307xexpress_performance1-600x307.png.pagespeed.ic.Uo4X4tIjj9.png)

Overall performance of Node.js 4.0.0 compared to 0.12 and and 0.10

We clearly see that there is a performance gain of roughly 20% between the examined Node.js versions. 0.12 was even slower than 0.10 and 4.0.0 is much faster than both.

Using process.memoryUsage() I also graphed out the memory usage split into Resident Set Size, Heap Total and Heap Used.

![](https://4.bp.blogspot.com/-SDTlKm-i6VQ/Ve_P-UcpW9I/AAAAAAAAC30/7NUlmiuNg6I/s1600/600x281xexpress_memory1-600x281.png.pagespeed.ic.Q2tECVnMNa.png)

Comparing Memory Usage

The results are neither exiting nor disappointing although we see at a first glance that 0.10 demands less overall memory and 4.0.0 the most heap but V8 does a good job in reserving memory that is available on the system. So the higher figures for 0.12 and 4.0.0 may simply mean that V8’s memory handling has changed between the versions and that it now simply allocates more resources beforehand. I’ve also collected some metrics and charts that justify this but this would go beyond the scope of this post, so I will do a separate one on Node.js memory handling and garbage collection in the near future.

After all we can say that you can expect significant performance gains with 4.0.0 and that you may probably want to keep an eye on your memory usage.

### Long Term Support (LTS) Versions ###

Rolling out a new version in bigger environments (including testing and fixing things) often takes months and needs to be well planned – especially for enterprises the lack of a predictable release schedule was cumbersome in the past.

Establishing a LTS policy is a really big step and one of the most important things surrounding the release of 4.0.0.

This means

- There will be LTS releases every 12 months
- Every LTS version will be active for this 12 months
- After that every LTS version will be in maintenance mode for another 18 months
- The first LTS release will be in October. If you deploy it then, you can rely on it for 30 months.

![](https://2.bp.blogspot.com/-HIqv87yBHWI/Ve_csiWb2jI/AAAAAAAAC4E/1aOWGHHSO-8/s1600/600x275xstrawmanschedule-600x275.png.pagespeed.ic.rs6_g0ZSH6.png)

There is a [dedicated LTS sub-project on GitHub](https://github.com/nodejs/LTS). I encourage you to review it.

## Dynatrace and Node.js 4.0.0 ##

While we already working on porting the native parts of our Node.js agent to Nan 2 we have decided that we will align with Nodes new LTS schedule and ship a new version in early November.

## TL/DR ##

- 4.0.0 is the future of Node.js. If you start a new project today use it.
- The request performance is roughly 20% better than 0.12 – this is a significant gain.
- The switch to a new V8 version and the introduction of Nan 2.0 has implications on native modules and some not maintained ones may cease to work (but you should get rid of them anyway then)
- 4.0.0 uses a recent V8 version and offers many new language features from ES6
- The introduction of Long Term Support (LTS) is one of the most important and highly demanded new "features"

## Did I miss anything? ##

I’m eager to hear your impressions with Node.js 4.0.0.

When will you switch to 4.0.0?

How does your migration procedure look like?

Have you experienced any problems yet not mentioned here?

Are there any big benefits I’ve missed?

Are you happy about the LTS schedule?

Source: http://apmblog.dynatrace.com/2015/09/05/all-you-need-to-know-about-node-js-4-0/
