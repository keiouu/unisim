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

exports.courses = function(game) {

    'use strict';

    //Hardcoded courses that can be enlisted.
    game.courses.addCourse('Art', 1, 0);
    game.courses.addCourse('Maths', 3, 2);
    game.courses.addCourse('Physics', 4, 3);
    game.courses.addCourse('English', 6, 10);
    game.courses.addCourse('Comp Sci.', 12, 4);

    /**
     * Send the courses to the client when they connect
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     */
    game.server.on('courses', 'connect', function(message, client) {
        client.send('courses', 'set', game.courses.toJSON());
    });

    /**
     * Player has requested to enroll upon a course.
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     */
    game.server.on('courses', 'enroll', function(message, client) {
        var courseName = message.course;
        var course = game.courses.getCourseByName(courseName);

        if (course != null) {
            course.setEnrolled(message.value);
            client.send('courses', 'enrolled', {course: courseName, value: message.value});
            client.send('actors', 'refreshstaffui', {});
        }

    });

    /**
     * Request a redownload of the courses
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     */
    game.server.on('courses', 'connect', function(message, client) {
        client.send('courses', 'set', game.courses.toJSON());
    });

    /**
     * Called by the server each loop iteration
     */
    game.scheduler.on('tick', function() {
        //DO NOTHING
    });

    /**
     * Saves course module.
     */
    game.server.on('courses', 'save', function(message, client) {
        var json = game.courses.toJSON();
        game.saveload.save('courses', message.savename, json);
    });

    /**
     * Load the course module's contents from file.
     * @param {object} msg The msg from the client.
     * @param {object} client The client.
     */
    game.server.on('courses', 'load', function(msg, client) {
        var json = game.saveload.load('courses', msg.savename);
        game.courses.fromJSON(json);
        client.send('courses', 'redownload');
    });
};
