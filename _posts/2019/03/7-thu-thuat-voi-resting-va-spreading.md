---
template: post
title: 7 thủ thuật với Resting và Spreading JavaScript Objects
date: "2019-03-27"
author: Van-Duyet Le
category: Javascript
tags:
- ES6
- Javascript
- Nodejs
- Thủ thuật
modified_time: '2019-03-27T00:00:03.766+07:00'
blogger_orig_url: https://blog.duyet.net/2019/03/7-thu-thuat-voi-resting-va-spreading.html
slug: /2019/03/7-thu-thuat-voi-resting-va-spreading.html
description: Resting và spreading càng ngày được ưa chuộng vì sự tiện lợi của nó, sau đây là 7 tricks với JavaScript objects.
thumbnail: https://1.bp.blogspot.com/-Lx7eCzJBFOM/XI27Q9rLwuI/AAAAAAAA7f8/nArHouQIfwIJF_VQOpoUm2qaEG7VMgnfgCLcBGAs/s1600/Screen%2BShot%2B2019-03-17%2Bat%2B10.12.44%2BAM.png
fbCommentUrl: none
---

# 1. Thêm thuộc tính vào Objects.

Bạn có thể vừa clone và thêm thuộc tính cho objects. Ví dụ sau clone user object và thêm vào thuộc tính password

```js
const user = { id: 100, name: 'Howard Moon'}
const userWithPass = { ...user, password: 'Password!' }

user //=> { id: 100, name: 'Howard Moon' }
userWithPass //=> { id: 100, name: 'Howard Moon', password: 'Password!' }
```

# 2. Merge Objects
Merge 2 objects vào 1 objects

```js
const part1 = { id: 100, name: 'Howard Moon' }
const part2 = { id: 100, password: 'Password!' }

const user1 = { ...part1, ...part2 }
//=> { id: 100, name: 'Howard Moon', password: 'Password!' }
```

Hoặc có thể merge với cú pháp sau:

```js
const partial = { id: 100, name: 'Howard Moon' }
const user = { ...partial, ...{ id: 100, password: 'Password!' } }

user //=> { id: 100, name: 'Howard Moon', password: 'Password!' }
```

# 3. Loại bỏ (xóa) một thuộc tính (Exclude Properties)
Có thể loại bỏ thuộc tính bằng cách destructuring kết hợp với rest operator. Ví dụ sau loại bỏ thuộc tính password

```js
const noPassword = ({ password, ...rest }) => rest
const user = {
  id: 100,
  name: 'Howard Moon',
  password: 'Password!'
}

noPassword(user) //=> { id: 100, name: 'Howard moon' }
```


# 4. Loại bỏ thuộc tính linh động (Dynamically Exclude Properties)
Thủ thuật sau sử dụng computed object property names để xóa thuộc tính một cách linh động:

```js
const user1 = {
  id: 100,
  name: 'Howard Moon',
  password: 'Password!'
}
const removeProperty = prop => ({ [prop]: _, ...rest }) => rest
//                     ----       ------
//                          \   /
//                dynamic destructuring

const removePassword = removeProperty('password')
const removeId = removeProperty('id')

removePassword(user1) //=> { id: 100, name: 'Howard Moon' }
removeId(user1) //=> { name: 'Howard Moon', password: 'Password!' }
```

# 5. Sắp xếp loại thứ tự các thuộc tính (Organize Properties)
Đưa id lên vị trí đầu tiền

```js
const user3 = {
  password: 'Password!',
  name: 'Naboo',
  id: 300
}

const organize = object => ({ id: undefined, ...object })
//                            -------------
//                          /
//  move id to the first property

organize(user3)
//=> { id: 300, password: 'Password!', name: 'Naboo' }
```

# 6. Thuộc tính mặc định (Default Properties)
`setDefaults` function sau sẽ tự động thêm thuộc tính `quotes: []` nếu object đó không có thuộc tính quotes.

```js
const user2 = {
  id: 200,
  name: 'Vince Noir'
}

const user4 = {
  id: 400,
  name: 'Bollo',
  quotes: ["I've got a bad feeling about this..."]
}

const setDefaults = ({ quotes = [], ...object}) =>
  ({ ...object, quotes })

setDefaults(user2)
//=> { id: 200, name: 'Vince Noir', quotes: [] }

setDefaults(user4)
//=> {
//=>   id: 400,
//=>   name: 'Bollo',
//=>   quotes: ["I've got a bad feeling about this..."]
//=> }
```

# 7. Đổi tên thuộc tính (Renaming Properties)
Kết hợp các kỹ thuật ở trên, ta viết function rename để đổi tên 1 thuộc tính như sau:

```js
const renamed = ({ ID, ...object }) => ({ id: ID, ...object })

const user = {
  ID: 500,
  name: "Bob Fossil"
}

renamed(user) //=> { id: 5000, name: 'Bob Fossil' }
```

# Tham khảo

- https://blog.bitsrc.io/6-tricks-with-resting-and-spreading-javascript-objects-68d585bdc83
- https://javascript.info/rest-parameters-spread-operator


