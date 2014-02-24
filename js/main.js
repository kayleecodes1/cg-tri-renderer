//////////////////////////////////
//                              //
//        VIEWPORT SETUP        //
//                              //
//////////////////////////////////

// Set up the canvas.
var VIEWPORT_WIDTH = 512;
var VIEWPORT_HEIGHT = 512;
var VIEWPORT = $('#viewport').get(0).getContext('2d');
// Is 2D currently rendered?
var TWOD = false;
// Is a wireframe currently rendered?
var WIREFRAME = false;
var WIREFRAME_R = 1;
var WIREFRAME_G = 1;
var WIREFRAME_B = 1;
// Is a flat shaded currently rendered?
var FLAT_SHADED = false;
// The currently rendered triangle set.
var TRIANGLES_ORIGINAL = '';
// The currently transformed triangle set.
var TRIANGLES_CURRENT = [];

//////////////////////////////////
//                              //
//         UI FUNCTIONS         //
//                              //
//////////////////////////////////

// Show the appropriate fields when the
// user clicks for file input method.
$('.fileInputType').click(function()
{
	// Update the buttons.
	$('.fileInputType').removeClass('active');
	$(this).addClass('active');
	
	// Update the fields.
	$('.fileInputField').hide();
	$('#'+$(this).data('target')).show();
});
$('#sampleFilesButton').click();

// Handle the sample file selection.
$('.sampleFile').click(function()
{
	// Make this the active sample file.
	$('.sampleFile').removeClass('active');
	$(this).addClass('active');
});

// Handle clearing of the viewport.
$('#clearButton').click(function()
{
	// Clear the canvas.
	clearViewport();		
	
	// Prevent the form from submitting.
	return false;
})
.click();

$('#renderMethod').change(function()
{
	if($('#renderMethod').val() == 1)
	{
		$('#transformationsContainer').hide();
	}
	else
	{
		$('#transformationsContainer').show();
	}
}).change();

// Handle submission of the file form.
$('#fileForm').submit(function()
{
	// Get the data from a sample file.
	if($('#sampleFilesButton').hasClass('active'))
	{
		// Get the triangle data.
		var url = $('.sampleFile.active').data('file-location');

		// Render the triangles.
		renderFileFromURL(url);
	}
	// Get the data from an uploaded file.
	else if($('#fileInputButton').hasClass('active'))
	{
		// Retrieve the form data.
		var formData = new FormData($('#fileForm').get(0));
		
		// Create and open an XHR.
		var xhr = new XMLHttpRequest();
		xhr.open('POST', 'upload.php');
		
		// Set up event listener to wait for a response.
		xhr.onreadystatechange = function()
		{
			// If the XHR returns with data
			if(xhr.readyState == 4)
			{
				// Render the triangles if it came
				// back without an error.
				if(xhr.responseText != 'error')
				{
					renderTriangles(xhr.responseText);
				}
				// Otherwise, report the error.
				else
				{
					console.log('There was an error reading the file.');
				}
			}
		};
		
		// Send the request.
		xhr.send(formData);
	}
	// Get the data from an input URL.
	else if($('#urlInputButton').hasClass('active'))
	{
		// Retrieve the URL input.
		var url = $('#fileURL').val();
		
		// Render the file.
		renderFileFromURL(url);
	}
	// Get the data from an direct input.
	else if($('#directInputButton').hasClass('active'))
	{
		// Render the triangles.
		renderTriangles($('#directInput').val());
	}		
	
	// Prevent the form from submitting.
	return false;
});

//////////////////////////////////
//                              //
//      TRIANGLE RENDERING      //
//                              //
//////////////////////////////////

