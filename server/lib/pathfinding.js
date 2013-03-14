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

var cb = require('../../shared/callback.js');
exports.debug = new cb.CallbackManager();

/**
 * Helper function for below function,
 * tells us if an array contains the given co-ordinates,
 * expressed as an object of {x: y:}. Index of doesn't work
 * as they're different object instances with the same properties.
 * @param {Array} array The array to test.
 * @param {object} coords The co-ords.
 * @return {boolean} Whether we found the co-ordinates.
 */
var containsCoords = function(array, coords) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].x == coords.x && array[i].y == coords.y) {
            return true;
        }
    }
    return false;
};

/**
 * Helper function used by the pathfinding
 * to convert a list of available exit directions (as compass points)
 * into x & y co-ordinates of valid adjacent tiles.
 * @param {number} tx The current tile X.
 * @param {number} ty The current tile Y.
 * @param {Array} matrix navMatrix.
 */
var getAdjacenciesByCompassPoints = function(tx, ty, matrix) {

    var validAdjacencies = [];
    for (var x = -1; x <= 1; x++) {
        for (var y = -1; y <= 1; y++) {

            //discard current tile.
            if (x == 0 && y == 0) {
                continue;
            }

            //first test - can we exit this tile in the specified direction?
            if (!matrix[tx][ty].hasOwnProperty('exits') || containsCoords(matrix[tx][ty].exits, {x: x, y: y})) {

                var newX = x + tx;
                var newY = y + ty;

                //out of map bounds, we can't navigate here or cost is -1 so tile is unmovable
                if (newX < 0 || newY < 0 || newX >= matrix.length || newY >= matrix[0].length || matrix[newX][newY].cost == -1) {
                    continue;
                }

                //second test - can we enter the tile we're going to in the specified direction?
                if (!matrix[newX][newY].hasOwnProperty('entrances') || containsCoords(matrix[newX][newY].entrances, {x: x * -1, y: y * -1})) {

                    //all tests passed, so we can move to this tile
                    validAdjacencies.push({x: newX, y: newY});
                }
            }
        }
    }
    return validAdjacencies;
};

/**
 * A* path finding algorithm! Here be dragons.
 * @param {object} start The pos to start from.
 * @param {object} navMatrix A 2d array object.
 * @param {object} pathWeight The list of pathWeights.
 * @param {object} target The target.
 * @return {Array} A list of squares.
 * @constructor
 */
