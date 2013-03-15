/*
Copyright 2012, 2013 Jake Blatchford, Mike Garwood, Will Oliver, Jonathan Scherrer, Tom Verran

This file is part of Unisim.

Unisim is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Unisim is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Unisim.  If not, see <http://www.gnu.org/licenses/>.
*/

exports.world = function(game) {

    'use strict';

    var oldWorld;
    var redraw = true;
    var redrawAll = true;

    var mouseMoveX = 0, mouseMoveY = 0;
    var keyboardMoveX = 0, keyboardMoveY = 0;
    var mouse = {x: 0, y: 0};
    var lastHighlightX = 0, lastHighlightY = 0;

    var tileSize = game.world.getTileSize();

    //Minimap UI element
    var ui = require('ui/minimap.js');
    var minimapDim = 200; //N size of one side of the minimap square in pixels
    var minimap = new ui.Minimap(game.world.getWidth(), game.world.getHeight(), tileSize, minimapDim, this.game);
    game.container.addElement('minimap', minimap, 10, -minimapDim - 20);

    minimap.addListener('mousedown', function(e) {
        minimap.setMove(true);
        var off = minimap.move(e);
        setOffset(off.x, off.y);
    });

    minimap.addListener('mousemove', function(e) {
        if (minimap.getMove()) {
            var off = minimap.move(e);
            setOffset(off.x, off.y);
        }
    });

    /**
     * Handler for mouse up event
     * @param {object} e Mouse event data.
     */
    game.container.addListener('mouseup', function(e) {
        minimap.setMove(false);
    });

    /**
     * Function to set the offset X and Y coordinate of the game view.
     * @param {Number} x X coordinate to shift viewpoint to.
     * @param {Number} y Y coordinate to shift viewpoint to.
     */
    var setOffset = function(x, y) {
        game.offsetX = x;
        game.offsetY = y;
        redrawAll = true;
    };

    /**
     * A world is sent to us!
     * @param {object} data The world data.
     */
    this.createEvent = function(data) {
        game.world.fromJson(data);

        //Create a world array, which stores the old world data, to check what needs redrawing
        oldWorld = [];
        for (var i = 0; i < game.world.getWidth(); i++) {
            oldWorld[i] = [];
            for (var j = 0; j < game.world.getHeight(); j++) {
                oldWorld[i][j] = '';
            }
        }
        redraw = true;
    };

    /**
     * Called by the server, update the world
     * @param {object} data Tile info sent by the server.
     */
    this.updateEvent = function(data) {
        for (var i = 0; i < data.length; i++) {
            game.world.setTile(data[i].x, data[i].y, data[i].type);
        }
        redraw = true;
    };

    /**
     * A world is resent to us from the server!
     * @param {object} data The world data.
     */
    this.resendEvent = function(data) {
        game.world.fromJson(data);
        redraw = true;
    };

    /**
     * request a world re-download.
     */
    this.redownloadEvent = function() {
        game.server.send('world', 'redownload', {});
    };

    //KEYBOARD EVENTS

    /**
     * Handler for key down events
     * @param {object} e Mouse event data.
     */
    game.container.addListener('keydown', function(e) {
        if (e == 37) {      //Left Arrow
            keyboardMoveX = -1;
        } else if (e == 38) {//Up Arrow
            keyboardMoveY = -1;
        } else if (e == 39) {//Right Arrow
            keyboardMoveX = 1;
        } else if (e == 40) {//Down Arrow
            keyboardMoveY = 1;
        }
    });

    /**
     * Handler for key up events
     * @param {object} e Mouse event data.
     */
    game.container.addListener('keyup', function(e) {
        if (e == 37) {
            keyboardMoveX = 0;
        } else if (e == 38) {
            keyboardMoveY = 0;
        } else if (e == 39) {
            keyboardMoveX = 0;
        } else if (e == 40) {
            keyboardMoveY = 0;
        }
    });

    //MOUSE EVENTS

    /**
     * Handler for mouse move events
     * @param {object} e Mouse event data.
     */
    game.container.addListener('mousemove', function(e) {

        //declare variables.
        var mouseX = e.x, mouseY = e.y, mouseLocation = [];

        mouseLocation[0] = mouseX + game.offsetX;
        mouseLocation[1] = mouseY + game.offsetY;

        var edgeSize = 20;

        //Border Checks X
        if (mouseX < edgeSize) {
            mouseMoveX = -1;
        } else if (mouseX > window.innerWidth - edgeSize) {
            mouseMoveX = 1;
        } else {
            mouseMoveX = 0;
        }

        //Border Checks Y
        if (mouseY < edgeSize) {
            mouseMoveY = -1;
        } else if (mouseY > window.innerHeight - edgeSize) {
            mouseMoveY = 1;
        } else {
            mouseMoveY = 0;
        }
        mouse = e;
        redraw = true;
    });

    //GRAPHICS EVENTS

    var load = require('lib/images.js');
    var loader = new load.ImageLoader();

    //load in the images we need to draw things
    var highlightTile = loader.addImage('highlight.png');

    var tiles = {
        grass: loader.addImage('grass.png'),
        water: loader.addImage('water.png'),
        rock: loader.addImage('rock.png'),
        path: loader.addImage('herringbone.png'),
        door: loader.addImage('door.png'),
        floor: loader.addImage('floor.png'),
        entrance: loader.addImage('entrance.png'),
        chair: loader.addImage('chair.png'),
        lecturn: loader.addImage('lecturn.png'),
        bed: loader.addImage('bed.png'),
        sofa: loader.addImage('sofa.png'),
        wallEast: loader.addImage('wall_straight.png'),
        cornerTl: loader.addImage('corner.png'),
        barStool: loader.addImage('barStool.png'),
        table: loader.addImage('table.png')
    };

    loader.load(function() {

        //create a temporary canvas object
        var tempCanvas = document.createElement('canvas');
        tempCanvas.height = tiles.wallEast.height;
        tempCanvas.width = tiles.wallEast.width;

        //flip our canvas round to get the west wall
        var tempCtx = tempCanvas.getContext('2d');
        tempCtx.translate(tiles.wallEast.width, 0);
        tempCtx.scale(-1, 1);

        //draw our east wall flipped, so westerly
        tempCtx.drawImage(tiles.wallEast, 0, 0);

        //create a wallWest from ctx
        tiles.wallWest = new Image();
        tiles.wallWest.src = tempCanvas.toDataURL();

        //also flip our top left corner for top right
        tempCtx.drawImage(tiles.cornerTl, 0, 0);

        // and as ever, save
        tiles.cornerTr = new Image();
        tiles.cornerTr.src = tempCanvas.toDataURL();

        //rotate our canvas for north
        tempCtx.translate(15, 15);
        tempCtx.rotate(90 * Math.PI / 180);
        tempCtx.drawImage(tiles.wallEast, -15, -15);

        //and create the resulting img
        tiles.wallNorth = new Image();
        tiles.wallNorth.src = tempCanvas.toDataURL();

        //flip again - south
        tempCtx.scale(-1, 1);
        tempCtx.drawImage(tiles.wallEast, -15, -15);

        //and create the resulting img
        tiles.wallSouth = new Image();
        tiles.wallSouth.src = tempCanvas.toDataURL();

        //also flip our top left corner for top right
        tempCtx.drawImage(tiles.cornerTl, -15, -15);

        // and as ever, save
        tiles.cornerBl = new Image();
        tiles.cornerBl.src = tempCanvas.toDataURL();

        tempCtx.scale(1, -1);

        //also flip our top left corner for top right
        tempCtx.drawImage(tiles.cornerTl, -15, -15);

        // and as ever, save
        tiles.cornerBr = new Image();
        tiles.cornerBr.src = tempCanvas.toDataURL();
    });

    /**
     * Function to check image would be drawn on screen
     * @param {object} context The 2d context to draw into.
     * @param {object} image The image to be drawn.
     * @param {int} x The x coordinate of the canvas to draw the image at.
     * @param {int} y The y coordinate of the canvas to draw the image at.
     * @param {number} width The width of the image to be drawn.
     * @param {number} height The height of the image to be drawn.
     */
    var drawImageIfValid = function(context, image, x, y, width, height) {

        //Check placement is valid (Image can be seen)
        if (x + tileSize > 0 && x < context.canvas.width) {
            if (y + tileSize > 0 && y < context.canvas.width) {
                //Draw image as on screen
                context.drawImage(image, x, y, width, height);
            }
        }
    };

    /**
     * Kicked by the Client tick event,
     * which is roughly 60fps.
     * @param {object} g Object containing graphics context.
     */
    this.paintEvent = function(g) {
        // check if the game redraw variable is set
        if (game.redraw) {
            redrawAll = true;
            game.redraw = false;
        }

        //skip if no world or images
        if (!game.world.getLoaded()) {
            return;
        }

        var context = g.layers[2];

        if (redraw || redrawAll) {
            var gameWidth = game.world.getWidth();
            var gameHeight = game.world.getHeight();
            var miniMapTileSize = 1;

            //grab where the mouse is in terms of tiles, rather than absolute X co-ordinates.
            var mouseX = (Math.floor((mouse.x + (game.offsetX % tileSize)) / tileSize) * tileSize) - (game.offsetX % tileSize);
            var mouseY = (Math.floor((mouse.y + (game.offsetY % tileSize)) / tileSize) * tileSize) - (game.offsetY % tileSize);

            // get highlight tile
            var highlightX = Math.floor((mouse.x + game.offsetX) / tileSize);
            var highlightY = Math.floor((mouse.y + game.offsetY) / tileSize);

            // check if highlight position has changed
            if (highlightX != lastHighlightX || highlightY != lastHighlightY) {
                // set last highlight tile to be cleared
                oldWorld[lastHighlightX][lastHighlightY] = 'mouse';
            }

            for (var x = 0; x < gameWidth; x++) {
                for (var y = 0; y < gameHeight; y++) {
                    var curTile = game.world.tile(x, y);
                    if (oldWorld[x][y] != curTile || redrawAll) {
                        drawImageIfValid(context, tiles[curTile], (x * tileSize) - game.offsetX, (y * tileSize) - game.offsetY, tileSize, tileSize);

                        // only update the minimap if the tile changed
                        if (oldWorld[x][y] != curTile) {
                            //Add to the minimap if tile has changed
                            var colour;
                            if (curTile == 'grass') {
                                colour = '#006600';
                            } else if (curTile == 'entrance') {
                                colour = '#CC0000';
                            } else if (curTile == 'water') {
                                colour = '#0000FF';
                            } else if (curTile == 'rock') {
                                colour = '#000000';
                            } else {
                                colour = '#CCCC33';
                            }
                            minimap.updateMap(x, y, colour);
                        }

                        oldWorld[x][y] = curTile;
                    }
                }
            }

            // check if the highlight should be drawn
            if (highlightX != lastHighlightX || highlightY != lastHighlightY || redrawAll) {
                // update last highlight coords
                lastHighlightX = highlightX;
                lastHighlightY = highlightY;

                context.strokeStyle = '#ff0'; // yellow
                context.lineWidth = 4;
                context.strokeRect(mouseX + 4, mouseY + 4, tileSize - 8, tileSize - 8);
            }

            //Minimap view hightlight
            minimap.setOffset(game.offsetX, game.offsetY);

            // set redraws to false
            redraw = false;
            redrawAll = false;
        }
    };

    /**
     * Run on tick
     * by moving the offsetX of our game
     */
    this.tickEvent = function() {

        if (!game.world.getLoaded()) {
            return;
        }

        var scrollSpeed = 5;
        var moveX = mouseMoveX + keyboardMoveX;
        var moveY = mouseMoveY + keyboardMoveY;

        //If moving left, else right
        if (moveX < 0 && game.offsetX >= scrollSpeed) {
            setOffset(game.offsetX - scrollSpeed, game.offsetY);
        } else if (moveX > 0 && game.offsetX <= ((game.world.getWidth() * tileSize) - window.innerWidth) - scrollSpeed) {
            setOffset(game.offsetX + scrollSpeed, game.offsetY);
        }
        //If moving up, else down
        if (moveY < 0 && game.offsetY >= scrollSpeed) {
            setOffset(game.offsetX, game.offsetY - scrollSpeed);
        } else if (moveY > 0 && game.offsetY <= ((game.world.getHeight() * tileSize) - window.innerHeight) - scrollSpeed) {
            setOffset(game.offsetX, game.offsetY + scrollSpeed);
        }
    };

    /**
     * Clear the client's world.
     */
    this.clearEvent = function() {
        game.world.clearWorld();
    };

};
