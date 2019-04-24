pt.legendCodeMulti = pt.legendCodeMulti || {};

pt.legendCodeMulti.init = function() {
	
	//Remove any existing svgs
	d3.select('#legend-code-multi #legendCodeMulti svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 20,
		right: 40,
		bottom: 20,
		left: 40
	};
	var width = $(".slides").width()*0.75 - margin.left - margin.right;
	var height = 160 - margin.top - margin.bottom;
				
	//SVG container
	pt.legendCodeMulti.svg = d3.select('#legend-code-multi #legendCodeMulti')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)

	var svg = pt.legendCodeMulti.svg.append("g")
		.attr("class", "SOMwrapper")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Create the Gradient ////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Append defs container	
	pt.legendCodeMulti.defs = svg.append("defs");

	var colorsMulti = ["#2c7bb6", "#00a6ca","#00ccbc","#90eb9d","#ffff8c","#f9d057","#f29e2e","#e76818","#d7191c"];
	var locations = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];

	pt.legendCodeMulti.defs
		.append("linearGradient")
	    .attr("id", "legend-grad-multi")
	    .attr("x1", "0%")
	    .attr("y1", "0%")
	    .attr("x2", "100%")
	    .attr("y2", "0%")
	    .selectAll("stop") 
	    .data(d3.range(colorsMulti.length))                  
    	.enter().append("stop")
		.attr("offset", function(d) { return locations[d]; })   
    	.attr("stop-color", function(d) { return colorsMulti[d]; });

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
		.style("fill", "url(#legend-grad-multi)");

	///////////////////////////////////////////////////////////////////////////
	/////////////////////// Calculate hexagon variables ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var SQRT3 = Math.sqrt(3),
		hexRadius = 35,
		hexWidth = SQRT3 * hexRadius,
		hexHeight = 2 * hexRadius;
	var hexagonPoly = [[0,-1],[SQRT3/2,0.5],[0,1],[-SQRT3/2,0.5],[-SQRT3/2,-0.5],[0,-1],[SQRT3/2,-0.5]];
	var hexagonPath = "m" + hexagonPoly.map(function(p){ return [p[0]*hexRadius, p[1]*hexRadius].join(','); }).join('l') + "z";

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Draw the Hexagons ///////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Find the locations of each colored hexagon

	hexLocations = []
	for(var i = 0; i < locations.length; i++) {
		hexLocations.push({
			x: width*locations[i],
			y: 15
		})
	}//for i

	//Place a hexagons path (but still invisible)
	var hexPath = svg.selectAll(".hexagon")
		.data(hexLocations)
		.enter().append("path")
		.attr("class", "hexagon")
		.attr("d", function(d) { return "M" + d.x + "," + d.y + hexagonPath; })
		.style("fill", function(d,i) { return colorsMulti[i]; })
		.style("opacity", 0); 

}//init

pt.legendCodeMulti.showHex = function() {

	//Start with a black rectangle
	d3.selectAll("#legendCodeMulti .exampleRect")
		.style("fill", "black");

	//Hide hexagons (in case you move backwards)
	d3.selectAll("#legendCodeMulti .hexagon")
		.transition().duration(1000)
		.style("opacity", 1);

}//showHex

pt.legendCodeMulti.toBlack = function() {

	//Set back to black, in case you move backwards
	d3.selectAll("#legendCodeMulti .exampleRect")
		.style("fill", "black");

	// d3.selectAll("#legendCodeMulti .hexagon")
	// 	.transition().duration(1000)
	// 	.style("opacity", 1);

}//toBlack

pt.legendCodeMulti.fillRectMulti = function() {

	d3.selectAll("#legendCodeMulti .hexagon")
		.style("opacity", 1);
		
	d3.selectAll("#legendCodeMulti .exampleRect")
		.style("fill", "url(#legend-grad-multi)");

}//fillRectMulti