function renderFileFromURL(url)
{
	// Make sure URL ends with .txt or .tri.
	var ext = url.substring(url.length - 3, url.length);
	if(ext == 'txt' || ext == 'tri')
	{		
		// Create and open an XHR.
		var formData = new FormData();
		var xhr = new XMLHttpRequest();
		xhr.open('POST', url);
		
		// Set up event listener to wait for a response.
		xhr.onreadystatechange = function()
		{
			// If the XHR returns with data
			if(xhr.readyState == 4)
			{
				// Render the triangles
				renderTriangles(xhr.responseText);
			}
		};
		
		// Set up event listener to wait for an error.
		xhr.onerror = function()
		{
			console.log('There was an error reading the file from the URL.');
		}
		
		// Send the request.
		xhr.send(formData);
	}
	// The URL was invalid.
	else
	{
		console.log('There was an error reading the file from the URL.');
	}
}

// Clears the viewport and resets it to
// its default state, a black background.
function clearViewport(transform)
{
	// Clear the canvas.
	VIEWPORT.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
	// Draw a black backround.
	VIEWPORT.fillStyle = '#000';
	VIEWPORT.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
	
	// Only resets variables if the triangles
	// are not being transformed.
	if(!transform)
	{
		// Nothing is rendered, so unset those variables.
		TWOD = false;
		WIREFRAME = false;
		FLAT_SHADED = false;
		TRIANGLES_ORIGINAL = '';
		TRIANGLES_CURRENT = [];
	}
}

// Render all of the triangles represented
// in the given raw text content.
function renderTriangles(textContent, transform)
{
	// Clear the viewport.
	clearViewport(transform);
	
	// A transformation is being made, use
	// the original rendering method.
	if(transform)
	{
		if(TWOD)
		{
			var renderMethod = 1;
		}
		else if(WIREFRAME)
		{
			var renderMethod = 2;
		}
		else if(FLAT_SHADED)
		{
			var renderMethod = 3;
		}
	}
	// No transformation is being made, a
	// new render is being output to the user.
	else
	{
		// Convert the raw text content to triangle objects.
		var triangles = convertTextContent(textContent);
		
		// Store the triangles being rendered.
		TRIANGLES_ORIGINAL = textContent;
		TRIANGLES_CURRENT = triangles;
		
		// Retrieve the specified rendering method.
		var renderMethod = $('#renderMethod').val();
	}
	
	// Render each triangle.
	$.each(TRIANGLES_CURRENT, function(index, tri)
	{
		// Rasterizing triangles in 2d.
		if(renderMethod == 1)
		{
			renderTriangle2D(tri);
		}
		// Wireframe rendering in 3d.
		else if(renderMethod == 2)
		{
			renderTriangle3DWireframe(tri);
		}
		// Flat shading.
		else if(renderMethod == 3)
		{
			renderTriangle3DFlatShaded(tri);
		}
	});
}

// Convert raw text content into an array of
// triangle objects that contain their data.
function convertTextContent(textContent)
{
	// Set up the array to hold the triangle objects.
	var triangles = [];
	
	// Break the text content into its lines.
	var textLines = textContent.split("\n");
	
	// Process all of the lines individually.
	$.each(textLines, function(index, line)
	{
		// Trim the line.
		line = $.trim(line);
		
		// Ignore any empty lines or comment lines.
		// Convert the remaining well-formatted lines
		// to triangle objects and push them onto the
		// triangles array we initialized earlier.
		if(line != '' && line.charAt(0) != '#')
		{
			// Break the line up into its elements
			// using whitespace as a delimiter.
			var elements = line.replace(/[^\w\s]|_/g, function ($1) { return $1; }).replace(/[ ]+/g, ' ').split(' ');
			
			// Check that there are 18 elements,
			// otherwise skip this line.
			if(elements.length == 18)
			{
				// Convert each element to a floating point.
				$.each(elements, function(index, e)
				{
					elements[index] = parseFloat(e);
				});
				
				// Create the triangle object.
				var tri =
				{
					x0: elements[0], y0: elements[1], z0: elements[2],
					x1: elements[3], y1: elements[4], z1: elements[5],
					x2: elements[6], y2: elements[7], z2: elements[8],
					r0: fixRGB(elements[9]), g0: fixRGB(elements[10]), b0: fixRGB(elements[11]),
					r1: fixRGB(elements[12]), g1: fixRGB(elements[13]), b1: fixRGB(elements[14]),
					r2: fixRGB(elements[15]), g2: fixRGB(elements[16]), b2: fixRGB(elements[17])
				}
				
				// Push the triangle object onto the array.
				triangles.push(tri);
			}
			// Report each line that is not well-formatted.
			else
			{
				console.log('Line ' + (index + 1) + ' does not appear to be well-formatted.');
			}
		}
	});
	
	// Return the array of triangle objects.
	return triangles;
}

