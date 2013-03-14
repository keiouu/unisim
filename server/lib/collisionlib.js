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

var testDeadlock = true;

/**
 * Create a collision manager, allowing spacial identification
 * of actors based on a nav grid of a given size.
 *
 * The collision manager acts as a wrapper for the actor repository,
 * taking commands to move the actors and applying its own collision logic in between.
 * @param {object} world The game world of tiles.
 * @param {object} actors The actor repository.
 * @constructor
 */
exports.CollisionManager = function(world, actors) {

    var width = world.getWidth();
    var height = world.getHeight();
    var tileSize = world.getTileSize();

    var doCollisions = true;

    //matrix of positions
    var spatialData = [];

    //list of actor ID -> position
    //to allow reverse lookups
    var linearData = {};

    //actors blocked this tick
    var blockedActors = {};

    //have the actors blocked changed?
    var blockedChanged = false;

    //a callback to fire when actors are blocked/unblocked
    var blockedCallback = null;

    var actorRepo = actors;

    //pad out our spatial matrix
    for (var x = 0; x < width; x++) {
        spatialData[x] = [];
        for (var y = 0; y < height; y++) {
            spatialData[x][y] = [];
        }
    }

    /**
     * Find out whether the given world tile contains a stationary actor.
     * @param {number} x The x tile.
     * @param {number} y The y tile.
     * @return {boolean} Whether we have an actor there.
     */
    this.tileContainsStationaryActor = function(x, y) {
        if (spatialData[x][y].length > 0) {
            var actorBearing = actorRepo.getActor(spatialData[x][y][0]).getBearing();
            return (actorBearing.x == 0 && actorBearing.y == 0);
        }
        return false;
    };

    /**
     * Get spatial collision data.
     * This is only for debugging.
     * @return {Array} The data.
     */
    this.getSpatialData = function() {
        return spatialData;
    };

    /**
     * Get info about the blocked actors.
     * @return {Object} actor The actor.
     */
    this.getBlockedActorInfo = function() {
        var newlyBlocked = [];
        for (var id in blockedActors) {
            if (blockedActors.hasOwnProperty(id)) {
                var actor = actorRepo.getActor(id);
                newlyBlocked[id] = {x: actor.getX(),
                    y: actor.getY(),
                    path: actor.getPath(),
                    blocked: blockedActors[id]};
            }
        }
        return blockedActors;
    };

    /**
     * Detect whether the given actor is deadlocked.
     * @param {number} id The actor ID to test for deadlock.
     * @return {boolean} Are they deadlocked?
     */
    var isDeadlocked = function(id) {

        //save our initial actor
        var startid = id;
        var maxIterations = 10;

        do {
            //figure out where the actor on the given tile is trying to go
            var bearing = actorRepo.getActor(id).getBearing();

            //they're not deadlocked if they're able to move. Also, make sure they're actually attempting to move.
            if (blockedActors[id] == false || (bearing.x == 0 && bearing.y == 0)) {
                return false;
            }

            //grab the next actor to check. Will be an empty list if no-one else.
            id = spatialData[linearData[id].x + bearing.x][linearData[id].y + bearing.y][0];

        } while (id != startid && typeof id == 'number' && --maxIterations > 0);

        //oh dear
        return true;
    };

    /**
     * Update the position of our actor in our collision matrix.
     * @param {number} id an ID to associate with the actor.
     * @param {object} actor The actor to update.
     * @param {number} multiplier how far to move.
     */
    var moveActorAndUpdatePosition = function(id, actor, multiplier) {

        var oldXTile, oldYTile;
        if (!linearData.hasOwnProperty(id)) {
            oldXTile = Math.floor(actor.getX() / tileSize);
            oldYTile = Math.floor(actor.getY() / tileSize);
        } else {
            oldXTile = linearData[id].x;
            oldYTile = linearData[id].y;
        }

        //add our actor to the spatial grid in their position
        if (spatialData[oldXTile][oldYTile].indexOf(id) == -1) {
            spatialData[oldXTile][oldYTile].push(id);
            linearData[id] = {x: oldXTile, y: oldYTile};
        }

        var bearing = actor.getBearing();
        var newXTile = Math.floor((actor.getX() + (bearing.x * multiplier)) / tileSize);
        var newYTile = Math.floor((actor.getY() + (bearing.y * multiplier)) / tileSize);
        var xIsTheProblem;

        //detect the "stepped diagonals" issue where actors move south then west rather than southwest, skip moving if so.
        if (bearing.x != 0 && bearing.y != 0 && ((xIsTheProblem = (newXTile - oldXTile == 0)) != (newYTile - oldYTile == 0))) {
            newXTile = oldXTile;
            newYTile = oldYTile;
        }

        //lets be optimistic, eh
        var canMove = true;

        //they're going to move tiles
        //in the spacial domain, so move them over
        if ((oldXTile != newXTile || oldYTile != newYTile)) {

            //initial canmove check - is there an actor ahead?
            canMove = spatialData[newXTile][newYTile].length == 0;

            if (!canMove) { //only disallow movement if going in same direction

                var otherActor = actorRepo.getActor(spatialData[newXTile][newYTile][0]); //below: ignore if we're on a non colliding tile (like chairs)
                var shouldIgnore = !world.tileHasCollision(newXTile, newYTile);
                var dir = otherActor.getBearing();

                //so if they're going in precisely the opposite direction to us we'll let them go by, or if they're waiting we'll go by
                if ((dir.x == actor.getBearing().x * -1 && dir.y == actor.getBearing().y * -1) || shouldIgnore) {
                    canMove = true;
                }
            }

            //break circular deadlocks by allowing one actor to move
            if (!canMove && testDeadlock && isDeadlocked(id)) {
                canMove = true;
            }

            //move the actor if allowed
            if (canMove || !doCollisions) {
                spatialData[oldXTile][oldYTile].splice(spatialData[oldXTile][oldYTile].indexOf(id), 1);
                spatialData[newXTile][newYTile].push(id);
                linearData[id] = {x: newXTile, y: newYTile};
            }
        }

        if ((blockedActors[id] != !canMove) && doCollisions) {
            blockedActors[id] = !canMove;
            blockedChanged = true;
        }

        if (canMove || !doCollisions) {
            actor.applyBearing(multiplier);
        }
    };

    /**
     * Handle movement
     * @param {number} multiplier The amount to move.
     * @param {function} callback A callback that must return true when given an actor & id if the actors are to move.
     */
    this.handleMovement = function(multiplier, callback) {

        blockedChanged = false;
        actorRepo.each(function(actor, id) {
            //run the callback
            if (callback(actor, id)) {
                moveActorAndUpdatePosition(id, actor, multiplier);
            }

        });

        if (blockedChanged) {
            blockedCallback();
        }
    };

    /**
     * Register a callback to fire
     * when the list of blocked actors changes
     * @param {function} callback The callback to run.
     */
    this.onBlockedActorsChanged = function(callback) {
        if (typeof callback == 'function') {
            blockedCallback = callback;
        }
    };
};
