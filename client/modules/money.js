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

exports.money = function(game) {

    var balance;
    var ui = require('lib/UiElements.js');
    var label = new ui.Label(20, 10, 'Money');
    game.sideBar.addElement('money', label);

    /* //Uncomment the /* etc to run grid test code
     var gridMenu = new ui.Menu(200,200, 'testing grid');
     gridMenu.addElement('1', new ui.Button(10, 10, '1'), 0, 0);
     gridMenu.addElement('2', new ui.Button(10, 10, '2'), 0, 0);
     gridMenu.addElement('3', new ui.Button(10, 10, '3'), 0, 0);
     gridMenu.addElement('4', new ui.Button(10, 10, '4'), 0, 0);
     gridMenu.distributeToGrid(2, 2, 10, 10, false);
     game.container.addElement('test', gridMenu, 200, 200);
     */

    /**
     * The sets the balance sent to us from the server!
     * @param {object} data The money data.
     */
    this.setEvent = function(data) {
        balance = data;
        game.money = data;
    };

    /**
     * request a world redownload.
     */
    this.redownloadEvent = function() {
        game.server.send('money', 'redownload', {});
    };

    /**
     * Paint our money onto the screen
     * @param {object} g Graphics message.
     */
    this.paintEvent = function(g) {
        if (balance != null) {
            var lbl_text = 'Money: £' + balance;
            label.setText(lbl_text);
        }
    };

};
