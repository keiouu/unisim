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
 * A UI to display a starting tutorial to the player.
 * @param {Object} game - reference to game objects.
 * @constructor
 */
exports.Tutorial1 = function(game) {

    var titleString = 'Tutorial - Welcome';
    var me = this;
    var nextPhase;
    var skipFunc;

    // Call parent constructor
    basicElements.Menu.call(this, 350, 100, titleString);

    var labelText1 = new basicElements.Label(330, 10, 'Welcome to University Simulator!\n Would you like a tutorial?');
    labelText1.setCentered(true);
    this.addElement('labelText1', labelText1, 10, 30);

    var buttonYes = new basicElements.Button(150, 20, 'YES, give me a tutorial.');
    this.addElement('buttonYes', buttonYes, 10, 70);
    buttonYes.addListener('mouseup', function(e) {
        me.setVisible(false);
        nextPhase();
    });

    var buttonNo = new basicElements.Button(150, 20, 'NO, skip the tutorial.');
    this.addElement('buttonNo', buttonNo, 190, 70);
    buttonNo.addListener('mouseup', function(e) {
        me.setVisible(false);
        skipFunc();
    });

    this.nextTutorialPhase = function(func) {
        nextPhase = func;
    };

    this.skipFunctionality = function(func) {
        skipFunc = func;
    };

};

//setup menu prototype info.
exports.Tutorial1.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Tutorial1.prototype.constructor = exports.Tutorial1;

/**
 * Stage 2 of the tutorial to the player - overview.
 * @param {Object} game - reference to game objects.
 * @constructor
 */
exports.Tutorial2 = function(game) {

    var titleString = 'Tutorial - Objective';
    var me = this;
    var nextPhase;
    var skipFunc;

    // Call parent constructor
    basicElements.Menu.call(this, 350, 200, titleString);

    var labelText1 = new basicElements.Label(330, 10, 'The aim of the game is to build a successful university.\n ' +
        'You will have to attract students to the university,\n \n ' +
        'by meeting their needs and scheduling lectures.\n ' +
        'You will also have to manage staff members.\n \n ' +
        'You can move around the university by moving the mouse near the edges of the screen, using the arrow keys or clicking on the minimap.');

    labelText1.setCentered(true);
    this.addElement('labelText1', labelText1, 10, 30);

    var buttonNext = new basicElements.Button(80, 20, 'NEXT');
    this.addElement('buttonNext', buttonNext, 135, 170);
    buttonNext.addListener('mouseup', function(e) {
        me.setVisible(false);
        nextPhase();
    });

    var buttonSkip = new basicElements.Button(40, 20, 'Skip');
    this.addElement('buttonSkip', buttonSkip, 300, 170);
    buttonSkip.addListener('mouseup', function(e) {
        me.setVisible(false);
        skipFunc();
    });

    this.nextTutorialPhase = function(func) {
        nextPhase = func;
    };

    this.skipFunctionality = function(func) {
        skipFunc = func;
    };

};

//setup menu prototype info.
exports.Tutorial2.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Tutorial2.prototype.constructor = exports.Tutorial2;

/**
 * Stage 3 of the tutorial to the player - sidebar.
 * @param {Object} game - reference to game objects.
 * @constructor
 */
exports.Tutorial3 = function(game) {

    var titleString = 'Tutorial - Sidebar';
    var me = this;
    var nextPhase;
    var skipFunc;

    // Call parent constructor
    basicElements.Menu.call(this, 350, 100, titleString);

    var labelText1 = new basicElements.Label(330, 10, 'The top left of the screen contains the sidebar.\n \n' +
        '<----      Here your can see your available money, the time of day and research progress.'
    );
    labelText1.setCentered(true);
    this.addElement('labelText1', labelText1, 10, 30);

    var buttonNext = new basicElements.Button(80, 20, 'NEXT');
    this.addElement('buttonNext', buttonNext, 135, 70);
    buttonNext.addListener('mouseup', function(e) {
        me.setVisible(false);
        nextPhase();
    });

    var buttonSkip = new basicElements.Button(40, 20, 'Skip');
    this.addElement('buttonSkip', buttonSkip, 300, 70);
    buttonSkip.addListener('mouseup', function(e) {
        me.setVisible(false);
        skipFunc();
    });

    this.nextTutorialPhase = function(func) {
        nextPhase = func;
    };

    this.skipFunctionality = function(func) {
        skipFunc = func;
    };

};

//setup menu prototype info.
exports.Tutorial3.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Tutorial3.prototype.constructor = exports.Tutorial3;

