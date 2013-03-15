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

exports.building = function(game) {

    //add blueprints that are available from the start.
    game.buildings.addBlueprint('Bag Ette', 100, 'Food', 30);
    game.buildings.addBlueprint('Mocha Shop', 300, 'Food', 30);
    game.buildings.addBlueprint('Fine Restaurant', 900, 'Food', 60);

    game.buildings.addBlueprint('Seminar Room', 30, 'Academic', 48);
    game.buildings.addBlueprint('Lecture Theatre', 10, 'Academic', 72);
    game.buildings.addBlueprint('Library', 40, 'Academic', 290);

    game.buildings.addBlueprint('Alcoholic Lager Bar', 150, 'Bar', 30);

    game.buildings.addBlueprint('Flat Flats', 50, 'Accommodation', 72);
    game.buildings.addBlueprint('Amazing Houses', 250, 'Accommodation', 30);

    game.buildings.addBlueprint('Staff Room', 50, 'Staff', 48);

    game.buildings.addBlueprint('Games Room', 450, 'Recreational', 30);
    game.buildings.addBlueprint('Student Area', 10, 'Recreational', 30);

    /**
     * Listen to our building repository
     * and fire messages to the client when
     * new buildings are created from anywhere
     */
    game.buildings.buildingAdded(function() {
        game.server.broadcast('building', 'add', game.buildings.lastBuildingToJson());
        game.time.addTimeTabledBuilding(game.buildings.getLastAdded());
    });

    /**
     * Called when the client connects,send them a list of buildings
     * @param {object} msg The msg from the client.
     * @param {object} client The client.
     */
    game.server.on('building', 'connect', function(msg, client) {
        client.send('building', 'update', game.buildings.toJson());
    });

    /**
     * Called when the client changes the subtype of a building.
     * @param {object} msg The msg from the client.
     * @param {object} client The client.
     */
    game.server.on('building', 'subtype', function(msg, client) {
        var building = game.buildings.getBuildingAtLocation(msg.x, msg.y);

        building.setSubType(msg.subtype);
    });

    /**
     * Update the building repository from the server.
     * @param {object} msg The msg from the client.
     * @param {object} client The client.
     */
    game.server.on('building', 'create', function(msg, client) {

        var ntl = {}, nbr = {};

        //ensure tl is top left, br is bottom right
        ntl.x = msg.tl.x < msg.br.x ? msg.tl.x : msg.br.x;
        ntl.y = msg.tl.y < msg.br.y ? msg.tl.y : msg.br.y;
        nbr.x = msg.tl.x > msg.br.x ? msg.tl.x : msg.br.x;
        nbr.y = msg.tl.y > msg.br.y ? msg.tl.y : msg.br.y;

        var width = nbr.x - ntl.x;
        var height = nbr.y - ntl.y;

        var widthInTiles = width / game.world.getTileSize();
        var heightInTiles = height / game.world.getTileSize();

        var ts = game.world.getTileSize();
        var cost = game.buildings.getBlueprint(msg.id).getCost() * ((width / ts) * (height / ts));
        var cap = Math.floor((heightInTiles - 3) * (widthInTiles - 2));

        if (game.world.canBuildInRegion(ntl.x / ts, nbr.x / ts, ntl.y / ts, nbr.y / ts)) {
            if (!game.actors.hasActorsInRegion(ntl, nbr)) {
                if (game.money.getBalance() > cost) {
                    try {
                        game.buildings.addBuilding(msg.id, ntl.x, ntl.y, width, height, widthInTiles, heightInTiles, cap);
                        game.money.spend(cost);
                    } catch (e) {
                        //send an error back
                        client.send('ui', 'error', e.message);
                    }
                } else {
                    client.send('ui', 'error', 'You do not have enough money');
                }
            } else {
                client.send('ui', 'error', 'Buildings cannot be placed on actors');
            }
        } else {
            client.send('ui', 'error', 'These tiles cannot be built on');
        }
    });

    /**
     * Request a redownload of buildings.
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     */
    game.server.on('building', 'redownload', function(message, client) {
        client.send('building', 'create', game.buildings.toJson());
    });

    /**
     * Save the building module's contents to file.
     * @param {object} msg The msg from the client.
     * @param {object} client The client. To be ignored for this function.
     */
    game.server.on('building', 'save', function(msg, client) {
        var json = game.buildings.toJson();
        game.saveload.save('building', msg.savename, json);
    });

    /**
     * Load the building module's contents from file.
     * @param {object} msg The msg from the client.
     * @param {object} client The client. To be ignored for this function.
     */
    game.server.on('building', 'load', function(msg, client) {
        var json = game.saveload.load('building', msg.savename);
        client.send('building', 'clear');
        game.buildings.fromJson(json);
        client.send('building', 'redownload');
    });
};
