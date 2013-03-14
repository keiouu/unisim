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

exports.TimeRepository = function(startHour, startMin) {

    var currentHour = 0;
    var currentMin = 0;
    var rolloverTick = 0; //Number of current interal ticks used for rolling a minute.
    var minTicks = 10; //Number of ticks needed to roll over a minute.

    var buildingTimetables = [];
    var lecturesSoon = [];
    var lecturesNow = [];

    /**
     * Set the time to a given hour and minute.
     * @param {integer} hour - the starting hour time. 0 <= x <= 23.
     * @param {integer} min - the starting min time. 0 <= x <= 59.
     */
    this.setTime = function(hour, min) {
        if (hour >= 0 && hour < 24) {
            currentHour = hour;
        }
        if (min >= 0 && min < 60) {
            currentMin = min;
        }
    };

    this.setTime(startHour, startMin);

    /**
     * Adds a building to the TimeRepository if it has a timetable.
     * @param {Object} building - the building to add.
     */
    this.addTimeTabledBuilding = function(building) {
        if (building.hasTimetable()) {
            buildingTimetables.push(building);
        }
    };

    /**
     * Convert the time to be transfered across the network.
     * @return {object} A serialized time object.
     */
    this.serialize = function() {
        return {hour: currentHour, min: currentMin};
    };

    /**
     * Increment the Minute by one.
     * Will increment hour if nessicary
     */
    var incrementMinute = function() {
        currentMin++;

        if (currentMin > 59) {
            currentMin = 0;
            incrementHour();
        }
    };

    /**
     * Increment the Hour by one.
     */
    var incrementHour = function() {
        currentHour++;

        if (currentHour > 17) {
            currentHour = 8;
            //Increment date?
        }
    };

    /**
     * Called every tick by the client game loop.
     * Increments the time every few ticks.
     * @return {boolean} true if time has incremented.
     */
    this.updateTime = function() {

        if (currentHour == null) {
            return false;
        }

        rolloverTick++;
        if (rolloverTick >= minTicks) {
            rolloverTick = 0;
            incrementMinute();
            return true;
        }

        return false;
    };

    /**
     * Return the current hour.
     * @return {Integer} Current hour (0 <= t < 24).
     */
    this.getHour = function() {
        return currentHour;
    };

    /**
     * Return the current min.
     * @return {Integer} Current min (0 <= t < 60).
     */
    this.getMin = function() {
        return currentMin;
    };

    /**
     * Update any lectures that happen within the next 15 mins.
     * @param {Number} timeGap - Number of minutes to check forward for lectures.
     * @return {Object} - a list of the lectures occuring soon.
     */
    this.checkLecturesSoon = function(timeGap) {
        lecturesSoon = [];
        for (var i = 0; i < buildingTimetables.length; i++) {
            var lectures = buildingTimetables[i].getTimetable().getLecturesSoon(currentHour, currentMin, timeGap);
            if (lectures != []) {
                for (var j = 0; j < lectures.length; j++) {
                    lecturesSoon.push({course: lectures[j].getCourse(), tl: {x: buildingTimetables[i].getX(), y: buildingTimetables[i].getY()}, building: buildingTimetables[i],
                        br: {x: buildingTimetables[i].getX() + buildingTimetables[i].getWidth(), y: buildingTimetables[i].getY() + buildingTimetables[i].getHeight()}});
                }
            }
        }

        return lecturesSoon;
    };

    /**
     * Update any lectures that are occuring now.
     * @return {Object} - a list of the current lectures occuring now.
     */
    this.checkLectureNow = function() {
        lecturesNow = [];
        for (var i = 0; i < buildingTimetables.length; i++) {
            lecture = buildingTimetables[i].getTimetable().checkLectureOccuring(currentHour, currentMin, currentHour, currentMin);
            if (lecture != null) {
                lecturesNow.push({course: lecture.getCourse(), tl: {x: buildingTimetables[i].getX(), y: buildingTimetables[i].getY()},
                    br: {x: buildingTimetables[i].getX() + buildingTimetables[i].getWidth(), y: buildingTimetables[i].getY() + buildingTimetables[i].getHeight()}});
            }
        }

        return lecturesNow;

    };

    /*
     * Get a lecture's location if a lecture for a course is starting soon.
     * @param {String} course - The course name to check for lectures.
     * @return {Object} course, building tl and br locations if found. null if not.
     */
    this.getLectureSoonLocationByCourse = function(course) {
        for (var i = 0; i < lecturesSoon.length; i++) {
            if (lecturesSoon[i].course == course) {
                return lecturesSoon[i];
            }
        }

        //None found
        return null;
    };

    /*
     * Get a lecture's location if a lecture for a course is currently running.
     * @param {String} course - The course name to check for lectures.
     * @return {Object} course, building tl and br locations if found. null if not.
     */
    this.getLectureNowLocationByCourse = function(course) {
        for (var i = 0; i < lecturesNow.length; i++) {
            if (lecturesNow[i].course == course) {
                return lecturesNow[i];
            }
        }

        //None found
        return null;
    };

};

