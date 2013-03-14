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

exports.saveload = function(game) {

    'use strict';

    //Flag for recording at intervals or not.
    var record = true;

    //Vars for counting frames and limit on when to save
    var frameLimit = 719;
    var tick = 0;

    var modules = {};
    for (var key in game) {
        modules[key] = [];
    }

    /**
     * Sends a list of savegames to the client requesting them.
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     */
    game.server.on('saveload', 'getsaves', function(message, client) {
        var saves = game.saveload.getSaves();
        if (message != null) {   // Add new save slot option for save menu
            saves.push(message);
        }
        client.send('saveload', 'savelist', saves);
    });

    /**
     * The tick function. If record flag is set to true, then automatically
     * takes a snapshot every given number of frames.
     */
    game.scheduler.on('tick', function(data) {
        tick++;
        if (tick > frameLimit) {
            for (var key in game) {
                if (typeof(game[key].toJson) != 'undefined') {    //Confirms this is a "saveable" module
                    modules[key][0] = game[key].toJson();
                }
            }
            tick = 0;
        }
    });
};