// A helper function to check a given RGB value
// and make sure it is between 0.0 and 1.0.
// Brings the value into range and returns it.
function fixRGB(n)
{
	if(n < 0){ return 0; }
	if(n > 1){ return 1; }
	return n;
}

// Renders a single triangle given an object
// containing the triangle data.
function renderTriangle2D(tri)
{
	TWOD = true;
	
	// Make sure the triangle is visible,
	// render it if it is.
	if(checkNormal(tri, 0))
	{
		// Get the minimum and maximum x and
		// y coordinates for the triangle, these
		// coordinates cannot go beyond the
		// viewport bounds.
		var xMin = Math.floor(Math.min(tri.x0, tri.x1, tri.x2));
		if(xMin < -VIEWPORT_WIDTH / 2){ xMin = -VIEWPORT_WIDTH / 2; }
		var xMax = Math.ceil(Math.max(tri.x0, tri.x1, tri.x2));
		if(xMax > VIEWPORT_WIDTH / 2){ xMax = VIEWPORT_WIDTH / 2; }
		var yMin = Math.floor(Math.min(tri.y0, tri.y1, tri.y2));
		if(yMin < -VIEWPORT_HEIGHT / 2){ yMin = -VIEWPORT_HEIGHT / 2; }
		var yMax = Math.ceil(Math.max(tri.y0, tri.y1, tri.y2));
		if(yMax > VIEWPORT_HEIGHT / 2){ yMax = VIEWPORT_HEIGHT / 2; }
		
		// Run through the pixels in the bounding
		// box of the triangle and render the
		// ones that are a part of the triangle.
		for(var y = yMin; y <= yMax; y++)
		{
			for(var x = xMin; x <= xMax; x++)
			{
				// Find the barycentric coordinates
				// of the current point.
				var baryCoords = barycentricCoordinates(tri, {x: x, y: y});
				
				// If the point is in the triangle,
				// render it in the viewport,
				// otherwise do nothing.
				if(baryCoords)
				{
					// Figure out the RGB
					// values for the point.
					var r = (baryCoords.u * tri.r0) + (baryCoords.v * tri.r1) + (baryCoords.w * tri.r2);
					var g = (baryCoords.u * tri.g0) + (baryCoords.v * tri.g1) + (baryCoords.w * tri.g2);
					var b = (baryCoords.u * tri.b0) + (baryCoords.v * tri.b1) + (baryCoords.w * tri.b2);
					
					// Render the point as a pixel.
					renderPixel(x, y, r, g, b);
				}
			}
		}
	}
}

// Checks to see if the given triangle object's
// vertices are in counter-clockwise (CCW) order and
// that the triangle is not degenerate (a point or a
// line), returns true if it passes and false otherwise.
// If rtrn is set to true, returns the normal vector.
function checkNormal(tri, rtrn)
{
	// Determine the normal vector by taking the
	// cross product of the vectors AB and AC.
	var ab = Vector.create([tri.x1 - tri.x0, tri.y1 - tri.y0, tri.z1 - tri.z0]);
	var ac = Vector.create([tri.x2 - tri.x0, tri.y2 - tri.y0, tri.z2 - tri.z0]);
	var normal = ab.cross(ac);
	// Determine if the triangle is degenerate.
	var normalLength = vectorLength(normal);
	
	// The triangle is CCW if the z-coordinate of the
	// normal vector is positive, and the triangle
	// is not degenerate if the length of the normal
	// vector does not equal 0.
	if(normal.elements[2] > 0 && normalLength != 0)
	{
		if(rtrn)
		{
			return normal;
		}
		else
		{
			return true;
		}
	}
	// Otherwise, return false.
	else
	{
		return false;
	}
}
	
