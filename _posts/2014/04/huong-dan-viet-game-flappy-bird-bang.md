---
template: post
title: Hướng dẫn viết game Flappy Bird bằng HTML5 - Phần 3
date: "2014-04-02"
category: Javascript
tags:
- HTML5
- game
- jQuery
modified_time: '2015-01-22T19:22:48.214+07:00'
thumbnail: https://4.bp.blogspot.com/-7exI9UlIZZ4/UzuVmrP-YRI/AAAAAAAAGgE/OjgRgxeToxU/s1600/diag.png
blogger_id: tag:blogger.com,1999:blog-3454518094181460838.post-900355265705355732
blogger_orig_url: https://blog.duyet.net/2014/04/huong-dan-viet-game-flappy-bird-bang.html
slug: /2014/04/huong-dan-viet-game-flappy-bird-bang.html
description: Ở phần 1 của bài viết này, chúng ta đã biết cách xây dựng Flappy Bird Clone đơn giản. Phần 2 đã bổ xung thêm một số hiện ứng và âm thanh. Trong phần cuối cùng của bài viết này, mình sẽ hướng dẫn các bạn thêm 1 số thành phần khác để hoàn chỉnh game của chúng ta. Bắt đầu nào!

---

Ở phần 1 của bài viết này, chúng ta đã biết cách xây dựng Flappy Bird Clone đơn giản. Phần 2 đã bổ xung thêm một số hiện ứng và âm thanh. Trong phần cuối cùng của bài viết này, mình sẽ hướng dẫn các bạn thêm 1 số thành phần khác để hoàn chỉnh game của chúng ta. Bắt đầu nào!

## Ý tưởng ##

Bạn có thể xem trước kết quả những gì chúng ta sẽ làm ngày hôm nay [tại đây](https://jsfiddle.net/lvduit/sw9HM/embedded/result/).
Chúng ta sẽ cùng nhau code thêm 1 số thứ sau đây như Loading Screen, Menu chọn, và actual.
Mỗi thành phần của 1 game ta gọi là 1 state. Hai phần trước của bài viết chúng ta mới chỉ xây dựng 1 state chính mà màn hình điều khiển chú chim. Trò chơi sẽ tự đông bắt đầu khi ta load game. Bây giờ chúng ta sẽ thêm 2 state nữa là Load State (màn hình chờ ấy), Menu state.
Khi game được load chúng ta sẽ ở Load state, khi sẵn sàng sẽ chuyển sang menu state và chơi game. khi thua sẽ quay lại menu state. Ok hình dung rồi chứ :)
Ta sẽ như sơ đồ dưới đây:

