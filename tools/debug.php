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
/**
 * Tom's Automagical debug symbol insertion.
 * Because we use XHRs and eval() to require in our clientside JS
 * we get no helpful stacktraces, particularly from FF, and an impossible error
 * meant I had to write this to find out where things were going wrong.
 */

/**
 * Find JS source files recursively
 * in the given directory.
 * @param $dir
 * @return array
 */
function getJsFilesRecursively($dir) {
    $foundFiles = array();
    foreach (scandir($dir) as $file) {
        if (is_dir($dir.DIRECTORY_SEPARATOR.$file) && $file != '.' && $file != '..') {
            $foundFiles = array_merge($foundFiles, getJsFilesRecursively($dir.DIRECTORY_SEPARATOR.$file));
        } else if (substr($file, -3, 3) == '.js') {
            $foundFiles[] = $dir.DIRECTORY_SEPARATOR.$file;
        }
    }
    return $foundFiles;
}


//run through all client JS files, add makeshift debug symbols (!)
//note: This is SO SLOW due to the thousands of console.logs when the client works that its only practical
//for use when you have an absolutely show-stopping error, and even then its tricky.
foreach (getJsFilesRecursively('src'.DIRECTORY_SEPARATOR.'client') as $file) {
    $code = explode("\n", file_get_contents($file));
    foreach ($code as $index=>&$line) {
        if (strpos($line, 'function') !== false && substr(trim($line), -1, 1)=='{') {
            $line .= ' console.log("'.str_replace('\\','\\\\', $file).' line '.$index.'");';
        }
    }
    file_put_contents($file, implode("\n", $code));
}
