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

var basicElements = require('../lib/UiElements.js');

/**
 * Minimap UI element
 * @param {Number} width Game world width.
 * @param {Number} height Game world height.
 * @param {Number} worldTileSize Game display's tile size.
 * @param {Number} minimapDim The size N of the minimap square size in pixels.
 * @param {Object} myWorld The client world object that owns this minimap.
 * @constructor
 */
exports.Minimap = function(width, height, worldTileSize, minimapDim, myWorld) {

    var miniMapTileSize = minimapDim / width;
    var tileSize = worldTileSize;

    var worldWidth = width;
    var worldHeight = height;
    var minimapHeight = worldHeight * miniMapTileSize;

    var world = myWorld;

    //Offset of game world
    var offsetX = 0;
    var offsetY = 0;

    //Setup our buffered canvas
    var mapCtx;
    mapCtx = document.createElement('canvas').getContext('2d');
    mapCtx.canvas.width = worldWidth * miniMapTileSize;
    mapCtx.canvas.height = minimapHeight;

    //Moves the minimap view if true
    var move = false;

    // Call parent constructor
    basicElements.Label.call(this, miniMapTileSize * worldWidth, miniMapTileSize * worldHeight, '');

    /**
     * Updates the buffered canvas to reflect the world
     * @param {Number} x The x coordinate to change.
     * @param {Number} y The y coordinate to change.
     * @param {String} colour The colour to change this coordinate to.
     * @this {Minimap}
     */
    this.updateMap = function(x, y, colour) {
        mapCtx.fillStyle = colour;
        mapCtx.fillRect(x * miniMapTileSize, y * miniMapTileSize,
            miniMapTileSize,
            miniMapTileSize);
        this.setRedraw(true);
    };

    /**
     * Moves the minimap depending on the mouse x and y coords on the map and relative to the game
     * world, returning the new offset X and Y.
     * @param {object} e The mouse event info.
     * @return {object} The offset object containing new x and y offsets.
     */
    this.move = function(e) {
        var x = e.x / miniMapTileSize;
        var y = e.y / miniMapTileSize;

        //Width and height of minimap view in tiles
        var mapWidth = (ctx.canvas.width / tileSize);
        var mapHeight = (ctx.canvas.height / tileSize);

        x = Math.floor(x - (mapWidth / 2));
        y = Math.floor(y - (mapHeight / 2));
        if (x < 0) {
            x = 0;
        }
        else if (x > width - mapWidth) {
            x = width - mapWidth;
        }
        if (y < 0) {
            y = 0;
        }
        else if (y > height - mapHeight) {
            y = height - mapHeight;
        }

        return {x: x * tileSize, y: y * tileSize};
    };

    /**
     * Listener event for mouse down on the minimap. Zooms view to where the
     * user clicks.
     */
    this.addListener('mouseup', function(e) {
        move = false;
    });

    /**
     * Sets the minimap move variable to be true or false
     * @param {boolean} newMove The true of false boolean to set movement to.
     */
    this.setMove = function(newMove) {
        move = newMove;
    };

    /**
     * Gets the minimap move variable
     * @return {boolean} Minimap move variable.
     */
    this.getMove = function() {
        return move;
    };

    /**
     * Updates the current offset X and Y coordinates
     * @param {Number} x The new offset x coordinate.
     * @param {Number} y The new offset y coordinate.
     * @this {Minimap}
     */
    this.setOffset = function(x, y) {
        offsetX = x;
        offsetY = y;
        this.setRedraw(true);
    };

    /**
     * Over written draw function. Simply draws the buffered mapCtx to the
     * supplied ctx, and draws the rectangle highlight over where the player is
     * current viewing.
     * @param {object} ctx The canvas context to be drawn to.
     */
    this.draw = function(ctx) {
        //Draw our buffered minimap canvas onto our view
        ctx.drawImage(mapCtx.canvas, 0, 0);

        //Minimap view hightlight
        ctx.strokeStyle = '#ff0'; // yellow
        ctx.lineWidth = 1;
        var minimapY = ctx.canvas.height - minimapHeight;
        var highlightX = (Math.floor(offsetX / tileSize) * miniMapTileSize) + 1;
        var highlightY = (Math.floor(offsetY / tileSize) * miniMapTileSize) + 1;
        ctx.strokeRect(highlightX, highlightY, Math.floor((ctx.canvas.width / tileSize) * miniMapTileSize) - 2, Math.floor((ctx.canvas.height / tileSize) * miniMapTileSize) - 1);
    };

};
