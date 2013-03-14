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

/**
 * Return the given co-ordinate array with the x/y co-ordinates in each object inverted.
 * @param {Array} coordinates an array of {x: , y:} objects.
 * @param {boolean=true} flipX whether to f'ip the X axis.
 * @param {boolean=true} flipY whether to flip the Y axis.
 */
exports.invertValues = function(coordinates, flipX, flipY) {
    if (typeof flipX == 'undefined') {
        flipX = true
    }
    if (typeof flipY == 'undefined') {
        flipY = true
    }
    var returnArray = [];
    for (var i = 0; i < coordinates.length; i++) {
        returnArray.push({x: coordinates[i].x * (flipX ? -1 : 1), y: coordinates[i].y * (flipY ? -1 : 1)});
    }
    return returnArray;
};


/**
 * Invert the axes of the co-ordinate array, so X co-ordinates become Y, and Y become X.
 * This has the effect of a 90 degree turn to the right.
 * @param {Array} coordinates an array of {x: , y:} objects.
 */
exports.invertAxes = function(coordinates) {
    var returnArray = [];
    for (var i = 0; i < coordinates.length; i++) {
        returnArray.push({x: coordinates[i].y, y: coordinates[i].x});
    }
    return returnArray;
};
