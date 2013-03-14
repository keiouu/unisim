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

exports.mainMenu = function(game) {

    'use strict';

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
    function positionButtons(context) {
        var buttonWidth = context.canvas.width / 2;
        var buttonHeight = context.canvas.height / 10;

        var menuX = (context.canvas.width * 0.5) - (buttonWidth / 2);
        var menuY = (context.canvas.height * 0.75);

        buttons[0] = {x: menuX, y: menuY, width: buttonWidth, height: buttonHeight, text: 'Start Game!'};
    };

    /**
     * Works out if any of the buttons are highlighted by the mouse
     * @return {int} The id of the highlighted button, -1 if no buttons highlighted.
     */
    function checkHover() {
        for (var i = 0; i < buttons.length; i++) {
            if (mouse.x >= buttons[i].x) {
                if (mouse.x <= (buttons[i].x + buttons[i].width)) {
                    if (mouse.y >= buttons[i].y && mouse.y <= (buttons[i].y + buttons[i].height)) {
                        return i;
                    }
                }
            }
        }
        return -1;
    };

    /**
     * Performs the action of a button
     * @param {int} buttonId the id of the button which is having its action performed.
     */
    function performAction(buttonId) {
        switch (buttonId) {
            case 0:
                game.mainMenu = false;
                break;
        }
    };

    /**
     * Kicked by the Client tick event,
     * which is roughly 60fps.
     * @param {object} g Object containing graphics context.
     */
    this.paintEvent = function(g) {

        var context = g.context;

        if (game.mainMenu) {
            context.globalAlpha = 1;
            context.fillStyle = 'black';
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);

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
            context.font = 'bold ' + fontSize + 'px sans-serif';
            context.textBaseline = 'middle';
            context.textAlign = 'center';
            context.fillStyle = '#FFF';

            context.fillText('University Simulator', context.canvas.width * 0.5, context.canvas.height * 0.2);

            context.fillStyle = '#000';
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
        if (game.mainMenu) {
            mouse = e;
            clicked = checkHover();
        }
    };

    /**
     * Capture mouse up events
     * @param {object} e Mouse event data.
     */
    this.mouseupEvent = function(e) {
        if (game.mainMenu) {
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
};