exports.findPath = function(start, navMatrix, pathWeight, target) {

    //base case: If our destination is unpassable don't try to find a path to it.
    if (navMatrix[target.x][target.y].cost == -1) {
        console.log('Pathfinder: got impassable target.');
        return [];
    }

    //our openList contains nodes {parent, x, y}
    var openList = [];

    //dunno what this is
    var closedList = [];

    //navigation width
    var navWidth = navMatrix.length;

    //navigation height
    var navHeight = navMatrix[0].length;

    if (target.x == start.x && target.y == start.y) {
        return [
            {x: target.x, y: target.y}
        ];
    }

    /**
     * Get the H cost of a given node,
     * using the Diagonal Shortcut method
     * @param {number} x The x.
     * @param {number} y The y.
     * @return {Number} cost.
     */
    var getHeuristicCost = function(x, y) {

        var xDistance = Math.abs(target.x - x);
        var yDistance = Math.abs(target.y - y);
        var h;

        if (xDistance > yDistance) {
            h = (14 * yDistance) + (10 * (xDistance - yDistance));
        }
        else {
            h = (14 * xDistance) + (10 * (yDistance - xDistance));
        }
        return h;
    };

    /**
     * Work out the G (movement) cost of a node.
     * @param {object} parent The node we're going from.
     * @param {Number} x The x co-ordinate of the node.
     * @param {Number} y The y co-ordinate of the node.
     * @return {Number} The movement cost.
     */
    var getMovementCost = function(parent, x, y) {
        if (x != parent.x && y != parent.y) {
            return 4 + navMatrix[x][y].cost + parent.g;
        } else {
            return navMatrix[x][y].cost + parent.g;
        }

        /* Mikes changes, to be reinstated soon
         if (x != parent.x && y != parent.y) {
         return 4 + Math.pow(navMatrix[x][y], pathWeight) + parent.g;
         } else {
         return Math.pow(navMatrix[x][y], pathWeight) + parent.g;
         }*/
    };

    /**
     * Get the node on our open list with the lowest F cost,
     * which is to say the lowest G + H cost.
     * @return {object} The node.
     */
    var getLowestCostNode = function() {
        var lowest = null;
        for (var i = 0; i < openList.length; i++) {
            if (lowest === null || openList[i].h + openList[i].g < lowest.h + lowest.g) {
                lowest = openList[i];
            }
        }
        return lowest;
    };

    /**
     * Is the given node in the open list
     * @param {object} node The node.
     * @return {boolean} true/false.
     */
    var inOpenList = function(node) {
        for (var i = 0; i < openList.length; i++) {
            if (openList[i].x == node.x && openList[i].y == node.y) {
                return i;
            }
        }
        return false;
    };

    /**
     * Is the given node in the closed list
     * @param {object} node The node.
     * @return {boolean} true/false.
     */
    var inClosedList = function(node) {
        for (var i = 0; i < closedList.length; i++) {
            if (closedList[i].x == node.x && closedList[i].y == node.y) {
                return i;
            }
        }
        return false;
    };

    /**
     * Add adjacent nodes to the open list.
     * @param {object} currentNode The node to go from.
     */
    var addAdjacencies = function(currentNode) {

        //get adjacent tiles to ours, bearing in mind the valid exits from our tile. (i.e. can we go northeast, south etc)
        var adjacencies = getAdjacenciesByCompassPoints(currentNode.x, currentNode.y, navMatrix);

        for (var coords = 0; coords < adjacencies.length; coords++) {

            //conversion code
            var x = adjacencies[coords].x;
            var y = adjacencies[coords].y;

            //ignore our actual current node
            if (x != currentNode.x || y != currentNode.y) {

                //ignore the node if its on the closed list
                if (inClosedList({x: x, y: y}) !== false) {
                    continue;
                }

                //disallow walking through target only spaces unless they're the target. This is good for beds, chairs etc
                //that realistically people wouldn't be happy to hop over if there is an alternative route available.
                if (navMatrix[x][y].hasOwnProperty('targetonly') && navMatrix[x][y].targetonly && x != (target.x || y != target.y)) {
                    continue;
                }

                //is this node in the open list?
                var openListIndex = inOpenList({x: x, y: y});

                //false = no, canything else = yes
                if (openListIndex === false) {
                    openList.push({x: x, y: y, parent: currentNode, g: getMovementCost(currentNode, x, y), h: getHeuristicCost(x, y)});
                    exports.debug.fire('adjacent', {x: x, y: y});
                } else {

                    var tile = openList[openListIndex];

                    //find out if this tile would be a better route to the tile we foudn
                    var gFromHere = getMovementCost(currentNode, tile.x, tile.y);

                    if (tile.g >= gFromHere) {
                        tile.parent = currentNode;
                        tile.g = gFromHere;
                    }
                }
            }
        }
    };

    //add our initial actor location to the open list
    openList.push({parent: null, x: start.x, y: start.y, g: 0});
    addAdjacencies(openList[0]);

    //shift our initial node off the open list onto the closed list.
    closedList.push(openList.shift());

    //index of our target
    var closedListIndex;

    //archive of lowest cost nodes,
    //used to detect impassable paths
    var currentOrHigherIterations = 0;
    var previousLowestCost = null;

    //go while we still have nodes
    while (openList.length > 0) {

        //grab the lowest cost node.
        var currentNode = getLowestCostNode();

        //find out the cost of the current node
        var currentCost = currentNode.g + currentNode.h;

        //compare the cost to that of our last lowest. If its higher,
        //make a note of that (by incrementing currentOrHigherIterations)
        //and if not, reset that counter as we're still making progress to the target
        if (!previousLowestCost || previousLowestCost <= currentCost) {
            currentOrHigherIterations++;

            //if we've made no progress for 5000 iterations
            //we're probably never going to hit our target
            if (currentOrHigherIterations > 5000) {
                throw new Error('No path found with in iteration limit');
            }

        } else {
            currentOrHigherIterations = 0;
        }

        //save our current cost as the previous cost.
        previousLowestCost = currentCost;

        exports.debug.fire('current', currentNode);
        openList.splice(openList.indexOf(currentNode), 1);
        closedList.push(currentNode);

        if (currentNode.x == target.x && currentNode.y == target.y) {
            closedListIndex = closedList.indexOf(currentNode);
            break;
        }

        addAdjacencies(currentNode);
        exports.debug.fire('open', openList);
        exports.debug.fire('closed', closedList);

    }

    //if we did get our destination
    if (closedListIndex !== false) {

        var squares = [];
        var node = closedList[closedListIndex];

        //go back through route
        while (node) {

            //also convert co-ordinates
            //from squares to absolute points
            squares.push({x: (node.x), y: (node.y)});
            node = node.parent;
        }

        //return the reversed.
        squares.reverse();
        return squares;

    } else {
        throw new Error('No path found with in iteration limit');
    }
};

/**
 * optimise the path returned by the above function.
 * @param {object} path A path to follow as a list of co-ordinates.
 * @return {Array} An optimised list of co-ordinates.
 */
exports.optimisePath = function(path) {

    var newPath = [];
    var lastDiff = {x: 0, y: 0};

    for (var i = 1; i < path.length; i++) {
        var diff = {x: path[i].x - path[i - 1].x, y: path[i].y - path[i - 1].y};
        if (diff.x != lastDiff.x || diff.y != lastDiff.y) {
            newPath.push(path[i - 1]);
        }
        lastDiff = diff;
    }

    //always add the destination
    newPath.push(path[path.length - 1]);
    return newPath;
};

/**
 * Convert a grid space to an absolute co-ordinate,
 * which then refers to the centre of that tile
 * @param {number} number The co-ordinate.
 * @param {number} tileSize The tile size.
 * @return {Number} The converted amount.
 */
exports.toAbsoluteCoordinate = function(number, tileSize) {
    return (number * tileSize) + (tileSize / 2);
};

/**
 * Convert the output of findPath
 * into absolute pixel co-ordinates,
 * given a pixel size of each square of the nav matrix
 * @param {Object} path the path from findPath.
 * @param {Number} tileSize The tile size.
 * @return {Array} The new path list.
 */
exports.convertCoords = function(path, tileSize) {
    if (path.length == 0) {
        return path;
    }
    path.forEach(function(item) {
        item.x = exports.toAbsoluteCoordinate(item.x, tileSize);
        item.y = exports.toAbsoluteCoordinate(item.y, tileSize);
    });
    return path;
};
