<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Kyle Maguire - Computer Graphics - Assignment 4</title>
    <link type="text/css" rel="stylesheet" href="css/main.css" />
</head>
<body>
	<div id="fileContainer">
    	Computer Graphics - Rendering Triangles<br />
        <span style="font-size:12px;">*accepts .txt and .tri files</span><br />
        <span style="font-size:12px;">More information on the TRI file format can be found
            <a href="http://paulbourke.net/dataformats/tri/" target="_blank">here</a>.</span><br />
        <div>
        	<select id="renderMethod">
            	<option value="1">Rasterize Triangles in 2D</option>
                <option value="2">Render in 3D (Wireframe)</option>
                <option value="3">Render in 3D (Flat Shaded)</option>
            </select>
        </div>
        <form id="fileForm" method="post" action="">
        	<div id="sampleFilesButton" class="fileInputType active" data-target="sampleFiles">Sample Files</div>
        	<div id="fileInputButton" class="fileInputType" data-target="file">File Upload</div>
            <div id="urlInputButton" class="fileInputType" data-target="fileURL">File URL</div>
            <div id="directInputButton" class="fileInputType" data-target="directInput">Direct Input</div>
            <div id="inputContainer">
            	<div id="sampleFiles" class="fileInputField">
                <?php
                    $first = true;
                    if ($handle = opendir('data')) {
                        while (false !== ($file = readdir($handle))) {
                            if ($file != "." && $file != "..") {
                                $filename = preg_replace('/\.[^.]+$/', '', $file);
                                echo '<div class="sampleFile' . ($first ? ' active' : '') . '" data-file-location="data/' . $file . '">' . $filename . '</div>';
                                if($first) { $first = false; }
                            }
                        }
                        closedir($handle);
                   }
                ?>
            	</div>
                <input id="file" class="fileInputField" name="file" type="file" />
                <input id="fileURL" class="fileInputField" name="fileURL" type="text" />
                <textarea id="directInput" class="fileInputField" name="directInput" /></textarea>
            </div>
            <button id="clearButton">Clear</button>
            <input id="submitButton" type="submit" value="Render" />
        </form>
    </div>
    <div id="viewportContainer">
		<canvas id="viewport" width="512" height="512"></canvas>
	</div>
    <div id="transformationsContainer" style="text-align:center;">
    	<button id="translateXNeg" class="transformButton" onclick="translateTriangles(-10, 0, 0);">-</button>
         Translate X 
        <button id="translateXPos" class="transformButton" onclick="translateTriangles(10, 0, 0);">+</button>
		 | 
        <button id="translateYNeg" class="transformButton" onclick="translateTriangles(0, -10, 0);">-</button>
         Translate Y 
        <button id="translateYPos" class="transformButton" onclick="translateTriangles(0, 10, 0);">+</button>
         | 
        <button id="translateZNeg" class="transformButton" onclick="translateTriangles(0, 0, -10);">-</button>
         Translate Z 
        <button id="translateZPos" class="transformButton" onclick="translateTriangles(0, 0, 10);">+</button>
        <br />
        <br />
        <button id="rotateXNeg" class="transformButton" onclick="rotateTriangles(-15, 0, 0);">-</button>
         Rotate X 
        <button id="rotateXPos" class="transformButton" onclick="rotateTriangles(15, 0, 0);">+</button>
         | 
        <button id="rotateYNeg" class="transformButton" onclick="rotateTriangles(0, -15, 0);">-</button>
         Rotate Y 
        <button id="rotateYPos" class="transformButton" onclick="rotateTriangles(0, 15, 0);">+</button>
         | 
        <button id="rotateZNeg" class="transformButton" onclick="rotateTriangles(0, 0, -15);">-</button>
         Rotate Z 
        <button id="rotateZPos" class="transformButton" onclick="rotateTriangles(0, 0, 15);">+</button>
        <br />
        <br />
       	<button id="scaleXNeg" class="transformButton" onclick="scaleTriangles(.8, 1, 1);">-</button>
         Scale X 
        <button id="scaleXPos" class="transformButton" onclick="scaleTriangles(1.2, 1, 1);">+</button>
         | 
        <button id="scaleYNeg" class="transformButton" onclick="scaleTriangles(1, .8, 1);">-</button>
         Scale Y 
        <button id="scaleYPos" class="transformButton" onclick="scaleTriangles(1, 1.2, 1);">+</button>
         | 
        <button id="scaleZNeg" class="transformButton" onclick="scaleTriangles(1, 1, .8);">-</button>
         Scale Z 
        <button id="scaleZPos" class="transformButton" onclick="scaleTriangles(1, 1, 1.2);">+</button>
        <br />
    	<button id="resetButton" onclick="resetTransformations();">Reset Transformations</button>
   	</div>

   	<script type="text/javascript" src="js/lib/jquery-1.8.0.min.js"></script>
	<script type="text/javascript" src="js/lib/sylvester.js"></script>
	<script type="text/javascript" src="js/main.js"></script>
</body>
</html>