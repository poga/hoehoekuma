function create_bear(x, y) {
    var anim = new jaws.Animation({sprite_sheet: "sprites/char1_sprites.png", frame_duration: 300, frame_size: [24, 32]});
    bear = new jaws.Sprite({x:x, y:y, scale: 3, anchor: "center" });
    bear.anim_up = anim.slice(5, 9);
    bear.anim_down = anim.slice(0, 4);
    bear.anim_left = anim.slice(15, 19);
    bear.anim_right = anim.slice(10,14);

    bear.setImage( bear.anim_down.next());

    return bear;
}

function Game() {
    var bear;
    var map;
    var auto_bears = [];
    var speed = 2;

    this.setup = function () {
        map = new jaws.Sprite({ x:320, y:240, anchor: "center", image: "map.png"});
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
        map.draw();
        bear.draw();
        auto_bears.forEach(function(b) {b.draw();});
    };
}

jaws.onload = function() {
  jaws.assets.add("sprites/char1_sprites.png");
  jaws.assets.add("map.png");
  jaws.start(Game);  // Our convenience function jaws.start() will load assets, call setup and loop update/draw in 60 FPS
};

