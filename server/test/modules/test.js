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

exports.test = function() {

    'use strict';
    var called = false;

    /**
     * Test event
     */
    this.testEvent = function() {
        called = true;
    };

    /**
     * Was our event called?
     * @return {boolean} Whether we were called.
     */
    this.wasCalled = function() {
        return called;
    };

    /**
     * Clear whether we were called
     */
    this.clearCalled = function() {
        called = false;
    };
};