![](https://4.bp.blogspot.com/-7exI9UlIZZ4/UzuVmrP-YRI/AAAAAAAAGgE/OjgRgxeToxU/s1600/diag.png)

Tất cả các code chúng ta có thể viết chung 1 file .js duy nhất, nhưng mà để thuận tiện và dễ dàng cho các bạn thì mình sẽ tách thành 4 file với các chức năng khác nhau nha.

## Cài đặt code 

Tải 4 file template của mình [tại đây](https://github.com/lvduit/phaser-tutorials/raw/master/4-flappy_bird/flappy_bird_basic.zip). Trong file nén gồm có:

- 4 file js: `load.js`, `menu.js`, `play.js`, và `game.js` (4 file này đều rỗng nhé, mình tạo sẵn cho các bạn dễ hình dung)
- File `index.html` và thư viện `phaser.min.js`

Và bây giờ chúng ta hay code cho từng file js

## load.js ##

State này rất đơn giản, nó sẽ reload các file resource mà chúng ta đã thấy trong các phần trước. Bây giờ chúng ta sẽ viết như sau:

```js
var load_state = {  
    preload: function() { 
        this.game.stage.backgroundColor = '#71c5cf';
        this.game.load.image('bird', 'assets/bird.png');  
        this.game.load.image('pipe', 'assets/pipe.png');  
        this.game.load.audio('jump', 'assets/jump.wav');
    },

    create: function() {
        // Sau khi đã load xong hết assets, chúng ta bắt đầu load state menu
        this.game.state.start('menu');
    }
};

```

## menu.js ##

Tiếp theo là state menu. Đây là state hiển thị một menu hết sức đơn giản, nó chứa thông tin cách chơi game và hiển thị số điểm nếu game over.
Chú ý 2 điểm mới trong code sau đây:

- Biến score là biến toàn cục, để có thể lưu điểm số ở các state khác nhau
- Để xác định tọa độ để in text ra giữa màn hình chúng ta sử dụng game.world.width/2 và anchor.setTo(0.5, 0.5)

```js
var menu_state = {  
    create: function() {
        // Call the 'start' function when pressing the spacebar
        var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        space_key.onDown.add(this.start, this); 

        // Defining variables
        var style = { font: "30px Arial", fill: "#ffffff" };
        var x = game.world.width/2, y = game.world.height/2;

        // Adding a text centered on the screen
        var text = this.game.add.text(x, y-50, "Press space to start", style);
        text.anchor.setTo(0.5, 0.5); 

        // If the user already played
        if (score > 0) {
            // Display its score
            var score_label = this.game.add.text(x, y+50, "score: " + score, style);
            score_label.anchor.setTo(0.5, 0.5); 
        }
    },

    // Start the actual game
    start: function() {
        this.game.state.start('play');
    }
};
```

## play.js ##

Đây là phần chính của game, cũng giống như những phần trước, chỉ thay đổi 1 số thay đổi nhỏ thôi

```js
var play_state = {

    // No more 'preload' function, since it is already done in the 'load' state

    create: function() { 
        var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        space_key.onDown.add(this.jump, this); 

        this.pipes = game.add.group();
        this.pipes.createMultiple(20, 'pipe');  
        this.timer = this.game.time.events.loop(1500, this.add_row_of_pipes, this);           

        this.bird = this.game.add.sprite(100, 245, 'bird');
        this.bird.body.gravity.y = 1000; 
        this.bird.anchor.setTo(-0.2, 0.5);

        // No 'this.score', but just 'score'
        score = 0; 
        var style = { font: "30px Arial", fill: "#ffffff" };
        this.label_score = this.game.add.text(20, 20, "0", style); 

        this.jump_sound = this.game.add.audio('jump');
    },

    update: function() {
        if (this.bird.inWorld == false)
            this.restart_game(); 

        if (this.bird.angle < 20)
            this.bird.angle += 1;

        this.game.physics.overlap(this.bird, this.pipes, this.hit_pipe, null, this);      
    },

    jump: function() {
        if (this.bird.alive == false)
            return; 

        this.bird.body.velocity.y = -350;
        this.game.add.tween(this.bird).to({angle: -20}, 100).start();
        this.jump_sound.play();
    },

    hit_pipe: function() {
        if (this.bird.alive == false)
            return;

        this.bird.alive = false;
        this.game.time.events.remove(this.timer);

        this.pipes.forEachAlive(function(p){
            p.body.velocity.x = 0;
        }, this);
    },

    restart_game: function() {
        this.game.time.events.remove(this.timer);

        // This time we go back to the 'menu' state
        this.game.state.start('menu');
    },

    add_one_pipe: function(x, y) {
        var pipe = this.pipes.getFirstDead();
        pipe.reset(x, y);
        pipe.body.velocity.x = -200; 
        pipe.outOfBoundsKill = true;
    },

    add_row_of_pipes: function() {
        var hole = Math.floor(Math.random()*5)+1;

        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole +1) 
                this.add_one_pipe(400, i*60+10);   

        // No 'this.score', but just 'score'
        score += 1; 
        this.label_score.content = score;  
    }
};
```

## game.js  ##

Phần cuối cùng, chúng ta sẽ ráp toàn bộ code vào Phaser để biên dịch và định nghĩa các state:

```js
// Initialize Phaser
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div');

// Our 'score' global variable
var score = 0;

// Define all the states
game.state.add('load', load_state);  
game.state.add('menu', menu_state);  
game.state.add('play', play_state);  

// Start with the 'load' state
game.state.start('load');  
```

Và cuối cùng cũng đã hoàn thành rồi, bạn save toàn bộ code và upload lên trên Webserver để thưởng thức.
Game vẫn còn nhiều chỗ để hoàn chỉnh giống như game gốc của anh Đông, nhưng mình sẽ dừng bài viết tại đây. Trên đây chỉ là những bước cơ bản nhất để bạn có thể hình dung các thực hiện 1 game đơn giản trên HTML5. Mọi thắc mắc các bạn có thể comment hoặc email cho mình :)

Chúc bạn thành công và đón đọc các bài viết khác nhé.
