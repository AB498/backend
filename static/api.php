<?php

function getLastEditedTimes($dir, $baseDir = '/') {
    $result = array();
    $files = scandir($dir);

    foreach ($files as $file) {
        $relativePath = $baseDir . '' . $file;
        $filePath = $dir . '/' . $file;

        if (is_dir($filePath) && $file != '.' && $file != '..') {
            $result += getLastEditedTimes($filePath, $relativePath);
        } elseif (is_file($filePath)) {
            $lastEditedTime = filemtime($filePath); // Last modified time
            $result[$relativePath] = date("Y-m-d H:i:s", $lastEditedTime);
        }
    }

    return $result;
}

// Assuming you are using a basic PHP server setup
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $directoryPath = getcwd();
    $lastEditedTimes = getLastEditedTimes($directoryPath);
    header('Content-Type: application/json');
    echo json_encode($lastEditedTimes);
}
