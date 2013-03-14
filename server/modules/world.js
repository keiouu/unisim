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

    //cache world width and height
    var width = game.world.getWidth();
    var height = game.world.getHeight();

    //list of tile changes
    var tileChanges = [];

    //Fill world with grass or water
    for (var x = 5; x < width - 5; x++) {
        for (var y = 5; y < height - 5; y++) {
            if (Math.random() < 0.3) {
                game.world.setTile(x, y, 'water');
            }
        }
    }

    // add more water tiles
    for (x = width; x > 0; x--) {
        for (y = height; y > 0; y--) {
            if (x + 1 < width && y + 1 < height && game.world.tile(x, y + 1) == 'water' && game.world.tile(x + 1, y) == 'water' && Math.random() > 0.5) {
                game.world.setTile(x, y, 'water'); //chance of water next to existing water tiles
            }
        }
    }

    // fill in the blanks
    for (var clear = 0; clear < 2; clear++) {
        for (x = 0; x < width - 4; x++) {
            for (y = 0; y < height - 4; y++) {
                if (game.world.countTilesArea(x, y, x + 3, y + 3, 'water') > 7) {
                    game.world.setTile(x, y, 'water');
                }
            }
        }
    }

    // clear lonely water tiles
    for (clear = 0; clear < 20; clear++) {
        for (x = 0; x < width - 4; x++) {
            for (y = 0; y < height - 4; y++) {

                // this must not be greater than 5
                if (game.world.countTilesArea(x, y, x + 3, y + 3, 'water') < 5) {
                    game.world.replaceTilesArea(x + 1, y + 1, x + 2, y + 2, 'water', 'grass');
                }
            }
        }
    }

    // clear lonely water tiles bottom right to top left
    for (clear = 0; clear < 20; clear++) {
        for (x = width - 1; x > 4; x--) {
            for (y = height - 1; y > 4; y--) {

                // this must not be greater than 5
                if (game.world.countTilesArea(x - 3, y - 3, x, y, 'water') < 5) {
                    game.world.replaceTilesArea(x - 1, y - 1, x - 2, y - 2, 'water', 'grass');
                }
            }
        }
    }

    var borderWidth = 7;

    /*
     // build a border around the edge of the world
     for (x = 0; x < width; x++) {
     for (y = 0; y < height; y++) {
     // left and right
     if (x < borderWidth || x > (width - borderWidth)) {
     game.world.setTile(x, y, 'rock');
     }
     // top and bottom
     if (y < borderWidth || y > (height - borderWidth)) {
     game.world.setTile(x, y, 'rock');
     }
     }
     }
     */

    //import our furnisher module that furnishes buildings
    var furnisher = require('../lib/furnisher.js');

    /**
     * Handle creating world tiles around buildings
     * so they can be seen in the world.
     */
    game.buildings.buildingAdded(function(building) {

        //grab the building location and the size of our tiles
        var tileSize = game.world.getTileSize();

        //express the building location in terms of tiles, to draw in the building
        var tl = {x: Math.floor(building.getX() / tileSize), y: Math.floor(building.getY() / tileSize)};
        var br = {x: Math.floor((building.getX() + building.getWidth()) / tileSize), y: Math.floor((building.getY() + building.getHeight()) / tileSize)};

        //now set the tiles
        for (x = tl.x; x < br.x; x++) {
            for (var y = tl.y; y < br.y; y++) {

                //set walls for the outside of the building, otherwise set the floor
                var type = null;

                //east, west walls
                if (x == tl.x) {
                    type = 'wallEast';
                } else if (x == br.x - 1) {
                    type = 'wallWest';
                }

                //north, south walls
                if (y == br.y - 1) {
                    type = 'wallSouth';
                } else if (y == tl.y) {
                    type = 'wallNorth';
                }

                //corner pieces
                if (x == tl.x && y == tl.y) {
                    type = 'cornerTl';
                } else if (x == br.x - 1 && y == tl.y) {
                    type = 'cornerTr';
                } else if (x == tl.x && y == br.y - 1) {
                    type = 'cornerBl';
                } else if (x == br.x - 1 && y == br.y - 1) {
                    type = 'cornerBr';
                }

                //override the wall setting to add in a door on the bottom
                if (x == tl.x + Math.floor((br.x - tl.x) / 4) && y == br.y - 1) {
                    type = 'door';
                }

                //grab interior tiles / furnishings to place from the furnisher obj
                var furnishFunction = 'furnish'+building.getType();

                if (!type && furnisher.hasOwnProperty(furnishFunction)) {
                    type = furnisher[furnishFunction](x, y, {x: tl.x + 1, y: tl.y + 1}, {x: br.x - 2, y: br.y - 2});
                } else if (!type) {
                    type = 'floor';
                }

                //save our changes
                game.world.setTile(x, y, type);
            }
        }

        //Determine new capacity if needed:
        if (building.getType() == 'Academic') {
            building.setCapacity(game.world.getTilesByTypeInArea(tl.x, tl.y, building.getWidth() / tileSize, building.getHeight() / tileSize, 'chair').length);
        } else if (building.getType() == 'Accommodation') {
            building.setCapacity(game.world.getTilesByTypeInArea(tl.x, tl.y, building.getWidth() / tileSize, building.getHeight() / tileSize, 'bed').length);
        } else if (building.getType() == 'Staff') {
            building.setCapacity(game.world.getTilesByTypeInArea(tl.x, tl.y, building.getWidth() / tileSize, building.getHeight() / tileSize, 'sofa').length);
        }

    });

    /**
     * Send the world to the client when they connect
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     *
     */
    game.server.on('world', 'connect', function(message, client) {
        client.send('world', 'create', game.world.toJson());
    });

    /**
     * Called when the client is lagging behind,
     * to allow it to redownload the entire world
     * @param {object} message The message.
     * @param {object} client The client.
     */
    game.server.on('world', 'redownload', function(message, client) {
        client.send('world', 'resend', game.world.toJson());
    });

    /**
     * Event to handle updates to tiles from the client
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     */
    game.server.on('world', 'update', function(message, client) {
        // only update tile server-side if the client has the correct tile
        if (game.world.tile(message.pos.x, message.pos.y) == message.tile.from) {
            game.world.setTile(message.pos.x, message.pos.y, message.tile.to);
        }
    });

    /**
     * Make a note of tile changes,
     * to push to the client each tick.
     */
    game.world.onTileChanged(function(data) {
        tileChanges.push(data);
    });

    /**
     * Called every cycle. Push any tile changes
     * over to the client.
     */
    game.scheduler.on('tick', function() {
        if (tileChanges.length > 0) {
            game.server.broadcast('world', 'update', tileChanges);
            tileChanges = [];
        }
    });

    /**
     * Save the world module's contents to file.
     * @param {object} msg The msg from the client.
     * @param {object} client The client. To be ignored for this function.
     */
    game.server.on('world', 'save', function(msg, client) {
        var json = game.world.toJson();
        game.saveload.save('world', msg.savename, json);
    });

    /**
     * Load the world module's contents from file.
     * @param {object} msg The msg from the client.
     * @param {object} client The client. To be ignored for this function.
     */
    game.server.on('world', 'load', function(msg, client) {
        var json = game.saveload.load('world', msg.savename);
        client.send('world', 'clear');
        game.world.fromJson(json);
        client.send('world', 'redownload');
    });
};
