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
 * Encode a message for transmission
 * @param {String} res The resource.
 * @param {String} verb The verb.
 * @param {String} msg The msg.
 * @return {Object} The encoded object.
 */
exports.encode = function(res, verb, msg) {
    return {res: res, verb: verb, msg: msg};
};

/**
 * Decode a message into {res:, verb:, msg:} format
 * @param {String} msg The message to decode.
 * @return {object} The decoded message.
 */
exports.decode = function(msg) {
    return msg;
};