/**
 * Stage 4 of the tutorial to the player - buildings.
 * @param {Object} game - reference to game objects.
 * @constructor
 */
exports.Tutorial4 = function(game) {

    var titleString = 'Tutorial - Buildings';
    var me = this;
    var nextPhase;
    var skipFunc;

    // Call parent constructor
    basicElements.Menu.call(this, 350, 200, titleString);

    var labelText1 = new basicElements.Label(330, 30, '<-------     The left of the screen has the building menu.\n \n ' +
        'None and Edit are options. Whilst others are buildings.\n \n ' +
        'None means "Do Not Build"\n ' +
        'Edit is used for setting timetables.'
    );
    labelText1.setCentered(true);
    this.addElement('labelText1', labelText1, 10, 30);

    var buttonNext = new basicElements.Button(80, 20, 'NEXT');
    this.addElement('buttonNext', buttonNext, 135, 170);
    buttonNext.addListener('mouseup', function(e) {
        me.setVisible(false);
        nextPhase();
    });

    var buttonSkip = new basicElements.Button(40, 20, 'Skip');
    this.addElement('buttonSkip', buttonSkip, 300, 170);
    buttonSkip.addListener('mouseup', function(e) {
        me.setVisible(false);
        skipFunc();
    });

    this.nextTutorialPhase = function(func) {
        nextPhase = func;
    };

    this.skipFunctionality = function(func) {
        skipFunc = func;
    };

};

//setup menu prototype info.
exports.Tutorial4.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Tutorial4.prototype.constructor = exports.Tutorial4;

/**
 * Stage 5 of the tutorial to the player - Lecture Theatre.
 * @param {Object} game - reference to game objects.
 * @constructor
 */
exports.Tutorial5 = function(game) {

    var titleString = 'Tutorial - Lecture Theatre';
    var me = this;
    var nextPhase;
    var skipFunc;

    // Call parent constructor
    basicElements.Menu.call(this, 350, 250, titleString);

    var labelText1 = new basicElements.Label(330, 20, '<-------     Try building a Lecture Theatre.\n \n ' +
        'Select the Lecture Theatre from the list.\n' +
        'Then click and drag using the mouse on some grass tiles. \n \n ' +
        'The highlighted area will be red for buildings that have invalid placements or are too small.\n \n ' +
        'The text in the middle of the highlighted box tells you the cost of the building. ' +
        'The number will be red if you cannot afford the building.'
    );
    labelText1.setCentered(true);
    this.addElement('labelText1', labelText1, 10, 30);

    var buttonSkip = new basicElements.Button(40, 20, 'Skip');
    this.addElement('buttonSkip', buttonSkip, 300, 220);
    buttonSkip.addListener('mouseup', function(e) {
        me.setVisible(false);
        skipFunc();
    });

    this.nextTutorialPhase = function(func) {
        nextPhase = func;
    };

    this.skipFunctionality = function(func) {
        skipFunc = func;
    };

};

//setup menu prototype info.
exports.Tutorial5.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Tutorial5.prototype.constructor = exports.Tutorial5;

/**
 * Stage 6 of the tutorial to the player - Courses.
 * @param {Object} game - reference to game objects.
 * @constructor
 */
exports.Tutorial6 = function(game) {

    var titleString = 'Tutorial - Courses';
    var me = this;
    var nextPhase;
    var skipFunc;

    // Call parent constructor
    basicElements.Menu.call(this, 200, 200, titleString);

    var labelText1 = new basicElements.Label(180, 20, 'Well Done!\n \n' +
        'Now you will need to offer courses so that you can attract them to the university campus.\n \n ' +
        'Click on the courses button at the top of the screen.');
    labelText1.setCentered(true);
    this.addElement('labelText1', labelText1, 10, 30);

    var buttonSkip = new basicElements.Button(40, 20, 'Skip');
    this.addElement('buttonSkip', buttonSkip, 150, 170);
    buttonSkip.addListener('mouseup', function(e) {
        me.setVisible(false);
        skipFunc();
    });

    this.nextTutorialPhase = function(func) {
        nextPhase = func;
    };

    this.skipFunctionality = function(func) {
        skipFunc = func;
    };

};

//setup menu prototype info.
exports.Tutorial6.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Tutorial6.prototype.constructor = exports.Tutorial6;

/**
 * Stage 7 of the tutorial to the player - Offer Art.
 * @param {Object} game - reference to game objects.
 * @constructor
 */
