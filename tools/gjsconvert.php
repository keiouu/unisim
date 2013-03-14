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

<?php

// Load the file
$filename = "build/gjslint.txt";

// chec file exists
if(file_exists($filename)) {
	// read the lines of the file
	$contents = file_get_contents($filename);
	$lines = explode("\n", $contents);
	
	$issues = array();
	$file = "";
	// for each line
	foreach($lines as $l) {
		// check if file or line error
		if(strpos($l, "FILE") !== false) {
			// get file name
			preg_match_all("/----- FILE  :  (.+?) -----/", $l, $matches);
			$file = $matches[1][0];
		} elseif(strpos($l, "Line") !== false) {
			// get line error message
			preg_match_all("/Line (\d+), E:\d+?: (.*)/", $l, $matches);
			// ignore long line errors
			if(strpos($l, "E:0110") === false) {
				$issues[$file][] = array("line" => $matches[1][0], "error" => $matches[2][0]);	
			}
			
		}
	}

	// output in xml format
	echo '<?xml version="1.0" encoding="utf-8"?><jslint>';
	foreach($issues as $file => $issue) {
		echo '<file name="' . $file . '">';
		foreach($issue as $i) {
			echo '<issue line="' . $i["line"] . '" reason="' . htmlentities($i["error"]) . '" />';	
		}
		
		echo '</file>';
	}
	

	echo '</jslint>';

	exit(0);
} else {
	echo "File does not exist";
	exit (1);
}
