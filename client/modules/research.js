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

    var currentResearch = 'None';
    var currentProgress = 0;
    var requiredProgress = 0;
    var researchTree = null;
    var researchComplete = false;
    var researching = false;

    var ui = require('lib/UiElements.js');
    var label = new ui.Label(20, 10, 'Research');
    //game.sideBar.addElement('research', label);

    /**
     * The sets the balance sent to us from the server!
     * @param {object} data The money data.
     */
    this.setEvent = function(data) {
        researchTree = data.tree;
        currentResearch = data.current;
        label.setText('Research: None');
    };

    /**
     * request a world redownload.
     */
    this.redownloadEvent = function() {
        game.server.send('research', 'redownload', {});
    };

    game.container.addListener('keypress', function(e) {
        if (String.fromCharCode(e) == 'r') { //r button
            game.server.send('research', 'start', 'Improved Beer');
        }
    });

    /**
     * Start a research event as confirmed by server
     * @param {object} message - message from server.
     */
    this.startEvent = function(message) {
        currentResearch = message.name;
        requiredProgress = message.ticks;
        currentProgress = message.current;
        researching = true;
    };

    /**
     * A research has completed as confirmed by server
     * @param {object} message - message from server.
     */
    this.completeEvent = function(message) {
        var index = message.i;

        currentProgress = requiredProgress;
        researchTree[index].complete = true;
        researchComplete = true;
        researching = false;
    };

    this.tickEvent = function() {
        if (researchTree != null && researching) {
            if (currentProgress < requiredProgress)
                currentProgress += 0.092; //Hacky - 0.1 is slightly too fast.
        }
    };
};
