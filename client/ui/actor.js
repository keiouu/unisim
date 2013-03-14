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
 * A small UI to display and details about an actor.
 * @param {Object} game - reference to game objects.
 * @param {Object} actor - actor's information
 * @constructor
 */
exports.ActorUI = function(game, actor) {

    var labelHappyActor;
    var labelTiredActor;
    var labelHungerActor;
    var labelDegreeActor;
    
    /**
     * Update elements and redraw self.
     * @this referenced.
     */
    this.redrawSelf = function() {
        labelHappyActor.setText(actor.getAttribute('happiness') / 10);
        labelTiredActor.setText(actor.getAttribute('tiredness') / 10);
        labelHungerActor.setText(actor.getAttribute('hunger') / 10);
        labelDegreeActor.setText(actor.getAttribute('degreeQuality') / 10);
        this.setRedraw(true);
    };

    if (actor != null) {

        var titleString = actor.getCourse();

        if (actor.getType() == 'student') {
            titleString += ' Student'     
        } else {
            titleString += ' Staff' 
        }
        

        // Call parent constructor
        basicElements.Menu.call(this, 120, 130, titleString);

        var labelHappy = new basicElements.Label(60, 10, 'Happiness:');
        this.addElement('labelHappy', labelHappy, 10, 30);

        labelHappyActor = new basicElements.Label(40, 10, actor.getAttribute('happiness') / 10);
        this.addElement('labelHappyActor', labelHappyActor, 85, 30);

        var labelTired = new basicElements.Label(60, 10, 'Energy:');
        this.addElement('labelTired', labelTired, 10, 50);

        labelTiredActor = new basicElements.Label(40, 10, actor.getAttribute('tiredness') / 10);
        this.addElement('labelTiredActor', labelTiredActor, 85, 50);

        var labelHunger = new basicElements.Label(60, 10, 'Fullness:');
        this.addElement('labelHunger', labelHunger, 10, 70);

        labelHungerActor = new basicElements.Label(40, 10, actor.getAttribute('hunger') / 10);
        this.addElement('labelHungerActor', labelHungerActor, 85, 70);

        var labelDegree = new basicElements.Label(60, 10, 'Smartness:');
        this.addElement('labelDegree', labelDegree, 10, 110);

        labelDegreeActor = new basicElements.Label(40, 10, actor.getAttribute('degreeQuality') / 10);
        this.addElement('labelDegreeActor', labelDegreeActor, 85, 110);

        this.redrawSelf();
    }

};

//setup menu prototype info.
exports.ActorUI.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.ActorUI.prototype.constructor = exports.ActorUI;
