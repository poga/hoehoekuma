function create_bear(x, y) {
    var anim = new jaws.Animation({sprite_sheet: "sprites/char1_sprites.png", frame_duration: 100, frame_size: [24, 32]});
    bear = new jaws.Sprite({x:x, y:y, scale: 3, anchor: "center" });
    bear.anim_up = anim.slice(3, 5);
    bear.anim_down = anim.slice(0, 2);
    bear.anim_left = anim.slice(9, 11);
    bear.anim_right = anim.slice(6,8);

    bear.setImage( bear.anim_down.next());

    return bear;
}

function Game() {
    var bear;
    var auto_bears = [];
    var speed = 2;

    this.setup = function () {
        bear = create_bear(320, 240);
        for (var i=0; i<10; i++) {
            auto_bears.push(create_bear(Math.random()*500+100, Math.random()*300+100));
        }
        jaws.preventDefaultKeys(["up", "down", "left", "right"]);
    };

    this.update = function () {
        bear.setImage( bear.anim_down.next());
        auto_bears.forEach(function(b) {b.setImage(b.anim_down.next());});
        if(jaws.pressed("left")) {
            bear.x -= speed;
            bear.setImage( bear.anim_left.next());
        }
        if(jaws.pressed("right")){
            bear.x += speed;
            bear.setImage( bear.anim_right.next());
        }
        if(jaws.pressed("up")){
            bear.y -= speed;
            bear.setImage( bear.anim_up.next());
        }
        if(jaws.pressed("down")){
            bear.y += speed;
            bear.setImage( bear.anim_down.next());
        }
    };
    this.draw = function () {
        jaws.clear();
        bear.draw();
        auto_bears.forEach(function(b) {b.draw();});
    };
}

jaws.onload = function() {
  jaws.assets.add("sprites/char1_sprites.png");
  jaws.start(Game);  // Our convenience function jaws.start() will load assets, call setup and loop update/draw in 60 FPS
};
