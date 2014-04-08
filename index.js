$.getJSON("./text.json", function (data) { window.bear_text = data; });

// --------------- CONSTANT ------------------

var SHEET_NUM = 0;
var AUTO_BEAR_NUM = 10;
var SCALE = 1; // scale factor to the image assets

// Other Global Game State Variables ---------

var miso_bear_num_ = 3; // initial num
var auto_bears = [];   

// --------------- Math and Helpers ----------

function len_sq(obj1, obj2) {
  var dx = (obj2.x - obj1.x)
  var dy = (obj2.y - obj1.y)  
  return (dx * dx) + (dy * dy);
}

function uint_random(n) {
  return ~~(Math.random()*n);
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

// ------------ Bear Behaviours, not yet fully refactored -----------------

function bear_say(text) {
  var that = this;
  if (that.text_n) return;
  that.text_n = text;
  setTimeout(function() {
    that.text_n = null;
  }, 1000);
}

function auto_bear_following(bear) {

  // approaching hero bear's position by a fraction each frame
  this.x += (bear.x - this.x) / 5; 
  this.y += (bear.y - this.y) / 5;
  
  // when auto_bear follows hero bear, make them facing the same direction
  if(jaws.pressed("left")) {       
      this.setImage( this.anim_left.next() );
  }
  if(jaws.pressed("right")){
      this.setImage( this.anim_right.next() );
  }
  if(jaws.pressed("up")){
      this.setImage( this.anim_up.next() );
  }
  if(jaws.pressed("down")){
      this.setImage( this.anim_down.next() );
  }
  
  // hardcoded area detection for "Going into the build brewing miso"
  if( this.x < jaws.width * 0.66 && this.x > jaws.width * 0.33 &&
      this.y < 95 ) {
    miso_bear_num_ += 1;
    var index = auto_bears.indexOf(this);
    if( index > -1 ) {
      auto_bears.splice(index, 1); 
    }
    delete this;
  }
}

function auto_bear_roaming(bear) {
  this.x += this.vx;
  this.y += this.vy;
  if( this.x < 0 || this.x > jaws.width ) {
    this.vx *= -1;
  }
  if( this.y < 100 || this.y > jaws.height ) {
    this.vy *= -1;
  }
  
  // change character facing after speed change:
  var arc = Math.atan2( - this.vy, this.vx );
  if( arc > -3/4 * Math.PI && arc <= -1/4 * Math.PI ) {
    this.setImage(this.anim_down.next());
  }
  else if( arc > -1/4 * Math.PI && arc <= 1/4 * Math.PI ) {
    this.setImage(this.anim_right.next());
  }
  else if( arc > 1/4 * Math.PI && arc <= 3/4 * Math.PI ) {
    this.setImage(this.anim_up.next());
  }
  else {
    this.setImage(this.anim_left.next()); 
  }
  
  // This is just a hack here. in the actual game, auto_bears should only follow hero bear
  // when he is "shouted to death" so he follows the hero.
  // But for the demonstration of following quickly, let's just check proximity and 
  // changes auto_bear's behaviour
  if( len_sq(this, bear) < 400 ) {
    this.movement = auto_bear_following;
  }
}

// ----------------- Constructors ----------------

function create_bear(type_n, x, y) {

    var sheetname = 'sprites/char' + (type_n) + '_sprites.png';

    var anim = new jaws.Animation({sprite_sheet: sheetname, frame_duration: 200, frame_size: [24, 32]});
    var bear = new jaws.Sprite({x:x, y:y, scale: SCALE, anchor: "center" });
    bear.anim_up = anim.slice(8, 12);
    bear.anim_down = anim.slice(0, 4);
    bear.anim_left = anim.slice(12, 16);
    bear.anim_right = anim.slice(4, 8);
    bear.type_n = type_n;
    bear.text_n = null;
    bear.say = bear_say;

    bear.setImage( bear.anim_down.next());
    
    // vx / vy only used by auto_bears
    bear.vx = Math.random()*2 - 1;
    bear.vy = Math.random()*2 - 1;
    bear.movement = auto_bear_roaming;

    return bear;
}

function create_cooking_bear(x, y) {
  var anim = new jaws.Animation({sprite_sheet: 'cooking.png', frame_duration: 400, frame_size: [53, 53]});
  var cooking = new jaws.Sprite( {x:x, y:y, scale: SCALE, anchor: "center" } );
  cooking.anim = anim;
  cooking.setImage( cooking.anim.next() );
  
  return cooking;
}

// -------------------------- Game --------------------------

function Game() {
    var bear;
    var map;
    var cooking_bear;
    var speed = 2;
    
    this.setup = function () {
        cooking_bear = create_cooking_bear( jaws.width/2, 50 );
        
        map = new jaws.Sprite({ x:jaws.width/2, y:jaws.height/2, anchor: "center", image: "background.png"});
        
        bear = create_bear(1, jaws.width/2, jaws.height/2);
        for (var i=0; i < AUTO_BEAR_NUM; i++) {
            auto_bears.push(create_bear(uint_random(SHEET_NUM-1)+2, Math.random()*jaws.width, 100+Math.random()*(jaws.height-100)));
        }
        jaws.preventDefaultKeys(["up", "down", "left", "right"]);
    };

    this.update = function () {
        if( auto_bears.length < AUTO_BEAR_NUM ) {
            auto_bears.push(create_bear(uint_random(SHEET_NUM-1)+2, Math.random()*jaws.width, 100+Math.random()*(jaws.height-100)));
        }
    
        cooking_bear.setImage( cooking_bear.anim.next() );
    
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
        
        auto_bears.forEach(function(b) {
          b.movement(bear);
        });
    };
    this.draw = function () {
        jaws.clear();
        map.draw();
        cooking_bear.draw();
        bear.draw();
        auto_bears.forEach(function(b) {
            b.draw();
            if (b.text_n) {
              draw_dialog(jaws.canvas, b.x-50, b.y-65, 100, 30, "#fff");
              draw_text(jaws.canvas, b.x-40, b.y-43, window.bear_text[b.text_n], "rgb(0,0,0)");
            } else {
              if (Math.random() < 0.005) {
                b.say(uint_random( size_of_dict(bear_text) ) + 1);
              }
            }
        });
    };
}

// --------------------- Everything else ------------------------

function when_load_fail_we_start_game() {
  // remember to add new assets here 
  jaws.assets.add("background.png");
  jaws.assets.add("cooking.png");
  jaws.assets.add("badguy.png");
  jaws.assets.add("base.png");
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

