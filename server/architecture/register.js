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

// Require in our Encoder
var Encoder = require('../../shared/encoder.js');

/**
 * A Server object to wrap a socket
 * @param {object} socket A Socket.io socket.
 * @constructor
 */
var Server = function(socket) {

    /**
     * A socket.io socket
     * @type {object}
     */
    var skt = socket;

    /**
     * Send some data - a verb & optional message
     * @param {string} res The resource to send.
     * @param {string} verb The verb to send.
     * @param {object=} message The message.
     *
     */
    this.send = function(res, verb, message) {
        skt.emit('message', Encoder.encode(res, verb, message));
    };
};

/**
 * Create a master server registration object
 * @param {Server} gameServer The object representing the running game server (not the master server).
 * @param {json} config The server config properties, such as server name and max clients.
 * @constructor
 */
exports.Register = function(gameServer, config) {
    //create websocket to server to test module events
    var io = require('socket.io-client');
    var socket = new io.connect('http://localhost:8080');

    var server = new Server(socket);

    //general message callback
    socket.on('message', function(data) {
        var decoded = Encoder.decode(data);
        if (decoded.res == 'connections' && decoded.verb == 'requestDetails') {
            server.send('connections', 'sendDetails', {name: config.name, details: {clients: gameServer.clientCount(), maxClients: config.maxClients}});
        }
    });

    //callback for connections
    socket.on('connect', function() {
        server = new Server(socket);
    });

    /**
     * Get a server to send data to
     * @return {object} The server object.
     */
    this.getServer = function() {
        return server;
    };
};