// Takes a triangle object and a point {x, y} and
// returns barycentric coordinates {a, b, c} if
// the point is inside the triangle, otherwise
// returns false.
function barycentricCoordinates(tri, point)
{/*
	///////////////////
	// VECTOR METHOD //
	///////////////////
	
	// Determine the normal vector of the triangle.
	var ab = Vector.create([tri.x1 - tri.x0, tri.y1 - tri.y0, 0]);
	var ac = Vector.create([tri.x2 - tri.x0, tri.y2 - tri.y0, 0]);
	var normal = ab.cross(ac);
	// Determine the normal length of the triangle
	var normalLength = vectorLength(normal);
	
	// Determine the vectors for the barymetric coordinates.
	var ap = Vector.create([tri.x0 - point.x, tri.y0 - point.y, 0]);
	var bp = Vector.create([tri.x1 - point.x, tri.y1 - point.y, 0]);
	var cp = Vector.create([tri.x2 - point.x, tri.y2 - point.y, 0]);
	
	// Determine the barycentric coordinates of the triangle.
	var u = (vectorLength(bp.cross(cp))) / normalLength;
	var v = (vectorLength(ap.cross(cp))) / normalLength;
	var w = (vectorLength(ap.cross(bp))) / normalLength;
	*/
	
	/////////////////
	// AREA METHOD //
	/////////////////
	
	// Determine the four triangle areas.
	var totalArea = Math.abs(((tri.x0 * (tri.y1 - tri.y2)) + (tri.x1 * (tri.y2 - tri.y0)) + (tri.x2 * (tri.y0 - tri.y1))) / 2);
	var areaU = Math.abs(((tri.x2 * (point.y - tri.y1)) + (point.x * (tri.y1 - tri.y2)) + (tri.x1 * (tri.y2 - point.y))) / 2);
	var areaV = Math.abs(((tri.x0 * (point.y - tri.y2)) + (point.x * (tri.y2 - tri.y0)) + (tri.x2 * (tri.y0 - point.y))) / 2);
	var areaW = Math.abs(((tri.x1 * (point.y - tri.y0)) + (point.x * (tri.y0 - tri.y1)) + (tri.x0 * (tri.y1 - point.y))) / 2);
	
	// Determine the barycentric coordinates of the triangle.
	var u = areaU / totalArea;
	var v = areaV / totalArea;
	var w = areaW / totalArea;
	
	// Make sure the point is inside the triangle.
	if(u >= 0 && v >= 0 && w >= 0 && !((u + v + w).toFixed(1) > 1))
	{
		return {u: u, v: v, w: w};
	}
	// Return false if the point is not part of the triangle.
	else
	{
		return false;
	}
}

// Takes a triangle object and a point {x, y} and
// returns true if the point lies on an edge of the
// triangle, otherwise returns false.
function onEdge(tri, p)
{
	var slopeA = (tri.y0 - tri.y1) / (tri.x0 - tri.x1);
	var intersectA = -slopeA * tri.x0 / tri.y0;
	// Check if the pixel being checked is within 1 pixel of the edge.
	if(Math.abs(p.y - (slopeA * p.x) + intersectA) < 1)
	{
		return true;
	}
	
	var slopeB = (tri.y1 - tri.y2) / (tri.x1 - tri.x2);
	var intersectB = -slopeB * tri.x1 / tri.y1;
	// Check if the pixel being checked is within 1 pixel of the edge.
	if(Math.abs(p.y - (slopeB * p.x) + intersectB) < 1)
	{
		return true;
	}
	
	var slopeC = (tri.y2 - tri.y0) / (tri.x2 - tri.x0);
	var intersectC = -slopeC * tri.x2 / tri.y2;
	// Check if the pixel being checked is within 1 pixel of the edge.
	if(Math.abs(p.y - (slopeC * p.x) + intersectC) < 1)
	{
		return true;
	}
	
	return false;
}

