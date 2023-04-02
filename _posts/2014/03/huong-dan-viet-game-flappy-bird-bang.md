---
template: post
title: Hướng dẫn viết game Flappy Bird bằng HTML5 - Phần 2
date: "2014-03-07"
category: Javascript
tags:
- HTML5
- Post
- game
- Tutorials
modified_time: '2014-03-07T17:08:36.995+07:00'
thumbnail: https://4.bp.blogspot.com/-Eq0_6IHymko/UxmaVz4MU5I/AAAAAAAAGZE/DMmKGg7quvc/s1600/Untitled.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-6090677513466161707
blogger_orig_url: https://blog.duyet.net/2014/03/huong-dan-viet-game-flappy-bird-bang.html
slug: /2014/03/huong-dan-viet-game-flappy-bird-bang.html
description: Trong phần 1 của chuỗi bài viết về cách viết 1 game Flappy Bird Clone, chúng ta đã làm được 1 bộ khung tương đối đơn giản, nhưng nó vẫn còn thiếu nhiều thứ. Trong phần 2 này chúng ta sẽ tìm hiểu cách thêm các hiệu ứng cho chú chim của chúng ta thêm phần ức chế. 

---

Trong phần 1 của chuỗi bài viết về cách viết 1 game Flappy Bird Clone, chúng ta đã làm được 1 bộ khung tương đối đơn giản, nhưng nó vẫn còn thiếu nhiều thứ. Trong phần 2 này chúng ta sẽ tìm hiểu cách thêm các hiệu ứng cho chú chim của chúng ta thêm phần ức chế. 
Bạn có thể chơi thử trước tại đây để xem những gì chúng ta sẽ code trong phần 2 này, [tại đây](https://jsfiddle.net/lvduit/LeAj6/embedded/result/).

![](https://4.bp.blogspot.com/-Eq0_6IHymko/UxmaVz4MU5I/AAAAAAAAGZE/DMmKGg7quvc/s1600/Untitled.png)

## Bước 1: Cài đặt
Đầu tiên bạn [download template](https://github.com/lessmilk/phaser-tutorials/raw/master/3-flappy_bird/flappy_bird_basic.zip) mình viết sẵn tại đây, trong file download về sẽ bao gồm chúng ta sẽ thực hiện trong phần 1, chỉ thêm 1 file mới là file audio.
Mở file main.js và bắt đầu nào.

## Bước 2: Hiệu ứng bay ##

Con chim của chúng ta chỉ bay lên và rơi xuống, như vậy thì sẽ rất chán, bây giờ mình sẽ hướng dẫn các bạn thêm 1 số hiệu ứng giống như game gốc của chúng ta. 

1. Khi rơi xuống chú chim sẽ úp mặt xuống.

2. Khi bay lên ngẩng mặt lên.

Đầu tiên chúng ta thêm dòng sau vào hàm update()

```js
if (this.bird.angle < 20)  
    this.bird.angle += 1;
```

Thuộc tính angle cho phép chúng ta xoay đối tượng. Ở đây chúng ta sẽ thêm `this.bird.angle = -20;` vào hàm `jump()` để cho chú chim xoay lại như cũ khi nhảy lên. Tuy nhiên thuộc tính sẽ xoay 1 cách ngay lập tức, trông game như đang giật giật. Vì thế chúng ta sẽ k dùng cái này, thay vào đó sẽ sử dụng animate để cho chú chim "quay đầu" 1 cách mượt mà.  

```js
// create an animation on the bird
var animation = this.game.add.tween(this.bird);

// Set the animation to change the angle of the sprite to -20° in 100 milliseconds
animation.to({angle: -20}, 100);

// And start the animation
animation.start();  

```

Hoặc bạn cũng có thể viết 1 cách ngắn gọn những dòng trên bằng 1 dòng đơn giản sau theo cú pháp của Javascript

```js
this.game.add.tween(this.bird).to({angle: -20}, 100).start();
```

Nếu bạn test thử game ngay bây giờ, bạn sẽ thấy nó sẽ quay không giống như game gốc, bởi thực ra nó được quay 1 góc với tâm ở cạnh trên bên trái. Bạn xem hình dưới để phân biệt.

![](https://3.bp.blogspot.com/-y_pto-d-ILM/UxmQL1Qn5MI/AAAAAAAAGY0/c2qGR5x3LUw/s1600/anchor.png)

Bên trái là code hiện tại của chúng ta, chú chim quay với tâm cố định cạnh bên. Cái chúng ta cần là nó quay với tâm như hình bên phải.

Cái chúng ta cần là thay đổi tâm vào chính giữa, cái tâm đó gọi là "anchor". Thêm dòng sau vào hàm create()

```js
this.bird.anchor.setTo(-0.2, 0.5);  
```

Xem thử nào, tốt hơn rồi đó =]]  

## Bước 3: Chuyện gì xảy ra khi chim va vào cột. ##

Ở thời điểm này, khi chim của chúng ta chết nếu va vào cột và restart game ngay lập tức. Tiếp tục chúng ta sẽ chỉnh sửa 1 chút, khi chim chết trên màn hình hiện lên thông báo là bạn đã Fail.

Chúng ta sẽ sửa dòng sau trong hàm `update()`, khi chim va vào cột sẽ không gọi `restart_game()` mà sẽ gọi `hit_pipe()`

```js
this.game.physics.overlap(this.bird, this.pipes, this.hit_pipe, null, this);  

```

Tiếp theo chúng ta sẽ viết thêm hàm `hit_pipe()`

```js
hit_pipe: function() {  
    // Set the alive property of the bird to false
    this.bird.alive = false;

    // Prevent new pipes from appearing
    this.game.time.events.remove(this.timer);

    // Go through all the pipes, and stop their movement
    this.pipes.forEachAlive(function(p){
        p.body.velocity.x = 0;
    }, this);
},

```

Cuối cùng, chúng ta sẽ không cho chú chim tiếp tục nhảy nếu như chim chết, sửa hàm `jump()` lại, return `false` nếu chim đã chết

```js
if (this.bird.alive == false)  
    return; 

```

## Bước 4: Thêm hiệu ứng âm thanh ##

Thêm âm thanh vào game ư? Cực kì dễ trong Phaser.

Đầu tiên load nguồn trong `preload()`

```js
this.game.load.audio('jump', 'assets/jump.wav');
```

Tiếp theo, khi nhảy lên thì phát ra âm thanh, thêm code sau vào hàm `create()` để khởi tạo biến jump_sound để lưu audio

```js
this.jump_sound = this.game.add.audio('jump');  
```

Thêm dòng sau để phát ra âm thanh vào trong hàm jump()

```js
this.jump_sound.play(); 

```

Và chúng ta đã làm xong phần 2, bạn có thể download source code của phần này [tại đây](https://github.com/lessmilk/phaser-tutorials/raw/master/3-flappy_bird/flappy_bird_final.zip).

## What's next?  ##

Chỉ với vài dòng code đơn giản bạn có thể tạo ra 1 game, nhưng bạn có thể làm tốt hơn nhiều cơ. Trong phần tiếp theo, cũng là phần cuối. Bạn có thể biết cách lưu điểm kỉ lục, màn hình start screen, menu... Bạn có thể subscribe để mình có thể email cho bạn khi phần tiếp theo hoàn thành. Chúc các bạn thành công.
