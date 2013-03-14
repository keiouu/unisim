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

var basicElements = require('../lib/UiElements.js');

/**
 * A UI to display and edit the timetable of a building.
 * and to fire events when the user picks one.
 * @param {Object} game - reference to game objects.
 * @param {Object} building - building to get the timetable from.
 * @constructor
 */
exports.Timetable = function(game, building) {

    var titleString = 'Timetable';
    var subTimetable = null;

    var addListener = function(button, startHour) {
        button.addListener('mouseup', function(e) {
            subTimetable = new exports.SubTimetable(game, building, startHour);
            game.container.addElement('subtimetable', subTimetable, -330, 115);
        });
    };

    /**
     * Update elements and redraw self.
     * @this referenced.
     */
    this.redrawSelf = function() {

        for (var startHour = 10; startHour < 17; startHour++) {

            //Check if there is a lecture in this hour
            var lecture = roomTimetable.checkLectureOccuring(startHour, 0, startHour + 1, 0);
            var button = null;
            if (lecture != null) {
                button = new basicElements.Button(40, 40, lecture.getCourse());
            } else {
                button = new basicElements.Button(40, 40, 'Free');
            }

            addListener(button, startHour);

            this.addElement('button' + startHour, button, 0, 0);
            this.distributeToGrid(7, 2, 0, 0);
        }
        this.setRedraw(true);
    };

    if (building != null) {
        titleString += ' - ' + building.getName();

        var roomTimetable = building.getTimetable();

        // Call parent constructor
        basicElements.Menu.call(this, 300, 100, titleString);

        var label10 = new basicElements.Label(30, 10, '10-11');
        label10.setCentered(true);
        this.addElement('Label10', label10, 0, 0);

        var label11 = new basicElements.Label(30, 10, '11-12');
        label11.setCentered(true);
        this.addElement('Label11', label11, 0, 0);

        var label12 = new basicElements.Label(30, 10, '12-13');
        label12.setCentered(true);
        this.addElement('Label12', label12, 0, 0);

        var label13 = new basicElements.Label(30, 10, '13-14');
        label13.setCentered(true);
        this.addElement('Label13', label13, 0, 0);

        var label14 = new basicElements.Label(30, 10, '14-15');
        label14.setCentered(true);
        this.addElement('Label14', label14, 0, 0);

        var label15 = new basicElements.Label(30, 10, '15-16');
        label15.setCentered(true);
        this.addElement('Label15', label15, 0, 0);

        var label16 = new basicElements.Label(30, 10, '16-17');
        label16.setCentered(true);
        this.addElement('Label16', label16, 0, 0);

        this.redrawSelf();
    }

    this.hideSubTimetable = function() {
        if (subTimetable != null) {
            subTimetable.setVisible(false);
        }
    };

};

//setup menu prototype info.
exports.Timetable.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Timetable.prototype.constructor = exports.Timetable;

/**
 * A UI to pick which lecture to pick for a timeslot.
 * and to fire events when the user picks one.
 * @param {Object} game - reference to game objects.
 * @param {String} building - building name to add to title if not null.
 * @param {String} time - the time chosen to edit.
 * @constructor
 */
exports.SubTimetable = function(game, building, time) {

    var titleString = '';

    if (time != null) {
        titleString += time + '-' + (time + 1);
    }

    if (building != null) {
        titleString += ' - ' + building.getName();
    }

    var me = this;
    var types = game.courses.getTypes();
    var numCourses = types.length;

    var addListener = function(button, courseName, ui) {
        button.addListener('mouseup', function(e) {
            game.server.send('time', 'addlecture', {
                course: courseName,
                time: time,
                buildx: building.getX(),
                buildy: building.getY()
            });
            ui.setVisible(false);
            game.tutorial.fire('lectureAdded', courseName);
        });
    };

    //Find the size of the popup
    var enrolledCourses = game.courses.getEnrolledCourses();
    var numEnrolled = enrolledCourses.length;

    // Call parent constructor
    basicElements.Menu.call(this, (numEnrolled * 45) + 100, 50, titleString);

    //For every course
    for (var i = 0; i < numEnrolled; i++) {

        //Get the course
        var course = enrolledCourses[i];
        var courseName = course.getName();

        var button = new basicElements.Button(40, 40, courseName);
        addListener(button, courseName, this);
        this.addElement('button' + courseName, button, 0, 0);
    }

    var buttonFree = new basicElements.Button(40, 40, 'Free');
        buttonFree.addListener('mouseup', function () {
            game.server.send('time', 'removelecture', {
                time: time,
                buildx: building.getX(),
                buildy: building.getY()
            });
            me.setVisible(false);
        });
        this.addElement('buttonFree', buttonFree, 0, 0);


    this.distributeToGrid(numEnrolled + 1, 1, 0, 0);

    if (numEnrolled == 0) {
        this.setVisible(false);
    }

};

//setup menu prototype info.
exports.SubTimetable.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.SubTimetable.prototype.constructor = exports.SubTimetable;