// Takes a Sylvester 3D Vector object
// and computes its length / magnitude.
function vectorLength(v)
{
	// Determines the length of the
	// given vector and returns it.
	return Math.sqrt(
		Math.pow(v.elements[0], 2) +
		Math.pow(v.elements[1], 2) +
		Math.pow(v.elements[2], 2)
	);
}

// Renders a pixel at the given x and y, the
// origin (0,0) being in the center of the viewport
// with x increasing right and y increasing up,
// and uses the given r, g, and b values as its color.
function renderPixel(x, y, r, g, b)
{
	// Convert our coordinates to canvas coordinates.
	var renderX = Math.floor((VIEWPORT_WIDTH / 2) + x);
	var renderY = Math.floor((VIEWPORT_HEIGHT / 2) - y);
	
	// Convert our [0-1] color values to [0-255] values
	// and format the string to describe the color.
	var renderR = Math.floor(r * 255);
	var renderG = Math.floor(g * 255);
	var renderB = Math.floor(b * 255);
	
	// Draw the pixel.
	VIEWPORT.fillStyle = 'rgb(' + renderR + ',' + renderG + ',' + renderB + ')';
	VIEWPORT.fillRect(renderX, renderY, 1, 1);
}

// 
function renderTriangle3DWireframe(tri)
{
	WIREFRAME = true;
	
	// Make sure the triangle is visible,
	// render it if it is.
	if(checkNormal(tri, 0))
	{/*
		// Get the minimum and maximum x and
		// y coordinates for the triangle, these
		// coordinates cannot go beyond the
		// viewport bounds.
		var xMin = Math.floor(Math.min(tri.x0, tri.x1, tri.x2));
		if(xMin < -VIEWPORT_WIDTH / 2){ xMin = -VIEWPORT_WIDTH / 2; }
		var xMax = Math.ceil(Math.max(tri.x0, tri.x1, tri.x2));
		if(xMax > VIEWPORT_WIDTH / 2){ xMax = VIEWPORT_WIDTH / 2; }
		var yMin = Math.floor(Math.min(tri.y0, tri.y1, tri.y2));
		if(yMin < -VIEWPORT_HEIGHT / 2){ yMin = -VIEWPORT_HEIGHT / 2; }
		var yMax = Math.ceil(Math.max(tri.y0, tri.y1, tri.y2));
		if(yMax > VIEWPORT_HEIGHT / 2){ yMax = VIEWPORT_HEIGHT / 2; }
		
		// Run through the pixels in the bounding
		// box of the triangle and render the
		// ones that are on an edge.
		for(var y = yMin; y <= yMax; y++)
		{
			for(var x = xMin; x <= xMax; x++)
			{
				// If the point is on one of the
				// edges of the triangle, render it
				if(onEdge(tri, {x: x, y: y}))
				{
					// Render the point as a pixel
					renderPixel(x, y, WIREFRAME_R, WIREFRAME_G, WIREFRAME_B);
				}
			}
		}*/
		VIEWPORT.lineWidth = 1;
		VIEWPORT.strokeStyle = '#FFF';
		
		VIEWPORT.beginPath();
		VIEWPORT.moveTo((VIEWPORT_WIDTH / 2) + tri.x0, (VIEWPORT_HEIGHT / 2) - tri.y0);
		VIEWPORT.lineTo((VIEWPORT_WIDTH / 2) + tri.x1, (VIEWPORT_HEIGHT / 2) - tri.y1);
		VIEWPORT.lineTo((VIEWPORT_WIDTH / 2) + tri.x2, (VIEWPORT_HEIGHT / 2) - tri.y2);
		VIEWPORT.lineTo((VIEWPORT_WIDTH / 2) + tri.x0, (VIEWPORT_HEIGHT / 2) - tri.y0);
		VIEWPORT.stroke();
	}
}

