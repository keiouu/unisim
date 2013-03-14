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

'use strict';
var assert = require('assert');
var route = require('../../shared/router.js');
var test = require('./modules/test.js');

//load a couple of test modules
var module1 = new test.test();
var module2 = new test.test();

//mock up a repo
var repository = {
    getModules: function() {
        return {module1: module1, module2: module2};
    }
};

//create a router with our fake repository
var router = new route.Router(repository);

describe('Router', function() {
    describe('#route()', function() {
        it('should route messages', function() {

            //test routing to a specific module
            router.route({res: 'module1', verb: 'test', msg: {}});
            assert.equal(false, module2.wasCalled());
            assert.equal(true, module1.wasCalled());
            module1.clearCalled();

            //test routing to all modules
            router.route({res: null, verb: 'test', msg: {}});
            assert.equal(true, module2.wasCalled());
            assert.equal(true, module1.wasCalled());
        });
    });
});