exports.Tutorial7 = function(game) {

    var titleString = 'Tutorial - Offering a Course';
    var me = this;
    var nextPhase;
    var skipFunc;

    // Call parent constructor
    basicElements.Menu.call(this, 300, 190, titleString);

    var labelText1 = new basicElements.Label(280, 20,
        'The courses menu shows you a list of courses that you can offer as University!\n \n' +
            'Each course has a minimum number of Lectures and Seminars that must be scheduled before the course is a valid degree.\n \n ' +
            'Try offering the Art Module. Click on the Offer button in line with Art Course.');
    labelText1.setCentered(true);
    this.addElement('labelText1', labelText1, 10, 30);

    var buttonSkip = new basicElements.Button(40, 20, 'Skip');
    this.addElement('buttonSkip', buttonSkip, 250, 160);
    buttonSkip.addListener('mouseup', function(e) {
        me.setVisible(false);
        skipFunc();
    });

    this.nextTutorialPhase = function(func) {
        nextPhase = func;
    };

    this.skipFunctionality = function(func) {
        skipFunc = func;
    };

};

//setup menu prototype info.
exports.Tutorial7.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Tutorial7.prototype.constructor = exports.Tutorial7;

/**
 * Stage 8 of the tutorial to the player - Staff Button.
 * @param {Object} game - reference to game objects.
 * @constructor
 */
exports.Tutorial8 = function(game) {

    var titleString = 'Tutorial - Staff Button';
    var me = this;
    var nextPhase;
    var skipFunc;

    // Call parent constructor
    basicElements.Menu.call(this, 300, 150, titleString);

    var labelText1 = new basicElements.Label(280, 20,
        'Well Done!\n \n ' +
            'You\'re going to need staff to run your lectures. \n \n ' +
            'Click on the staff button, also found at the top of the screen.');
    labelText1.setCentered(true);
    this.addElement('labelText1', labelText1, 10, 30);

    var buttonSkip = new basicElements.Button(40, 20, 'Skip');
    this.addElement('buttonSkip', buttonSkip, 250, 120);
    buttonSkip.addListener('mouseup', function(e) {
        me.setVisible(false);
        skipFunc();
    });

    this.nextTutorialPhase = function(func) {
        nextPhase = func;
    };

    this.skipFunctionality = function(func) {
        skipFunc = func;
    };

};

//setup menu prototype info.
exports.Tutorial8.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Tutorial8.prototype.constructor = exports.Tutorial8;

/**
 * Stage 9 of the tutorial to the player - Hiring Staff.
 * @param {Object} game - reference to game objects.
 * @constructor
 */
exports.Tutorial9 = function(game) {

    var titleString = 'Tutorial - Hiring Staff';
    var me = this;
    var nextPhase;
    var skipFunc;

    // Call parent constructor
    basicElements.Menu.call(this, 200, 300, titleString);

    var labelText1 = new basicElements.Label(180, 20,
        'At the top of the staff hire window you can change the subject you wish to hire for, ' +
            'out of a selection from those you offer.\n \n ' +
            'Each staff member comes with a bio.\n \n ' +
            'You will need a Staff Room for staff to rest in.\n \n ' +
            'Build a Staff Room and then hire an Art staff member.\n ' +
            'Feel free to close either the courses or staff window.');
    labelText1.setCentered(true);
    this.addElement('labelText1', labelText1, 10, 30);

    var buttonSkip = new basicElements.Button(40, 20, 'Skip');
    this.addElement('buttonSkip', buttonSkip, 150, 270);
    buttonSkip.addListener('mouseup', function(e) {
        me.setVisible(false);
        skipFunc();
    });

    this.nextTutorialPhase = function(func) {
        nextPhase = func;
    };

    this.skipFunctionality = function(func) {
        skipFunc = func;
    };

};

//setup menu prototype info.
exports.Tutorial9.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Tutorial9.prototype.constructor = exports.Tutorial9;

/**
 * Stage 10 of the tutorial to the player - Edit Mode.
 * @param {Object} game - reference to game objects.
 * @constructor
 */
exports.Tutorial10 = function(game) {

    var titleString = 'Tutorial - Edit Mode';
    var me = this;
    var nextPhase;
    var skipFunc;

    // Call parent constructor
    basicElements.Menu.call(this, 200, 200, titleString);

    var labelText1 = new basicElements.Label(180, 20,
        'Well Done! Close the staff window now.\n \n ' +
            'Now we need to schedule a lecture.\n \n ' +
            'Select edit mode from the building menu, and click on the lecture theatre you created earlier.');
    labelText1.setCentered(true);
    this.addElement('labelText1', labelText1, 10, 30);

    var buttonSkip = new basicElements.Button(40, 20, 'Skip');
    this.addElement('buttonSkip', buttonSkip, 150, 170);
    buttonSkip.addListener('mouseup', function(e) {
        me.setVisible(false);
        skipFunc();
    });

    this.nextTutorialPhase = function(func) {
        nextPhase = func;
    };

    this.skipFunctionality = function(func) {
        skipFunc = func;
    };

};

