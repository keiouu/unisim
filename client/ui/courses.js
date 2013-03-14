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
 * A UI to display and edit the available courses of the university.
 * and to fire events when the user picks one.
 * @param {Object} game - reference to game objects.
 * @constructor
 */
exports.Courses = function(game) {

    basicElements.Menu.call(this, 350, 120, 'Courses');

    var addEnrollListener = function(button, courseName, bool) {
        button.addListener('mouseup', function(e) {
            game.server.send('courses', 'enroll', {course: courseName, value: bool});
        });
    };

    if (game != null) {

        var types = game.courses.getTypes();
        var numCourses = types.length;

        var labelCourses = new basicElements.Label(50, 20, 'Name');
        labelCourses.setCentered(true);
        this.addElement('LabelCourses', labelCourses, 0, 0);

        var labelLectures = new basicElements.Label(50, 20, 'Lecs Req.');
        labelLectures.setCentered(true);
        this.addElement('LabelLectures', labelLectures, 0, 0);

        var labelSeminars = new basicElements.Label(50, 20, 'Sems Req.');
        labelSeminars.setCentered(true);
        this.addElement('LabelSeminars', labelSeminars, 0, 0);

        var labelEnroll = new basicElements.Label(50, 20, 'Offer');
        labelEnroll.setCentered(true);
        this.addElement('LabelEnroll', labelEnroll, 0, 0);

        var labelValid = new basicElements.Label(50, 20, 'Valid');
        labelValid.setCentered(true);
        this.addElement('LabelValid', labelValid, 0, 0);

        var labelDivider1 = new basicElements.Label(75, 20, '----------------');
        var labelDivider2 = new basicElements.Label(75, 20, '----------------');
        var labelDivider3 = new basicElements.Label(75, 20, '----------------');
        var labelDivider4 = new basicElements.Label(75, 20, '----------------');
        var labelDivider5 = new basicElements.Label(75, 20, '----------------');

        this.addElement('LabelDivider1', labelDivider1, 0, 0);
        this.addElement('LabelDivider2', labelDivider2, 0, 0);
        this.addElement('LabelDivider3', labelDivider3, 0, 0);
        this.addElement('LabelDivider4', labelDivider4, 0, 0);
        this.addElement('LabelDivider5', labelDivider5, 0, 0);

        //For every course
        for (var i = 0; i < numCourses; i++) {

            //Get the course
            var course = game.courses.getCourseByName(types[i]);
            var courseName = course.getName();

            if (course.getEnrolled()) {
                var numLec = course.getNumLecturesTaught() + ' / ' + course.getNumLecturesRequired();
                var numSem = course.getNumSeminarsTaught() + ' / ' + course.getNumSeminarsRequired();
            } else {
                var numLec = course.getNumLecturesRequired();
                var numSem = course.getNumSeminarsRequired();
            }

            var courseText = courseName + ':';

            var label = new basicElements.Label(60, 20, courseText);
            this.addElement('label' + courseName, label, 0, 0);

            var labelLec = new basicElements.Label(10, 20, numLec);
            labelLec.setCentered(true);
            this.addElement('labelLec' + courseName, labelLec, 0, 0);

            var labelSem = new basicElements.Label(10, 20, numSem);
            labelSem.setCentered(true);
            this.addElement('labelSem' + courseName, labelSem, 0, 0);

            if (course.getEnrolled()) {
                var button = new basicElements.Button(40, 20, 'Drop');
                addEnrollListener(button, courseName, false);
            } else {
                var button = new basicElements.Button(40, 20, 'Offer');
                addEnrollListener(button, courseName, true);
            }
            this.addElement('button' + courseName, button, 0, 0);

            if (course.getValid()) {
                var labelVal = new basicElements.Label(10, 20, 'Y');
            } else {
                var labelVal = new basicElements.Label(10, 20, 'N');
            }
            labelVal.setCentered(true);
            this.addElement('labelval' + courseName, labelVal, 0, 0);

        }

        this.distributeToGrid(5, numCourses + 2, 0, 0);

    }

};

//setup menu prototype info.
exports.Courses.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Courses.prototype.constructor = exports.Timetable;
