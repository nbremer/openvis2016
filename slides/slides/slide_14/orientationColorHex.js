pt.orientationColorHex = pt.orientationColorHex || {};

pt.orientationColorHex.init = function() {
	
	//Remove any existing svgs
	d3.select('#orientation-color-hex #orientationColorHex svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var Names = ["Black Widow","Captain America","Hawkeye","the Hulk","Iron Man","Thor"],
		colors = ["#301E1E", "#083E77", "#342350", "#567235", "#8B161C", "#DF7C00"];

	var margin = {
		top: 40,
		right: 0,
		bottom: 10,
		left: 0
	};

	var width = $(".slides").width()*0.9 - margin.left - margin.right;
	var height = 600; //$(".slides").height()*0.6 - margin.left - margin.right;

	///////////////////////////////////////////////////////////////////////////
	/////////////////////// Calculate hexagon variables ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var blockWidth = width / 7;

	var SQRT3 = Math.sqrt(3),
		hexWidth = blockWidth/2*1.1,
		hexRadius = hexWidth / SQRT3,
		hexHeight = 2 * hexRadius;
	var hexagonPoly = [[0,-1],[SQRT3/2,0.5],[0,1],[-SQRT3/2,0.5],[-SQRT3/2,-0.5],[0,-1],[SQRT3/2,-0.5]];
	var hexagonPath = "m" + hexagonPoly.map(function(p){ return [p[0]*hexRadius, p[1]*hexRadius].join(','); }).join('l') + "z";

	var blockHeight = hexHeight*0.6;
		
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////////// Create SVG ///////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//SVG container
	pt.orientationColorHex.svg = d3.select("#orientation-color-hex #orientationColorHex")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.orientationColorHex.svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Place Hexagon in center /////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var duration = 750,
		delay = duration*0.5,
		startDelay = 500;

	//Find the locations of each colored hexagon
	hexLocations = [
		{x: blockWidth, y:blockHeight},
		{x: 2*blockWidth, y:2*blockHeight},
		{x: 3*blockWidth, y:blockHeight},
		{x: 4*blockWidth, y:2*blockHeight},
		{x: 5*blockWidth, y:blockHeight},
		{x: 6*blockWidth, y:2*blockHeight}
	];

	//Place a hexagons path (but still invisible)
	var hexWrapper = svg.selectAll(".hexagonWrapper")
		.data(hexLocations)
		.enter().append("g")
		.attr("class", "hexagonWrapper");

	var hexPath = hexWrapper.append("path")
		.attr("class", "hexagon")
		.attr("d", function(d) { return "M" + d.x + "," + d.y + hexagonPath; })
		.style("fill", "none")
		.style("stroke", function(d,i) { return colors[i]; });

	//Get the total length of the path
	var totalLength = hexPath.node().getTotalLength();	
	//Make the paths grow
	hexPath
	  	.attr("stroke-dasharray", totalLength + " " + totalLength)
		.attr("stroke-dashoffset", totalLength)
	  	.transition().duration(duration)
	  	.delay(function(d,i) { return i*delay + startDelay; })
	  	//.ease("linear")
		.attr("stroke-dashoffset", 0);

	//Place hexagon fills
	var hexagonFills = hexWrapper.append("path")
		.attr("class", "hexagonFills")
		.attr("d", function(d) { return "M" + d.x + "," + d.y + hexagonPath; })
		.style("fill", function(d,i) { return colors[i]; })
		.style("opacity", 0);

	//Make the hexagon fills appear
	hexagonFills.transition().duration(duration)
		.delay(function(d,i) { return i*delay + duration*0.7 + startDelay; })
		.style("opacity", 1);

	//Append index above hexagon
	var hexagonText = hexWrapper.append("text")
		.attr("class", "hexagonNumber")
		.attr("x", function(d) { return d.x; })
		.attr("y", function(d) { return d.y -(hexRadius + 20); })
		.text(function(d,i) { return i; })
		.style("opacity", 0);
		
	//Make the text appear
	hexagonText.transition().duration(duration)
		.delay(function(d,i) { return i*delay + duration*0.7 + startDelay; })
		.style("opacity", 1);

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Append text below //////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var textWrapper = svg.append("g")
		.attr("class", "textWrapper")
		.attr("transform", "translate(" + (width / 2) + "," + (blockHeight * 6) + ")");

	textWrapper.append("text")
		.attr("class", "title")
		.attr("x", -width/4)
		.attr("y", 0)
		.text("Color at 0%");

	textWrapper.append("text")
		.attr("class", "subtitle")
		.attr("x", -width/4)
		.attr("y", 34)
		.text("based on source.index");	

	textWrapper.append("text")
		.attr("class", "title")
		.attr("x", width/4)
		.attr("y", 0)
		.text("Color at 100%");

	textWrapper.append("text")
		.attr("class", "subtitle")
		.attr("x", width/4)
		.attr("y", 34)
		.text("based on target.index");	

};//init