// 
function renderTriangle3DFlatShaded(tri)
{
	FLAT_SHADED = true;
	
	// Make sure the triangle is visible,
	// render it if it is.
	var normal = checkNormal(tri, 1);
	if(normal !== false)
	{
		// Compute the colors for the triangle, taking
		// lighting into account, making a temporary
		// triangle to hand to the barycentricCoordinates
		// function.
		var normalLength = vectorLength(normal);
		var nCar = normal.multiply(1 / normalLength);
		var d = nCar.dot(Vector.create([0, 0, 1]));	
		if(d < 0){ return; }
		var tri_temp = {x0: tri.x0, y0: tri.y0, z0: tri.z0,
			x1: tri.x1, y1: tri.y1, z1: tri.z1,
			x2: tri.x2, y2: tri.y2, z2: tri.z2,
			r0: d * tri.r0, g0: d * tri.g0, b0: d * tri.b0,
			r1: d * tri.r1, g1: d * tri.g1, b1: d * tri.b1,
			r2: d * tri.r2, g2: d * tri.g2, b2: d * tri.b2
		};
		
		// Get the minimum and maximum x and
		// y coordinates for the triangle, these
		// coordinates cannot go beyond the
		// viewport bounds.
		var xMin = Math.floor(Math.min(tri.x0, tri.x1, tri.x2));
		if(xMin < -VIEWPORT_WIDTH / 2){ xMin = -VIEWPORT_WIDTH / 2; }
		var xMax = Math.ceil(Math.max(tri.x0, tri.x1, tri.x2));
		if(xMax > VIEWPORT_WIDTH / 2){ xMax = VIEWPORT_WIDTH / 2; }
		var yMin = Math.floor(Math.min(tri.y0, tri.y1, tri.y2));
		if(yMin < -VIEWPORT_HEIGHT / 2){ yMin = -VIEWPORT_HEIGHT / 2; }
		var yMax = Math.ceil(Math.max(tri.y0, tri.y1, tri.y2));
		if(yMax > VIEWPORT_HEIGHT / 2){ yMax = VIEWPORT_HEIGHT / 2; }
		
		// Run through the pixels in the bounding
		// box of the triangle and render the
		// ones that are a part of the triangle.
		for(var y = yMin; y <= yMax; y++)
		{
			for(var x = xMin; x <= xMax; x++)
			{					
				// Find the barycentric coordinates
				// of the current point.
				var baryCoords = barycentricCoordinates(tri_temp, {x: x, y: y});
				
				// If the point is in the triangle,
				// render it in the viewport,
				// otherwise do nothing.
				if(baryCoords)
				{
					// Figure out the RGB
					// values for the point.
					var r = (baryCoords.u * tri_temp.r0) + (baryCoords.v * tri_temp.r1) + (baryCoords.w * tri_temp.r2);
					var g = (baryCoords.u * tri_temp.g0) + (baryCoords.v * tri_temp.g1) + (baryCoords.w * tri_temp.g2);
					var b = (baryCoords.u * tri_temp.b0) + (baryCoords.v * tri_temp.b1) + (baryCoords.w * tri_temp.b2);
					
					// Render the point as a pixel.
					renderPixel(x, y, r, g, b);
				}
			}
		}
	}
}

// Translates the triangles in the TRIANGLES_CURRENT
// array the specified amount along each axis (3D).
function translateTriangles(x, y, z)
{
	// Go through all of the triangles.
	for(var i = 0; i < TRIANGLES_CURRENT.length; i++)
	{
		var tri = TRIANGLES_CURRENT[i];
		
		// Set the new values for the triangles points.
		tri.x0 = tri.x0 + x;
		tri.y0 = tri.y0 + y;
		tri.z0 = tri.z0 + z;
		tri.x1 = tri.x1 + x;
		tri.y1 = tri.y1 + y;
		tri.z1 = tri.z1 + z;
		tri.x2 = tri.x2 + x;
		tri.y2 = tri.y2 + y;
		tri.z2 = tri.z2 + z;
	}
	
	// Re-render the triangles with their
	// new transformations.
	renderTriangles('', 1);
}

