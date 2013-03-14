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

    //Graphics stuff
    var load = require('lib/images.js');
    var loader = new load.ImageLoader();
    var actorImage = loader.addImage('../images/actor.png');
    var staffImage = loader.addImage('../images/staff.png');
    var debugImage = loader.addImage('../images/actorDebug.png');
    var navMatrix = [];

    var draw = false;
    var loaded = false;
    var showPaths = 0;
    var showCollisionMatrix = false;
    var tileSize = game.world.getTileSize();
    var blockedActors = {};

    var sUI = require('ui/staffhire.js');
    var staffUI = new sUI.StaffHire(game);
    var staffUIShown = false;

    var aUI = require('ui/actor.js');
    var actorUI = new aUI.ActorUI(game);
    var actorUIShown = false;

    var trackedactor = null;
    var trackedX = 0;
    var trackedY = 0;

    game.container.addElement('staffhire', staffUI, 50, 50, -1, '%');
    game.container.alignChild('staffhire', 'centre');
    staffUI.setVisible(false);

    loader.load(function() {
        draw = true;
    });

    var makeStaffUI = function() {
        staffUIShown = true;
        staffUI.refresh();
        staffUI.setVisible(true);
    };

    var ui = require('lib/UiElements.js');
    var label = new ui.Label(20, 10, 'Number of Students: 0');
    game.sideBar.addElement('students', label, 0, 0);

    /**
     * Server has responsed with the bio.
     * @param {Object} message - Array of strings.
     */
    this.staffbioEvent = function(message) {
        var array = message.bio;
        var string = '';
        //Merge them into one string.
        for (i = 0; i < array.length; i++) {
            string += array[i] + '\n \n ';
        }
        staffUI.displayBio(string);
    };

    this.refreshstaffuiEvent = function() {
        staffUI.refresh();
    };

    //Staff Button
    var uiElem = require('lib/UiElements.js');
    var staffButton = new uiElem.Button(50, 20, 'Staff');
    staffButton.addListener('mouseup', function(e) {
        if (staffUIShown) {
            staffUI.setVisible(false);
            staffUIShown = false;
        } else {
            makeStaffUI();
        }
    });

    game.container.addElement('staffButton', staffButton, 280, 10);

    /**
     * Listen for changes to key events
     */
    game.container.addListener('keypress', function(e) {
        if (String.fromCharCode(e) == 'o') {
            showPaths = ++showPaths % 3;
        } else if (String.fromCharCode(e) == 'c') { // C key for collisions
            showCollisionMatrix = !showCollisionMatrix;
        } else if (String.fromCharCode(e) == 'a') { //a key for actorDebug
            game.server.send('actors', 'debugtoggle', {});
        }
    });

    /**
     * request actors to be redownload from the server.
     */
    this.redownloadEvent = function() {
        game.server.send('actors', 'redownload', {});
    };

    /**
     * A list of actors is sent to us!
     * @param {object} data The actors data.
     */
    this.createEvent = function(data) {
        game.actors.fromJson(data);
        loaded = true;
    };

    /**
     * An additional actor is sent to us!
     * @param {object} data The actor data.
     */
    this.addEvent = function(data) {
        game.actors.addFromJson(data);
    };

    this.removeEvent = function(data) {
        game.actors.localRemoveActor(data);
    };

    /**
     * Clear the client's list of actors.
     */
    this.clearEvent = function() {
        game.actors.clearActors();
    };

    /**
     * A reset event from the server,
     * null the paths of actors.
     * @param {object} ids Actor IDs to reset.
     */
    this.resetEvent = function(ids) {
        for (var i = 0; i < ids.length; i++) {
            game.actors.getActor(ids[i]).setPath([]);
        }
    };

    /**
     * Called by the server when an actor
     * has a new path to go to, and the client needs to know.
     * @param {object} msg The msg.
     */
    this.pathEvent = function(msg) {
        game.actors.getActor(msg.id).setPath(msg.path);
        if (game.server) {
            game.server.send('actors', 'startmove', {id: msg.id});
        }

    };

    /**
     * The server giving us details
     * of any actors who shouldn't move.
     * @param {object} data Object of actor -> can they move.
     */
    this.blockedEvent = function(data) {
        blockedActors = data;

        if (game.server) { //debug: request the collision matrix.
            game.server.send('actors', 'collision', {});
        }
    };

    /**
     * We've recieved a collision matrix from the server.
     * @param {object} matrix The collision spatial data.
     */
    this.collisionEvent = function(matrix) {
        navMatrix = matrix;
    };

    /**n
     * Event called by the server every server tick.
     * Move each actor with our Actor Mover.
     */
    this.tickEvent = function() {

        //count for UI
        var numStudents = 0;
        game.actors.each(function(actor, id) {
            if (!blockedActors.hasOwnProperty(id) || blockedActors[id] == false) {
                if (actor.getAttribute('canMove') == 0 && game.server != null) {
                    game.server.send('actors', 'startmove', {id: id});
                }
                actor.applyBearing(1);
            } else {
                //hack, to show bearings
                actor.applyBearing(0);
            }

            if (actor.getType() == 'student') {
                numStudents++;
            }
        });

        //update our student count label.
        var labelText = 'Students: ' + numStudents;
        if (label.getText() != labelText) {
            label.setText(labelText);
        }

        if (actorUIShown && trackedactor) {
            actorUI.redrawSelf();

            var xmove = trackedactor.getX() - trackedX;
            var ymove = trackedactor.getY() - trackedY;

            if (xmove != 0 || ymove != 0) {

                //Move to follow the actor
                game.offsetX += (trackedactor.getX() - trackedX);
                game.offsetY += (trackedactor.getY() - trackedY);

                //Correct game offset.
                if (game.offsetX < 0) {
                    game.offsetX = 0;
                } else if (game.offsetX > ((game.world.getWidth() * tileSize) - window.innerWidth)) {
                    game.offsetX = (game.world.getWidth() * tileSize) - window.innerWidth;
                }

                //Correct game offset.
                if (game.offsetY < 0) {
                    game.offsetY = 0;
                } else if (game.offsetY > ((game.world.getHeight() * tileSize) - window.innerHeight)) {
                    game.offsetY = (game.world.getWidth() * tileSize) - window.innerHeight;
                }

                //Update actor position.
                trackedX = trackedactor.getX();
                trackedY = trackedactor.getY();

                //Redraw the world
                game.redraw = true;
            }
        }

    };

    /**
     * Event to display the server position of Actors
     * @param {object} msg - list of actors.
     */
    this.debugEvent = function(msg) {
        game.actorsdebug.fromJson(msg);
    };

    /**
     * Event to say we have a new maximum number of actors.
     * @param {object} msg - json containing new actor limit.
     */
    this.newcapEvent = function(msg) {
        game.actors.setActorCap(msg.cap);
    };

    /**
     * Stop displaying the debug Actors.
     */
    this.debugstopEvent = function() {
        game.actorsdebug.clearActors();
    };

    /**
     * Capture mouse down events
     * @param {object} e Mouse event data.
     */
    game.container.addListener('mousedown', function(e) {
        //These are used so that actors are easier to select.
        var clickedActor = null;
        var distance = 20;
        actorUIShown = false;

        game.actors.each(function(actor) {

            //If an actor has already been found, skip the rest.
            if (clickedActor != null) {return;}

            var leftX = actor.getX() - (actorImage.width / 4)- game.offsetX;
            var rightX = actor.getX() + (actorImage.width / 4) - game.offsetX;
            var topY = actor.getY() - (actorImage.height / 4) - game.offsetY;
            var bottomY = actor.getY() + (actorImage.height / 4) - game.offsetY;

            if (e.x >= leftX && e.x <= rightX) {
                if (e.y >= topY && e.y <= bottomY) {
                    clickedActor = actor;
                }
            }

        });

        if (clickedActor != null) {
            actorUIShown = true;
            trackedactor = clickedActor;
            trackedX = clickedActor.getX();
            trackedY = clickedActor.getY();
            actorUI = new aUI.ActorUI(game, clickedActor);

            var xLocation = e.x + 30;
            var yLocation = e.y - 65;

            //If the actor is on the right side of the screen, spawn to the left.
            if (xLocation > game.container.getWidth() / 2) {
                xLocation = e.x - 145
            }
            if (yLocation < 0) { //Can't draw off the screen.
                yLocation = 0;
            }

            game.container.addElement('actorui', actorUI, xLocation, yLocation);
        } else {
            actorUIShown = false;
            actorUI.setVisible(false);
        }

    });

    /**
     * Handler for key down events
     * If we move - disable the autotracking of actors.
     * @param {object} e Mouse event data.
     */
    game.container.addListener('keydown', function(e) {

        //If we move - disable actor tracking.
        var moving = false;

        if (e == 37) {      //Left Arrow
            moving = true;
        } else if (e == 38) {//Up Arrow
            moving = true;
        } else if (e == 39) {//Right Arrow
            moving = true;
        } else if (e == 40) {//Down Arrow
            moving = true;
        }

        if (moving) {
            actorUIShown = false;
            actorUI.setVisible(false);
        }
    });

    /**
     * Handler for mouse move events
     * If we move - disable the autotracking of actors.
     * @param {object} e Mouse event data.
     */
    game.container.addListener('mousemove', function(e) {

        //declare variables.
        var mouseX = e.x, mouseY = e.y;

        var edgeSize = 20;
        var moving = false;

        //Border Checks X
        if (mouseX < edgeSize) {
            moving = true;
        } else if (mouseX > window.innerWidth - edgeSize) {
            moving = true;
        }

        //Border Checks Y
        if (mouseY < edgeSize) {
            moving = true;
        } else if (mouseY > window.innerHeight - edgeSize) {
            moving = true;
        }

        if (moving) {
            actorUIShown = false;
            actorUI.setVisible(false);
        }
    });

    /**
     * Server has told us about some client attribute updates.
     * @param {Object} data - server data.
     */
    this.attributesEvent = function(data) {
        var updates = data.updates;

        for (var i = 0; i < updates.length; i++) {
            var actor = game.actors.getActor(updates[i].id);
            actor.setAttributes(updates[i].attributes);
        }
    };

    /**
     * Paint the actors on the screen
     * @param {object} g Graphics message.
     */
    this.paintEvent = function(g) {

        if (!draw || !loaded) {
            return;
        }

        g.context = g.layers[3];

        if (showCollisionMatrix) {
            var d = navMatrix;
            for (var x = 0; x < d.length; x++) {
                for (var y = 0; y < d[0].length; y++) {
                    if (d[x][y].length > 0) {
                        g.context.fillStyle = 'rgba(255,0,0,0.5)';
                    } else {
                        g.context.fillStyle = 'rgba(0,255,0,0.5)';
                    }
                    g.context.fillRect(x * tileSize - game.offsetX, y * tileSize - game.offsetY, tileSize, tileSize);
                }
            }
        }

        var scale = 1;
        var actortype;
        game.actors.each(function(actor) {

            var x = actor.getX() - (actorImage.width * scale / 2);
            var y = actor.getY() - (actorImage.height * scale / 2);

            //show direction
            var bearing = actor.getBearing();
            var distance;

            //show direction
            if (showPaths == 1) {
                g.context.beginPath();
                g.context.fillStyle = 'rgba(255,0,255,1)';
                g.context.strokeStyle = 'rgba(255,0,255,1)'; // a delightful magic pink.
                g.context.moveTo(actor.getX() - game.offsetX, actor.getY() - game.offsetY);

                if (bearing.x != 0 && bearing.y != 0) {
                    distance = 10;
                } else {
                    distance = 14;
                }

                g.context.lineTo(actor.getX() + (bearing.x * distance) - game.offsetX, actor.getY() + (bearing.y * distance) - game.offsetY);
                g.context.closePath();
                g.context.stroke();

                //show entire paths
            } else if (showPaths == 2) {

                //grab our actor's path for drawing
                var path = actor.getPath(), prevPath = {};

                //run through it and draw the lines
                for (var p = 0; p < path.length; p++) {
                    if (p == 0) {
                        prevPath = {x: actor.getX(), y: actor.getY()};
                    } else {
                        prevPath = path[p - 1];
                    }
                    g.context.beginPath();
                    g.context.fillStyle = 'rgba(255,255,0,0.3)';
                    g.context.strokeStyle = 'rgba(255,255,0,0.3)';
                    g.globalCompositeOperation = 'destination-atop';
                    g.context.moveTo(prevPath.x - game.offsetX, prevPath.y - game.offsetY);
                    g.context.lineTo(path[p].x - game.offsetX, path[p].y - game.offsetY);
                    g.context.closePath();
                    g.context.stroke();
                }
            }

            actortype = actor.getType();

            //now draw our actors.
            if (actortype == 'staff') {
                drawImageIfValid(g.context, staffImage, x - game.offsetX,
                    y - game.offsetY, actorImage.width * scale, actorImage.height * scale);
            }
            else {
                drawImageIfValid(g.context, actorImage, x - game.offsetX,
                    y - game.offsetY, actorImage.width * scale, actorImage.height * scale);
            }

        });

        //DEBUG ACTORS
        game.actorsdebug.each(function(actor) {

            var x = actor.getX() - (actorImage.width * scale / 2);
            var y = actor.getY() - (actorImage.height * scale / 2);

            drawImageIfValid(g.context, debugImage, x - game.offsetX,
                y - game.offsetY, actorImage.width * scale, actorImage.height * scale);

        });

    };

    /**
     * Function to check image would be drawn on screen
     * @param {object} context The 2d context to draw into.
     * @param {object} image The image to be drawn.
     * @param {int} x The x coordinate of the canvas to draw the image at.
     * @param {int} y The y coordinate of the canvas to draw the image at.
     * @param {number} width The width of the image to be drawn.
     * @param {number} height The height of the image to be drawn.
     */
    var drawImageIfValid = function(context, image, x, y, width, height) {
        //Check placement is valid (Image can be seen)
        if (x + tileSize > 0 && x < context.canvas.width) {
            if (y + tileSize > 0 && y < context.canvas.width) {
                context.drawImage(image, x, y, width, height);
            }
        }
    };
};