//setup menu prototype info.
exports.Tutorial10.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Tutorial10.prototype.constructor = exports.Tutorial10;

/**
 * Stage 11 of the tutorial to the player - Scheduling Lectures.
 * @param {Object} game - reference to game objects.
 * @constructor
 */
exports.Tutorial11 = function(game) {

    var titleString = 'Tutorial - Scheduling Lectures';
    var me = this;
    var nextPhase;
    var skipFunc;

    // Call parent constructor
    basicElements.Menu.call(this, 200, 180, titleString);

    var labelText1 = new basicElements.Label(180, 20,
        'Here you can see the timetable for the lecture theatre you selected.\n \n ' +
            'Click on one of the free lecture slots and assign Art to that slot.');
    labelText1.setCentered(true);
    this.addElement('labelText1', labelText1, 10, 30);

    var buttonSkip = new basicElements.Button(40, 20, 'Skip');
    this.addElement('buttonSkip', buttonSkip, 150, 150);
    buttonSkip.addListener('mouseup', function(e) {
        me.setVisible(false);
        skipFunc();
    });

    this.nextTutorialPhase = function(func) {
        nextPhase = func;
    };

    this.skipFunctionality = function(func) {
        skipFunc = func;
    };

};

//setup menu prototype info.
exports.Tutorial11.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Tutorial11.prototype.constructor = exports.Tutorial11;

/**
 * Stage 12 of the tutorial to the player - Scheduling Lectures.
 * @param {Object} game - reference to game objects.
 * @constructor
 */
exports.Tutorial12 = function(game) {

    var titleString = 'Tutorial - Accommodation';
    var me = this;
    var nextPhase;
    var skipFunc;

    // Call parent constructor
    basicElements.Menu.call(this, 200, 250, titleString);

    var labelText1 = new basicElements.Label(180, 20,
        'Nice! If you open the courses window you can see that the art module is now marked as valid.' +
            'You just need to do one more thing before students can come on campus.\n \n ' +
            'You need to build Accommodation for students to live in. Build some "Flat Flats" now.');
    labelText1.setCentered(true);
    this.addElement('labelText1', labelText1, 10, 30);

    var buttonSkip = new basicElements.Button(40, 20, 'Skip');
    this.addElement('buttonSkip', buttonSkip, 150, 220);
    buttonSkip.addListener('mouseup', function(e) {
        me.setVisible(false);
        skipFunc();
    });

    this.nextTutorialPhase = function(func) {
        nextPhase = func;
    };

    this.skipFunctionality = function(func) {
        skipFunc = func;
    };

};

//setup menu prototype info.
exports.Tutorial12.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Tutorial12.prototype.constructor = exports.Tutorial12;

/**
 * Stage 13 of the tutorial to the player - Scheduling Lectures.
 * @param {Object} game - reference to game objects.
 * @constructor
 */
exports.Tutorial13 = function(game) {

    var titleString = 'Tutorial - That\'s it!';
    var me = this;
    var nextPhase;
    var skipFunc;

    // Call parent constructor
    basicElements.Menu.call(this, 350, 250, titleString);

    var labelText1 = new basicElements.Label(330, 20,
        'Congratulations! You should now have students coming onto your university campus.\n \n ' +
            'Students will want places to eat and relax, but you\'ll have to manage that.\n \n ' +
            'To attract more students to your campus, you will have to offer more courses.\n \n ' +
            'You can save and load using the buttons at the top of the screen. Good Luck!');
    labelText1.setCentered(true);
    this.addElement('labelText1', labelText1, 10, 30);

    var buttonFinish = new basicElements.Button(80, 20, 'Finish');
    this.addElement('buttonFinish', buttonFinish, 130, 220);
    buttonFinish.addListener('mouseup', function(e) {
        me.setVisible(false);
        nextTutorialPhase();
    });

    this.nextTutorialPhase = function(func) {
        nextPhase = func;
    };

    this.skipFunctionality = function(func) {
        skipFunc = func;
    };

};

//setup menu prototype info.
exports.Tutorial13.prototype = new basicElements.Menu;

/**
 * Prototype constructor.
 * @type {function}
 */
exports.Tutorial13.prototype.constructor = exports.Tutorial12;

