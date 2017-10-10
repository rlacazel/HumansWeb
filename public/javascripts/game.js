/**
 * Created by rlaca on 09/10/2017.
 */


var tilesize = 32;
var ratio = tilesize/64;

var roomAx = 0;
var roomAy = 0;
var roomBx = 4;
var roomBy = 0;
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'canvascontainer', { preload: preload, create: create, update: update, render: render });
var doorA;

function preload() {
    game.load.spritesheet('tileset', 'images/tileset.png', 64, 64);
    game.load.spritesheet('objects', 'images/objects.png', 64, 64);
}

var handle1;
var handle2;

var line1;

function create() {

    game.stage.backgroundColor = '#ffffff';

    buildRoomA(roomAx,roomAy);
    buildRoomB(roomBx, roomBy);
    drawTileRectangle(roomAx+1,roomAy+1,3,3,'tileset',215);
    drawTileRectangle(roomBx+1,roomBy+1,3,3,'tileset',215);
}

function buildRoomA(x, y)
{
    var offsetx = x*tilesize;
    var offsety = y*tilesize;

    sprite = game.add.sprite(offsetx + 3*tilesize , offsety + 4*tilesize, 'tileset', 215);
    sprite.scale.setTo(ratio, ratio);

    // top wall
    sprite = game.add.sprite(offsetx, offsety, 'tileset',266);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + tilesize, offsety, 'tileset',265);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + 2*tilesize, offsety, 'tileset',265);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + 3*tilesize, offsety, 'tileset',265);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + 4*tilesize, offsety, 'tileset',268);
    sprite.scale.setTo(ratio,ratio);

    // left and right walls
    sprite = game.add.sprite(offsetx, offsety + 1*tilesize, 'tileset',264);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx, offsety + 2*tilesize, 'tileset',264);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx, offsety + 3*tilesize, 'tileset',264);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + 4*tilesize, offsety + 1*tilesize, 'tileset',264);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + 4*tilesize, offsety + 2*tilesize, 'tileset',264);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + 4*tilesize, offsety + 3*tilesize, 'tileset',264);
    sprite.scale.setTo(ratio,ratio);

    // bottom wall
    sprite = game.add.sprite(offsetx, offsety + 4*tilesize, 'tileset',298);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + tilesize, offsety + 4*tilesize, 'tileset',265);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + 2*tilesize, offsety + 4*tilesize, 'tileset',265);
    sprite.scale.setTo(ratio,ratio);
    doorA = game.add.sprite(offsetx + 3*tilesize, offsety + 4*tilesize, 'objects',67);
    doorA.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + 4*tilesize, offsety + 4*tilesize, 'tileset',300);
    sprite.scale.setTo(ratio,ratio);
}

function buildRoomB(x, y)
{
    var offsetx = x*tilesize;
    var offsety = y*tilesize;

    sprite = game.add.sprite(offsetx + 3*tilesize , offsety + 4*tilesize, 'tileset', 215);
    sprite.scale.setTo(ratio, ratio);

    // top wall
    /*sprite = game.add.sprite(offsetx, offsety, 'tileset',266);
    sprite.scale.setTo(ratio,ratio);*/
    sprite = game.add.sprite(offsetx + tilesize, offsety, 'tileset',265);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + 2*tilesize, offsety, 'tileset',265);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + 3*tilesize, offsety, 'tileset',265);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + 4*tilesize, offsety, 'tileset',268);
    sprite.scale.setTo(ratio,ratio);

    // left and right walls
    /*sprite = game.add.sprite(offsetx, offsety + 1*tilesize, 'tileset',264);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx, offsety + 2*tilesize, 'tileset',264);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx, offsety + 3*tilesize, 'tileset',264);
    sprite.scale.setTo(ratio,ratio);*/
    sprite = game.add.sprite(offsetx + 4*tilesize, offsety + 1*tilesize, 'tileset',264);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + 4*tilesize, offsety + 2*tilesize, 'tileset',264);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + 4*tilesize, offsety + 3*tilesize, 'tileset',264);
    sprite.scale.setTo(ratio,ratio);

    // bottom wall
    /*sprite = game.add.sprite(offsetx, offsety + 4*tilesize, 'tileset',298);
    sprite.scale.setTo(ratio,ratio);*/
    sprite = game.add.sprite(offsetx + tilesize, offsety + 4*tilesize, 'tileset',265);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + 2*tilesize, offsety + 4*tilesize, 'tileset',265);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + 3*tilesize, offsety + 4*tilesize, 'objects',67);
    sprite.scale.setTo(ratio,ratio);
    sprite = game.add.sprite(offsetx + 4*tilesize, offsety + 4*tilesize, 'tileset',300);
    sprite.scale.setTo(ratio,ratio);
}

function drawTileRectangle(x, y, sizex, sizey, spritesheet, index) {
    for (i = 0; i < sizex; i++) {
        for (j = 0; j < sizey; j++) {
            sprite = game.add.sprite((x+i)*tilesize , (y+j)*tilesize, spritesheet, index);
            sprite.scale.setTo(ratio, ratio);
        }
    }
}

function openDoorA() {
    var demoTween = game.add.tween(doorA).to({x:roomAx+tilesize*2,y:roomAy+tilesize*4},1000);
    demoTween.start();
}

function closeDoorA() {
    var demoTween = game.add.tween(doorA).to({x:roomAx+tilesize*3,y:roomAy+tilesize*4},1000);
    demoTween.start();
}

function update() {

    //line1.fromSprite(handle1, handle2, false);

}

function render() {

}