// Rotates the triangles in the TRIANGLES_CURRENT
// array the specified angle about each axis (3D).
function rotateTriangles(x, y, z)
{
	// Adjust the angle inputs to radians.
	x = x * 2 * Math.PI / 360;
	y = y * 2 * Math.PI / 360;
	z = z * 2 * Math.PI / 360;
	
	// Go through all of the triangles.
	for(var i = 0; i < TRIANGLES_CURRENT.length; i++)
	{
		var tri = TRIANGLES_CURRENT[i];
		
		// Create each point of the triangle as a vector.
		var v1 = Vector.create([tri.x0, tri.y0, tri.z0]);
		var v2 = Vector.create([tri.x1, tri.y1, tri.z1]);
		var v3 = Vector.create([tri.x2, tri.y2, tri.z2]);
		
		// Create the rotation matrices.
		var rX = Matrix.create([[1, 0, 0], [0, Math.cos(x), -Math.sin(x)], [0, Math.sin(x), Math.cos(x)]]);
		var rY = Matrix.create([[Math.cos(y), 0, Math.sin(y)], [0, 1, 0], [-Math.sin(y), 0, Math.cos(y)]]);
		var rZ = Matrix.create([[Math.cos(z), -Math.sin(z), 0], [Math.sin(z), Math.cos(z), 0], [0, 0, 1]]);
		console.log(rX);
		// Rotate the vectors in 3-space.
		var t1 = rX.multiply(rY.multiply(rZ.multiply(v1)));
		var t2 = rX.multiply(rY.multiply(rZ.multiply(v2)));
		var t3 = rX.multiply(rY.multiply(rZ.multiply(v3)));
		
		// Set the new values for the triangles points.
		tri.x0 = t1.elements[0];
		tri.y0 = t1.elements[1];
		tri.z0 = t1.elements[2];
		tri.x1 = t2.elements[0];
		tri.y1 = t2.elements[1];
		tri.z1 = t2.elements[2];
		tri.x2 = t3.elements[0];
		tri.y2 = t3.elements[1];
		tri.z2 = t3.elements[2];
	}
	
	// Re-render the triangles with their
	// new transformations.
	renderTriangles('', 1);
}

// Scales the triangles in the TRIANGLES_CURRENT
// array by the specified amount along each axis (3D).
function scaleTriangles(x, y, z)
{
	// Go through all of the triangles.
	for(var i = 0; i < TRIANGLES_CURRENT.length; i++)
	{
		var tri = TRIANGLES_CURRENT[i];
		
		// Create each point of the triangle as a vector.
		var v1 = Vector.create([tri.x0, tri.y0, tri.z0]);
		var v2 = Vector.create([tri.x1, tri.y1, tri.z1]);
		var v3 = Vector.create([tri.x2, tri.y2, tri.z2]);
		
		// Create the scale matrix.
		var s = Matrix.create([[x, 0, 0], [0, y, 0], [0, 0, z]]);
		
		// Scale the vectors in 3-space.
		var t1 = s.multiply(v1);
		var t2 = s.multiply(v2);
		var t3 = s.multiply(v3);
		
		// Set the new values for the triangles points.
		tri.x0 = t1.elements[0];
		tri.y0 = t1.elements[1];
		tri.z0 = t1.elements[2];
		tri.x1 = t2.elements[0];
		tri.y1 = t2.elements[1];
		tri.z1 = t2.elements[2];
		tri.x2 = t3.elements[0];
		tri.y2 = t3.elements[1];
		tri.z2 = t3.elements[2];
	}
	
	// Re-render the triangles with their
	// new transformations.
	renderTriangles('', 1);
}

// Reverses any transformations made to the
// currently loaded triangles, resetting them.
function resetTransformations()
{
	// Re-render the triangles with their
	// new transformations.
	renderTriangles(TRIANGLES_ORIGINAL, 0);
}