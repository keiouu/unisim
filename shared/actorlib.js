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

exports.Actor = function(nx, ny, type, ncourse, accomX, accomY) {

    if (typeof nx != 'number' || typeof ny != 'number') {
        throw new Error('Bad X or Y co-ordinate');
    }

    //initialise various actor variables, including their attributes
    var x = nx, y = ny, xMod = 0, yMod = 0, path = [], pathWeight = 0, attributes = {
        happiness: 500,
        degreeQuality: 0,
        tiredness: 1000,
        hunger: 1000,
        waiting: 0,
        canMove: 0
    };

    var stayTime = {
        current: 0,
        leave: Math.floor(Math.random() * 1000) + 1000
    };

    var influences = {
        happiness: Math.random() + 0.5, //Randomly generate a number between 0.5-1.5
        degreeQuality: Math.random() + 0.5,
        tiredness: Math.random() + 0.5,
        hunger: Math.random() + 0.5,
        nothing: Math.random() //Want it to be less likely most of the time.
    };

    var course = ncourse;
    var accommodationX = accomX;
    var accommodationY = accomY;

    /**
     * Get our type.
     * @return {String} The type.
     */
    this.getType = function() {
        return type;
    };

    /**
     * Get our X position.
     * @return {Number} The position.
     */
    this.getX = function() {
        return x;
    };

    this.setX = function(nx) {
        x = nx;
    };

    this.setY = function(ny) {
        y = ny;
    };

    /**
     * Initialize the path weighting
     */
    this.initializeWeight = function() {
        //We want a random number between 1 and 2.
        pathWeight = Math.random() + 1;
    };

    /**
     *  Get the path weighting
     *  @return {Number} The weighting of using paths in pathfinding.
     */
    this.getWeight = function() {
        return pathWeight;
    };

    /**
     *  Set the weighting (Should only be used for JSON conversion)
     *  @param {Number} weight pathWeight value to set.
     */
    this.setWeight = function(weight) {
        pathWeight = weight;
    };

    /**
     * Get our Y position.
     * @return {Number} The position.
     */
    this.getY = function() {
        return y;
    };

    /**
     * Do we have a path?
     * @return {Boolean} Whether we have a path.
     */
    this.hasPath = function() {
        return path.length > 0;
    };

    /**
     * Get our bearing
     * @return {Object} The bearing {x: y: }.
     */
    this.getBearing = function() {
        return {x: xMod, y: yMod};
    };

    /**
     * Recalculate our bearing,
     * dependent on our current path.
     */
    var recalculateBearing = function() {

        //no path? don't move
        if (!path.length) {
            xMod = 0;
            yMod = 0;
            return;
        }

        //not currently going anywhere, or have invalid amounts given to us?
        if ((!xMod != 1 || xMod != -1) && (yMod != 1 || yMod != -1)) {
            if (x < path[0].x) {
                xMod = 1;
            } else if (x > path[0].x) {
                xMod = -1;
            } else {
                xMod = 0;
            }
            if (y < path[0].y) {
                yMod = 1;
            } else if (y > path[0].y) {
                yMod = -1;
            } else {
                yMod = 0;
            }
        }
    };

    /**
     * Apply our bearing to our position.
     * @param {number} multiplier An amount to multiply movement speed by.
     */
    this.applyBearing = function(multiplier) {

        if (!path.length) {
            return;
        }

        //apply our bearings
        x += (xMod * multiplier);
        y += (yMod * multiplier);

        //if at destination
        if (x == path[0].x && y == path[0].y) {
            path.shift();
            recalculateBearing();
        }
    };

    /**
     * Accesses the actors current "Stay Time" tick
     * @return {number} Current tick count for this actor.
     */
    this.getStayTick = function() {
        return stayTime.current;
    };

    /**
     * Accesses the actors "Leave Time" tick count
     * @return {number} Tick count for this actor to leave.
     */
    this.getLeaveTick = function() {
        return stayTime.leave;
    };

    /**
     * Sets the actor's new "Stay Time" tick
     * @param {number} tick new tick count for this actor.
     */
    this.setStayTick = function(tick) {
        stayTime.current = tick;
    };

    /**
     * Get an actor attribute.
     * @param {String} attr The attr to get.
     * @return {Number} The attribute.
     */
    this.getAttribute = function(attr) {
        return attributes[attr];
    };

    /**
     * Get all actor attributes.
     * @return {Object} An object of all attributes.
     */
    this.getAttributes = function() {
        return attributes;
    };

    /**
     * Set the attributes of this actor.
     * @param {object} attrs An object of new attributes.
     */
    this.setAttributes = function(attrs) {
        attributes = attrs;
    };

    /**
     * Modify an actor's attribute.
     * @param {string} attr The attribute to modify.
     * @param {number} amount The amount to modify by.
     */
    this.modifyAttribute = function(attr, amount) {
        if (attributes.hasOwnProperty(attr)) {
            attributes[attr] += amount;
            if (attributes[attr] > 1000) {
                attributes[attr] = 1000;
            } else if (attributes[attr] < 0) {
                attributes[attr] = 0;
            }
        } else {
            throw new Error('Bad Attribute ' + attr);
        }
    };

    /**
     * Set an actor's attribute.
     * @param {string} attr The attribute to modify.
     * @param {number} amount The amount to modify by.
     */
    this.setAttribute = function(attr, amount) {
        if (attributes.hasOwnProperty(attr)) {
            attributes[attr] = amount;
        } else {
            throw new Error('Bad Attribute ' + attr);
        }
    };

    /**
     * Get an actor attribute.
     * @param {String} attr The attr to get.
     * @return {Number} The attribute.
     */
    this.getInfluence = function(attr) {
        return influences[attr];
    };

    /**
     * Get all actor influences.
     * @return {Object} An object of all influences.
     */
    this.getInfluences = function() {
        return influences;
    };

    /**
     * Set the influences of this actor.
     * @param {object} attrs An object of new influences.
     */
    this.setInfluences = function(attrs) {
        influences = attrs;
    };

    /**
     * Set our actor path
     * @param {Array} newPath A new path of [{x, y}].
     * @param {Boolean=} teleport Whether to teleport to path start.
     */
    this.setPath = function(newPath, teleport) {
        if (typeof teleport == 'undefined') {
            teleport = true;
        }
        path = newPath; //set new path
        if (newPath.length > 0 && teleport) {
            x = newPath[0].x;
            y = newPath[0].y;
        }
        recalculateBearing();
    };

    /**
     * Get our current path.
     * @return {Array} The path (a shallow copy).
     */
    this.getPath = function() {
        return path.slice(0);
    };

    /**
     * Get if the actor is currently waiting.
     * @return {Boolean} if waiting or not (waiting > 0).
     */
    this.getWaiting = function() {
        return attributes['waiting'] > 0;
    };

    /**
     * Get the remaining time to wait.
     * @return {number} Time left to wait.
     */
    this.getWaitingTime = function() {
        return attributes['waiting'];
    };

    /**
     * Get the course the actor is on.
     * @return {String} The position.
     */
    this.getCourse = function() {
        return course;
    };

    /**
     * Set the course the actor is on.
     * @param {String} nCourse - The new course.
     */
    this.setCourse = function(nCourse) {
        course = nCourse;
    };

    /**
     * Get the actor's accommodation X position.
     * @return {Number} the actors absolute accomodation X coordinate.
     */
    this.getAccomX = function() {
        return accomX;
    };

    /**
     * Get the actor's accommodation X position.
     * @return {Number} the actors absolute accomodation X coordinate.
     */
    this.getAccomY = function() {
        return accomY;
    };

};

