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

exports.RandomFileReader = function(filename) {

    var fs = require('fs');
    var filepath = 'lib/filereader_files/' + filename;

    //To be implemented:
    var fileExists = true;

    if (fileExists) {
        var content = fs.readFileSync(filepath, 'utf8').match(/[^\r\n]+/g);
        var contentLength = content.length;
    } else {
        content = [];
        contentLength = 0;
        console.log('No such file: ' + filename);
    }

    /**
     * Randomly return a specified number of lines, each being different.
     * @param {Integer} number - number of lines to return.
     * @return {Object} - an array of Strings containing set number of random lines or all of them.
     */
    this.getRandomLines = function(number) {

        var returnArray = [];

        shuffleArray();

        if (number < contentLength && number > 0) {
            //Add a random line for each we have specified.
            for (var i = 0; i < number; i++) {
                returnArray.push(content[i]);
            }
        } else {
            //Otherwise return the entire array
            return content;
        }
        return returnArray;
    };

    /**
     * Randomise order of elements in our array.
     * Uses the Fisher-Yates shuffle algorithm.
     */
    var shuffleArray = function() {
        //Working from the end backwards
        for (var i = contentLength - 1; i > 0; i--) {
            //Pick from only the elements available (i.e. before i)
            var j = Math.floor(Math.random() * (i + 1));
            //Swap i and j.
            var temp = content[i];
            content[i] = content[j];
            content[j] = temp;
        }
    };

};
