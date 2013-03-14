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

'use strict';

/**
 * Input handler
 * @param {object} canvas The canvas.
 * @param {object} container The root UI container.
 * @param {object} router for client.
 * @constructor
 */
exports.Input = function(canvas, container, router) {

    //the element with key focus
    var focusedElement = null;

    //handle adding mouse events. These are the 'normal' events
    //whereby we recurse down through the tree to run a callback.
    //That also returns the clicked element, which then gets passed
    //key events through a seperate system, done below.
    var events = ['mousemove', 'mousedown', 'mouseup'];
    var eventHandler = function(e) {

        //FF compatibility
        var mouseX, mouseY;
        if (e.offsetX) {
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        } else {
            mouseX = e.layerX;
            mouseY = e.layerY;
        }

        //send the mouse event to our root UI container, get back a reference to any responding element.
        var elem = container.handleMouseEvent(mouseX, mouseY, e.type.toString());

        //handle keyboard focus.
        if (e.type == 'mouseup') {
            if (elem != focusedElement && focusedElement) {
                focusedElement.setFocused(false);
            }
            if (elem) {
                focusedElement = elem;
                focusedElement.setFocused(true);
            }
        }
    };

    //bind our event function to events
    for (var i = 0; i < events.length; i++) {
        canvas.addEventListener(events[i], eventHandler, false);
    }

    /**
     * Generic key handler, in which we route key events
     * to the currently focused UI element.
     * @param event
     */
    var keyHandler = function(event) {

        //send the event off to our UI element.
        if (focusedElement && focusedElement.isVisible()) {
            var keyCode = event.charCode ? event.charCode : event.keyCode;
            focusedElement.fireKeyEvent(event.type, keyCode);
        }
    };

    /**
     * Handle key down and key up events,
     * which we need to capture and then if they're backspace, space or arrowkeys block propogation of.
     * @param {object} event The event object from the browser.
     * @return {Boolean} Whether to allow propogation.
     */
    var keyDownKeyUpHandler = function(event) {

        //detect backspace and enter keys, as well as all the arrowkeys
        if (event.keyCode == 32 || event.keyCode == 8 || (event.keyCode >= 37 && event.keyCode <= 40)) {

            //call keyhandler to route this event
            keyHandler(event);

            //stop the propogation of the event (e.g. backspace goes back on FF, chrome)
            if (navigator.userAgent.toLowerCase().indexOf("msie") == -1) {
                event.stopPropagation();
            } else {
                event.returnValue = false;
            }
            return false;
        } else {
            return true;
        }
    };

    document.getElementsByTagName("body")[0].onkeypress = keyHandler;
    document.getElementsByTagName('body')[0].onkeyup = keyDownKeyUpHandler;
    document.getElementsByTagName('body')[0].onkeydown = function(event) {
        var ret = keyDownKeyUpHandler(event);
        if (ret == false) { //block backspace etc. If this returns false (so preventing ff, chrome from navigating away from the page) onkeypress wont fire...
            keyHandler({type: 'keypress', keyCode: event.keyCode}); //...so we need to fake a keypress so text elements can respond to backspace, space & arrows
        }
        return ret;
    };
};
