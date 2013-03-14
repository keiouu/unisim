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

'use strict';

/**
 * Objects shared between modules.
 * @type {Object}
 */
var gameObjects = {
    offsetX: 0, //the global world offset
    offsetY: 0, //again, but on the Y axis
    server: null, //the server to connect to
    money: null, //the money object that stores player balance
    redraw: true, //whether or not the world image buffer needs to be redrawn
    container: null //The main ui container
};

//add in an actors.
var act = require('actorlib.js');
var inp = require('lib/input.js');
var repo = require('architecture/repository.js');
var cl = require('architecture/client.js');
var bui = require('buildinglib.js');
var anim = require('lib/anim.js');
var route = require('router.js');
var wor = require('worldlib.js');
var ui = require('lib/UiElement.js');
var uiElems = require('lib/UiElements.js');
var course = require('courselib.js');

/**
 * World.
 * @type {wor.World}
 */
gameObjects.world = new wor.World();

/**
 * Actors.
 * @type {act.Actors}
 */
gameObjects.actors = new act.Actors();

/**
 * Actors.
 * @type {act.Actors}
 */
gameObjects.actorsdebug = new act.Actors();

/**
 * Buildings.
 * @type {bui.BuildingRepository}
 */
gameObjects.buildings = new bui.BuildingRepository();

/**
 * Courses.
 * @type {course.CoursesRepository}
 */
gameObjects.courses = new course.CoursesRepository();

var cb = require('./callback.js');
/**
 * Tutorial Callback listener.
 * @type {cb.CallbackManager}
 */
gameObjects.tutorial = new cb.CallbackManager();

//grab the graphics context for our canvas
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

/**
 * Canvas width.
 * @type {Number}
 */
canvas.width = window.innerWidth;

/**
 * Canvas height.
 * @type {Number}
 */
canvas.height = window.innerHeight;

/**
 * Root UI container.
 * @type {cont.Container}
 */
gameObjects.container = new ui.UiElement(canvas.width, canvas.height, 0, null);

/**
 * Side bar shared by modules.
 * @type {uiElems.Menu}
 */
gameObjects.sideBar = new uiElems.Menu(200, 80, 'University Statistics');
gameObjects.container.addElement('sidebar', gameObjects.sideBar, 10, 10);

/**
 * Input handler.
 * @type {inp.Input}
 */
gameObjects.input = new inp.Input(canvas, gameObjects.container, router);

/**
 * Module repository.
 * @type {repo.Repository}
 */
var repository = new repo.Repository(gameObjects);

/**
 * Router, soon to be deprecated.
 * @type {route.Router}
 */
var router = new route.Router(repository);

/**
 * And the client side network layer.
 * @type {cl.Client}
 */
var client = new cl.Client(router);

/**
 * A shared server object so clients
 * can send messages apropos of nothing
 * @type {Object}
 */
gameObjects.server = null;

//canvas layers
var canvases = [];
for (var i = 0; i < 5; i++) {
    var canv = document.createElement('canvas').getContext('2d');

    /**
     * The height of the canvas.
     * @type {Number}
     */
    canv.canvas.height = window.innerHeight;

    /**
     * The width of the canvas.
     * @type {Number}
     */
    canv.canvas.width = window.innerWidth;
    canvases.push(canv);
}

/**
 * Called when the window is resized.
 * Set the canvas width, height.
 */
window.onresize = function() {

    /**
     * Canvas width
     * @type {Number}
     */
    canvas.width = window.innerWidth;

    /**
     * Canvas height
     * @type {Number}
     */
    canvas.height = window.innerHeight;
    for (var i = 0; i < canvases.length; i++) {

        //update the size of our canvas elements
        canvases[i].canvas.height = window.innerHeight;
        canvases[i].canvas.width = window.innerWidth;

        //update the size of our root UI container
        gameObjects.container.setSize(window.innerWidth, window.innerHeight);
    }

    gameObjects.redraw = true;

    // redraw everything on screen
    gameObjects.container.setRedraw(true);
};

/**
 * Boolean on whether to loop or not.
 * @type {Boolean}
 */
gameObjects.loop = true;

//fire a tick event each frame
//also (usually) fire a paint evt
anim.onEachFrame(function() {

    if (!anim) {
        return;
        /*    } else if (gameObjects.mainMenu) {
         router.route({res: 'mainMenu', verb: 'paint', msg: {context: ctx}});
         return;
         */
    } else if (gameObjects.server == null) {
        gameObjects.server = client.getServer();
    }

    //Game loop with client updates and draw screen request.
    var loops = 0;

    //While the time is past the next tick and we haven't updated maximum times.
    while ((new Date).getTime() > anim.nextGameTick && loops < anim.maxFrameSkip) {

        //Client side updates go here.
        router.route({res: null, verb: 'tick', msg: {}});

        anim.nextGameTick += anim.skipTicks; //Add time until next update.

        loops++;
    }

    //Check to see if we have not caught up with the server.
    if (loops == anim.maxFrameSkip && loops != 0) {
        //Request a world resend..
        router.route({res: null, verb: 'redownload', msg: {}});
        anim.nextGameTick = (new Date).getTime();
    }

    if (gameObjects.redraw == true) {

        //Only redraw the image buffer when necessary
        router.route({res: null, verb: 'redraw', msg: {}});
    }

    //Draw the game only if there has been an update
    if (loops != 0) {

        //route paint event to modules. Context is for backwards compatibility, should use layers.
        router.route({res: null, verb: 'paint', msg: {context: canvases[0], layers: canvases}});

        //now draw our various layers in order.
        for (var i = 0; i < canvases.length; i++) {
            ctx.drawImage(canvases[i].canvas, 0, 0, canvas.width, canvas.height);
            // do not clear layer2, let world handle that, layer 4 is ui
            if (i != 2) {
                canvases[i].clearRect(0, 0, canvases[i].canvas.width, canvases[i].canvas.height);
            }
        }
    }

    //Draw the ui last
    gameObjects.sideBar.distributeChildren(true, 10, 10);
    gameObjects.container.drawComponent(canvases[4]);
});
