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

exports.building = function(game) {

    var tileSize = game.world.getTileSize();
    var startPos = {};

    //Load actor image to work with actor collision detection
    var load = require('lib/images.js');
    var loader = new load.ImageLoader();
    var actorImage = loader.addImage('../images/actor.png');

    //Separate variable to store location of construction highlight
    var highlight = {start: {x: 0, y: 0}, width: 0, height: 0};
    var constructing = false;

    var ui = require('ui/buildings.js');
    var buildingUi = new ui.Buildings();

    game.container.addElement('buildings', buildingUi, 10, 110);

    //Timetable UI
    var uiElem = require('ui/timetable.js');
    var timetableUi = null;

    /**
     * Fire when the edit button is used.
     * Should pass a building as the callback.
     * @param {function} callback The callback.
     */
    this.editClicked = function(callback) {
        callbacks.on('edit', callback);
    };

    /**
     * Redraws the timetable UI.
     */
    this.redrawtimetableEvent = function() {
        timetableUi.redrawSelf();
    };

    /**
     * Update the building repository from the server.
     * @param {object} changes The new buildings.
     */
    this.updateEvent = function(changes) {
        game.buildings.fromJson(changes);
        buildingUi.setBlueprints(game.buildings.listBlueprintNames());
    };

    /**
     * Add the building to the repository from the server.
     * @param {object} building The new building to be added.
     */
    this.addEvent = function(building) {
        game.buildings.addBuildingFromJson(building);
    };

    /**
     * A list of buildings is sent to us.
     * @param {object} data The building data.
     */
    this.createEvent = function(data) {
        game.buildings.fromJson(data);
    };

    /**
     * Mouse click - add or edit a building.
     */
    game.container.addListener('mousedown', function(e) {

        var x = (e.x + game.offsetX);
        var y = (e.y + game.offsetY);

        constructing = false;

        var index = buildingUi.getSelectedBlueprint();

        //If we are making a path
        // -3 is last element in list due to none, edit.
        if (index == buildingUi.getNumberElements() - 3) {
            highlight.width = 0;
            highlight.height = 0;
            constructing = true;
            game.server.send('world', 'update', {pos: {x: Math.floor(x / tileSize), y: Math.floor(y / tileSize)}, tile: {from: 'grass', to: 'path'}});
        } else if (index == buildingUi.getNumberElements() - 4) {
            highlight.width = 0;
            highlight.height = 0;
            constructing = true;
            game.server.send('world', 'update', {pos: {x: Math.floor(x / tileSize), y: Math.floor(y / tileSize)}, tile: {from: 'path', to: 'grass'}});
        }else if (index >= 0) {
            //If we are constructing a building
            constructing = true;
            startPos = {x: x, y: y};
            calculateHighlight(e);
        } else if (index == -1) {
            //Edit Mode.
            var building = game.buildings.getBuildingAtLocation(x, y);
            if (building != null && building.hasTimetable()) {
                timetableUi = new uiElem.Timetable(game, building);
                game.container.addElement('timetable', timetableUi, -320, 10);
                timetableUi.setVisible(true);
                game.tutorial.fire('edit', building);
            } else {
                if (timetableUi) {
                    timetableUi.setVisible(false);
                    timetableUi.hideSubTimetable();
                }
            }
        }
    });

    /**
     * Clears the client building data
     */
    this.clearEvent = function() {
        game.buildings.clearBuildings();
    };

    /**
     * Request buildings to be redownload from the server.
     */
    this.redownloadEvent = function() {
        game.server.send('building', 'redownload', {});
    };

    /**
     * Called on mouse up
     */
    game.container.addListener('mouseup', function(e) {

        var index = buildingUi.getSelectedBlueprint();
        if (index == buildingUi.getNumberElements() - 3) {   //We are constructing a path tile!
            constructing = false;
        } else if (index == buildingUi.getNumberElements() - 4) {   //We are constructing a grass tile!
            constructing = false;
        }else if (index >= 0) { //If we are constructing a building
            constructing = false;
            var x = (e.x + game.offsetX);
            var y = (e.y + game.offsetY);
            var xFunc = {}, yFunc = {};

            //we floor the smallest co-ordinates to get the top-left co-ordinate of that grid square
            //then we ceil the largest co-ordinates to get the bottom-right co-ord of that square, so the building
            //completely fills the grid squares the user has dragged over

            if (x > startPos.x) {
                xFunc.start = Math.floor;
                xFunc.end = Math.ceil;
            } else {
                xFunc.start = Math.ceil;
                xFunc.end = Math.floor;
            }

            if (y > startPos.y) {
                yFunc.start = Math.floor;
                yFunc.end = Math.ceil;
            } else {
                yFunc.start = Math.ceil;
                yFunc.end = Math.floor;
            }

            startPos.x = xFunc.start(startPos.x / tileSize) * tileSize;
            startPos.y = yFunc.start(startPos.y / tileSize) * tileSize;
            var endX = (xFunc.end(x / tileSize) * tileSize);
            var endY = (yFunc.end(y / tileSize) * tileSize);

            //build please
            if (game.server) {
                game.server.send('building', 'create', {
                    id: buildingUi.getSelectedBlueprint(),
                    tl: {x: startPos.x, y: startPos.y},
                    br: {x: endX, y: endY}
                });
            }
        }
    });

    /**
     * When the mouse moves call the calculate highlight method.
     */
    game.container.addListener('mousemove', function(e) {
        if (constructing) { //If we are constructing a building
            //Check if we are building a path
            if (buildingUi.getSelectedBlueprint() == buildingUi.getNumberElements() - 3) {
                game.server.send('world', 'update', {pos: {x: Math.floor((e.x + game.offsetX) / tileSize), y: Math.floor((e.y + game.offsetY) / tileSize)}, tile: {from: 'grass', to: 'path'}});
            } else if (buildingUi.getSelectedBlueprint() == buildingUi.getNumberElements() - 4) {
                game.server.send('world', 'update', {pos: {x: Math.floor((e.x + game.offsetX) / tileSize), y: Math.floor((e.y + game.offsetY) / tileSize)}, tile: {from: 'path', to: 'grass'}});
            }else {
                calculateHighlight(e);
            }
        }
    });

    /**
     * Calculates the highlight box for where the user is creating a building.
     * @param {object} e Mouse event data.
     */
    function calculateHighlight(e) {
        var x = (e.x + game.offsetX);
        var y = (e.y + game.offsetY);

        if (x > startPos.x) {
            highlight.start.x = Math.floor(startPos.x / tileSize) * tileSize;
            highlight.width = (Math.ceil(x / tileSize) * tileSize) - highlight.start.x;
        } else {
            highlight.start.x = Math.floor(x / tileSize) * tileSize;
            highlight.width = (Math.ceil(startPos.x / tileSize) * tileSize) - highlight.start.x;
        }

        if (y > startPos.y) {
            highlight.start.y = Math.floor(startPos.y / tileSize) * tileSize;
            highlight.height = (Math.ceil(y / tileSize) * tileSize) - highlight.start.y;
        } else {
            highlight.start.y = Math.floor(y / tileSize) * tileSize;
            highlight.height = (Math.ceil(startPos.y / tileSize) * tileSize) - highlight.start.y;
        }
    }

    /**
     * Calculates whether the highlight box intersects anything which cannot be built on.
     * @param {object} building The building type that is selected.
     * @return {boolean} True if a building could safely be built the highlight box.
     */
    function highlightSafe(building) {
        var safe = false;

        var tl = {}, br = {};

        tl.x = highlight.start.x;
        tl.y = highlight.start.y;
        br.x = highlight.start.x + highlight.width;
        br.y = highlight.start.y + highlight.height;

        var widthInTiles = highlight.width / tileSize;
        var heightInTiles = highlight.height / tileSize;
        var area = widthInTiles * heightInTiles;

        if (game.world.canBuildInRegion(tl.x / tileSize, br.x / tileSize, tl.y / tileSize, br.y / tileSize)) {
            if (!game.actors.hasActorsInRegion(tl, br)) {
                // check building meets the minimum size requirements
                if (widthInTiles >= 5 && heightInTiles >= 5 && area >= building.getMinSize()) {
                    safe = true;
                }
            }
        }

        return safe;
    }

    /**
     * Paint our buildings onto the screen
     * @param {object} g Graphics message.
     */
    this.paintEvent = function(g) {
        //Check if we are constructing something that isn't a path.
        if (constructing && buildingUi.getSelectedBlueprint() != buildingUi.getNumberElements() - 3) {
            var building = game.buildings.getBlueprint(buildingUi.getSelectedBlueprint());
            //Draw up a highlight of where the building will be constructed
            if (highlightSafe(building)) {
                g.context.fillStyle = 'rgba(0,0,170,0.3)';
            } else {
                g.context.fillStyle = 'rgba(170,0,0,0.3)';
            }
            g.context.fillRect(highlight.start.x - game.offsetX, highlight.start.y - game.offsetY, highlight.width, highlight.height);

            // if the area is large enough display the cost to build
            if (highlight.width / tileSize >= 3 && highlight.height / tileSize >= 3) {
                // Display the cost
                var buildingCost = building.getCost() * (highlight.width / tileSize) * (highlight.height / tileSize);
                var buildingCostText = '£' + buildingCost;

                // text alignment
                g.context.textBaseline = 'middle';
                g.context.textAlign = 'center';
                g.context.font = '16px sans-serif';

                // font colour based on available money
                if (game.money < buildingCost) {
                    g.context.fillStyle = '#ff0000';
                } else {
                    g.context.fillStyle = '#ffffff';
                }
                g.context.fillText(buildingCostText, (highlight.start.x - game.offsetX) + (highlight.width / 2), (highlight.start.y - game.offsetY) + (highlight.height / 2));
            }
        }

        //text alignment
        g.context.textBaseline = 'top';
        g.context.font = '10px sans-serif';
        g.context.textAlign = 'left';

        game.buildings.eachBuilding(function(building) {

            g.context.fillStyle = '#000000'; // set fill colour for building name text.

            //Compose the building title text.
            var buildingText = building.getName();
            g.context.fillText(buildingText, (building.getX() - game.offsetX) + 20, (building.getY() - game.offsetY) + 5);
        });
    };
};