/**
 * Timetable Structure
 * Keeps track of when lectures are due.
 * @constructor
 */
exports.TimeTable = function() {

    var timetable = []; //Array of lectures.

    /**
     * Adds a lecture to the timetable system. A lecture cannot clash with another in the same timetable.
     * @param {String} course - the course that the lecture teaches.
     * @param {Integer} startHour - the starting hour of the lecture (0 <= t < 24).
     * @param {Integer} startMin - the ending hour of the lecture (0 <= t < 60).
     * @param {Integer} endHour - the starting minute of the lecture (0 <= t < 24).
     * @param {Integer} endMin - the ending minute of the lecture (0 <= t < 60).
     * @return {Boolean} - returns if successfully added.
     * @this referenced
     */
    this.addLecture = function(course, startHour, startMin, endHour, endMin) {

        //Check lecture does not end before it finishes.
        if (endHour < startHour || (startHour == endHour && endMin < startMin)) {
            console.log('Lecture ends before it starts!');
            return false;
        }

        //Check for overlaps
        if (this.checkLectureOccuring(startHour, startMin, endHour, endMin) == null) {
            var lecture = new exports.Lecture(course, startHour, startMin, endHour, endMin);
            timetable.push(lecture);
            return true;
        }

        console.log('Lecture Check: ' + startHour + ':' + startMin + '->' + endHour + ':' + endMin +
            ' overlaps another Lecture. Can not be added!');

        return false;
    };

    /**
     * Removes a lecture from the timetable system.
     * @param {String} course - the course that the lecture teaches.
     * @param {Integer} startHour - the starting hour of the lecture (0 <= t < 24).
     * @param {Integer} startMin - the ending hour of the lecture (0 <= t < 60).
     * @param {Integer} endHour - the starting minute of the lecture (0 <= t < 24).
     * @param {Integer} endMin - the ending minute of the lecture (0 <= t < 60).
     * @return {String} - returns coursetype of the lecture removed or null.
     * @this referenced
     */
    this.removeLecture = function(startHour, startMin, endHour, endMin) {
        //Check lecture does not end before it finishes.
        if (endHour < startHour || (startHour == endHour && endMin < startMin)) {
            console.log('Lecture ends before it starts!');
            return null;
        }

        var toDelete = this.checkLectureOccuring(startHour, startMin, endHour, endMin);

        if (timetable.indexOf(toDelete) != -1) {
            var course = timetable[timetable.indexOf(toDelete)].getCourse();
            timetable.splice(timetable.indexOf(toDelete), 1);
            return course;
        }

        return null;

    }

    /**
     * Checks if the times entered overlaps with an existing lecture.
     * Returns the lecture if there is an overlap.
     * @param {Integer} checkStartHour - the starting hour of the lecture (0 <= t < 24).
     * @param {Integer} checkStartMin - the ending hour of the lecture (0 <= t < 60).
     * @param {Integer} checkEndHour - the starting minute of the lecture (0 <= t < 24).
     * @param {Integer} checkEndMin - the ending minute of the lecture (0 <= t < 60).
     * @return {Object} - returns lecture if one is currently occuring, or null if not.
     */
    this.checkLectureOccuring = function(checkStartHour, checkStartMin, checkEndHour, checkEndMin) {

        var numLecs = timetable.length;

        //Convert check time into easy to use format: hour.min
        var checkStartTime = checkStartHour + (checkStartMin / 100);
        var checkEndTime = checkEndHour + (checkEndMin / 100);

        //With every lecture..
        for (var i = 0; i < numLecs; i++) {
            var lecture = timetable[i];

            //Get and convert lecture time into easy to use format: hour.min
            var lecStartTime = lecture.getStartHour() + (lecture.getStartMin() / 100);
            var lecEndTime = lecture.getEndHour() + (lecture.getEndMin() / 100);

            //Check for overlaps
            if ((checkStartTime >= lecStartTime && checkStartTime <= lecEndTime) || //Start Time overlaps
                (checkEndTime >= lecStartTime && checkEndTime <= lecEndTime) || //End Time overlaps
                (checkStartTime <= lecStartTime && checkEndTime >= lecEndTime)) { //Lecture Encased
                return lecture;
            }
        }

        //No overlaps found
        return null;
    };

    /**
     * Find lectures that are going to happen within the next period of time.
     * @param {Integer} curHour  - the current hour (0 <= t < 24).
     * @param {Integer} curMin  - the current minute (0 <= t < 60).
     * @param {Integer} timeGap  - the number of minutes to check for lectures.
     * @return {Objects} array of Lecture Objects happening soon.
     */
    this.getLecturesSoon = function(curHour, curMin, timeGap) {
        var numLecs = timetable.length;
        var lecsSoon = [];

        for (var i = 0; i < numLecs; i++) {
            var lecture = timetable[i];
            var lecSoon = false;

            var checkEndMin = curMin + timeGap;
            var checkEndHour = curHour;

            while (checkEndMin >= 60) {
                checkEndHour += 1;
                checkEndMin -= 60;
            }

            var startHour = lecture.getStartHour();
            var startMin = lecture.getStartMin();

            //If lecture hour starts in the future AND hour is soon
            if (startHour >= curHour && startHour <= checkEndHour) //If lecture occurs within required hours.
            {
                //Does lecture occurs within required mins.
                if (curHour < startHour - 1) {
                    //Lecture occurs more than 1 hour away.
                    lecSoon = true;
                } else if (curHour == startHour - 1 && (startMin <= checkEndMin ||
                    (checkEndMin < curMin && curHour + 1 < checkEndHour))) {
                    //If we are in the hour before it starts and we are correct mins away (Checking for wrap-around).
                    lecSoon = true;
                } else if (curHour == startHour && curMin < startMin && (startMin <= checkEndMin ||
                    (checkEndMin < curMin && curHour + 1 < checkEndHour))) {
                    //If same hour AND lecture starts in the future AND is soon
                    lecSoon = true;
                }
            }

            if (lecSoon) {
                lecsSoon.push(lecture);
            }

        }

        return lecsSoon;

    };

    /**
     * Converts the timetable into a networkable object.
     * @return {Object} JSON object of lectures.
     */
    this.toJSON = function() {
        var array = [];
        //For every lecture.
        for (var i = 0; i < timetable.length; i++) {
            array.push(timetable[i].toJSON());
        }
        var json = {array: array};
        return json;
    };

    /**
     * Convert network data (JSON) into timetable data.
     * @param {Object} json - the json data.
     */
    this.fromJSON = function(json) {
        var array = json.array;
        for (var i = 0; i < array.length; i++) {
            this.addLecture(array[i].course, array[i].startHour, array[i].startMin, array[i].endHour, array[i].endMin);
        }
    };

};

