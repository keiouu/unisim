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

exports.ResearchRepository = function() {

    /**
     * A list of researches and their state.
     * @type {Array}
     */
    var researchTree = [];

    var cb = require('../../shared/callback.js');
    var callbacks = new cb.CallbackManager();

    /**
     * Convert the research to be transfered across the network.
     * @return {object} A serialized research object.
     */
    this.serialize = function() {
        var l = researchTree.length;
        var newResearch = [];
        for (var i = 0; i < l; i++) {
            var obj = {name: researchTree[i].getName(), duration: researchTree[i].getDuration(),
                requirement: researchTree[i].getRequirement(), complete: researchTree[i].getComplete()};
            newResearch.push(obj);
        }
        return newResearch;
    };

    /**
     * Add a research object to this repository.
     * @param {object} research The research.
     */
    this.addResearch = function(research) {
        researchTree.push(research);
    };

    /**
     * Return the index of a research with a given name.
     * @param {string} resName - name of the research to find.
     * @return {number} the index of the research. -1 if not found.
     */
    this.getIndexByName = function(resName) {
        var length = researchTree.length;

        for (var i = 0; i < length; i++) {
            if (researchTree[i].getName() == resName) {
                return i;
            }
        }

        return -1;
    };

    this.getResearchTree = function() {
        return researchTree;
    };

    this.completeResearch = function(index) {
        researchTree[index].setComplete(true);
        callbacks.fire('researchComplete');
    };

    this.onResearchCompleted = function(func) {
        callbacks.on('researchComplete', func);
    };

};

/**
 * An Individual Research Item
 * @param {string} name The item name.
 * @param {number} duration How long it takes.
 * @param {object} requirement Any pre-requisites.
 * @param {function} func A callback to run on completion.
 * @constructor
 */
exports.Research = function(name, duration, requirement, func) {

    var researchName = name;
    var researchDuration = duration;
    var researchRequirement = requirement;
    var researchComplete = false;

    this.researchMethod = func;

    /**
     * Get the name of the research
     * @return {String} research name.
     */
    this.getName = function() {
        return researchName;
    };

    /**
     * Get the duration of the research in ticks.
     * @return {number} research duration in ticks.
     */
    this.getDuration = function() {
        return researchDuration;
    };

    /**
     * Get the requirements of the research
     * @return {String} prior research name.
     */
    this.getRequirement = function() {
        return researchRequirement;
    };

    /**
     * Get if the research is complete
     * @return {boolean} research complete or not.
     */
    this.getComplete = function() {
        return researchComplete;
    };

    /**
     * Set if the research is complete
     * @param {boolean} value - value to set reserachComplete.
     */
    this.setComplete = function(value) {
        researchComplete = value;
    };

};
