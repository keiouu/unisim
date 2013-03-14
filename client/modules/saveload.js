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

    var ui = require('../ui/saveload.js');
    var uiElem = require('../lib/UiElements.js');
    var saveloadui = null;

    var savebutton = new uiElem.Button(40, 20, 'Save');
    savebutton.addListener('mouseup', function(e) {
        if (saveloadui != null && saveloadui.isVisible()) {
            saveloadui.close();
        } else {
            makeUI('Save');
            game.server.send('saveload', 'getsaves', 'New save');
            saveloadui.saveListen();
        }
    });

    var loadbutton = new uiElem.Button(40, 20, 'Load');
    loadbutton.addListener('mouseup', function(e) {
        if (saveloadui != null && saveloadui.isVisible()) {
            saveloadui.setVisible(false);
        } else {
            makeUI('Load');
            game.server.send('saveload', 'getsaves', null);
            saveloadui.loadListen();
        }
    });

    game.container.addElement('loadButton', loadbutton, 450, 10);
    game.container.addElement('saveButton', savebutton, 400, 10);

    var makeUI = function(title) {
        saveloadui = new ui.Saveload(game, title);
        game.container.addElement('saveload', saveloadui, (game.container.getWidth() / 2) - 125, 200);
        saveloadui.setVisible(true);
    };

    /**
     * Gives the UI its list of saves from the server.
     * @param {Object} saves List of save names to choose from.
     */
    this.savelistEvent = function(saves) {
        saveloadui.setSaves(saves);
    };

};
