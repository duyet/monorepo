---
template: post
title: Git - How to remove untracked files
date: "2015-08-25"
author: Van-Duyet Le
tags:
- Git
modified_time: '2016-02-29T23:23:31.364+07:00'
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-3267008759685934556
blogger_orig_url: https://blog.duyet.net/2015/08/how-to-remove-untracked-files.html
slug: /2015/08/how-to-remove-untracked-files.html
category: Git
description: If you have a bunch of untracked files and want to remove them all in one go then just do this
fbCommentUrl: none
---

If you have a bunch of untracked files and want to remove them all in one go then just do this:

```
$ git clean
```
You might need to add the -f flag to force the removal of files. You also have the option of doing a dry run where Git won't actually remove anything, just show you the files that would be removed:

```
$ git clean -n
```

And that's pretty much it.
