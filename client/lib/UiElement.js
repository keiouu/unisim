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

exports.UiElement = function(width, height, layer, func) {
    'use strict';

    //define event callback manager, add func, if given.
    var cb = require('callback.js');
    var callback = new cb.CallbackManager();
    if (typeof func == 'function') {
        callback.on('mouseup', func, this);
    }

    /**
     * Add another event listener.
     * @param {string} type The event type.
     * @param {function} func The callback.
     * @param {Object} self The object that created the callback.
     */
    this.addListener = function(type, func, self) {
        callback.on(type, func, self);
    };

    /**
     * Add a listener for keys,
     * when this element has focus.
     * @param {function} func The callback to run on a key press.
     * @param {Object} self The object that created the callback.
     */
    this.addKeyListener = function(func, self) {
        callback.on('key', func, self);
    };

    /**
     * Fire the key event.
     * @param {string} type Event type.
     * @param {number} key The keycode.
     */
    this.fireKeyEvent = function(type, key) {
        callback.fire(type, key);
    };

    //set our layer to 0 by default
    if (typeof layer == 'undefined') {
        layer = 0;
    }

    // redraw on next step
    var redraw = true;

    /**
     * Set whether this element should be redrawn.
     * @param {boolean} doRedraw Should we redraw?
     * @param {boolean} falseRecursive Should this be set recursively for false?
     */
    this.setRedraw = function(doRedraw, falseRecursive) {
        redraw = doRedraw;
        // if parent is being redrawn must redraw child
        // TODO: this behaviour can probably be improved
        //       by defining whether the parent needs to
        //       draw anything

        var recursive = false;
        if (typeof falseRecursive != 'undefined' || falseRecursive) {
            recursive = true;
        }

        if (redraw == true || recursive) {
            for (var key in children) {
                if (children.hasOwnProperty(key)) {
                    children[key].elem.setRedraw(redraw);
                }
            }
        }
    };

    /**
     * Get whether this element should be redraw.
     * @return {boolean} Should we redraw?
     */
    this.getRedraw = function() {
        return true;

        var cRedraw = false;
        // check if any children need to be redrawn
        for (var key in children) {
            if (children.hasOwnProperty(key)) {
                var child = children[key].elem.getRedraw();
                if (child == true) {
                    return true;
                }
            }
        }

        if (redraw == true) {
            cRedraw = true;
        }

        return cRedraw;
    };

    //are we visible
    var visible = true;

    /**
     * Set whether we're visible.
     * @param {boolean} isVisible Should we be visible?
     * @this {UiElement}
     */
    this.setVisible = function(isVisible) {
        visible = isVisible;

        // update children recursively
        for (var key in children) {
            if (children.hasOwnProperty(key)) {
                children[key].elem.setVisible(visible);
            }
        }

        this.setRedraw(true);
    };

    /**
     * Are we visible?
     * @return {Boolean} Are we visible?
     * @this {UiElement}
     */
    this.isVisible = function() {
        return visible;
    };

    //are we focused
    var focused = false;

    /**
     * Set whether we're focused.
     * @param {boolean} isFocused Are we focused?
     * @this {UiElement}
     */
    this.setFocused = function(isFocused) {
        focused = isFocused;
        this.setRedraw(true);
    };

    /**
     * Are we focused?
     * @return {Boolean} Whether we're focused.
     */
    this.isFocused = function() {
        return focused;
    };

    //child elements
    var children = {};

    /**
     * Get the absolute (px) position of a child UI element.
     * @param {string} child the child element to get position of.
     */
    this.getAbsoluteChildPosition = function(child) {
        var ex, ey;
        var element = children[child];
        if (element.unit == 'px') { //unit is in pixels, nice and simple
            ex = element.x < 0 ? this.getWidth() + element.x : element.x;
            ey = element.y < 0 ? this.getHeight() + element.y : element.y;
        } else { //unit is in percent, so do percentage conversion.

            //handle the possibility of the user specifying negative %s
            var px = element.x >= 0 ? element.x : 100 - element.x;
            var py = element.x >= 0 ? element.y : 100 - element.y;

            //convert over to pixel values.
            ex = (this.getWidth() / 100) * px;
            ey = (this.getHeight() / 100) * py;
        }

        if (element.alignment == 'centre') {
            ex -= Math.floor(element.elem.getWidth() / 2);
            ey -= Math.floor(element.elem.getHeight() / 2);
        }

        return {x: ex, y: ey};
    };

    /**
     * Get our child elements.
     * @return {Array} A list of child element names.
     */
    this.getChildren = function() {
        var returnChildren = [];
        for (var child in children) {
            if (children.hasOwnProperty(child)) {
                returnChildren.push(child);
            }
        }
        return returnChildren;
    };

    /**
     *
     * @param {string} child The child element to get.
     * @return {object} The specific child element.
     */
    this.getChild = function(child) {
        return children[child].elem;
    };

    /**
     * Position a child element.
     * @param {string} child The name of the child element.
     * @param {number} x The x-position of the element.
     * @param {number} y The y position of the element.
     * @this {UiElement}
     */
    this.positionChild = function(child, x, y) {
        children[child].x = x;
        children[child].y = y;
        this.setRedraw(true);
    };

    /**
     * Set the origin of a child, so where they will be drawn.
     * relative to their X and Y position - should it be their top left co-ordinate or their centre?
     * @param {string} child The child element to position.
     * @param {string} origin Either 'centre' or 'topleft'.
     */
    this.alignChild = function(child, origin) {
        if (origin != 'centre' && origin != 'topleft') {
            origin = 'topleft';
        }
        children[child].alignment = origin;
    };

    /**
     * Get our width.
     * @return {number} The width.
     */
    this.getWidth = function() {
        return width;
    };

    /**
     * Set our Size.
     * @param {number} nw New width.
     * @param {number} nh New height.
     * @this {UiElement}
     */
    this.setSize = function(nw, nh) {
        width = nw;
        height = nh;
        this.setRedraw(true);
    };

    /**
     * Get our height.
     * @return {number} The height.
     */
    this.getHeight = function() {
        return height;
    };

    /**
     * Get our layer.
     * @return {number} The layer.
     */
    this.getLayer = function() {
        return layer;
    };

    /**
     * Adds an element to this container.
     * @param {string} name The name which will be used to reference the new webelement.
     * @param {object} element The element to store.
     * @param {int} x The x co-ordinate to place the element.
     * @param {int} y The y co-ordinate to place the element.
     * @param {int=} time Time for the element to stay on the screen in frames negative value if permanent.
     * @param {string=px} unit The unit to measure the placement with (px or %)
     * @this {UiElement}
     */
    this.addElement = function(name, element, x, y, time, unit) {
        if (typeof unit == 'undefined' || (unit != 'px' && unit != '%')) {
            unit = 'px';
        }
        if (typeof time == 'undefined') {
            time = -1;
        } else if (time > 0) {
            // convert miliseconds to current time plus delay
            var d = new Date();
            time = d.getTime() + time;
        }
        children[name] = {elem: element, time: time, x: x, y: y, unit: unit, alignment: 'topleft'};
        this.setRedraw(true);
    };

    /**
     * Removes and element from this container.
     * @param {string} name The name of the element to remove.
     * @this {UiElement}
     */
    this.removeElement = function(name) {
        delete children[name];
        this.setRedraw(true);
    };

    /**
     * Recurse down the element tree from here,
     * finding children (if any) who were clicked.
     * @param {number} x The x co-ordinate of the event.
     * @param {number} y The y co-ordinate of th event.
     * @param {string} type The event type.
     * @return {object} The element.
     * @this jenkins.
     */
    this.handleMouseEvent = function(x, y, type) {

        //log elements within the mouse bounds.
        //so we can organise by layers.
        var foundElements = [];

        //find all children at x, y
        for (var elem in children) {
            if (children.hasOwnProperty(elem)) {
                var element = children[elem];
                var coords = this.getAbsoluteChildPosition(elem);
                if (coords.x <= x && element.elem.getWidth() + coords.x >= x && element.elem.isVisible()) {
                    if (coords.y <= y && element.elem.getHeight() + coords.y >= y) {
                        foundElements.push({e: element, ex: coords.x, ey: coords.y});
                    }
                }
            }
        }

        //log whether we've handled the event
        var triggeredElement = null;

        //is there a child at x, y?
        if (foundElements.length > 0) {

            //we've got multiple elems
            if (foundElements.length > 1) {
                foundElements.sort(function(a, b) {
                    return a.e.elem.getLayer() - b.e.elem.getLayer();
                });
            }

            //try each candidate element by layer to see if they can handle
            //the event. If they can't we'll try the next one etc.
            while (!triggeredElement && foundElements.length > 0) {
                //pass the event down to element we've picked, translating co-ordinates to their coordinate space.
                triggeredElement = foundElements[0].e.elem.handleMouseEvent(x - foundElements[0].ex, y - foundElements[0].ey, type);
                foundElements.shift();
            }
        }

        //no valid kids, so its us
        if (!triggeredElement) {
            callback.fire(type, {x: x, y: y});
            return this;
        } else { //return the valid child
            return triggeredElement;
        }
    };

    /**
     * Clears this object from the screen.
     * @param {object} ctx the canvas context to draw on.
     * @this {UiElement}
     */
    this.clear = function(ctx) {
        //ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
    };

    /**
     * Draws anything.
     * @param {object} ctx the canvas context to draw on.
     */
    this.draw = function(ctx) {
    };

    /**
     * Draws the containers contents onto the screen.
     * @param {object} ctx the canvas context to draw on.
     * @this Jenkins.
     */
    this.drawComponent = function(ctx) {

        //define a default font for all UI elements
        ctx.font = 'normal 12px sans-serif';

        // check if object should be cleared from screen
        if (!this.isVisible() && this.getRedraw()) {
            this.clear(ctx);
            // set redraw false on all children recursively
            this.setRedraw(false, true);
            return;
        }

        if (!this.isVisible() && !this.getRedraw()) {
            return;
        }

        // check if this or any children should be redrawn
        if (!this.getRedraw()) {
            return;
        }

        // before anything else check if we need to remove any elements, then clear the whole canvas
        var removed = false;
        for (var key in children) {
            if (children.hasOwnProperty(key)) {
                //check whether we should remove
                var d = new Date();
                if (children[key].time > 0 && d.getTime() > children[key].time) {
                    this.removeElement(key);
                    removed = true;
                }
            }
        }

        // something has been removed so clear
        if (removed) {
            this.clear(ctx);
        }

        // draw this element
        this.draw(ctx);
        this.setRedraw(false);

        // draw children elements
        for (var key in children) {
            if (children.hasOwnProperty(key)) {

                //save ctx state
                ctx.save();

                //handle negative positioning relative to the bottom right of the parent
                var coords = this.getAbsoluteChildPosition(key);

                //transform drawing co-ordinates to relative ones
                ctx.translate(coords.x, coords.y);

                //now actually draw the component
                children[key].elem.drawComponent(ctx);

                //put our canvas back for the next sibling.
                ctx.restore();
            }
        }
    };
    // TODO: Write method to calculate the size of this element based on all subelements
};
