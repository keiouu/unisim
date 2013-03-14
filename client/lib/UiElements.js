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

//reference to the UIElement prototype.
var ui = require('lib/UiElement.js');

//third party text wrap library
var wrap = require('lib/wrap.js');

/**
 * A Label constructor.
 * @param {number} width The label width.
 * @param {number} height The label height.
 * @param {string} text The label text.
 * @param {function=} func Callback.
 * @constructor
 */
exports.Label = function(width, height, text, func) {

    // Call parent constructor
    // TODO: set height and width correctly
    ui.UiElement.call(this, width, height, 0, func);
    var alignment = 'left';
    var textSize = null;

    /**
     * Set whether we're centered or not.
     * @param {object} centered position of text.
     * @this {Label}
     */
    this.setCentered = function(centered) {
        alignment = centered ? 'center' : 'left';
        this.setRedraw(true);
    };

    /**
     * Set our text size.
     * @param {number} size The size.
     */
    this.setTextSize = function(size) {
        textSize = size;
    };

    /**
     * Sets the text of thr label
     * @param {string} newText The text to put on the label.
     * @this {Label}
     */
    this.setText = function(newText) {
        // only redraw if text has actually changed
        if (text != newText) {
            this.setRedraw(true);
        }
        text = newText;
    };

    /**
     * Get our label text.
     * @return {string} The text.
     */
    this.getText = function() {
        return text;
    };

    /**
     * Draws the label onto the screen
     * @param {object} ctx the canvas context to draw on.
     * @this Jenkins.
     */
    this.draw = function(ctx) {
        ctx.fillStyle = '#000';
        ctx.textAlign = alignment;
        ctx.textBaseline = 'middle';

        if (textSize) {
            ctx.font = 'normal ' + textSize + 'px sans-serif';
        }

        // calculate width of the text and update this width
        // TODO: this somehow needs to be called on label creation
        var textWidth = ctx.measureText(text);
        width = textWidth.width;

        var x = alignment == 'center' ? this.getWidth() / 2 : 0;
        wrap.drawWrappedText(ctx, text, x, this.getHeight() / 2, this.getWidth(), 15);
    };
};

//setup label prototype info.
exports.Label.prototype = new ui.UiElement;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Label.prototype.constructor = exports.Label;

/**
 * A Button constructor
 * @param {number} width The button width.
 * @param {number} height The button height.
 * @param {string|Image} contents The button text or image.
 * @param {function=} func Callback.
 * @constructor
 */
exports.Button = function(width, height, contents, func) {

    // Call parent constructor
    // TODO: set height and width correctly
    ui.UiElement.call(this, width, height, 0, func);

    //are we pressed?
    var pressed = false;
    this.addListener('mousedown', function(e, self) {
        pressed = true;
        self.setRedraw(true);
    }, this);
    this.addListener('mouseup', function(e, self) {
        pressed = false;
        self.setRedraw(true);
    }, this);

    /**
     * Sets the text of thr label
     * @param {string} newContents The text or DOM Image to put on the label.
     * @this {Button}
     */
    this.setContents = function(newContents) {
        if (typeof newContents == 'string' || typeof newContents == 'Image') {
            contents = newContents;
        }
        this.setRedraw(true);
    };

    /**
     * Draws the label onto the screen
     * @param {object} ctx the canvas context to draw on.
     * @this Jenkins.
     */
    this.draw = function(ctx) {
        //create a gradient.
        var grd = ctx.createLinearGradient(0, 0, 0, this.getHeight());
        grd.addColorStop(0, !pressed ? '#eee' : '#aaa');
        grd.addColorStop(1, !pressed ? '#aaa' : '#eee');
        ctx.fillStyle = grd;

        //fill a rectangle to our width & height to show the gradient.
        ctx.fillRect(0, 0, this.getWidth(), this.getHeight());

        //draw the caption
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(contents, this.getWidth() / 2, this.getHeight() / 2);

        //draw a border.
        ctx.translate(0.5, 0.5);

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(0, 0, this.getWidth() - 1, this.getHeight() - 1);

        //because canvas is weird we have to translate for 1px lines
        //(http://diveintohtml5.info/canvas.html "Why did you start x and y at 0.5? Why not 0?")
        ctx.translate(-0.5, -0.5);
    };
};

//setup button prototype info.
exports.Button.prototype = new ui.UiElement;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Button.prototype.constructor = exports.Button;

/**
 * A Menu constructor - a visible element container w/title.
 * @param {number} width The menu width.
 * @param {number} height The menu height.
 * @param {string} title The menu text.
 * @param {function=} func Callback.
 * @constructor
 */
