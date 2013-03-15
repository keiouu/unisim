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

var getGridFurnisher = function(type) {
    return function(x, y, tl, br) {
        if ((x - tl.x) % 2 == 0 && (y - tl.y) % 2 == 0 && y != br.y) {
            return type;
        }
        return 'floor';
    }
};

/**
 * Furnish university accommodation.
 * @param {number} x The x co-ordinate to place a tile in.
 * @param {number} y The x co-ordinate to place a tile in.
 * @param {object} tl The top left of our floor space.
 * @param {object} br The bottom right of our floor space.
 * @return {String} The tile type to place in the world.
 */
exports.furnishAccommodation = getGridFurnisher('bed');

/**
 * Furnish academic buildings.
 * @param {number} x The x co-ordinate to place a tile in.
 * @param {number} y The x co-ordinate to place a tile in.
 * @param {object} tl The top left of our floor space.
 * @param {object} br The bottom right of our floor space.
 * @return {String} The tile type to place in the world.
 */
exports.furnishAcademic = function(x, y, tl, br) {
    if (x > tl.x + 1 && y != br.y) return 'chair';
    if (x == tl.x && y == tl.y) return 'lecturn';
    return 'floor';
};

/**
 * Furnish bars (bars)
 * @param {number} x The x co-ordinate to place a tile in.
 * @param {number} y The x co-ordinate to place a tile in.
 * @param {object} tl The top left of our floor space.
 * @param {object} br The bottom right of our floor space.
 * @return {String} The tile type to place in the world.
 */
exports.furnishBar = function(x, y, tl, br) {
    if (y == tl.y + 1) return 'barStool';
    return 'floor';
};

/**
 * Furnish recreation (games, etc)
 * @param {number} x The x co-ordinate to place a tile in.
 * @param {number} y The x co-ordinate to place a tile in.
 * @param {object} tl The top left of our floor space.
 * @param {object} br The bottom right of our floor space.
 * @return {String} The tile type to place in the world.
 */
exports.furnishRecreational = function(x, y, tl, br) {
    midline = Math.ceil(tl.x + ((br.x - tl.x) / 2));
    if (x != midline && y != br.y && y%2 == 0) return 'sofa';
    if (x != midline && x % 2 != 0 && y != br.y && y % 2 != 0) return 'table';
    return 'floor';
};

/**
 * Furnish staff rooms
 * @param {number} x The x co-ordinate to place a tile in.
 * @param {number} y The x co-ordinate to place a tile in.
 * @param {object} tl The top left of our floor space.
 * @param {object} br The bottom right of our floor space.
 * @return {String} The tile type to place in the world.
 */
exports.furnishStaff = getGridFurnisher('sofa');
