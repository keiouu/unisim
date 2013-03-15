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

exports.Types = ['Academic', 'Recreational', 'Food', 'Accommodation', 'Staff', 'Bar'];

/**
 * Building constructor
 * @param {String} bName The building name.
 * @param {number} bCost The building cost.
 * @param {String} bType The building type.
 * @param {number} bminsize The minimum area the building must cover to be valid.
 * @constructor
 */
exports.Building = function(bName, bCost, bType, bminsize) {

    //check this is a valid building type
    if (exports.Types.indexOf(bType) === -1) {
        throw new Error('Bad Building Type: ' + bType);
    }

    var name = bName;
    var cost = bCost;
    var type = bType;
    var minsize = bminsize;
    var x, y, width, height, widthInTiles, heightInTiles, capacity;
    var numberStaff = 0;
    var subType = '';
    var occupants = 0;

    //Create a timetable if it is an academic building.
    if (type == 'Academic') {
        var tt = require('./timelib.js');
        var timetable = new tt.TimeTable();
    }

    /**
     * Get the name of the building
     * @return {String} Building name.
     */
    this.getName = function() {
        return name;
    };

    /**
     * Get the cost of the building.
     * @return {number} Building cost.
     */
    this.getCost = function() {
        return cost;
    };

    /**
     * Get the type of the building.
     * @return {String} Building type.
     */
    this.getType = function() {
        return type;
    };

    /**
     * Get the min size of the building.
     * @return {int} Building type.
     */
    this.getMinSize = function() {
        return minsize;
    };

    /**
     * Set our X
     * @param {Number} nx The new x.
     */
    this.setX = function(nx) {
        x = nx;
    };

    /**
     * Set our Y
     * @param {Number} ny The new y.
     */
    this.setY = function(ny) {
        y = ny;
    };

    /**
     * Get our X position
     * @return {Number} Our x position.
     */
    this.getX = function() {
        return x;
    };

    /**
     * Get our X position
     * @return {Number} Our y position.
     */
    this.getY = function() {
        return y;
    };

    /**
     * Set our width
     * @param {Number} nwidth Our new width.
     */
    this.setWidth = function(nwidth) {
        width = nwidth;
    };

    /**
     * Set our height
     * @param {Number} nheight Our new height.
     */
    this.setHeight = function(nheight) {
        height = nheight;
    };

    /**
     * Set our width in tiles
     * @param {Number} nwidth Our new width in tiles.
     */
    this.setWidthInTiles = function(nwidth) {
        widthInTiles = nwidth;
    };

    /**
     * Set our height in tiles
     * @param {Number} nheight Our new height in tiles.
     */
    this.setHeightInTiles = function(nheight) {
        heightInTiles = nheight;
    };

    /**
     * Set our minsize
     * @param {Number} nminsize Our new minsize.
     */
    this.setMinSize = function(nminsize) {
        minsize = nminsize;
    };

    /**
     * Get our width.
     * @return {Number} Our width.
     */
    this.getWidth = function() {
        return width;
    };

    /**
     * Get our height.
     * @return {Number} Our height.
     */
    this.getHeight = function() {
        return height;
    };

    /**
     * Get our width in tiles.
     * @return {Number} Our width in tiles.
     */
    this.getWidthInTiles = function() {
        return widthInTiles;
    };

    /**
     * Get our height in tiles.
     * @return {Number} Our height in tiles.
     */
    this.getHeightInTiles = function() {
        return heightInTiles;
    };

    /**
     * Get the capacity of this building.
     * @return {Number} Capacity of this building.
     */
    this.getCapacity = function() {
        return capacity;
    };

    /**
     * Get the occupants of this building.
     * @return {Number} occupants of this building.
     */
    this.getOccupants = function() {
        return occupants;
    };

    /**
     * Set the capacity of this building.
     * @param {Number} newCapacity - New capacity of this building.
     */
    this.setCapacity = function(newCapacity) {
        capacity = newCapacity;
    };

    /**
     * Set the occupants of this building.
     * @param {Number} newOccupants - New occupants of this building.
     */
    this.setOccupants = function(newOccupants) {
        occupants = newOccupants;
    };

    /**
     * Modify the occupants of this building (addition).
     * @param {Number} newOccupants - numbers occupants to add.
     */
    this.modifyOccupants = function(newOccupants) {
        occupants += newOccupants;
    };

    /**
     * Get number of staff inside the building.
     * @return {Number} Our height.
     */
    this.getNumberStaff = function() {
        return numberStaff;
    };

    /**
     * Modify number of staff inside the building.
     * @param {Number} amount - the amount to increase numberStaff by.
     * @this referenced.
     */
    this.modifyNumberStaff = function(amount) {
        numberStaff += amount;
        if (numberStaff < 0) {
            numberStaff = 0;
        }
    };

    /**
     * Set number of staff inside the building.
     * @param {Number} amount - the amount to increase numberStaff by.
     */
    this.setNumberStaff = function(amount) {
        numberStaff = amount;
    };

    /**
     * Set our subtype.
     * @param {String} value - The new subtype for the building.
     */
    this.setSubType = function(value) {
        subType = value;
    };

    /**
     * Get our sub type.
     * @return {String} Our subtype.
     */
    this.getSubType = function() {
        return subType;
    };

    /**
     * Get the timetable
     * @return {Object} timetable object or null.
     */
    this.getTimetable = function() {
        return timetable;
    };

    /**
     * Set the timetable
     * @param {Object} value - timetable object or null.
     */
    this.setTimetable = function(value) {
        if (timetable != null) {
            timetable.fromJSON(value);
        }

    };

    /**
     * Checks if the building has a timetable.
     * @return {Boolean} - true if timetable, false if null.
     */
    this.hasTimetable = function() {
        return (timetable != null);
    };

};

