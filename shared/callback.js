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

exports.CallbackManager = function() {

    var callbacks = {};

    /**
     * Add a callback
     * @param {String} tag The tag.
     * @param {Function} callback The callback.
     * @param {Object} self The object that created the callback.
     */
    this.on = function(tag, callback, self) {
        if (typeof callback == 'function') {
            if (callbacks[tag]) {
                callbacks[tag].push({callback: callback, self: self});
            } else {
                callbacks[tag] = [
                    {callback: callback, self: self}
                ];
            }
        }
    };

    /**
     * Fire the callbacks.
     * @param {String} tag The tag.
     * @param {Object} data The data to pass.
     * @return {boolean} Whether we fired any callbacks.
     */
    this.fire = function(tag, data) {
        if (callbacks.hasOwnProperty(tag) && callbacks[tag].length > 0) {
            for (var i = 0; i < callbacks[tag].length; i++) {
                callbacks[tag][i].callback(data, callbacks[tag][i].self);
            }
            return true;
        } else {
            return false;
        }
    };
};
