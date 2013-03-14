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

exports.Repository = function(game) {

    'use strict';

    //put the names of modules you want to load here
    //don't modify anything other than that.
    var load = ['world', 'actors', 'building', 'money', 'time', 'courses', 'research', 'saveload', 'ui', 'tutorial', 'debug'];

    //loaded modules.
    var modules = {};

    //now we load in the modules
    for (var i = 0; i < load.length; i++) {
        var namespace = require('modules/' + load[i] + '.js');
        modules[load[i]] = new namespace[load[i]](game);
        console.log('loaded ' + load[i]);
    }

    /**
     * Get all loaded modules
     * @return {Object} A list of modules.
     */
    this.getModules = function() {
        return modules;
    };
};
