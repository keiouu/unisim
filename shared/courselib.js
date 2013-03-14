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

exports.CoursesRepository = function() {

    var courses = []; //List of all the courses.
    var types = []; //List of the names of the courses.

    /**
     * Get the array of course types / names.
     * @return {Object} course types / names.
     */
    this.getTypes = function() {
        return types;
    };

    /**
     * Return an array of courses that are enrolled on.
     * @return {Object} array of courses which are enrolled on.
     */
    this.getEnrolledCourses = function() {
        var enrolled = [];

        //For every course
        for (var i = 0; i < courses.length; i++) {

            //Get the course
            var course = courses[i];
            var courseName = course.getName();

            //Make sure we are enrolled in the course
            if (course.getEnrolled()) {
                enrolled.push(course);
            }
        }

        return enrolled;
    };

    /**
     * Get a course object by it's name.
     * @param {String} cName - Name of the course to find.
     * @return {Object} course Object with specified name (null if not found).
     */
    this.getCourseByName = function(cName) {

        for (var i = 0; i < courses.length; i++) {
            var course = courses[i];
            if (course.getName() == cName) {
                return course;
            }
        }

        return null;
    };

    /**
     * Add a new course that the university can enlist in.
     * @param {String} pName - the Name of the course.
     * @param {Integer} pLectures - the number of lectures on the course.
     * @param {Integer} pSeminars - the number of seminars on the course.
     * @constructor
     */
    this.addCourse = function(pName, pLectures, pSeminars) {
        var nCourse = new exports.Course(pName, pLectures, pSeminars);
        courses.push(nCourse);
        types.push(pName);
    };

    /*
     * Serializes the Courses for network transmission.
     * @return {Object} JSON object of courses and types.
     */
    this.toJSON = function() {
        var serializedCourses = [];
        for (var i = 0; i < courses.length; i++) {
            var rec = courses[i];
            serializedCourses.push(courseToJson(rec));
        }
        var json = {courses: serializedCourses, types: types};
        return json;
    };

    /**
     * Convert specified course to JSON.
     * @param {Object} rec The course object being converted to JSON.
     * @return {Object} The serialized course to be returned.
     */
    var courseToJson = function(rec) {
        var course = {
            name: rec.getName(),
            numLecturesRequired: rec.getNumLecturesRequired(),
            numSeminarsRequired: rec.getNumSeminarsRequired(),
            numLecturesTaught: rec.getNumLecturesTaught(),
            numSeminarsTaught: rec.getNumSeminarsTaught(),
            enrolled: rec.getEnrolled()
        };
        return course;
    };

    /**
     * Convert specified JSON to courses array.
     * @param {Object} json - The course JSON to convert to a course object.
     * @return {Object} returns the converted course object.
     */
    var courseFromJson = function(json) {
        var course = new exports.Course(json.name, json.numLecturesRequired, json.numSeminarsRequired);
        course.changeNumLecturesTaught(json.numLecturesTaught);
        course.changeNumSeminarsTaught(json.numSeminarsTaught);
        course.setEnrolled(json.enrolled);
        return course;
    };

    /*
     * Reads a serialized courses module and loads it into the repository.
     * @param {Object} msg - JSON object of courses and types.
     */
    this.fromJSON = function(msg) {
        courses = [];
        var jsonCourses = msg.courses;

        for (var i = 0; i < jsonCourses.length; i++) {
            var rec = jsonCourses[i];
            var course = courseFromJson(rec);
            courses.push(course);
        }

        types = msg.types;
    };

    /**
     * Randomly get a course for a student, if we have met the criteria for the course.
     * @return {String} - a random valid course name, or null if none.
     */
    this.getRandomValidCourse = function() {
        var validCourses = [];
        //Get all the valid courses.
        for (var i = 0; i < courses.length; i++) {
            if (courses[i].getValid()) {
                validCourses.push(courses[i]);
            }
        }

        //Randomly pick a course
        var randomCourse = validCourses[Math.floor(Math.random() * validCourses.length)]
        if (randomCourse != null) {
            return randomCourse.getName();
        }

        return null;

    };

};

/**
 * An individual course that can be taught at the university.
 * @param {String} pName - the Name of the course.
 * @param {Integer} pLectures - the number of lectures on the course.
 * @param {Integer} pSeminars - the number of seminars on the course.
 * @constructor
 */
exports.Course = function(pName, pLectures, pSeminars) {

    var name = pName;
    var numLecturesRequired = pLectures;
    var numSeminarsRequired = pSeminars;
    var numLecturesTaught = 0;
    var numSeminarsTaught = 0;
    var enrolled = false; //Is the course taken by the universirty.
    var validForTeaching = false; //Has the criteria to teach the course been met (correct number of lectures + seminars);

    /**
     * Get the name of the course.
     * @return {String} the name of the course.
     */
    this.getName = function() {
        return name;
    };

    /**
     * Get the number of lectures required to teach on the course.
     * @return {String} number of lecture required to teach the course.
     */
    this.getNumLecturesRequired = function() {
        return numLecturesRequired;
    };

    /**
     * Get the number of seminars required to teach the course.
     * @return {String} number of seminars required to teach the course.
     */
    this.getNumSeminarsRequired = function() {
        return numSeminarsRequired;
    };

    /**
     * Get the number of lectures current taught on the course.
     * @return {String} number of lecture current taught on the course.
     */
    this.getNumLecturesTaught = function() {
        return numLecturesTaught;
    };

    /**
     * Change the number of lectures current taught on the course.
     * @param {Integer} amount - the number of lectures to increase numLecturesTaught (can be negative).
     * @return {Boolean} - returns if the course is now valid, when previously it wasn't.
     */
    this.changeNumLecturesTaught = function(amount) {
        numLecturesTaught += amount;
        return checkCourseValid();
    };

    /**
     * Change the number of seminars current taught on the course.
     * @param {Integer} amount - the number of seminars to increase numLecturesTaught (can be negative).
     * @return {Boolean} - returns if the course is now valid, when previously it wasn't.
     */
    this.changeNumSeminarsTaught = function(amount) {
        numSeminarsTaught += amount;
        return checkCourseValid();
    };

    /**
     * Get the number of seminars current taught on the course.
     * @return {String} number of seminars current taught on the course.
     */
    this.getNumSeminarsTaught = function() {
        return numSeminarsTaught;
    };

    /**
     * Get if the university has taken the course.
     * @return {Boolean} true if university enrolled on this course.
     */
    this.getEnrolled = function() {
        return enrolled;
    };

    /**
     * Set if the university has taken the course.     * @param {Boolean} value -  if university enrolled on this course.
     */
    this.setEnrolled = function(value) {
        enrolled = value;
    };

    /**
     * Get if the course has met the criteria to be taught.
     * @return {Boolean} true if course is valid.
     */
    this.getValid = function() {
        return validForTeaching;
    };

    /**
     * Check if the course has met the minimum criteria, and mark it as so if it has.
     * @return {Boolean} - returns if the course is now valid, when previously it wasn't.
     */
    var checkCourseValid = function() {
        var oldValid = validForTeaching;
        validForTeaching = (numLecturesTaught >= numLecturesRequired && numSeminarsTaught >= numSeminarsRequired);
        if (oldValid == false && validForTeaching == true) {
            return true;
        }
        return false;
    };

};