exports.Menu = function(width, height, title, func) {

    //height devoted to title.
    var titleHeight = 20;

    // Call parent constructor
    // TODO: set height and width correctly
    ui.UiElement.call(this, width, height, 0, func);

    if (typeof title == 'undefined') {
        title = '';
    }

    /**
     * Sets the text of the label
     * @param {string} newText The text to put on the label.
     * @this {Menu}
     */
    this.setTitle = function(newText) {
        titleHeight = newText.length == 0 ? 0 : 20;
        title = newText;
        this.setRedraw(true);
    };

    //initially size the titlebar
    this.setTitle(title);

    /**
     * Distribute elements vertically.
     * This will override X and Y co-ordinates of all children!
     * @param {boolean} vertical Render vertically? Defaults to true.
     * @param {number} paddingX X padding to use.
     * @param {number} paddingY Y padding to use.
     * @param {boolean=false} preserveSize whether to skip resizing elements.
     * @this Jenkins
     */
    this.distributeChildren = function(vertical, paddingX, paddingY, preserveSize) {

        var numX, numY;
        if (vertical) {
            numX = 1;
            numY = this.getChildren().length;
        } else {
            numX = this.getchildren().length;
            numY = 1;
        }

        this.distributeToGrid(numX, numY, paddingX, paddingY, preserveSize);
        this.setRedraw(true);
    };

    /**
     * Distribute elements in a grid
     * @param {number} numX The number of grid spaces on the X co-ordinate.
     * @param {number} numY The number of grid spaces on the Y co-ordinate.
     * @param {number} paddingX The amount of padding to have each side of the grid space.
     * @param {number} paddingY The amount of padding to have along the Y of the grid.
     * @param {boolean=false} preserveSize Whether to resize elements to fit one space.
     * @this referenced.
     */
    this.distributeToGrid = function(numX, numY, paddingX, paddingY, preserveSize) {

        if (typeof preserveSize == 'undefined') {
            preserveSize = false;
        }

        var children = this.getChildren();
        var widthPerElement = this.getWidth() / numX;
        var heightPerElement = (this.getHeight() - titleHeight) / numY;

        heightPerElement -= paddingY;
        widthPerElement -= paddingX;

        //run through each grid space
        for (var y = 0; y < numY; y++) {
            for (var x = 0; x < numX; x++) {

                if (children.length == 0) {
                    return;
                }

                //resize the elem
                if (!preserveSize) {
                    this.getChild(children[0]).setSize(widthPerElement, heightPerElement);
                }

                //and position it at the top left of the current grid cell.
                this.positionChild(children[0], (widthPerElement * x) + (paddingX / 2 * (x + 1)),
                    (heightPerElement * y) + titleHeight + (paddingY / 2 * (y + 1)));
                children.shift();
            }
        }
        this.setRedraw(true);
    };

    /**
     * Draws the label onto the screen
     * @param {object} ctx the canvas context to draw on.
     * @this Jenkins.
     */
    this.draw = function(ctx) {
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, this.getWidth(), this.getHeight());

        //Draw the menu bar
        if (titleHeight > 0) {

            //create a gradient.
            var grd = ctx.createLinearGradient(0, 0, 0, titleHeight);
            grd.addColorStop(0, '#009F88');
            grd.addColorStop(1, '#005C77');
            ctx.fillStyle = grd;

            ctx.fillRect(0, 0, this.getWidth(), titleHeight);
        }

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, this.getWidth() / 2, titleHeight / 2);
    };
};

//setup menu prototype info.
exports.Menu.prototype = new ui.UiElement;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Menu.prototype.constructor = exports.Menu;

/**
 * A Textbox constructor
 * @param {number} width The texbox width.
 * @param {number} height The textbox height.
 * @param {string} text The initial text.
 * @param {function=} func Callback.
 * @constructor
 */
