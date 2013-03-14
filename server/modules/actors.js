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

exports.actors = function(game) {

    //require in our A* path finding library
    var pathlib = require('../lib/pathfinding.js');
    var startx = pathlib.toAbsoluteCoordinate(game.world.getEntranceX(), game.world.getTileSize());
    var starty = pathlib.toAbsoluteCoordinate(game.world.getEntranceY(), game.world.getTileSize());

    /* - UNCOMMENT THIS BLOCK FOR PATHFINDING DEBUG VIEW
     //handle debugging the pathfinding library: current node
     pathlib.debug.on('current', function(node) {
     game.server.broadcast('debug', 'current', node);
     });

     //handle debugging the pathfinding library: show new adjacencies
     pathlib.debug.on('adjacent', function(node) {
     game.server.broadcast('debug', 'adjacent', node);
     });

     //handle debugging the pathfinding library: show open list
     pathlib.debug.on('open', function(list) {
     game.server.broadcast('debug', 'open', list);
     });

     //handle debugging the pathfinding library: show open list
     pathlib.debug.on('closed', function(list) {
     game.server.broadcast('debug', 'closed', list);
     });
     */
    var cols = require('../lib/collisionlib.js');
    var collisions = new cols.CollisionManager(game.world, game.actors);

    var maxWaitTime = 90;
    var debugMode = false;

    var debugTick = 0;
    var populateTick = 0;

    var randomFR = require('../lib/randomfilereadlib.js');
    var randomStaffBios = new randomFR.RandomFileReader('randomStaffBios');

    /**
     * Get a target building for the given actor to pathfind their way to.
     * @param {object} actor The actor looking for a building.
     */
    var getTargetBuilding = function(actor) {

        //Check for lectures first:
        var lectureDetails = game.time.getLectureSoonLocationByCourse(actor.getCourse());
        if (lectureDetails) {
            return lectureDetails.building;
        }

        //Array that stores the probabilities of each event:
        var probabilityTotal = 0;
        var probabilities = [];
        var probAmount = 0;

        //grab our actor influences
        var influences = actor.getInfluences();

        //Calculate all the probabilities.
        for (var influence in influences) {
            if (influences.hasOwnProperty(influence)) {
                probAmount = Math.random() * influences[influence];
                probabilities.push(probAmount);
                probabilityTotal += probAmount;
            }
        }

        //Determine the normalised probabilities
        var probabilitiesNormalisedTotal = 0;
        var probabilitiesNormalised = [];

        for (var i = 0; i < probabilities.length; i++) {
            probAmount = probabilities[i] / probabilityTotal;

            //The value for the next element will be the normalised propabilty, plus all the previous probabilties.
            probabilitiesNormalised.push(probAmount + probabilitiesNormalisedTotal);
            probabilitiesNormalisedTotal += probAmount;
        }

        //select a building type.
        var randNumber = Math.random();
        var buildingType;

        //Our random number dictates which action to take.
        if (randNumber < probabilitiesNormalised[0]) {
            buildingType = 'Recreational';
        } else if (randNumber < probabilitiesNormalised[1]) {
            buildingType = 'Academic';
        } else if (randNumber < probabilitiesNormalised[2]) {
            if (actor.getType() == 'staff') {
                buildingType = 'Staff';
            } else {
                buildingType = 'Accommodation';
            }
        } else if (randNumber < probabilitiesNormalised[3]) {
            buildingType = 'Food';
        } else {
            buildingType = '';
        }

        //If we are wanting to go to a lecture.
        if (buildingType == 'Academic') {
            //Check if we should be in a lecture and we are not.
            var lectureDetails = game.time.getLectureNowLocationByCourse(actor.getCourse());
            if (lectureDetails) {
                return lectureDetails.building;
            } else {
                buildingType = '';
            }
        }

        //send actors to their home accomodation / staff co-ordinate if they want accomodation or have nothing to do
        if (buildingType == 'Staff' || buildingType == 'Accommodation' || !buildingType) {
            return game.buildings.getBuildingAtLocation(actor.getAccomX(), actor.getAccomY());
        }

        //find buildings of the type we're trying to get to.
        var buildingResults = game.buildings.getBuildingsByType(buildingType);
        if (buildingResults[0] != null) {

            //find the closest result
            var closestBuilding = null;
            var closestDistance = null;

            for (i = 0; i < buildingResults.length; i++) {

                var tl = {x: buildingResults[i].getX(), y: buildingResults[i].getY()};
                var br = {x: tl.x + buildingResults[i].getWidth(), y: tl.y + buildingResults[i].getHeight()};

                var distX = Math.abs(((tl.x + br.x) / 2) - actor.getX());
                var distY = Math.abs(((tl.y + br.y) / 2) - actor.getY());

                //if this building is closer than any we've found yet then select it
                if (closestDistance == null || (distX + distY) < closestDistance) {
                    closestBuilding = buildingResults[i];
                    closestDistance = distX + distY;
                }
            }
        }

        //return the best result.
        return closestBuilding;
    };

    /**
     * Generate a new path for an actor, based upon new buildings.
     * @param {object} actor - the actor object to get a path for.
     * @return {object} target coordinates in {targetX, targetY}.
     */
    var newPath = function(actor) {

        //store the tile size, we use it a lot
        var gridSize = game.world.getTileSize();

        //where should we go within
        //each building type?
        var tileTypes = {
            Academic: {
                staff: 'lecturn', //in lectures, staff go to lecturns
                student: 'chair'  //while students sit on chairs.
            },
            Food: {
                staff: 'floor',
                student: 'floor'
            },
            Recreational: {
                staff: 'barStool',
                student: 'barStool'
            },
            Accommodation: {
                staff: 'bed',
                student: 'bed'
            },
            Staff: {
                staff: 'sofa',
                student: 'floor'
            }
        };

        //grab a building to aim for.
        var destination = getTargetBuilding(actor);
        var targetX, targetY;

        if (destination) {

            //if we're already at our destination building we'll just stay where we are.
            if (destination.getX() < actor.getX() && destination.getX() + destination.getWidth() > actor.getX()) {
                if (destination.getY() < actor.getY() && destination.getY() + destination.getHeight() > actor.getY()) {
                    targetX = Math.floor(actor.getX() / gridSize);
                    targetY = Math.floor(actor.getY() / gridSize);
                }
            }

            //we're not already at our destination
            if (!targetX && !targetY) {

                //where does this type of actor go to in this type of building?
                var targetTile = tileTypes[destination.getType()][actor.getType()];

                //convert building co-ordinates into tiles.
                var tileX = Math.floor(destination.getX() / gridSize);
                var tileY = Math.floor(destination.getY() / gridSize);
                var tileW = Math.floor(destination.getWidth() / gridSize);
                var tileH = Math.floor(destination.getHeight() / gridSize);

                //query a world to get a list of the positions of all un reserved chairs in the building.
                var places = game.world.getTilesByTypeInArea(tileX, tileY, tileW, tileH, targetTile, {reserved: false});

                //we have a place to go to
                if (places.length > 0) {

                    //Look for home bed first.
                    if (destination.getType() == 'Accommodation' || destination.getType() == 'Staff') {
                        if (game.world.tile(Math.floor(actor.getAccomX() / gridSize), Math.floor(actor.getAccomY() / gridSize)) == targetTile) {
                            targetX = actor.getAccomX() / gridSize;
                            targetY = actor.getAccomY() / gridSize;
                        }
                    }

                    do { //for now, pick a random, unoccupied chair.
                        var randomPlace = places[Math.floor(Math.random() * (places.length - 1))];
                        targetX = randomPlace.x;
                        targetY = randomPlace.y;
                    } while (game.world.getMetadata(targetX, targetY, 'reserved') == true);

                }
            }

            if (targetX && targetY) {

                //if we did have a target tile within a building, we'd better reserve it.
                game.world.setMetadata(targetX, targetY, 'reserved', true);
            }
        }

        //If we don't have a building to go to in particular we'll just pick somewhere random to wander to.
        var navMatrix = game.world.getNavMatrix(); //grab the nav matrix so we can avoid navigating actors to impassable tiles.
        while (targetX == null || targetY == null || navMatrix[targetX][targetY].cost == -1) {
            targetX = Math.floor(Math.random() * game.world.getWidth() / 2);
            targetY = Math.floor(Math.random() * game.world.getHeight() / 2);

            //Prevent wanderers from going into buildings.
            if (game.world.tile(targetX, targetY) != 'grass') {
                targetX = null;
                targetY = null;
            }
        }

        //Make the actor wait when they hit the destination.
        actor.setAttribute('waiting', maxWaitTime);

        //handle releasing locks on tiles if we are actually due to move away somewhere.
        if(targetX != Math.floor(actor.getX() / gridSize) || targetY != Math.floor(actor.getY() / gridSize)) {

            //staff leaving lecture rooms
            if (actor.getType() == 'staff') {
                var building = game.buildings.getBuildingAtLocation(actor.getX(), actor.getY());
                if (building != null) {
                    building.modifyNumberStaff(-1);
                }
            }

            //unreserve our actor's current tile, so they don't claim places that they aren't actually at.
            game.world.setMetadata(Math.floor(actor.getX() / gridSize), Math.floor(actor.getY() / gridSize), 'reserved', false);
        }

        //and return our new target.
        return {x: targetX, y: targetY};
    };

    /**
     * Check if the actor is at a building, and if so,
     * adjust the actor's attributes accordingly.
     * @param {Object} actor - actor to update.
     */
    var updateAttributes = function(actor) {

        var building = game.buildings.getBuildingAtLocation(actor.getX(), actor.getY());

        var staff = (actor.getType() == 'staff');

        if (Math.random() < 0.25) {
            actor.modifyAttribute('tiredness', -1);
        }
        if (Math.random() < 5) {
            actor.modifyAttribute('hunger', -1);
        }

        //If there was a building
        if (building != null) {

            var bname = building.getName();

            //Set the building to staffed as they arrive
            if (staff && actor.getWaitingTime() == maxWaitTime) {
                building.modifyNumberStaff(1);
            }

            if (bname == 'Lecture Theatre') {
                if (building.getNumberStaff() > 0) {
                    //Actors can only be trained if there is a lecturer
                    if (Math.random() < 0.5) {
                        actor.modifyAttribute('degreeQuality', 1);
                    }
                    actor.modifyAttribute('happiness', -1);
                    if (!staff) {
                        game.money.payment(1);
                    }
                }
            } else if (bname == 'Seminar Room') {
                if (building.getNumberStaff() > 0) {
                    //Actors can only be trained if there is a lecturer
                    actor.modifyAttribute('degreeQuality', 1);
                    actor.modifyAttribute('happiness', -3);
                    if (!staff) {
                        game.money.payment(1);
                    }
                }
            } else if (bname == 'Alcoholic Lager Bar') {
                if (Math.random() < 0.2) {
                    actor.modifyAttribute('degreeQuality', -1);
                }
                if (Math.random() < 0.5) {
                    actor.modifyAttribute('tiredness', -1);
                }
                actor.modifyAttribute('happiness', 3);
                if (!staff) {
                    game.money.payment(1);
                }
            } else if (bname == 'Bag Ette') {
                actor.modifyAttribute('hunger', 8);
                if (Math.random() < 0.5) {
                    actor.modifyAttribute('happiness', 1);
                }
                if (!staff) {
                    game.money.payment(1);
                }
            } else if (bname == 'Mocha Shop') {
                actor.modifyAttribute('hunger', 19);
                actor.modifyAttribute('happiness', 1);
                if (!staff) {
                    game.money.payment(2);
                }
            } else if (bname == 'Flat Flats' || bname == 'Staff Room') {
                actor.modifyAttribute('tiredness', 5);
            }
        }

        if (actor.getAttribute('waiting') > 0) {
            actor.modifyAttribute('waiting', -1);
        }

    };

    /**
     * Listen for buildings being placed, and recalculate
     * the paths of any actors about to intersect them
     */
    game.buildings.buildingAdded(function(building) {

        //grab the building location and the size of our tiles
        var idsToReset = [];

        game.actors.each(function(actor, id) {

            var path = actor.getPath();

            //if their path nodes intersect, delete path
            for (var i = 0; i < path.length; i++) {
                if (path[i].x >= building.getX() && path[i].y >= building.getY()) {
                    if (path[i].x <= building.getX() + building.getWidth() && path[i].y <= building.getY() + building.getHeight()) {
                        idsToReset.push(id);
                        actor.setPath([]);
                        break;
                    }
                }
            }
        });

        //tell our client to reset
        if (idsToReset.length > 0) {
            game.server.broadcast('actors', 'reset', idsToReset);
        }
    });

    /**
     * Send the actors to the client when they connect
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     */
    game.server.on('actors', 'connect', function(message, client) {
        client.send('actors', 'create', game.actors.toJson());
        client.send('actors', 'blocked', collisions.getBlockedActorInfo());
    });

    /**
     * Request a redownload of actors
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     */
    game.server.on('actors', 'redownload', function(message, client) {
        client.send('actors', 'create', game.actors.toJson());
    });

    /**
     * Adds a staff member.
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     */
    game.server.on('actors', 'staff', function(message, client) {

        if (game.courses.getTypes().indexOf(message.course) != -1) {

            var accommodation = game.buildings.getFreeStaffRoom();
            var tilesize = game.world.getTileSize();
            if (accommodation != null) { //If there are valid courses.
                var destTiles = game.world.getTilesByTypeInArea(accommodation.getX() / tilesize, accommodation.getY() / tilesize,
                    accommodation.getWidth() / tilesize, accommodation.getHeight() / tilesize, 'sofa');
                var sofa = destTiles[accommodation.getOccupants()];
                var accomX = sofa.x * tilesize;
                var accomY = sofa.y * tilesize;
                game.actors.addActor('staff', startx, starty, message.course, accomX, accomY);
                accommodation.modifyOccupants(1);
            } else {
                client.send('ui', 'error', 'Staff must have a staff room to go to.');
            }

        } else {
            client.send('ui', 'error', 'Staff must teach a subject.');
        }

    });

    /**
     * Actor can start moving again as client has received message.
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     */
    game.server.on('actors', 'startmove', function(message, client) {
        if (typeof game.actors.getActor(message.id) != 'undefined') {
            game.actors.getActor(message.id).setAttribute('canMove', 1);
        }
    });

    game.actors.actorAdded(function() {
        game.server.broadcast('actors', 'add', game.actors.lastActortoJson());
    });

    game.actors.actorRemoved(function() {
        game.server.broadcast('actors', 'remove', game.actors.getLastRemoved());
    });

    /**
     * Toggles the debug mode on and off
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     */
    game.server.on('actors', 'debugtoggle', function(message, client) {
        debugMode = debugMode ? false : true; //Toggle Debug Mode.

        if (!debugMode) {
            game.server.broadcast('actors', 'debugstop', {});
        }
        console.log('Actor Debug set to: ' + debugMode);
    });

    collisions.onBlockedActorsChanged(function() {
        game.server.broadcast('actors', 'blocked', collisions.getBlockedActorInfo());
    });

    /**
     * Called by the server each loop iteration
     */
    game.scheduler.on('tick', function(data) {

        //nav matrix from the world
        var navMatrix = game.world.getNavMatrix();
        var maxPathFinds = 5;
        var actorAttributeUpdates = [];
        var tileSize = game.world.getTileSize();

        game.server.broadcast('actors', 'collision', collisions.getSpatialData());

        //iterate through actors, move 'em
        collisions.handleMovement(game.speed, function(actor, id) {

            var setNewPath = false;

            //actor.setStayTick(actor.getStayTick() + 6);
            if (actor.getStayTick() >= actor.getLeaveTick() &&
                (actor.getX() / game.world.getTileSize()) == game.world.getEntranceX() &&
                (actor.getY() / game.world.getTileSize()) == game.world.getEntranceY()) {
                game.actors.removeActor(actor);
                return false;
            } else {
                //If the actor is waiting at his destination
                if (!actor.hasPath() && actor.getWaiting()) {
                    updateAttributes(actor);
                    var json = {id: id, attributes: actor.getAttributes()};
                    actorAttributeUpdates.push(json);
                } else {
                    //Check if actor is in a lecture
                    //Find the lecture that the actor should be in
                    var lecture = game.time.getLectureNowLocationByCourse(actor.getCourse());

                    //If there is a lecture, and the actor is in the lecture
                    if (lecture != null && game.buildings.getBuildingAtLocation(actor.getX(), actor.getY()) ==
                        game.buildings.getBuildingAtLocation(lecture.tl.x, lecture.tl.y)) {
                        actor.setAttribute('waiting', maxWaitTime); //Tell actor to keep attending lecture.
                    } else {
                        //Check to see if at the end of our path
                        //calculate new path if we've done less than 10
                        while (!actor.hasPath() && maxPathFinds-- > 0) {

                            var target = {x: null, y: null};

                            //grab a target for the actor to go to
                            if (actor.getStayTick() >= actor.getLeaveTick()) {

                                //we're supposed to be leaving, so off we go
                                target.x = game.world.getEntranceX();
                                target.y = game.world.getEntranceY();
                            } else {

                                //grab a new path while we don't have a valid target to head to
                                while (!target.x || !target.y || navMatrix[target.x][target.y] == -1) {
                                    target = newPath(actor);
                                }
                            }

                            try {

                                //calculate our path from the target using the A* pathfinding & convert co-ordinates
                                var p = pathlib.convertCoords(pathlib.findPath({x: Math.floor(actor.getX() / tileSize),
                                        y: Math.floor(actor.getY() / tileSize)},
                                    navMatrix, actor.getWeight(), target), tileSize);

                                //send to client
                                if (p.length > 0) {
                                    actor.setPath(p);
                                    game.server.broadcast('actors', 'path', {id: id, path: pathlib.optimisePath(p)});
                                    actor.setAttribute('canMove', 0);
                                    setNewPath = true;
                                }

                            } catch (e) {

                                //if we have no path the A* can't get to that target
                                //so we'd better blacklist it so we don't try again
                                game.world.setTileWeight(target.x, target.y, -1);
                                console.log('Failed to go to ' + game.world.tile(target.x, target.y));
                            }
                        }
                    }
                }
            }

            //If in Debug mode..
            if (debugMode) {
                debugTick++;
                if (debugTick > 5) {
                    game.server.broadcast('actors', 'debug', game.actors.toJson());
                    debugTick = 0;
                }
            }

            return (!setNewPath && actor.getAttribute('canMove') == 1);
        });

        //If we have updates to send.
        if (actorAttributeUpdates.length > 0) {
            game.server.broadcast('actors', 'attributes', {updates: actorAttributeUpdates});
        }

        //Check if we have the desired number of actors
        //populate with actors every 20th tick if possible.
        if (populateTick < 20) {
            populateTick++;
        }

        if (populateTick == 20 && game.actors.count() < game.actors.getActorCap()) {
            var course = game.courses.getRandomValidCourse();
            var accommodation = game.buildings.getFreeAccommodation();
            if (course != null && accommodation != null) { //If there are valid courses.
                //Look for the next free bed to assign.
                var destTiles = game.world.getTilesByTypeInArea(accommodation.getX() / tileSize, accommodation.getY() / tileSize,
                    accommodation.getWidth() / tileSize, accommodation.getHeight() / tileSize, 'bed');
                var bed = destTiles[accommodation.getOccupants()];
                var accomX = bed.x * tileSize;
                var accomY = bed.y * tileSize;
                game.actors.addActor('student', startx, starty, course, accomX, accomY);
                accommodation.modifyOccupants(1);
            }

            populateTick = 0;
        }

    });

    /**
     * Save the actor module's contents to file.
     * @param {object} msg The msg from the client.
     * @param {object} client The client.
     */
    game.server.on('actors', 'save', function(msg, client) {
        var json = game.actors.toJson();
        game.saveload.save('actors', msg.savename, json);
    });

    /**
     * Load the actor module's contents from file.
     * @param {object} msg The msg from the client.
     * @param {object} client The client.
     */
    game.server.on('actors', 'load', function(msg, client) {
        var json = game.saveload.load('actors', msg.savename);
        client.send('actors', 'clear');
        game.actors.fromJson(json);
        client.send('actors', 'redownload');
    });

    /**
     * Generate a staff bio with a number of sentences.
     * @param {object} msg The msg from the client.
     * @param {object} client The client.
     */
    game.server.on('actors', 'staffbio', function(msg, client) {
        var bio = randomStaffBios.getRandomLines(msg.number);
        client.send('actors', 'staffbio', {bio: bio});
    });

};
