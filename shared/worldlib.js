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

exports.World = function() {

    //World Information
    var entranceX = 20, entranceY = 0;
    var tileSize = 30;
    var width = 100;
    var height = 100;

    //Set up the world 2D array
    var loaded = false;
    var world = [];

    var cb = require('./callback.js');
    var callbacks = new cb.CallbackManager();

    //tile types / costs
    var tileMetadata = {
        door: {cost: 10, build: false},
        floor: {cost: 10, build: false},
        rock: {cost: -1, build: false},
        grass: {cost: 10, build: true},
        water: {cost: -1, build: false},
        entrance: {cost: 5, build: false}, //actor entrance
        path: {cost: 1, build: false}, //below: Chairs may only be approached & left from the north or south.
        chair: {cost: 10, build: false, entrances: [
            {x: 0, y: -1},
            {x: 0, y: 1}
        ], exits: [
            {x: 0, y: -1},
            {x: 0, y: 1}
        ], collisions: false},
        lecturn: {cost: 10, build: false, entrances: [
            {x: 0, y: -1},
            {x: 0, y: 1}
        ], exits: [
            {x: 0, y: -1},
            {x: 0, y: 1}
        ]},
        bed: {cost: 10, build: false, entrances: [
            {x: -1, y: 0},
            {x: 1, y: 0}
        ], exits: [
            {x: -1, y: 0},
            {x: 1, y: 0}
        ], targetonly: true},
        sofa: {cost: 10, build: false, entrances: [
            {x: -1, y: 0},
            {x: 1, y: 0}
        ], exits: [
            {x: -1, y: 0},
            {x: 1, y: 0}
        ], targetonly: true},
        barStool: {cost: 10, build: false, entrances: [
            {x: -1, y: 0},
            {x: 1, y: 0},
            {x: 0, y: 1},
            {x: -1, y: 1},
            {x: 1, y: 1}
        ], exits: [
            {x: -1, y: 0},
            {x: 1, y: 0},
            {x: 0, y: 1},
            {x: -1, y: 1},
            {x: 1, y: 1}
        ], targetonly: true}
    };


    //Note! Entrances are where you can enter *FROM* relative to this tile
    //Exits are where you can exit *TO* relative to this tile.
    //as such tiles that can be entered / exited from one dir
    //will have the same entrances and exits.

    //we need our co-ordinate library
    var coords = require('./coordinates.js');

    //add directional wall pieces. North entrances are the templace entrances & exits for a north facing wall.
    //we then manipulate these entrances, flipping them for south, rotating for west, flipping & rotating for east.
    var northEntrances = [
        {x: 0, y: -1},
        {x: 1, y: 0},
        {x: -1, y: 0},
        {x: 1, y: -1},
        {x: -1, y: -1}
    ];

    //inherit costs & buildability from the floor
    tileMetadata.wallNorth = {cost: 10, build: false};
    tileMetadata.wallNorth.entrances = northEntrances;
    tileMetadata.wallNorth.exits = northEntrances;

    //south is the same as north but flipped
    tileMetadata.wallSouth = JSON.parse(JSON.stringify(tileMetadata.wallNorth));
    tileMetadata.wallSouth.entrances = coords.invertValues(tileMetadata.wallNorth.entrances);
    tileMetadata.wallSouth.exits = tileMetadata.wallSouth.entrances;

    //east requires us to flip the axes around
    tileMetadata.wallEast = JSON.parse(JSON.stringify(tileMetadata.wallNorth));
    tileMetadata.wallEast.entrances = coords.invertAxes(tileMetadata.wallNorth.entrances);
    tileMetadata.wallEast.exits = coords.invertAxes(tileMetadata.wallNorth.exits);

    //then west is just east, but inverted.
    tileMetadata.wallWest = JSON.parse(JSON.stringify(tileMetadata.wallEast));
    tileMetadata.wallWest.entrances = coords.invertValues(tileMetadata.wallEast.entrances);
    tileMetadata.wallWest.exits = tileMetadata.wallWest.entrances;

    //add corner pieces to building walls, which allow entrances & exits from sw, nw, w, n and s (for top left)
    var cornerEntrances = [
        {x: -1, y: -1},
        {x: -1, y: 0},
        {x: -1, y: 1},
        {x: 0, y: -1},
        {x: 0, y: 1},
        {x: 1, y: 0}
    ];

    //top left corner piece.
    tileMetadata.cornerTl = {cost: 10, build: false};
    tileMetadata.cornerTl.entrances = cornerEntrances;
    tileMetadata.cornerTl.exits = cornerEntrances;

    //like with walls, the top right is the top left, but flipped.
    tileMetadata.cornerTr = JSON.parse(JSON.stringify(tileMetadata.cornerTl));
    tileMetadata.cornerTr.entrances = coords.invertValues(tileMetadata.cornerTl.entrances, true, false);
    tileMetadata.cornerTr.exits = tileMetadata.cornerTr.entrances;

    tileMetadata.cornerBl = JSON.parse(JSON.stringify(tileMetadata.cornerTl));
    tileMetadata.cornerBl.entrances = coords.invertValues(tileMetadata.cornerTl.entrances, false, true);
    tileMetadata.cornerBl.exits = tileMetadata.cornerBl.entrances;

    tileMetadata.cornerBr = JSON.parse(JSON.stringify(tileMetadata.cornerBl));
    tileMetadata.cornerBr.entrances =  coords.invertValues(tileMetadata.cornerTr.entrances, false, true);
    tileMetadata.cornerBr.exits = tileMetadata.cornerBr.entrances;

    //create a blank world array
    for (var i = 0; i < width; i++) {
        world[i] = [];
        for (var j = 0; j < height; j++) {
            world[i][j] = {type: 'grass', reserved: false};
        }
    }

    //set the entrance in our world
    world[entranceX][entranceY].type = 'entrance';

    /**
     * Set an item of tile metadata.
     * @param {number} x The tile X.
     * @param {number} y The tile Y.
     * @param {string} key The metadata key.
     * @param {object} value The metadata value.
     */
    this.setMetadata = function(x, y, key, value) {
        if (key != 'type') {
            world[x][y][key] = value;
        }
    };

    /**
     * Get tile metadata.
     * @param {number} x the X co-ordinate.
     * @param {number} y the Y co-ordinate.
     * @param {string} key The metadata key.
     * @return {object} The metadata value.
     */
    this.getMetadata = function(x, y, key) {
        return world[x][y][key];
    };

    /**
     * Get a tile of the game world at given x , y.
     * @param {number} x - horizontal cordinate of the cell to fetch.
     * @param {number} y - vertical cordinate of the cell to fetch.
     * @return {string} the tile at the given x , y.
     */
    this.tile = function(x, y) {
        return world[x][y].type;
    };

    /**
     * Returns if the world has been loaded.
     * @return {boolean} loaded variable.
     */
    this.getLoaded = function() {
        return loaded;
    };

    /**
     * Get the width of the game world.
     * @return {number} the width of the game world.
     */
    this.getWidth = function() {
        return width;
    };

    /**
     * Get the height of the game world.
     * @return {number} the height of the game world.
     */
    this.getHeight = function() {
        return height;
    };

    /**
     * Get the entrance X of the game world
     * @return {number} the X coordinate of the entrance to the game world.
     */
    this.getEntranceX = function() {
        return entranceX;
    };

    /**
     * Get the entrance Y of the game world
     * @return {number} the Y coordinate of the entrance to the game world.
     */
    this.getEntranceY = function() {
        return entranceY;
    };

    /**
     * Get the tile size.
     * @return {Number} The tile size.
     */
    this.getTileSize = function() {
        return tileSize;
    };

    /**
     * Count the number of tiles of a type in an area.
     * @param {Number} x1 The first X Co-ordinate.
     * @param {Number} y1 The first Y Co-ordinate.
     * @param {Number} x2 The second X Co-ordinate.
     * @param {Number} y2 The second Y Co-ordinate.
     * @param {String} tile The type to count.
     * @return {Number} The number of tiles.
     */
    this.countTilesArea = function(x1, y1, x2, y2, tile) {
        var count = 0;
        for (var i = x1; i <= x2; i++) {
            for (var j = y1; j <= y2 - 1; j++) {
                if (world[i][j].type == tile) {
                    count++;
                }
            }
        }
        return count;
    };

    /**
     * Get the X & Y positions of all tiles of a given type within an area.
     * @param {number} x Where on the X axis to begin looking.
     * @param {number} y Where on the Y axis to begin looking.
     * @param {number} width The number of tiles to check along X.
     * @param {number} height The number of tiles to check along Y.
     * @param {string} type The tile type to find co-ords of.
     * @param {object=} filter metadata key/values that tiles must have.
     */
    this.getTilesByTypeInArea = function(x, y, width, height, type, filter) {
        var returnArray = [];

        if (typeof filter == 'undefined') {
            filter = {};
        }

        for (var ix = x; ix < x + width; ix++) {
            for (var iy = y; iy < y + height; iy++) {
                if (world[ix][iy].type == type) {

                    //should we add this tile?
                    var add = true;

                    //iterate through filters
                    for (var key in filter) {

                        //skip adding this tile if it doesn't match the metadata filter.
                        if (filter.hasOwnProperty(key) && (!world[ix][iy].hasOwnProperty(key)  || world[ix][iy][key] != filter[key])) {
                            add = false;
                            break;
                        }
                    }

                    if (add) {
                        returnArray.push({x: ix, y: iy});
                    }
                }
            }
        }
        return returnArray;
    };

    /**
     * Set a tile at a specific position
     * @param {Number} x - horizontal co-ordinate of the cell to fetch.
     * @param {Number} y - vertical co-ordinate of the cell to fetch.
     * @param {String} tile - The type of tile to change to.
     */
    this.setTile = function(x, y, tile) {
        callbacks.fire('changed', {x: x, y: y, type: tile});
        world[x][y].type = tile;
    };

    /**
     * Set the weight of a given tile.
     * @param {number} x The X co-ordinate.
     * @param {number} y The Y co-ordinate.
     * @param {number} weight The new tile weight.
     */
    this.setTileWeight = function(x, y, weight) {
        world[x][y].cost = weight;
    };

    /**
     * Replace all the tiles in a given area.
     * @param {Number} x1 The first X Co-ordinate.
     * @param {Number} y1 The first Y Co-ordinate.
     * @param {Number} x2 The second X Co-ordinate.
     * @param {Number} y2 The second Y Co-ordinate.
     * @param {String} tile1 The tile to go from.
     * @param {String} tile2 The tile to go to.
     */
    this.replaceTilesArea = function(x1, y1, x2, y2, tile1, tile2) {
        for (var i = x1; i <= x2; i++) {
            for (var j = y1; j <= y2 - 1; j++) {
                if (world[i][j].type == tile1) {
                    world[i][j].type = tile2;
                    callbacks.fire('changed', {x: i, y: j, type: tile2});
                }
            }
        }
    };

    /**
     * Register a callback to fire when tiles are changed.
     * @param {function} callback The callback to fire.
     */
    this.onTileChanged = function(callback) {
        callbacks.on('changed', callback);
    };

    /**
     * Get our nav matrix
     * @return {Array} The 2D array of tile costs.
     */
    this.getNavMatrix = function() {
        var navMatrix = [];
        for (var x = 0; x < width; x++) {
            navMatrix.push([]); //2d array
            for (var y = 0; y < height; y++) {
                navMatrix[x][y] = {cost: tileMetadata[world[x][y].type].cost};
                if (tileMetadata[world[x][y].type].hasOwnProperty('exits')) {
                    navMatrix[x][y].exits = tileMetadata[world[x][y].type].exits;
                }
                if (tileMetadata[world[x][y].type].hasOwnProperty('entrances')) {
                    navMatrix[x][y].entrances = tileMetadata[world[x][y].type].entrances;
                }
                if (tileMetadata[world[x][y].type].hasOwnProperty('targetonly')) {
                    navMatrix[x][y].targetonly = tileMetadata[world[x][y].type].targetonly;
                }

            }
        }
        return navMatrix;
    };

    /**
     * Get whether the given tile has collision.
     * @param {number} x The x co-ordinate.
     * @param {number} y The y co-ordinate.
     */
    this.tileHasCollision = function(x, y) {
        return tileMetadata[world[x][y].type].hasOwnProperty('collisions') ? tileMetadata[world[x][y].type].collisions : true;
    };

    /**
     * Convert the world to be transfered across the network.
     * @return {object} A serialized world object.
     */
    this.toJson = function() {
        return {world: world, width: width, height: height, tileSize: tileSize};
    };

    /**
     * Convert the world from network data to world object.
     * @param {object} data - A serialized world object.
     */
    this.fromJson = function(data) {
        world = data.world;
        width = data.width;
        height = data.height;
        tileSize = data.tileSize;
        loaded = true;
    };

    /**
     * Returns true if the specified
     * region contains terrain that cannot be built on.
     * @param {Number} tlx Top left x.
     * @param {Number} brx Bottom right x.
     * @param {Number} tly Top left y.
     * @param {Number} bry Bottom right y.
     * @return {Boolean} false if terrain in region can't be built on.
     */
    this.canBuildInRegion = function(tlx, brx, tly, bry) {

        //we're outside of the world? If so, lets suggest not to build there
        if (tlx < 0 || brx >= width || tly < 0 || bry >= height) {
            return false;
        }

        //actually do the check then.
        for (var i = tlx; i < brx; i++) {
            for (var j = tly; j < bry; j++) {
                if (!tileMetadata[world[i][j].type].build) {
                    return false;
                }
            }
        }
        return true;
    };

    /**
     * Clear the world's contents
     */
    this.clearWorld = function() {
        world = [];
        loaded = false;
    };

};