exports.Text = function(width, height, text, func) {

    // Call parent constructor
    // TODO: set height and width correctly
    ui.UiElement.call(this, width, height, 0, func);
    var editable = true;
    /**
     * Sets the text of thr label
     * @param {string} newText The text to put on the label.
     * @this {Text}
     */
    this.setText = function(newText) {
        text = newText;
        this.setRedraw(true);
    };

    /**
     * Get the current text.
     * @return {string} The text.
     */
    this.getText = function() {
        return text;
    };

    /**
     * Set whether this text field is editable.
     * @param {boolean} isEditable Can this text field be edited?
     */
    this.setEditable = function(isEditable) {
        editable = isEditable;
    };

    /**
     * Draws the label onto the screen
     * @param {object} ctx the canvas context to draw on.
     * @this Jenkins.
     */
    this.draw = function(ctx) {

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, this.getWidth(), this.getHeight());

        ctx.strokeStyle = this.isFocused() ? '#ff0' : '#aaa';
        ctx.strokeRect(0.5, 0.5, this.getWidth() - 1, this.getHeight() - 1);

        ctx.fillStyle = '#000';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        wrap.drawWrappedText(ctx, text, 5, 5, this.getWidth() - 5, 15);
    };

    //add to the text on key presses
    this.addListener('keypress', function(e, self) {
        if (editable) {
            if (e == 8) { //backspace
                text = text.substring(0, text.length - 1);
            } else {
                text += String.fromCharCode(e);
            }
            self.setRedraw(true);
        }
    }, this);
};

//setup label prototype info.
exports.Text.prototype = new ui.UiElement;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Text.prototype.constructor = exports.Text;

/**
 * A Label constructor.
 * @param {number} width The label width.
 * @param {number} height The label height.
 * @param {function=} func Callback.
 * @constructor
 */
exports.List = function(width, height, func) {

    // Call parent constructor
    // TODO: set height and width correctly
    ui.UiElement.call(this, width, height, 0, func);

    var items = [];
    var selectedIndex = 0;

    /**
     * Sets the text of the label
     * @param {Array} nitems The text to put on the label.
     * @this {List}
     */
    this.setItems = function(nitems) {
        items = nitems;
        this.setRedraw(true);
    };

    /**
     * Get the selected index.
     * @return {Number} The selected index.
     */
    this.getSelectedIndex = function() {
        return selectedIndex;
    };

    /**
     * Get the selected item.
     * @return {object} The selected item.
     */
    this.getSelectedItem = function() {
        return items[selectedIndex];
    };

    /**
     * Get the number of items in the list.
     * @return {Number} the length of items.
     */
    this.getLength = function() {
        return items.length;
    };

    var me = this;
    this.addListener('mouseup', function(e, self) {
        selectedIndex = Math.floor(e.y / (me.getHeight() / items.length));
        self.setRedraw(true);
    }, this);

    /**
     * Draws the label onto the screen
     * @param {object} ctx the canvas context to draw on.
     * @this Jenkins.
     */
    this.draw = function(ctx) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, this.getWidth(), this.getHeight());

        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(0.5, 0.5, this.getWidth() - 1, this.getHeight() - 1);

        ctx.fillStyle = '#000';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        //figure out the height of each item
        height = this.getHeight() / items.length;

        for (var i = 0; i < items.length; i++) {
            ctx.fillStyle = '#000';
            if (this.getSelectedIndex() == i) {
                //create a gradient for the selected item
                var grd = ctx.createLinearGradient(0, height * i, 0, height * (i + 1));
                grd.addColorStop(0, '#009F88');
                grd.addColorStop(1, '#005C77');
                ctx.fillStyle = grd;

                ctx.fillRect(0, height * i, this.getWidth(), height);
                ctx.fillStyle = '#fff';
            }
            ctx.fillText(items[i], 5, height * i + (height / 2));
        }
    };
};

//setup label prototype info.
exports.List.prototype = new ui.UiElement;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.List.prototype.constructor = exports.Label;

/**
 * A ErrorBox constructor.
 * @param {string} text The label text.
 * @param {function=} func Callback.
 * @constructor
 */
exports.ErrorBox = function(text, func) {
    var width = 300;
    var height = 50;

    // Call parent constructor
    // TODO: set height and width correctly
    ui.UiElement.call(this, width, height, 0, func);

    // Create the label and get its size
    var error_message = new exports.Label(width, height, text, null);

    // Crete an error box for the label to go in
    var menu = new uiElems.Menu(width, height, 'Error');
    this.addElement('error_menu', menu, 0, 0);
    menu.addElement('error_message', error_message, 5, 20);
    menu.distributeChildren(true, 5, 5);

    // update the size of this ErrorBox
    width = menu.getWidth();
    height = menu.getHeight();

    /**
     * Draws the label onto the screen
     * @param {object} ctx the canvas context to draw on.
     * @this Jenkins.
     */
    this.draw = function(ctx) {
        // nothing to draw
    };

};

//setup ErrorBox prototype info.
exports.ErrorBox.prototype = new ui.UiElement;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.ErrorBox.prototype.constructor = exports.ErrorBox;
