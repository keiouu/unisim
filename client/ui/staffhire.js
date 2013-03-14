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
 * A UI to enable the hiring of staff.
 * and to handle UI input.
 * @param {Object} game - reference to game objects.
 * @constructor
 */
exports.StaffHire = function(game) {

    // Call parent constructor
    basicElements.Menu.call(this, 250, 400, 'Hire Staff');

    var enrolledCourses = game.courses.getEnrolledCourses();
    var index = 0;
    var courseName = 'Nothing';
    var me = this; //Needed due to scope loss.

    //Has to be created first to be able to edit text.
    var bioLabel = new basicElements.Label(230, 210, '');
    bioLabel.setCentered(true);

    /**
     * Refreshes the coursesLabel.
     * @this referenced.
     */
    this.refresh = function() {
        courseName = 'Nothing';

        enrolledCourses = game.courses.getEnrolledCourses();

        if (enrolledCourses[index] == null) {
            index = 0;
        }

        if (enrolledCourses.length != 0) {
            courseName = enrolledCourses[index].getName();
        }

        var courseLabel = new basicElements.Label(50, 20, courseName);
        courseLabel.setCentered(true);
        this.addElement('courseLabel', courseLabel, 100, 60);

        //Request bios to sent from the server.
        if (courseName != 'Nothing') {
            game.server.send('actors', 'staffbio', {number: 3});
            bioLabel.setText('Looking for hirable staff...');
        } else {
            bioLabel.setText('Enroll on courses to hire staff.');
        }

        this.setRedraw(true);
    };

    //UI ELEMENTS:

    //Teaches Label
    var teacheslabel = new basicElements.Label(50, 20, 'Teaches:');
    teacheslabel.setCentered(true);
    this.addElement('teacheslabel', teacheslabel, 100, 40);

    //Cycle Left Button
    var cycleCourseLeftButton = new basicElements.Button(20, 20, '<');
    cycleCourseLeftButton.addListener('mouseup', function(e) {
        index -= 1;
        if (index < 0) {
            index = enrolledCourses.length - 1;
        }
        me.refresh();
    });

    this.addElement('cycleCourseLeftButton', cycleCourseLeftButton, 75, 60);

    //Cycle Right Button
    var cycleCourseRightButton = new basicElements.Button(20, 20, '>');
    cycleCourseRightButton.addListener('mouseup', function(e) {
        index += 1;
        if (index > enrolledCourses.length) {
            index = 0;
        }
        me.refresh();
    });

    this.addElement('cycleCourseRightButton', cycleCourseRightButton, 155, 60);

    //Hire Button
    var hireButton = new basicElements.Button(230, 30, 'Hire');
    hireButton.addListener('mouseup', function(e) {
        game.server.send('actors', 'staff', {course: courseName});
    });

    this.addElement('hireButton', hireButton, 10, 360);

    var bioText = new basicElements.Text(230, 140, '');
    bioText.setEditable(false);
    this.addElement('biotext', bioText, 10, 200);

    this.addElement('biolabel', bioLabel, 10, 170);

    /**
     * Display a bio received from the server.
     * @param {String} bio - the text to display.
     */
    this.displayBio = function(bio) {

        bioLabel.setText('');
        bioText.setText(bio);

        this.setRedraw(true);
    };

};

//setup menu prototype info.
exports.StaffHire.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.StaffHire.prototype.constructor = exports.StaffHire;
