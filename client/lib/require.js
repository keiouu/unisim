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

var require_cache = {};

/**
 * A function to load a JavaScript file in a Node.js like way,
 * creating an exports object, loading the file in (blocking) and then returning exports.
 *
 * Eval is used here due to IE not always triggering onload callbacks for the more traditional
 * injected script tags that you'd use to load JS from JS.
 *
 * @see: http://stackoverflow.com/a/3248500
 *
 * @param {string} url The url to attempt to load.
 * @return {object} The loaded module exports object.
 */
var require = function(url) {

    'use strict';

    var exports = {};

    //fake a request response if we
    //have the cached responseText.
    if (require_cache.hasOwnProperty(url)) {
        request = {responseText: require_cache[url]};
        //console.log('cache hit: '+url);
    } else {
        //console.log('cache miss '+url);
        var request = new XMLHttpRequest();
        request.open('GET', url, false);
        request.send();
    }

    try {
        eval(request.responseText); //oh dear
        require_cache[url] = request.responseText;
        return exports;
    } catch (err) {
        if (typeof err.lineNumber == 'undefined') {
            err.lineNumber = '(If you were on Firefox you would know the line number.)';
        }
        console.log('Failed to load: ' + url + ' - ' + err.message, err.lineNumber);
        return null;
    }
};
