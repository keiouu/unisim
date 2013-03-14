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

exports.debug = function(game) {

    var open = [];
    var closed = [];
    var adjacencies = [];
    var currentNode;

    /**
     * Respond to a new currentNode
     * @param node
     */
    this.currentEvent = function(node) {
        currentNode = node;
        adjacencies = [];
    };

    /**
     * Respond to a new adjacent node
     * @param node
     */
    this.adjacentEvent = function(node) {
        adjacencies.push(node);
    };

    /**
     * Show a new open list
     * @param list
     */
    this.openEvent = function(list) {
        open = list;
    };

    /**
     * show a new closed list
     * @param list
     */
    this.closedEvent = function(list) {
        closed = list;
    };

    /**
     * Paint the actors on the screen
     * @param {object} g Graphics message.
     */
    this.paintEvent = function(g) {
        var ctx = g.context;

        var tileSize = game.world.getTileSize();

        //highlight open list in green
        ctx.fillStyle = 'rgba(0,255,0,0.5)';
        for (var i = 0; i < open.length; i++) {
            ctx.fillRect(open[i].x * tileSize - game.offsetX, open[i].y * tileSize - game.offsetY, tileSize, tileSize);
        }

        //highlight closed list in red
        ctx.fillStyle = 'rgba(255,0,0,0.5)';
        for (i = 0; i < closed.length; i++) {
            ctx.fillRect(closed[i].x * tileSize - game.offsetX, closed[i].y * tileSize - game.offsetY, tileSize, tileSize);
        }

        //highlight adjacencies in yellow
        ctx.fillStyle = 'rgba(255,255,0,0.5)';
        for (i = 0; i < adjacencies.length; i++) {
            ctx.fillRect(adjacencies[i].x * tileSize - game.offsetX, adjacencies[i].y * tileSize - game.offsetY, tileSize, tileSize);
        }

        //highlight current tile in blue
        if (typeof currentNode != 'undefined') {
            ctx.fillStyle = 'rgba(0,0,255,0.5)';
            ctx.fillRect(currentNode.x * tileSize - game.offsetX, currentNode.y * tileSize - game.offsetY, tileSize, tileSize);
        }
    }
};
