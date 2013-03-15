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

//ECMAScript strict
'use strict';

//if jenkins exit now
if (typeof jenkins !== 'undefined') {
    process.exit(0);
}

//Forward declare the server so it can be added to the repository
var gameObjects = {

    world: null, //world module that stores game world
    server: null, //the server to connect to
    money: null, //the money module that stores player balance
    actors: null, //actors module.
    time: null, //timing module.
    research: null, //research module.
    courses: null, //courses module
    speed: null, //multiplier for speed things.
    masterServer: null //The master server object
};

//Create the game world
var researchModule = require('./lib/researchlib.js');
var actorModule = require('../shared/actorlib.js');
var worldModule = require('../shared/worldlib.js');
var lib = require('../shared/buildinglib.js');
var timeModule = require('../shared/timelib.js');
var courseModule = require('../shared/courselib.js');
var moneyModule = require('./lib/money.js');
var saveloadModule = require('./lib/saveloadlib.js');
var registerModule = require('./lib/saveloadlib.js');

/**
 * A game world for the university.
 * @type {worldModule.World}
 */
gameObjects.world = new worldModule.World();

/**
 * A shared money object.
 * @type {moneyModule.Money}
 */
gameObjects.money = new moneyModule.Money();
gameObjects.money.initialize(1000000);

/**
 * A shared actor repository.
 * @type {actorModule.ActorsRepository}s
 */
gameObjects.actors = new actorModule.Actors();

/**
 * A shared time repository.
 * @type {timeModule.TimeRepository}
 */
gameObjects.time = new timeModule.TimeRepository(10, 0);

/**
 * A shared building repository.
 * @type {lib.BuildingRepository}
 */
gameObjects.buildings = new lib.BuildingRepository();

/**
 * A courses repository.
 * @type {courseModule.CoursesRepository}
 */
gameObjects.courses = new courseModule.CoursesRepository();

/**
 * A shared research repository. Of some kind.
 * @type {researchModule.ResearchRepository}
 */
gameObjects.research = new researchModule.ResearchRepository();

/**
 * A shared save/load module.
 * @type {saveloadModule.SaveLoad}
 */
gameObjects.saveload = new saveloadModule.SaveLoad();

//Setup express http server
var express = require('express');
var app = express();

//init http server, serve anything in /client or /shared
var httpServer = require('http').createServer(app);
app.use(express.static(__dirname + '/../client/'));
app.use(express.static(__dirname + '/../shared/'));

//create a scheduler to fire tick events
var cb = require('../shared/callback.js');

/**
 * A scheduler to fire tick events.
 * @type {cb.CallbackManager}
 */
gameObjects.scheduler = new cb.CallbackManager();

//now create our socket.io server abstraction obj
var gameServer = require('./architecture/server.js');

/**
 * A net server abstracted from socket IO.
 * @type {gameServer.Server}
 */
gameObjects.server = new gameServer.Server(httpServer);

//now create our socket.io server abstraction obj
var masterServer = require('./architecture/register.js');

//Load the config file, once loaded connect to master server
var fileName = 'config.json';
var fs = require('fs');
gameObjects.config = JSON.parse(fs.readFileSync(fileName, 'utf8'));
console.log(gameObjects.config);



fs.exists(fileName, function(exists) {
    if (exists) {
        fs.stat(fileName, function(error, stats) {
            fs.open(fileName, 'r', function(error, fd) {
                var buffer = new Buffer(stats.size);
                fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
                    var data = buffer.toString('utf8', 0, buffer.length);
                    data = JSON.parse(data);
                    gameObjects.config = data;
                    //Create our master server abstraction object, give it a reference to the game server object, so it can get the number of connected clients
                    gameObjects.masterServer = new masterServer.Register(gameObjects.server, data);
                    fs.close(fd);
                });
            });
        });
    }
});

//Load modules through Repository
var rep = require('./architecture/repository.js');
var repository = new rep.Repository(gameObjects);

//and set our http server going
httpServer.listen(9090);

/*
 * Server Input Monitor
 * listen on stdin for server
 * 3 param messages get parsed as JSON.
 * e.g.: building create {"tl":{"x":30,"y":30},"br":{"x":60,"y":60},"id":0}
 */
var stdin = process.openStdin();
stdin.on('data', function(chunk) {
    var msg = chunk.toString().trim().split(' ');

    if (msg.length == 2) {
        gameObjects.server.spoofRoute({res: msg[0], verb: msg[1], msg: {} });
    } else if (msg.length == 3) {
        console.log(JSON.parse(msg[2]));
        gameObjects.server.spoofRoute({res: msg[0], verb: msg[1], msg: JSON.parse(msg[2]) });
    }
});

/*
 * Game Loop Code:
 */

/**
 * Desired Frames Per Second.
 * @type {number}
 */
var fps = 12;

/**
 * Boolean on whether to loop or not.
 * @type {Boolean}
 */
gameObjects.loop = true;

/**
 * A multiplier for game speed based on FPS.
 * @type {Number}
 */
gameObjects.speed = Math.floor(60 / fps);
/**
 * The time interval in ms that the server should check for next update.
 * @type {number}
 */
var skipTicks = 1000 / fps;
/**
 * The number of frames that can be skipped before
 * dropping the loop.
 * @type {integer}
 */
var maxFrameSkip = 5;
/**
 * The time when when the server should check for next update.
 * @type {number}
 */
var nextGameTick = (new Date).getTime();

//server loop
(function loop() {

    if (gameObjects.loop) {
        //Game loop with server updates.
        var loops = 0;

        //While the time is past the next tick and we haven't updated maximum times.
        while ((new Date).getTime() > nextGameTick && loops < maxFrameSkip) {

            //now tell the modules we've ticked.
            if (gameObjects.server.clientCount() > 0) {
                gameObjects.scheduler.fire('tick', {});
            }

            nextGameTick += skipTicks; //Add time until next update.

            loops++;
        }

        //schedule another loop
        setTimeout(loop, skipTicks);
    }
}());
