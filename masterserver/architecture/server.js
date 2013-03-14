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

//force strict mode
'use strict';

//we need our encode/decode
var Encoder = require('../../shared/encoder.js');
var socketIo = require('socket.io');
var io;

/**
 * A client object to wrap a socket
 * @param {object} socket A Socket.io socket.
 * @constructor
 */
var Client = function(socket) {

    /**
     * A socket.io socket
     * @type {*}
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
 * A constructor for a Server,
 * which in this case wraps socket.io
 * @param {object} http an HTTP server.
 * @constructor
 */
exports.Server = function(http) {

    //nested verb -> res
    var callbacks = {};

    /**
     * Route our message
     * @param {Object} message  {res, verb, msg} - The message to route.
     * @param {Object} socket an object for the server method to reply to.
     */
    var route = function(message, socket) {

        //decode our message, route it
        var msg = Encoder.decode(message);
        if (msg.res && callbacks[msg.verb] && callbacks[msg.verb][msg.res]) {
            for (var i = 0; i < callbacks[msg.verb][msg.res].length; i++) {
                callbacks[msg.verb][msg.res][i](msg.msg, new Client(socket));
            }

            //handle routing to all resources.
        } else if (!msg.res && callbacks[msg.verb]) {
            for (var res in callbacks[msg.verb]) {
                if (callbacks[msg.verb].hasOwnProperty(res)) {
                    route({res: res, verb: msg.verb, msg: msg.msg}, socket);
                }
            }
        }
    };

    /**
     * Route our message as if we (the server) were a client, and print the response to the console
     * @param {Object} message  {res, verb, msg} - The message to route.
     */
    this.spoofRoute = function(message) {
        route(message, {send: function(res, verb, msg) {
            console.log(res, verb, msg);
        } });
    };

    /**
     * Add a callback
     * @param {String} res The resource to trigger the callback (messages with no resource will always trigger).
     * @param {String} verb The verb to trigger the callback.
     * @param {Function} callback The callback to run.
     */
    this.on = function(res, verb, callback) {
        if (callbacks[verb]) {
            if (callbacks[verb][res]) {
                callbacks[verb][res].push(callback);
            } else {
                callbacks[verb][res] = [callback];
            }
        } else {
            var obj = {};
            obj[res] = [callback];
            callbacks[verb] = obj;
        }
    };

    //set up the server
    io = socketIo.listen(http);
    io.set('log level', 1);

    //fire our connect callback
    io.sockets.on('connection', function(socket) {
        route({res: null, verb: 'connect', msg: {}}, socket);

        //general message callback
        socket.on('message', function(message) {
            //we pass the address in the message because for some reason once the socket reaches the connections class, the address has been removed
            message.msg.address = socket.handshake.address.address + ':9090';
            route(message, socket);
        });

        //fire the disconnect callback
        socket.on('disconnect', function(socket) {
            route({res: null, verb: 'disconnect', msg: null}, socket);
        });
    });

    /**
     * Broadcast a message
     * @param {string} res The resource.
     * @param {string} verb The verb.
     * @param {object} message The message.
     */
    this.broadcast = function(res, verb, message) {
        io.sockets.emit('message', Encoder.encode(res, verb, message));
    };
};
