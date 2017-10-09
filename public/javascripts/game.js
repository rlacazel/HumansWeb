/**
 * Created by rlaca on 09/10/2017.
 */

jQuery(function($){

var game = new Phaser.Game(800, 600, Phaser.CANVAS, '#game', { preload: preload, create: create, update: update, render: render });

    function preload() {

        // game.load.spritesheet('balls', 'assets/sprites/balls.png', 17, 17);
        game.load.spritesheet('tileset', 'images/tileset.png', 64, 64);
    }

    var handle1;
    var handle2;

    var line1;

    function create() {

        game.stage.backgroundColor = '#ffffff';

        sprite = game.add.sprite(0, 0, 'tileset',266);
        sprite = game.add.sprite(64, 0, 'tileset',265);

      /*  var startLine = game.add.graphics(0, 0);

        startLine.beginFill(0xffffff);

        startLine.lineStyle(2, 0x000000, 1);

        startLine.moveTo(0, 0);
        startLine.lineTo(100, 0);
        startLine.lineTo(100, 100);

        startLine.endFill();*/

    }

    function update() {

        //line1.fromSprite(handle1, handle2, false);

    }

    function render() {

    }

});