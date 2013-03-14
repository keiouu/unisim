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

exports.Router = function(repository) {

    'use strict';

    /**
     * An object of modules
     * @type {Object}
     */
    var modules = repository.getModules();

    /**
     * Route a message from some source to the relevant module.
     * @param {object} message The message to send.
     * @param {object=} client A client instance.
     * @this Jenkins
     */
    this.route = function(message, client) {

        if (typeof message === 'undefined') {
            return;
        }

        //if null, every module!
        if (message.res === null) {
            for (var mdl in modules) {
                if (modules.hasOwnProperty(mdl)) {
                    this.route({res: mdl, verb: message.verb, msg: message.msg}, client);
                }
            }
            return;
        }

        //find our module
        var module = modules[message.res];
        if (typeof module === 'undefined') {
            console.log('Router: Invalid module specified: ' + message.res);
        }

        //find out if they've defined a valid handler function for this event
        if (typeof module[message.verb.toLowerCase() + 'Event'] === 'function') {
            module[message.verb.toLowerCase() + 'Event'](message.msg, client);
        }
    };
};
