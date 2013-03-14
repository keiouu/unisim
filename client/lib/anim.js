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

/**
 * Desired Frames Per Second.
 * @type {number}
 */
exports.fps = 60;
/**
 * The time interval in ms that the client should check for next update.
 * @type {number}
 */
exports.skipTicks = 1000 / exports.fps;
/**
 * The number of frames that can be skipped before
 * a server redownload request should be sent.
 * @type {integer}
 */
exports.maxFrameSkip = 60;
/**
 * The time when when the client should check for next update.
 * @type {number}
 */
exports.nextGameTick = (new Date).getTime();

(function() {
    var onEachFrame;
    if (window.webkitRequestAnimationFrame) //Webkit Animation Frame
    {
        onEachFrame = function(cb) {
            var _cb = function() {
                cb();
                webkitRequestAnimationFrame(_cb);
            };
            _cb();
        };
    } else if (window.mozRequestAnimationFrame) //Firefox Animation Frame
    {
        onEachFrame = function(cb) {
            var _cb = function() {
                cb();
                mozRequestAnimationFrame(_cb);
            };
            _cb();
        };
    } else {  //Backup setInterval
        onEachFrame = function(cb) {
            setInterval(cb, exports.skipTicks);
        };
    }

    exports.onEachFrame = onEachFrame;
})();
