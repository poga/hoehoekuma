$.getJSON("./text.json", function (data) { window.bear_text = data; });
function uint_random(n) {
  return Math.floor(Math.random()*n);
}

function size_of_dict(t) {
  var size = 0, key;
  for(key in t) {
    if(t.hasOwnProperty(key)) ++size;
  }
  return size;
}

function draw_rect(canvas, x, y, width, height, fillStyle) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = fillStyle;
    ctx.fillRect(x, y, width, height);
}

function draw_roundrect(canvas, x, y, width, height, radius, fillStyle) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.fill();
}

function draw_dialog(canvas, x, y, width, height, fillStyle) {
    draw_roundrect(canvas, x, y, width, height, 10, fillStyle);
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(x + width - 10, y + height);
    ctx.lineTo(x + width - 25, y + height + 10);
    ctx.lineTo(x + width - 20, y + height);
    ctx.lineTo(x + width - 10, y + height - 10);
    ctx.fill();
}

function draw_text(canvas, x, y, text, fillStyle) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = fillStyle;
    ctx.font = "20px Verdana";
    ctx.fillText(text, x, y);
}

var SHEET_NUM = 0;
var AUTO_BEAR_NUM = 10;

function create_bear(type_n, x, y) {

    var sheetname = 'sprites/char' + (type_n) + '_sprites.png';

    var anim = new jaws.Animation({sprite_sheet: sheetname, frame_duration: 200, frame_size: [24, 32]});
    bear = new jaws.Sprite({x:x, y:y, scale: 3, anchor: "center" });
    bear.anim_up = anim.slice(8, 12);
    bear.anim_down = anim.slice(0, 4);
    bear.anim_left = anim.slice(12, 16);
    bear.anim_right = anim.slice(4, 8);
    bear.type_n = type_n;
    bear.text_n = uint_random( size_of_dict(bear_text) ) + 1;

    bear.setImage( bear.anim_down.next());
    
    // vx / vy only used by auto_bears
    bear.vx = Math.random()*4 - 2;
    bear.vy = Math.random()*4 - 2;

    return bear;
}

function Game() {
    var bear;
    var map;
    var auto_bears = [];
    var speed = 2;

    this.setup = function () {
        map = new jaws.Sprite({ x:320, y:240, anchor: "center", image: "map.png"});
        bear = create_bear(1, 320, 240);
        for (var i=0; i < AUTO_BEAR_NUM; i++) {
            auto_bears.push(create_bear(uint_random(SHEET_NUM-1)+2, Math.random()*500+100, Math.random()*300+100));
        }
        jaws.preventDefaultKeys(["up", "down", "left", "right"]);
    };

    this.update = function () {
        bear.setImage( bear.anim_down.next());
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
        
        // Auto-bears movements
        auto_bears.forEach(function(b) {
          b.x += b.vx;
          b.y += b.vy;
          if( b.x < 0 || b.x > jaws.width ) {
            b.vx *= -1;
          }
          if( b.y < 0 || b.y > jaws.height ) {
            b.vy *= -1;
          }
          
          // change character facing after speed change:
          var arc = Math.atan2( - b.vy, b.vx );
          if( arc > -3/4 * Math.PI && arc <= -1/4 * Math.PI ) {
            b.setImage(b.anim_down.next());
          }
          else if( arc > -1/4 * Math.PI && arc <= 1/4 * Math.PI ) {
            b.setImage(b.anim_right.next());
          }
          else if( arc > 1/4 * Math.PI && arc <= 3/4 * Math.PI ) {
            b.setImage(b.anim_up.next());
          }
          else {
            b.setImage(b.anim_left.next()); 
          }
        });
    };
    this.draw = function () {
        jaws.clear();
        map.draw();
        bear.draw();
        auto_bears.forEach(function(b) {
            b.draw();
            //draw_rect(jaws.canvas, b.x-50, b.y-65, 100, 30, "rgb(192,192,192)");
            draw_dialog(jaws.canvas, b.x-50, b.y-65, 100, 30, "#fff");
            draw_text(jaws.canvas, b.x-40, b.y-43, window.bear_text[b.text_n], "rgb(0,0,0)");
        });
    };
}

function when_load_fail_we_start_game() {
  jaws.assets.add("map.png");
  jaws.start(Game);  // Our convenience function jaws.start() will load assets, call setup and loop update/draw in 60 FPS
}

function load_asset_sequencially_until_fail(i) {
  var fname = 'sprites/char' + i + '_sprites.png';
  var oReq = new XMLHttpRequest();
  oReq.open('GET', fname, true );        
  oReq.responseType = "blob";
  oReq.onload = function ( oEvent ) {
    if ( oReq.status === 200 ) {
      SHEET_NUM += 1;
      jaws.assets.add(fname);
      load_asset_sequencially_until_fail( i+1 );
    } else {
      when_load_fail_we_start_game();
    }
  };
  oReq.send(null);
}

jaws.onload = function() {
  load_asset_sequencially_until_fail(1);
  console.log(window.bear_text);
  
};

