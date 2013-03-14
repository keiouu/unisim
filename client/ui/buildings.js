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
 * A UI to display various types of buildings
 * and to fire events when the user picks one.
 * @constructor
 */
exports.Buildings = function() {

    // Call parent constructor
    basicElements.Menu.call(this, 200, 250, 'Building Menu');
    var listElement = new basicElements.List(180, 230);
    this.addElement('list', listElement, 10, 10);
    this.distributeChildren(true, 10, 10);

    /**
     * Add a blueprint
     * @param {Array} items The blueprints.
     * @this JENKINS.
     */
    this.setBlueprints = function(items) {
        items.unshift('Edit');
        items.unshift('None');
        items.push('Grass');
        items.push('Path');
        listElement.setItems(items);
        this.setRedraw(true);
    };

    /**
     * Returns the listElement of this Buildings UI
     * @return {object} The listElement object.
     */
    this.getListElement = function() {
        return listElement;
    };

    /**
     * Returns the number of elements in the buildingUI.
     * @return {Number} Number of elements.
     */
    this.getNumberElements = function() {
        return listElement.getLength();
    };

    /**
     * Get the selected blueprint
     * @return {number} The selected ID.
     */
    this.getSelectedBlueprint = function() {
        return listElement.getSelectedIndex() - 2; //Edit and None are negative values
    };

    this.addListener('mousedown', function(e) {
        //Prevent mousedown events from going through the UI.
    });

};

//setup menu prototype info.
exports.Buildings.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Buildings.prototype.constructor = exports.Buildings;
