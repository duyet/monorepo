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

```bash
$ git clean -f
```

## Useful Options

**Dry run** - See what would be removed without actually deleting:
```bash
$ git clean -n
```

**Remove untracked directories** - Include directories in cleanup:
```bash
$ git clean -fd
```

**Interactive mode** - Choose which files to remove:
```bash
$ git clean -i
```

**Force with directories** - Remove both files and directories:
```bash
$ git clean -ffd
```

## Important Notes

- Untracked files are files that Git hasn't tracked yet (not in `.gitignore`, not staged, not committed)
- **Warning**: `git clean` is destructive and cannot be undone. Always use `-n` (dry run) first to verify what will be deleted
- Use `git clean` to clean up build artifacts, node_modules, logs, and other temporary files not tracked by Git