/**
 * Lecture Structure
 * Keeps track of when lectures are due.
 * @param {String} initCourse - the course that the lecture teaches.
 * @param {Integer} initStartHour - the starting hour of the lecture (0 <= t < 24).
 * @param {Integer} initStartMin - the ending hour of the lecture (0 <= t < 60).
 * @param {Integer} initEndHour - the starting minute of the lecture (0 <= t < 24).
 * @param {Integer} initEndMin - the ending minute of the lecture (0 <= t < 60).
 * @constructor
 */
exports.Lecture = function(initCourse, initStartHour, initStartMin, initEndHour, initEndMin) {

    var course = initCourse;
    var startHour = initStartHour;
    var startMin = initStartMin;
    var endHour = initEndHour;
    var endMin = initEndMin;

    /**
     * Get and return the Lecture's course name.
     * @return {String} course name.
     */
    this.getCourse = function() {
        return course;
    };

    /**
     * Set the Lecture's course name.
     * @param {String} value - course name.
     */
    this.setCourse = function(value) {
        course = value;
    };

    /**
     * Get and return the start hour of the lecture.
     * @return {String} start hour.
     */
    this.getStartHour = function() {
        return startHour;
    };

    /**
     * Set the the start hour of the lecture.
     * @param {String} value - start hour.
     */
    this.setStartHour = function(value) {
        startHour = value;
    };

    /**
     * Get and return the end hour of the lecture.
     * @return {String} end hour.
     */
    this.getEndHour = function() {
        return endHour;
    };

    /**
     * Set the the end hour of the lecture.
     * @param {String} value - end hour.
     */
    this.setEndHour = function(value) {
        endHour = value;
    };

    /**
     * Get and return the start Min of the lecture.
     * @return {String} start Min.
     */
    this.getStartMin = function() {
        return startMin;
    };

    /**
     * Set the the start Min of the lecture.
     * @param {String} value - start Min.
     */
    this.setStartMin = function(value) {
        startMin = value;
    };

    /**
     * Get and return the end Min of the lecture.
     * @return {String} end Min.
     */
    this.getEndMin = function() {
        return endMin;
    };

    /**
     * Set the the end Min of the lecture.
     * @param {String} value - end Min.
     */
    this.setEndMin = function(value) {
        endMin = value;
    };

    /**
     * Serialize the lecture for the network.
     * @return {Object} json object of one lecture.
     */
    this.toJSON = function() {
        var json = {
            course: course,
            startHour: startHour,
            startMin: startMin,
            endHour: endHour,
            endMin: endMin
        }
        return json;
    }

};
