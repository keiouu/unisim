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

    /**
     * Called when the client connects,
     * send them the server time.
     * @param {object} msg The msg from the client.
     * @param {object} client The client.
     */
    game.server.on('time', 'connect', function(msg, client) {
        client.send('time', 'set', game.time.serialize());
    });

    /**
     * Request a redownload of the time
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     */
    game.server.on('time', 'redownload', function(message, client) {
        client.send('time', 'set', game.time.serialize());
    });

    /**
     * User has requested a lecture to be added.
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     */
    game.server.on('time', 'addlecture', function(message, client) {

        var building = game.buildings.getBuildingAtLocation(message.buildx, message.buildy);
        var timetable = building.getTimetable();

        if (typeof timetable == 'undefined') {
            console.log('trying to add bad timetable!');
            console.log(building, message);
            return;
        }

        var result = timetable.addLecture(message.course, message.time, 5, message.time, 55);
        var nowValid = false;
        //Lecture added successfully
        if (result) {
            if (building.getName() == 'Lecture Theatre') {
                nowValid = game.courses.getCourseByName(message.course).changeNumLecturesTaught(1);
            } else if (building.getName() == 'Seminar Room') {
                nowValid = game.courses.getCourseByName(message.course).changeNumSeminarsTaught(1);
            }

            if (nowValid) {
                game.actors.setActorCap(game.actors.getActorCap() + 20);
                client.send('actors', 'newcap', {cap: game.actors.getActorCap()});
            }

            //Inform the client it was successful.
            client.send('time', 'addedlecture', message);
        } else {
            client.send('ui', 'error', 'Lecture already exists at that time.');
        }
    });

    /**
     * User has requested a lecture to be removed.
     * @param {object} message The message sent to the server.
     * @param {object} client The client that connected.
     */
    game.server.on('time', 'removelecture', function(message, client) {

        var building = game.buildings.getBuildingAtLocation(message.buildx, message.buildy);
        var timetable = building.getTimetable();

        if (typeof timetable == 'undefined') {
            console.log('trying to add bad timetable!');
            console.log(building, message);
            return;
        }

        var course = timetable.removeLecture(message.time, 5, message.time, 55);
        var nowValid = false;
        //Lecture added successfully
        if (course != null) {
            if (building.getName() == 'Lecture Theatre') {
                nowValid = game.courses.getCourseByName(course).changeNumLecturesTaught(-1);
            } else if (building.getName() == 'Seminar Room') {
                nowValid = game.courses.getCourseByName(course).changeNumSeminarsTaught(-1);
            }

            if (nowValid) {
                game.actors.setActorCap(game.actors.getActorCap() - 20);
                client.send('actors', 'newcap', {cap: game.actors.getActorCap()});
            }

            //Inform the client it was successful.
            client.send('time', 'removedlecture', message);
        }
    });

    /**
     * Called by the server each loop iteration
     */
    game.scheduler.on('tick', function() {
        if (game.time.updateTime()) {
            game.server.broadcast('time', 'set', game.time.serialize());

            var resultSoon = game.time.checkLecturesSoon(20);
            var resultNow = game.time.checkLectureNow();
            game.server.broadcast('time', 'lectures', {lecsoon: resultSoon, lecnow: resultNow});
        }
    });

    /**
     * Saves time module.
     */
    game.server.on('time', 'save', function(message, client) {
        var json = game.time.serialize();
        game.saveload.save('time', message.savename, json);
    });

    /**
     * Load the time module's contents from file.
     * @param {object} msg The msg from the client.
     * @param {object} client The client.
     */
    game.server.on('time', 'load', function(msg, client) {
        var json = game.saveload.load('time', msg.savename);
        game.time.setTime(json.hour, json.min);
        client.send('time', 'redownload');
    });
};

