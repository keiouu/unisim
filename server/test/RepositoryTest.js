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

var assert = require('assert');
var rep = require('../architecture/repository.js');

//load from our test dir
process.chdir('./test/');
var repository = new rep.Repository({});

describe('Repository', function() {
    describe('#getModules()', function() {
        it('should load test, but not broken', function() {
            var modules = repository.getModules();
            assert.equal(typeof modules['test'], 'object');
            assert.equal(typeof modules['broken'], 'undefined');
        });
    });
});