/**
 * Building repository
 * @constructor
 */
exports.BuildingRepository = function() {

    /**
     * A list of buildings
     * @type {Array}
     */
    var buildings = [];

    /**
     * A list of blueprints
     * @type {Array}
     */
    var blueprints = [];

    var cb = require('./callback.js');
    var callbacks = new cb.CallbackManager();

    //Our last added building
    var lastAdded;

    /**
     * Get all buildings in the given region
     * @param {object} tl Top left co-ordinate pair.
     * @param {object} br Bottom right co-ordinate pair.
     * @return {boolean|number} Whether a building can be placed.
     */
    this.hasBuildingsInRegion = function(tl, br) {

        for (var i = 0; i < buildings.length; i++) {
            var b = buildings[i], xclear = false, yclear = false;

            //allow if top left is > bottom right of building,
            //allow if bottom right is < top left of building
            if (tl.x >= b.getX() + b.getWidth() || br.x <= b.getX()) {
                xclear = true;
            }

            //allow if top left is > bottom right of building,
            //allow if bottom right is < top left of building
            if (tl.y >= b.getY() + b.getHeight() || br.y <= b.getY()) {
                yclear = true;
            }

            if (!xclear && !yclear) {
                return false;
            }
        }
        return true;
    };

    /**
     * If there is a building at co-ordinates then return its information.
     * @param {Number} x - horizontal co-ordinate.
     * @param {Number} y - vertical co-ordinate.
     * @return {Object} building information.
     */
    this.getBuildingAtLocation = function(x, y) {

        for (var i = 0; i < buildings.length; i++) {

            var b = buildings[i];
            var tl = {x: buildings[i].getX(), y: buildings[i].getY()};
            var br = {x: tl.x + buildings[i].getWidth(), y: tl.y + buildings[i].getHeight()};

            //If x and y is within the building
            if (x >= tl.x && x <= br.x && y >= tl.y && y <= br.y) {
                return b;
            }
        }

        //No building found
        return null;
    };

    /**
     * Add a building to this repository.
     * @param {Number} id The blueprint ID.
     * @param {Number} x The x co-ordinate.
     * @param {Number} y The y co-ordinate.
     * @param {Number} width The building width.
     * @param {Number} height The building height.
     * @param {Number} widthInTiles The building width in tiles.
     * @param {Number} heightInTiles The building height in tiles.
     * @param {Number} cap The building capacity.
     * @return {Boolean|Number} Whether we succeeded.
     * @this referenced.
     */
    this.addBuilding = function(id, x, y, width, height, widthInTiles, heightInTiles, cap) {

        if (!this.hasBuildingsInRegion({x: x, y: y}, {x: x + width, y: y + height})) {
            throw new Error('These tiles can\'t be built on.');
        }

        var blueprint = blueprints[id];

        // check building is large enough for its minsize
        // check building is large enough
        if ((widthInTiles < 5 || heightInTiles < 5) || ((widthInTiles * heightInTiles) < blueprint.getMinSize())) {
            throw new Error('This building is too small');
        }

        var building = new exports.Building(blueprint.getName(), blueprint.getCost(), blueprint.getType(), blueprint.getMinSize());
        building.setHeight(Math.round(height));
        building.setWidth(Math.round(width));
        building.setHeightInTiles(Math.round(heightInTiles));
        building.setWidthInTiles(Math.round(widthInTiles));
        building.setX(Math.round(x));
        building.setY(Math.round(y));
        building.setCapacity(cap);

        //now push our building in an object onto our list
        buildings.push(building);
        lastAdded = building;

        callbacks.fire('buildingadded', building);
        return buildings.length - 1;
    };

    /**
     * Add a callback to fire when a building is added.
     * @param {function} funct The callback to fire.
     */
    this.buildingAdded = function(funct) {
        callbacks.on('buildingadded', funct);
    };

    /**
     * Add a blueprint to this repository.
     * @param {String} name The blueprint name.
     * @param {Number} cost the blueprint cost.
     * @param {String} type The blueprint type.
     */
    this.addBlueprint = function(name, cost, type, minsize) {
        blueprints.push(new exports.Building(name, cost, type, minsize));
        callbacks.fire('blueprintadded', blueprints[blueprints.length - 1]);
    };

    /**
     * Add a callback to fire when a building is added.
     * @param {function} funct The callback to fire.
     */
    this.blueprintAdded = function(funct) {
        callbacks.on('blueprintadded', funct);
    };

    /**
     * Get a specific blueprint
     * @param {number} id The id.
     * @return {object} A specific blueprint.
     */
    this.getBlueprint = function(id) {
        return blueprints[id];
    };

    /**
     * Get a specific building
     * @param {Number} id The building ID.
     * @return {object} The building.
     */
    this.getBuilding = function(id) {
        return buildings[id];
    };

    /**
     * Iterate through each building
     * @param {function} callback The function.
     */
    this.eachBuilding = function(callback) {
        for (var i = 0; i < buildings.length; i++) {
            callback(buildings[i], i);
        }
    };

    /**
     * Iterate through each building
     * @param {function} callback The function.
     */
    this.eachBlueprint = function(callback) {
        for (var i = 0; i < blueprints.length; i++) {
            callback(blueprints[i], i);
        }
    };

    /**
     * Count the number of buildings.
     * @return {Number} The number of buildings.
     */
    this.countBuildings = function() {
        return buildings.length;
    };

    /**
     * List blueprint names.
     * Their position in the array will correspond to their ID.
     * @return {Array} An array of blueprint names.
     */
    this.listBlueprintNames = function() {
        var names = [];
        for (var i = 0; i < blueprints.length; i++) {
            names.push(blueprints[i].getName());
        }
        return names;
    };

    /**
     * Count the number of blueprints.
     * @return {Number} The number of blueprints.
     */
    this.countBlueprints = function() {
        return blueprints.length;
    };

    /**
     * Get a simple list of buildings of match a type.
     * @param {String} buildingType - the name of the buildings to search for.
     * @return {Object} A list of building items matching search name.
     */
    this.getBuildingsByType = function(buildingType) {

        var desiredBuildings = [];
        for (var i = 0; i < buildings.length; i++) {

            var rec = buildings[i];
            if (rec.getType() == buildingType) {
                desiredBuildings.push(rec);
            }
        }

        return desiredBuildings;
    };

    /**
     * Get a simple list of buildings which subtype match that given.
     * @param {String} buildingType - the subtype of the buildings to search for.
     * @return {Object} A list of building items matching search type.
     */
    this.getBuildingsBySubType = function(buildingType) {

        var desiredBuildings = [];
        for (var i = 0; i < buildings.length; i++) {

            var rec = buildings[i];
            if (rec.getSubType() == buildingType) {
                desiredBuildings.push(rec);
            }
        }

        return desiredBuildings;
    };

    /**
     * Convert specified serialized building.
     * @param {Object} rec The building object being converted to JSON.
     * @return {Object} The serialized building to be returned.
     */
    var buildingToJson = function(rec) {
        var building = {
            name: rec.getName(),
            cost: rec.getCost(),
            type: rec.getType(),
            minsize: rec.getMinSize(),
            width: rec.getWidth(),
            height: rec.getHeight(),
            widthInTiles: rec.getWidthInTiles(),
            heightInTiles: rec.getHeightInTiles(),
            x: rec.getX(),
            y: rec.getY(),
            staff: rec.getNumberStaff(),
            subtype: rec.getSubType(),
            capacity: rec.getCapacity(),
            occupants: rec.getOccupants(),
            timetable: rec.getTimetable()
        };
        return building;
    };

    /**
     * Get a simple list of blueprint stats for the client.
     * @param {Object} arr - An array of buildings to be serialized.
     * @return {Object} A list of building items.
     */
    var serializeBuildingArray = function(arr) {
        var serializedBuildings = [];
        for (var i = 0; i < arr.length; i++) {
            var rec = arr[i];
            serializedBuildings.push(buildingToJson(rec));
        }
        return serializedBuildings;
    };

    /**
     * Convert building from serialized JSON to an object.
     * @param {Object} json JSON object of building.
     * @return {Object} building object to be returned.
     */
    this.buildingFromJson = function(json) {
        var building = new exports.Building(json.name, json.cost, json.type, json.minsize);
        building.setHeight(json.height);
        building.setWidth(json.width);
        building.setX(json.x);
        building.setY(json.y);
        building.setMinSize(json.minsize);
        building.setNumberStaff(json.staff);
        building.setSubType(json.subtype);
        building.setCapacity(json.capacity);
        building.setOccupants(json.occupants);
        building.setTimetable(json.timetable);
        lastAdded = building;
        return building;
    };

    /**
     * Adds the given JSON building to the list of buildings in the game.
     * @param {Object} json JSON object of building.
     * @this Jenkins.
     */
    this.addBuildingFromJson = function(json) {
        var building = this.buildingFromJson(json.building);
        callbacks.fire('buildingadded', building);
        buildings.push(building);
    };

    /**
     * Convert ourselves to JSON
     * @return {Object} The entire buildings module serialized.
     */
    this.toJson = function() {
        return {buildings: serializeBuildingArray(buildings), blueprints: serializeBuildingArray(blueprints)};
    };

    /**
     * Populate buildings from JSON
     * @param {object} json JSON objects.
     * @this referenced.
     */
    this.fromJson = function(json) {

        buildings = [];
        blueprints = [];

        for (var i = 0; i < json.buildings.length; i++) {
            var building = this.buildingFromJson(json.buildings[i]);
            buildings.push(building);
        }

        for (i = 0; i < json.blueprints.length; i++) {
            this.addBlueprint(json.blueprints[i].name, json.blueprints[i].cost, json.blueprints[i].type, json.blueprints[i].minsize);
        }
    };

    /**
     * Gets a JSON object of the last building to be added to the game.
     * @return {Object} JSON object of last building added to the game.
     */
    this.lastBuildingToJson = function() {
        var json = buildingToJson(lastAdded);
        return {building: json};
    };

    /**
     * Return the last building to be added
     * @return {Object} last building object to be added.
     */
    this.getLastAdded = function() {
        return lastAdded;
    };

    /**
     * Clear the building and blueprints data
     */
    this.clearBuildings = function() {
        buildings = [];
        blueprints = [];
    };

    /**
     * See if there is any free accommodation, and return the building if there is.
     * @return {Object} - the accommodation building if there is space or null.
     */
    this.getFreeAccommodation = function() {

        var accommodations = this.getBuildingsByType('Accommodation');

        for (var i = 0; i < accommodations.length; i++) {
            var building = accommodations[i];
            if (building.getOccupants() < building.getCapacity()) {
                return building;
            }
        }

        return null;
    };

    /**
     * See if there is any free accommodation, and return the building if there is.
     * @return {Object} - the accommodation building if there is space or null.
     */
    this.getFreeStaffRoom = function() {

        var accommodations = this.getBuildingsByType('Staff');

        for (var i = 0; i < accommodations.length; i++) {
            var building = accommodations[i];
            if (building.getOccupants() < building.getCapacity()) {
                return building;
            }
        }

        return null;
    };

};
