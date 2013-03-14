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
 * The Save/Load UI to choose a slot (or make a new one) to save
 * to, or load up the previously saved slots.
 * @param {Object} game - reference to game objects.
 * @param {String} title - The title of the box, should be save or load.
 * @constructor
 */
exports.Saveload = function(game, title) {

    basicElements.Menu.call(this, 250, 60, title);

    var saves = [];
    var button = new basicElements.Button(40, 20, title);
    var list;   //List of saves
    var submenu; //Subsubmenu element for confirming/entering choices

    /**
     * Sets the listener for the save button.
     */
    this.saveListen = function() {
        button.addListener('mouseup', function(e, self) {
            var index = list.getSelectedIndex();
            if (index < saves.length - 1) {     //Ask to overwrite this slot, and do so if yes
                submenu = new basicElements.Menu(155, 60, 'Overwrite?');
                var yes = new basicElements.Button(70, 20, 'Yes');
                var no = new basicElements.Button(70, 20, 'No');
                yes.addListener('mouseup', function(e) {
                    game.server.send(null, 'save', {savename: saves[index]});
                    submenu.setVisible(false);
                });
                no.addListener('mouseup', function(e) {
                    submenu.setVisible(false);
                });
                submenu.addElement('yes', yes, 5, 30);
                submenu.addElement('no', no, 80, 30);
                game.container.addElement('confirmoverwrite', submenu, (game.container.getWidth() / 2) + 250 , 250);
            }
            else {  //Else, make a new slot.
                submenu = new basicElements.Menu(155, 85, 'Enter slot name:');
                var confirm = new basicElements.Button(75, 20, 'Save');
                var input = new basicElements.Text(145, 20, '');
                submenu.addElement('input', input, 5, 30);
                submenu.addElement('confirm', confirm, 40, 55);
                confirm.addListener('mouseup', function(e) {
                    var name = input.getText();
                    if (name == '') {
                        var error = new basicElements.ErrorBox('Enter a name.');
                        this.addElement('save_error', error, 125, 100);
                    }
                    else {
                        game.server.send(null, 'save', {savename: name});
                        submenu.setVisible(false);
                    }
                });
                game.container.addElement('confirmname', submenu, (game.container.getWidth() / 2) + 250 , 250);
            }
        }, this);
    };

    /**
     * Sets the listener for the load button.
     */
    this.loadListen = function() {
        button.addListener('mouseup', function(e, self) {
            var index = list.getSelectedIndex();
            game.server.send(null, 'load', {savename: saves[index]});
            self.setVisible(false);
        }, this);
    };

    if (game != null) {
        var label = new basicElements.Label(100, 20, 'Querying save games from server...');
        this.addElement('loading', label, 50, 30);
    }

    /**
     * Adds a list of saves to the UI for the user to choose from. Then updates the UI to reflect
     * this change.
     * @param {object} saveList The array of strings for each save name sent from the server.
     */
    this.setSaves = function(saveList) {
        saves = saveList;
        this.removeElement('loading');
        list = new basicElements.List(240, saveList.length * 20);
        this.setSize(this.getWidth(), (saveList.length * 20) + 80);
        list.setItems(saveList);
        this.addElement('saves', list, 5, 30);
        this.addElement('button', button, 105, this.getHeight() - 25);
    };
    
    /**
     * Closes this element and the submenu element by setting visible to false.
     */
    this.close = function() {
        this.setVisible(false);
        if (submenu != null) {
            submenu.setVisible(false);
        }
    };

};
