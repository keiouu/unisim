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

exports.SaveLoad = function() {

    var fs = require('fs');

    //Checks save/ directory exists on startup, and creates if missing
    try {
        fs.statSync('save/').isDirectory();
    } catch (err) {
        fs.mkdir('save');
    }

    /**
     * Save the specified module's data for the specific save file.
     * @param {string} module Module name.
     * @param {string} savename The save name for this instance.
     * @param {object} data JSON data object to write.
     */
    this.save = function(module, savename, data) {
        var string = JSON.stringify(data);

        try {
            var dir = 'save/' + savename + '/';
            fs.mkdir(dir);
            fs.writeFile(dir + module + '.json', string, function(err) {
                if (err) {
                    console.log(err);
                }
            });
        } catch (err) {
            console.log(err);
            fs.mkdir('save');
        }
    };

    /**
     * Load the specified module's data for the specific load file.
     * @param {string} module Module name.
     * @param {string} savename The save name for this instance.
     * @return {object} JSON data object read from the file specified.
     */
    this.load = function(module, savename) {
        try {
            var file = 'save/' + savename + '/' + module + '.json';
            var json = fs.readFileSync(file, 'utf8');
            json = JSON.parse(json);
            return json;
        } catch (err) {
            console.log(err);
            fs.mkdir('save');
        }
    };

    /**
     * Gets the list of saves in the save directory.
     * @return {object} Array of the different save names.
     */
    this.getSaves = function() {
        try {
            var saves = fs.readdirSync('save/');
            for (var i = 0; i < saves.length; i++) {
                if (!fs.statSync('save/' + saves[i]).isDirectory()) {
                    saves.splice(i, 1);
                }
            }
            return saves;
        } catch (err) {
            console.log(err);
            fs.mkdir('save');
            return [];
        }
    };
};
