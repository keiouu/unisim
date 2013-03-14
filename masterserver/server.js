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

//if jenkins exit now
if (typeof jenkins !== 'undefined') {
    process.exit(0);
}

//Forward declare the server so it can be added to the repository
var gameObjects = {
    server: null, // The server abstraction object
    servers: {}, //the servers that are registered with this meta server
    template: null //the html template
};

//Setup express http server
var express = require('express');
var app = express();

//Load the template file
var fs = require('fs');
var fileName = 'htmlTemplate.tpl';
fs.exists(fileName, function(exists) {
    if (exists) {
        fs.stat(fileName, function(error, stats) {
            fs.open(fileName, 'r', function(error, fd) {
                var buffer = new Buffer(stats.size);
                fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
                    var data = buffer.toString('utf8', 0, buffer.length);
                    gameObjects.template = data;
                    fs.close(fd);
                });
            });
        });
    }
});

//init http server, serve anything in /client or /shared
var httpServer = require('http').createServer(app);
app.use(express.static(__dirname + '/public'));

//create a scheduler to fire tick events
var cb = require('../shared/callback.js');

/**
 * A scheduler to fire tick events.
 * @type {cb.CallbackManager}
 */
gameObjects.scheduler = new cb.CallbackManager();

//now create our socket.io server abstraction obj
var masterServer = require('./architecture/server.js');

/**
 * A net server abstracted from socket IO.
 * @type {gameServer.Server}
 */
gameObjects.server = new masterServer.Server(httpServer);

//Load modules through Repository
var rep = require('./architecture/repository.js');
var repository = new rep.Repository(gameObjects);

//and set our http server going
httpServer.listen(8080);

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

/**
 * Desired delay between refreshing server list in seconds.
 * @type {number}
 */
var delay = 15;

/**
 * The time interval in ms that the server should check for next update.
 * @type {number}
 */
var skipTicks = 1000 * delay;

/**
 * The time when when the server should check for next update.
 * @type {number}
 */
var nextGameTick = (new Date).getTime();

//server loop
(function loop() {

    //While the time is past the next tick and we haven't updated maximum times.
    while ((new Date).getTime() > nextGameTick) {
        gameObjects.scheduler.fire('tick', {});
        nextGameTick += skipTicks; //Add time until next update.
    }

    //schedule another loop
    setTimeout(loop, skipTicks);
}());
