---
title: Git - Tutorial remove untracked files
date: '2015-08-25'
author: Duyet
tags:
  - Git
modified_time: '2016-02-29T23:23:31.364+07:00'
slug: /2015/08/how-to-remove-untracked-files.html
category: Git
description: If you have a bunch of untracked files and want to remove them all in one go then just do this
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
