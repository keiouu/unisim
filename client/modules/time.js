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

exports.time = function(game) {

    var currentHour;
    var currentMin;

    var ui = require('lib/UiElements.js');
    var label = new ui.Label(20, 10, 'Time');
    game.sideBar.addElement('time', label, 0, 0);

    var lecSoon = false;
    var lecNow = false;

    /**
     * The sets the time sent to us from the server!
     * @param {object} data The time data.
     */
    this.setEvent = function(data) {
        currentHour = data.hour;
        currentMin = data.min;

        var timestring = 'Time: ' + currentHour + ' : ';

        if (currentMin < 10) {
            timestring += '0' + currentMin;
        } else {
            timestring += currentMin;
        }
        var addString = '';
        if (lecSoon) {
            addString += ' Lecture Soon!';
        } else if (lecNow) {
            addString += ' Lecture Now!';
        }
        label.setText(timestring + addString);
    };

    /**
     * request a time redownload.
     */
    this.redownloadEvent = function() {
        game.server.send('time', 'redownload', {});
    };

    /**
     * Server has just added a lecture.
     * @param {Object} message - message containing lecture infomation.
     */
    this.addedlectureEvent = function(message) {
        var building = game.buildings.getBuildingAtLocation(message.buildx, message.buildy);
        var timetable = building.getTimetable();

        timetable.addLecture(message.course, message.time, 5, message.time, 55);

        if (building.getName() == 'Lecture Theatre') {
            game.courses.getCourseByName(message.course).changeNumLecturesTaught(1);
        } else {
            game.courses.getCourseByName(message.course).changeNumSeminarsTaught(1);
        }

        router.route({res: 'building', verb: 'redrawtimetable', msg: {}});
        router.route({res: 'courses', verb: 'redrawcourses', msg: {}});
    };

    /**
     * Server has just added a lecture.
     * @param {Object} message - message containing lecture infomation.
     */
    this.removedlectureEvent = function(message) {
        var building = game.buildings.getBuildingAtLocation(message.buildx, message.buildy);
        var timetable = building.getTimetable();

        var course = timetable.removeLecture(message.time, 5, message.time, 55);

        if (building.getName() == 'Lecture Theatre') {
            game.courses.getCourseByName(course).changeNumLecturesTaught(-1);
        } else {
            game.courses.getCourseByName(course).changeNumSeminarsTaught(-1);
        }

        router.route({res: 'building', verb: 'redrawtimetable', msg: {}});
        router.route({res: 'courses', verb: 'redrawcourses', msg: {}});
    };

    /**
     * Called from the server.
     * @param {object} msg The message.
     */
    this.lecturesEvent = function(msg) {
        lecSoon = (msg.lecsoon.length != 0);
        lecNow = (msg.lecnow.length != 0);
    };

};
