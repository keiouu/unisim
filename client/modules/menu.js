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

exports.menu = function(game) {

    'use strict';

    var menu = false; //Start the game with the menu hidden for now

    //stores which button has been clicked on, if none then it is -1;
    var clicked = -1;

    //save mouse pos
    var mouse = {x: 0, y: 0};

    //Stores menu button positions
    var buttons = [];

    /**
     * Works out where all the buttons should be on the screen
     * @param {object} context Canvas context.
     */
    var positionButtons = function(context) {
        var buttonWidth = context.canvas.width / 2;
        var buttonHeight = context.canvas.height / 10;

        var ySpacing = buttonHeight * 1.5;

        var menuX = (context.canvas.width / 2) - (buttonWidth / 2);
        var menuY = (context.canvas.height / 2) - (2 * ySpacing);

        buttons[0] = {x: menuX, y: menuY, width: buttonWidth, height: buttonHeight, text: 'New World'};
        buttons[1] = {x: menuX, y: menuY + ySpacing, width: buttonWidth, height: buttonHeight, text: 'Reverse Tiles'};
        buttons[2] = {x: menuX, y: menuY + (2 * ySpacing), width: buttonWidth, height: buttonHeight, text: 'Explode'};
        buttons[3] = {x: menuX, y: menuY + (3 * ySpacing), width: buttonWidth, height: buttonHeight, text: 'Disconnect'};
    };

    /**
     * Works out if any of the buttons are highlighted by the mouse
     * @return {int} The id of the highlighted button, -1 if no buttons highlighted.
     */
    var checkHover = function() {
        for (var i = 0; i < buttons.length; i++) {
            if (mouse.x >= buttons[i].x && mouse.x <= (buttons[i].x + buttons[i].width)) {
                if (mouse.y >= buttons[i].y && mouse.y <= (buttons[i].y + buttons[i].height)) {
                    return i;
                }

            }
        }
        return -1;
    };

    /**
     * Performs the action of a button
     * @param {int} buttonId the id of the button which is having its action performed.
     */
    var performAction = function(buttonId) {
        switch (buttonId) {
            case 0:
                for (var x = 0; x < game.world.getWidth(); x++) {
                    for (var y = 0; y < game.world.getHeight(); y++) {
                        var newTile = '';
                        if (Math.random() > 0.2) {
                            newTile = 'grass';
                        } else {
                            newTile = 'water';
                        }
                        game.world.setTile(x, y, newTile);
                        game.server.send('world', 'updatetile', {'pos': {'x': x, 'y': y}, 'tile': {'from': game.world.tile(x, y), 'to': newTile}});
                    }
                }
                break;

            case 1:
                for (var x = 0; x < game.world.getWidth(); x++) {
                    for (var y = 0; y < game.world.getHeight(); y++) {
                        var newTile = '';
                        if (game.world.tile(x, y) == 'grass') {
                            newTile = 'water';
                        } else {
                            newTile = 'grass';
                        }
                        game.world.setTile(x, y, newTile);
                        game.server.send('world', 'updatetile', {'pos': {'x': x, 'y': y}, 'tile': {'from': game.world.tile(x, y), 'to': newTile}});
                    }
                }
                break;

            case 2:
                var txt = 'potato';
                while (true) {
                    txt += 'potato';    //add as much as the browser can handle
                }
                break;
            case 3:
                //Doesn't actually disconnect
                /*game.mainMenu = true;*/
                menu = false;
                break;
        }
    };

    /**
     * Kicked by the Client tick event,
     * which is roughly 60fps.
     * @param {object} g Object containing graphics context.
     */
    this.paintEvent = function(g) {

        var context = g.layers[4];

        if (menu) {

            context.globalAlpha = 0.8;
            context.fillStyle = 'black';
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            context.globalAlpha = 1;

            //Calculate button positions
            positionButtons(context);

            //Check if any of the buttons should be highlighted
            var highlight = checkHover();

            //Draw the buttons
            for (var i = 0; i < buttons.length; i++) {
                context.fillStyle = '#aaa';
                if (i == clicked && i == highlight) { //If the button is being hovered by the mouse and is clicked paint it darker
                    context.fillStyle = '#888';
                } else if (i == highlight) { //If the button is being hovered by the mouse paint it brighter
                    context.fillStyle = '#ccc';
                } else if (i == clicked) {
                    clicked = -1; //This basically unclicks the button if the mouse is pressed on it then dragged off
                }
                context.fillRect(buttons[i].x, buttons[i].y, buttons[i].width, buttons[i].height);
            }

            //Work out font size
            var fontSize = buttons[0].height * 0.6;

            //Write text on the buttons
            context.fillStyle = '#000';
            context.font = 'bold ' + fontSize + 'px sans-serif';
            context.textBaseline = 'middle';
            context.textAlign = 'center';
            for (var i = 0; i < buttons.length; i++) {
                context.fillText(buttons[i].text, buttons[i].x + (buttons[i].width / 2), buttons[i].y + (buttons[i].height / 2));
            }

        }
    };

    /**
     * Capture mouse down events
     * @param {object} e Mouse event data.
     */
    this.mouseclickEvent = function(e) {
        if (menu) {
            mouse = e;
            clicked = checkHover();
        }
    };

    /**
     * Capture mouse up events
     * @param {object} e Mouse event data.
     */
    this.mouseupEvent = function(e) {
        if (menu) {
            mouse = e;
            performAction(clicked);
            clicked = -1;
        }
    };

    /**
     * Capture mouse events
     * @param {object} e Object containing event data.
     */
    this.mousemoveEvent = function(e) {
        mouse = e;
    };

    /**
     * Key down event.
     * @param {object} e Event info.
     */
    this.keydownEvent = function(e) {
        if (e.key == 27) {//Escape key
            menu = !menu;
            clicked = -1;
        }

    };
};
