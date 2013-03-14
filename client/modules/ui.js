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

exports.ui = function(game) {

    //keep track of any elements we've made invisible
    var elemsMadeInvisible = [];

    /**
     * Display an error to the client
     * @param {object} data The error to display.
     */
    this.errorEvent = function(data) {
        var uiElems = require('lib/UiElements.js');
        // create an error message box in the centre of the screen
        var errorBox = new uiElems.ErrorBox(data, null);
        game.container.addElement('errorbox', errorBox, 0, 0, 1000);
        // horrible code to recenter
        game.container.positionChild('errorbox', (window.innerWidth / 2) - (errorBox.getWidth() / 2), (window.innerHeight / 2) - (errorBox.getHeight() / 2));
    };

    /**
     * Listen for changes to key events
     */
    game.container.addListener('keypress', function(e) {
        var i = 0; //prevent dupe declaration
        if (String.fromCharCode(e) == 'u') {
            if (elemsMadeInvisible.length > 0) {
                for (i = 0; i < elemsMadeInvisible.length; i++) {
                    elemsMadeInvisible[i].setVisible(true);
                }
                elemsMadeInvisible = [];
            } else {
                var children = game.container.getChildren();
                for (i = 0; i < children.length; i++) {
                    var childElement = game.container.getChild(children[i]);
                    if (childElement.isVisible()) {
                        childElement.setVisible(false);
                        elemsMadeInvisible.push(childElement);
                    }
                }
            }
        }
    });
};
