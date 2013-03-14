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

exports.html = function(game) {

    var mustache = require('Mustache');

    var generate = function() {
        var data = {servers: new Array()};
        for (var key in game.servers) {
            var details = game.servers[key].details;
            details.name = key;
            data.servers.push(details);
        }

        if (game.template != null) {
            writeHtml(mustache.to_html(game.template, data));
        }
    };

    var writeHtml = function(html) {
        //Write to index.html
        var fs = require('fs');
        var fileName = 'public//index.html';
        fs.writeFile(fileName, html, function(err) {
            if (err) {
                console.log(err);
            }
        });
    };

    /**
     * Called by the server each loop iteration
     */
    game.scheduler.on('tick', function() {
        generate();
    });
};
