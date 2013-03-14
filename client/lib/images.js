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

exports.ImageLoader = function() {

    this.images = [];
    this.sources = [];
    this.toload = 0;

    /**
     * Add an image
     * @param {string} source The image source URL.
     * @return {Image} The image, currently blank, that will be loaded into.
     * @this ImageLoader
     */
    this.addImage = function(source) {
        var image = new Image();
        this.sources.push('images/' + source);
        this.images.push(image);
        this.toload++;
        return image;
    };

    /**
     * Load all images
     * @param {function} callback The callback to fire when all images are loaded.
     * @this ImageLoader
     */
    this.load = function(callback) {

        for (var i = 0; i < this.sources.length; i++) {

            //grab image
            var img = this.images[i];
            var scope = this;

            //tell us when its loaded
            img.onload = function() {
                if (--scope.toload == 0) {
                    callback(); //fire callback if all images loaded
                }
            };

            //now set our image loading
            img.src = this.sources[i];
        }
    };
};
