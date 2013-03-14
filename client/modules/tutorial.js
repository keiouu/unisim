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

exports.tutorial = function(game) {

    var stage = 1;
    game.sideBar.setVisible(false);
    var buildingUI = game.container.getChild('buildings');
    buildingUI.setVisible(false);
    var coursesButton = game.container.getChild('coursesButton');
    coursesButton.setVisible(false);
    var staffButton = game.container.getChild('staffButton');
    staffButton.setVisible(false);
    var loadButton = game.container.getChild('loadButton');
    loadButton.setVisible(false);
    var saveButton = game.container.getChild('saveButton');
    saveButton.setVisible(false);

    var skipFunction = function() {
        stage = -1;
        game.sideBar.setVisible(true);
        buildingUI.setVisible(true);
        coursesButton.setVisible(true);
        staffButton.setVisible(true);
        loadButton.setVisible(true);
        saveButton.setVisible(true);
    };

    var uiTut = require('ui/tutorial.js');
    var tutorial = new uiTut.Tutorial1(game);
    tutorial.skipFunctionality(skipFunction);
    tutorial.nextTutorialPhase(function() {


        //Objective
        stage = 2;
        tutorial.setVisible(false);
        tutorial = new uiTut.Tutorial2(game);
        tutorial.skipFunctionality(skipFunction);
        game.container.addElement('tutorial2', tutorial, Math.floor(game.container.getWidth() / 2) - 175, Math.floor(game.container.getHeight() / 2) - 100);
        tutorial.nextTutorialPhase(function() {

            //Sidebar
            stage = 3;
            game.sideBar.setVisible(true);
            tutorial.setVisible(false);
            tutorial = new uiTut.Tutorial3(game);
            tutorial.skipFunctionality(skipFunction);
            game.container.addElement('tutorial3', tutorial, 220, 10);
            tutorial.nextTutorialPhase(function() {

                //Buildings
                stage = 4;
                buildingUI.setVisible(true);
                tutorial.setVisible(false);
                tutorial = new uiTut.Tutorial4(game);
                tutorial.skipFunctionality(skipFunction);
                game.container.addElement('tutorial4', tutorial, 220, 140);
                tutorial.nextTutorialPhase(function() {

                    //Lecture Theatre
                    stage = 5;
                    tutorial.setVisible(false);
                    tutorial = new uiTut.Tutorial5(game);
                    tutorial.skipFunctionality(skipFunction);
                    game.container.addElement('tutorial5', tutorial, 220, 110);

                });
            });
        });
    });

    game.container.addElement('tutorial', tutorial, Math.floor(game.container.getWidth() / 2) - 175, Math.floor(game.container.getHeight() / 2) - 50);

    /**
     * Listen to our building repository
     * to check for lecture rooms being built.
     */
    game.buildings.buildingAdded(function() {

        //If we are looking for a lecture room to be built.
        if (stage == 4 || stage == 5) {
            var building = game.buildings.getLastAdded();
            if (building.getName() == 'Lecture Theatre') {
                //CoursesButton
                stage = 6;
                coursesButton.setVisible(true);
                tutorial.setVisible(false);
                tutorial = new uiTut.Tutorial6(game);
                tutorial.skipFunctionality(skipFunction);
                game.container.addElement('tutorial6', tutorial, 220, 50);
            }
        }
    });

    //Listen for coursesButton press in stage 6. 
    coursesButton.addListener('mouseup', function(e) {

        if (stage == 6) {
            //Offer Art.
            stage = 7;
            tutorial.setVisible(false);
            tutorial = new uiTut.Tutorial7(game);
            tutorial.skipFunctionality(skipFunction);
            game.container.addElement('tutorial7', tutorial, -320, 10);
        }

        //If we are in the art offer part of the tutorial.
        if (stage == 7) {
            var courseWindow = game.container.getChild('courses');
            var offerArtButton = courseWindow.getChild('buttonArt');

            offerArtButton.addListener('mouseup', function(e) {

                if (stage == 7) {
                    //Hire Staff Button.
                    stage = 8;
                    staffButton.setVisible(true);
                    tutorial.setVisible(false);
                    tutorial = new uiTut.Tutorial8(game);
                    tutorial.skipFunctionality(skipFunction);
                    game.container.addElement('tutorial8', tutorial, 220, 50);
                }
            });
        }

    });

    //Listen for staffButton press in stage 8. 
    staffButton.addListener('mouseup', function(e) {

        if (stage == 8) {
            //Hire Art Staff Member.
            stage = 9;
            tutorial.setVisible(false);
            tutorial = new uiTut.Tutorial9(game);
            tutorial.skipFunctionality(skipFunction);
            game.container.addElement('tutorial9', tutorial, 220, 110);
        }
    });

    //Check for a staff member being added.
    game.actors.actorAdded(function(actor) {
        if (stage == 9 && actor.getType() == 'staff' && actor.getCourse() == 'Art') {
            //Edit Mode.
            stage = 10;
            tutorial.setVisible(false);
            tutorial = new uiTut.Tutorial10(game);
            tutorial.skipFunctionality(skipFunction);
            game.container.addElement('tutorial10', tutorial, 220, 110);
        }

    });

    //Using the tutorial listener check for edit button presses.
    game.tutorial.on('edit', function(building) {
        if (stage == 10 && building.getName() == 'Lecture Theatre') {
            //Art Lecture Add.
            stage = 11;
            tutorial.setVisible(false);
            tutorial = new uiTut.Tutorial11(game);
            tutorial.skipFunctionality(skipFunction);
            game.container.addElement('tutorial11', tutorial, -530, 10);
        }
    });

    //Using the tutorial listener check for edit button presses.
    game.tutorial.on('lectureAdded', function(courseName) {
        if (stage == 11 && courseName == 'Art') {
            //Accommodation.
            stage = 12;
            tutorial.setVisible(false);
            tutorial = new uiTut.Tutorial12(game);
            tutorial.skipFunctionality(skipFunction);
            game.container.addElement('tutorial12', tutorial, 220, 110);
        }
    });

    /**
     * Listen to our building repository
     * to check for Accommodation being built.
     */
    game.buildings.buildingAdded(function() {

        //If we are looking for accommodation to be built.
        if (stage == 12) {
            var building = game.buildings.getLastAdded();
            if (building.getType() == 'Accommodation') {
                //Tutorial Over
                stage = 13;
                loadButton.setVisible(true);
                saveButton.setVisible(true);
                tutorial.setVisible(false);
                tutorial = new uiTut.Tutorial13(game);
                tutorial.skipFunctionality(skipFunction);
                tutorial.nextTutorialPhase(function() {
                    stage = -1;
                });
                game.container.addElement('tutorial13', tutorial, Math.floor(game.container.getWidth() / 2) - 175, Math.floor(game.container.getHeight() / 2) - 100);
            }
        }
    });

    /**
     * Paint our tutorial onto the screen
     * @param {object} g Graphics message.
     */
    this.paintEvent = function(g) {

    };

};
