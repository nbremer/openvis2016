pt.legendCodeTwo = pt.legendCodeTwo || {};

pt.legendCodeTwo.init = function() {
	
	//Remove any existing svgs
	d3.select('#legend-code-two #legendCodeTwo svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 40,
		right: 40,
		bottom: 20,
		left: 40
	};
	var width = $(".slides").width()*0.75 - margin.left - margin.right;
	var height = 180 - margin.top - margin.bottom;
				
	//SVG container
	pt.legendCodeTwo.svg = d3.select('#legend-code-two #legendCodeTwo')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)

	var svg = pt.legendCodeTwo.svg.append("g")
		.attr("class", "SOMwrapper")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Create the Gradient ////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Append defs container	
	pt.legendCodeTwo.defs = svg.append("defs");

	var colorsTwo = ["#73C4B7", "#1B779C"];

	var linearGradient = pt.legendCodeTwo.defs
		.append("linearGradient")
	    .attr("id", "gradientTwo")
	    .attr("x1", "0%")
	    .attr("y1", "0%")
	    .attr("x2", "100%")
	    .attr("y2", "0%");                

	//Set the color for the start (0%)
	linearGradient.append("stop") 
	    .attr("offset", "0%")   
	    .attr("stop-color", colorsTwo[0]);

	//Set the color for the end (100%)
	linearGradient.append("stop") 
	    .attr("offset", "100%")   
	    .attr("stop-color", colorsTwo[1]);

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Draw the legend ////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var rectHeight = 35;

	//Draw the Rectangle
	svg.append("rect")
		.attr("class", "exampleRect")
		.attr("x", 0)
		.attr("y", 70)
		//.attr("rx", rectHeight/2)
		.attr("width", width)
		.attr("height", rectHeight)
		.style("fill", "url(#gradientTwo)");

	///////////////////////////////////////////////////////////////////////////
	/////////////////////// Calculate hexagon variables ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var SQRT3 = Math.sqrt(3),
		hexRadius = 40,
		hexWidth = SQRT3 * hexRadius,
		hexHeight = 2 * hexRadius;
	var hexagonPoly = [[0,-1],[SQRT3/2,0.5],[0,1],[-SQRT3/2,0.5],[-SQRT3/2,-0.5],[0,-1],[SQRT3/2,-0.5]];
	var hexagonPath = "m" + hexagonPoly.map(function(p){ return [p[0]*hexRadius, p[1]*hexRadius].join(','); }).join('l') + "z";

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Draw the Hexagons ///////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Find the locations of each colored hexagon
	hexLocations = [
		{x: 0, y: 15},
		{x: width, y: 15}
	];

	//Place a hexagons path (but still invisible)
	var hexPath = svg.selectAll(".hexagon")
		.data(hexLocations)
		.enter().append("path")
		.attr("class", "hexagon")
		.attr("d", function(d) { return "M" + d.x + "," + d.y + hexagonPath; })
		.style("fill", function(d,i) { return colorsTwo[i]; })
		.style("opacity", 0); 

	svg.append("text")
		.attr("class", "percentages")
		.attr("x", 0)
		.attr("y", 15)
		.attr("dy", "0.25em")
		.text("0%");

	svg.append("text")
		.attr("class", "percentages")
		.attr("x", width)
		.attr("y", 15)
		.attr("dy", "0.25em")
		.text("100%");

}//init

pt.legendCodeTwo.toBlack = function() {

	//Start with a black rectangle
	d3.selectAll("#legendCodeTwo .exampleRect")
		.style("fill", "black");

	//Hide hexagons (in case you move backwards)
	d3.selectAll("#legendCodeTwo .hexagon")
		.transition().duration(500)
		.style("opacity", 0);

}//hexOne

pt.legendCodeTwo.hexOne = function() {

	//Show the first hexagon
	d3.selectAll("#legendCodeTwo .hexagon")
		.transition().duration(500)
		.style("opacity", function(d,i) {
			return i === 0 ? 1 : 0;
		});

}//hexOne

pt.legendCodeTwo.hexTwo = function() {

	//Set back to black, in case you move backwards
	d3.selectAll("#legendCodeTwo .exampleRect")
		.style("fill", "black");

	d3.selectAll("#legendCodeTwo .hexagon")
		.transition().duration(500)
		.style("opacity", 1);

}//hexOne

pt.legendCodeTwo.fillRectTwo = function() {

	d3.selectAll("#legendCodeTwo .hexagon")
		.transition().duration(500)
		.style("opacity", 1);

	d3.selectAll("#legendCodeTwo .exampleRect")
		.style("fill", "url(#gradientTwo)");

}//hexOne
