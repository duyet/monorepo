---
template: post
title: zx 
date: "2021-08-28"
author: Van-Duyet Le
category: Dev
tags:
 - Data Engineer
 - Git
 - Bitbucket
slug: /2021/08/zx.html
thumbnail: https://1.bp.blogspot.com/-UxQmomMaIJA/YSn3KPNcrQI/AAAAAAACNMA/nBsVLSi2dYUFx9QK1zWX8-s0ViiNSHLAQCLcBGAsYHQ/s0/zx-thumb.png 
draft: false
description: >
  A tool for writing better scripts. I usually choose to write a Python or Deno script instead of a shell script for more convenience. 
  I found this tool is so great, helping to write the script quickly.
fbCommentUrl: none
---

A tool for writing better scripts by Google - `zx`. 
I usually choose to write a Python or Deno script instead of a shell script for more convenience. 
I found this tool is so great, helping to write the script quickly.
It would help if you tried it too.

Refer to the Git repo here for the detailed document: https://github.com/google/zx

# Some examples

## backup-github.mjs

```js
#!/usr/bin/env zx

let username = await question('What is your GitHub username? ')
let token = await question('Do you have GitHub token in env? ', {
  choices: Object.keys(process.env)
})

let headers = {}
if (process.env[token]) {
  headers = {
    Authorization: `token ${process.env[token]}`
  }
}
let res = await fetch(`https://api.github.com/users/${username}/repos`, {headers})
let data = await res.json()
let urls = data.map(x => x.git_url)

await $`mkdir -p backups`
cd('./backups')

await Promise.all(urls.map(url => $`git clone ${url}`))
```

```bash
zx ./backup-github.mjs
```

## External files

```bash
zx https://gist.githubusercontent.com/duyet/04fe68cc1ce7c82360354a90824a5edd/raw/6e4dbcd74688fd492cbbb1f746e501f77c3f93d0/wttr.mjs
```

![](/media/2021/08/zx.png)
