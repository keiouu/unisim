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

exports.research = function(game) {

    var lib = require('../lib/researchlib.js');

    var currentTicks = 0; //Number of ticks we are at
    var requiredTicks = 0; //Number of ticks until research is complete.
    var currentResearch = '';
    var currentIndex = null;

    //add an initial building blueprint for the player to 'ave a go at placing.
    game.research.addResearch(new lib.Research('Improved Beer', 100, null, function() {
        console.log('Nicer Imported Beer Purchased');
    }));

    /**
     * Called when the client connects,
     * send them the server research.
     * @param {object} msg The msg from the client.
     * @param {object} client The client.
     */
    game.server.on('research', 'connect', function(msg, client) {
        client.send('research', 'set', {tree: game.research.serialize(), current: currentResearch});
    });

    /**
     * Request a redownload of the research
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     */
    game.server.on('research', 'redownload', function(message, client) {
        client.send('research', 'set', {tree: game.research.serialize(), current: currentResearch});
    });

    /**
     * Request to start researching a research.
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     */
    game.server.on('research', 'start', function(message, client) {
        if (researchRequest(message)) {
            client.send('research', 'start', serializeCurrent());
        }
    });

    game.research.onResearchCompleted(function() {
        //Perform the research method
        requiredTicks = 0;
        currentTicks = 0;
        currentResearch = '';

        game.research.getResearchTree()[currentIndex].researchMethod();
        game.server.broadcast('research', 'complete', {i: currentIndex});
        currentIndex = null;

    });

    /**
     * Called every tick by the client game loop.
     * Increments the progress of research every few ticks.
     */
    var updateResearch = function() {

        //No current research
        if (requiredTicks == 0) {
            return;
        }

        currentTicks++;
        if (currentTicks >= requiredTicks) {
            //Research is complete
            game.research.completeResearch(currentIndex);
        }
    };

    /**
     * A request from a user to start a research
     * @param {string} name - name of the research.
     * @return {boolean} if research has started.
     */
    var researchRequest = function(name) {

        //If Currently researching
        if (currentResearch != '') {
            console.log('Cannot start Research: ' + name + ' - Already Researching!');
            return false;
        }

        var index = game.research.getIndexByName(name);
        if (index == -1) {
            console.log('No Research by name: ' + name);
            return false;
        }

        if (game.research.getResearchTree()[index].complete == true) {
            console.log('Research aleady complete: ' + name);
            return false;
        }

        currentResearch = name;
        requiredTicks = game.research.getResearchTree()[index].getDuration();
        currentIndex = index;
        return true;

    };

    /**
     * Convert just the information required to start a research task.
     * @return {object} A serialized research task.
     */
    var serializeCurrent = function() {
        return {name: currentResearch, ticks: requiredTicks, current: currentTicks};
    };

    /**
     * Called by the server each loop iteration
     */
    game.scheduler.on('tick', function() {
        updateResearch();
    });

    /**
     * Saves research module.
     */
    game.server.on('research', 'save', function(message, client) {
        var json = game.research.serialize();
        game.saveload.save('research', message.savename, json);
    });

    /**
     * Load the research module's contents from file.
     * @param {object} msg The msg from the client.
     * @param {object} client The client.
     */
    game.server.on('research', 'load', function(msg, client) {
        //fromJson function for research needs to be looked in to, like storing func and stuff.
        //
        //var json = game.saveload.load('research', msg.savename);
        //game.research.setTime(json.hour, json.min);
        //client.send('research', 'redownload');
    });

};
