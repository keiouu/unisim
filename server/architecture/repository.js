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

    //loaded modules
    var modules = {};

    //filesystem module
    var fs = require('fs');

    //read in modules
    var folder = process.cwd() + '/modules/';
    var files = fs.readdirSync(folder);

    //now load each of them in turn
    for (var i = 0; i < files.length; i++) {

        //require in our module file
        var module = require(folder + files[i]);
        var constructorName = files[i].substr(0, files[i].length - 3);

        //error checking!
        if (typeof module[constructorName] !== 'function') {
            console.log('ERROR: Module ' + files[i] + ' does not expose a constructor named ' + constructorName);
            continue;
        }

        //construct our module object
        var moduleObject = new module[constructorName](game);
        console.log('Debug: Module ' + files[i] + ' loaded');
        modules[constructorName] = moduleObject;
    }

    /**
     * Get modules loaded by this repository.
     * @return {Object} The loaded modules, in an object of name => object instance pairs.
     */
    this.getModules = function() {
        return modules;
    };
};