/**
 * Repository class for actors.
 * @constructor
 */
exports.Actors = function() {
    var actors = [];
    var lastRemoved;    // Array id of last actor removed, not ref
    var cb = require('./callback.js');
    var callbacks = new cb.CallbackManager();
    var actorCap = 2;

    /**
     * Add an actor
     * @param {String} type The actor type.
     * @param {Number} x The actor X co-ordinate.
     * @param {Number} y The actor Y co-ordinate.
     * @param {String} course The actor's course that they study.
     * @return {Number} The actor's ID.
     */
    this.addActor = function(type, x, y, course, accomX, accomY) {
        var actor = new exports.Actor(x, y, type, course, accomX, accomY);
        actor.initializeWeight();
        actors.push(actor);
        callbacks.fire('added', actors[actors.length - 1]);
        return actors.length - 1;
    };

    /**
     * Parse from JSON
     * @param {object} json a JSON object.
     * @this is used.
     */
    this.fromJson = function(json) {
        if (json.actors) {
            actors = [];
            for (var i = 0; i < json.actors.length; i++) {
                var actor = this.addActor(json.actors[i].type, json.actors[i].x, json.actors[i].y, json.actors[i].course, json.actors[i].accomX, json.actors[i].accomY);
                this.getActor(actor).setWeight(json.actors[i].weight);
                this.getActor(actor).setAttributes(json.actors[i].attrs);
                this.getActor(actor).setInfluences(json.actors[i].infls);
                this.getActor(actor).setPath(json.actors[i].path);
            }
        }
        if (json.actorCap) {
            actorCap = json.actorCap;
        }
    };

    /**
     * Serialize to JSON
     * @return {object} A JSONable object (only attributes).
     * @this is used.
     */
    this.toJson = function() {
        var json = [];
        this.each(function(actor) {
            json.push({x: actor.getX(), y: actor.getY(), path: actor.getPath(), attrs: actor.getAttributes(), weight: actor.getWeight(),
                infls: actor.getInfluences(), type: actor.getType(), course: actor.getCourse(), accomX: actor.getAccomX(), accomY: actor.getAccomY()});
        });
        return {actors: json, cap: actorCap};
    };

    /**
     * Serialize to JSON
     * @return {object} A JSONable object (only attributes).
     * @this is used.
     */
    this.toJsonDebug = function() {
        var json = [];
        console.log(' ');
        //Send a maximum of 5 actors
        for (act = 0; (act < 5) && (act < actors.length); act++) {
            json.push({x: actors[act].getX(), y: actors[act].getY(), type: actors[act].getType()});
            console.log(act);
        }
        console.log(json);
        return {actors: json};
    };

    /**
     * Serialize to JSON
     * @return {object} A JSONable object (only attributes).
     * @this is used.
     */
    this.lastActortoJson = function() {
        actor = actors[actors.length - 1];
        json = {x: actor.getX(), y: actor.getY(), path: actor.getPath(), attrs: actor.getAttributes(), weight: actor.getWeight(),
            infls: actor.getInfluences(), type: actor.getType(), course: actor.getCourse(), accomX: actor.getAccomX(), accomY: actor.getAccomY()};

        return {actor: json};
    };

    /**
     * Serialize from JSON
     * @param {object} json a JSON actor object.
     * @this is used.
     */
    this.addFromJson = function(json) {
        var actor = this.addActor(json.actor.type, json.actor.x, json.actor.y, json.actor.course, json.actor.accomX, json.actor.accomY);
        this.getActor(actor).setWeight(json.actor.weight);
        this.getActor(actor).setAttributes(json.actor.attrs);
        this.getActor(actor).setInfluences(json.actor.infls);
        this.getActor(actor).setPath(json.actor.path);
    };

    /**
     * Fire when an actor is added
     * @param {function} callback The callback.
     */
    this.actorAdded = function(callback) {
        callbacks.on('added', callback);
    };

    /**
     * Returns the array position of the last actor removed
     * @return {number} Array position of last actor removed.
     */
    this.getLastRemoved = function() {
        return lastRemoved;
    };

    /**
     * Local remove of an actor (No callbacks)
     * @param {number} id Array index of actor to remove.
     */
    this.localRemoveActor = function(id) {
        actors.splice(id, 1);
        console.log(id);
    };

    /**
     * Remove an actor.
     * @param {object} actor The actor.
     */
    this.removeActor = function(actor) {
        lastRemoved = actors.indexOf(actor);
        actors.splice(lastRemoved, 1);
        callbacks.fire('removed', actor);
    };

    /**
     * Fire when an actor is removed.
     * @param {function} callback The callback.
     */
    this.actorRemoved = function(callback) {
        callbacks.on('removed', callback);
    };

    /**
     * Do something for each actor.
     * @param {function} callback The callback to call with each actor and their ID repeatedly.
     */
    this.each = function(callback) {
        for (var i = 0; i < actors.length; i++) {
            callback(actors[i], i);
        }
    };

    /**
     * Count our actors
     * @return {Number} The number.
     */
    this.count = function() {
        return actors.length;
    };

    /**
     * Get a specific actor
     * @param {Number} id The ID.
     * @return {object} The actor.
     */
    this.getActor = function(id) {
        return actors[id];
    };

    /**
     * Check if there is an actor in the specified area, point to note, this does not take into account the actor image size
     * @param {object} tl Top left co-ordinate pair.
     * @param {object} br Bottom right co-ordinate pair.
     * @return {boolean} Whether there is an actor within this region.
     * @this Actor
     */
    this.hasActorsInRegion = function(tl, br) {
        var hasActor = false;
        this.each(function(actor) {
            if (actor.getX() > tl.x && actor.getX() < br.x) {
                if (actor.getY() > tl.y && actor.getY() < br.y) {
                    hasActor = true;
                }
            }
        });

        return hasActor;
    };

    /**
     * Remove all the actors from the list
     */
    this.clearActors = function() {
        actors = [];
    };

    /**
     * Restores actors from the supplied JSON object.
     * @param {Object} json The json object containing the root "actor" element.
     */
    this.restoreActors = function(json) {
        actors = json;
        for (var i = 0; i < actors.length; i++) {
            callbacks.fire('added', actors[i]);
        }
    };

    /**
     * Get the maximum number of actors that can be in the world.
     * @return {Number} maximum number of actors.
     */
    this.getActorCap = function() {
        return actorCap;
    };

    /**
     * Set the maximum number of actors that can be in the world.
     * @param {Number} value - the new maximum number of actors.
     */
    this.setActorCap = function(value) {
        actorCap = value;
    };

};
