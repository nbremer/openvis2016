pt.legendCodeMultiShort = pt.legendCodeMultiShort || {};

pt.legendCodeMultiShort.init = function() {
	
	//Remove any existing svgs
	d3.select('#legend-code-multi-short #legendCodeMultiShort svg').remove();

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
	pt.legendCodeMultiShort.svg = d3.select('#legend-code-multi-short #legendCodeMultiShort')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)

	var svg = pt.legendCodeMultiShort.svg.append("g")
		.attr("class", "SOMwrapper")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Create the Gradient ////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Append defs container	
	pt.legendCodeMultiShort.defs = svg.append("defs");

	var colorScale = d3.scale.linear()
    	.range(["#2c7bb6", "#00a6ca","#00ccbc","#90eb9d","#ffff8c","#f9d057","#f29e2e","#e76818","#d7191c"])
    	.domain(d3.range(9));

	pt.legendCodeMultiShort.defs
		.append("linearGradient")
	    .attr("id", "gradientMultiShort")
	    .attr("x1", "0%")
	    .attr("y1", "0%")
	    .attr("x2", "100%")
	    .attr("y2", "0%")
	    .selectAll("stop") 
	    .data(colorScale.range())                  
    	.enter().append("stop")
		.attr("offset", function(d,i) { return i/(colorScale.range().length-1); })   
    	.attr("stop-color", function(d) { return d; });

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
		.style("fill", "url(#gradientMultiShort)");

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
	for(var i = 0; i < colorScale.range().length; i++) {
		hexLocations.push({
			x: width*i/(colorScale.range().length-1),
			y: 15
		})
	}//for i

	//Place a hexagons path (but still invisible)
	var hexPath = svg.selectAll(".hexagon")
		.data(hexLocations)
		.enter().append("path")
		.attr("class", "hexagon")
		.attr("d", function(d) { return "M" + d.x + "," + d.y + hexagonPath; })
		.style("fill", function(d,i) { return colorScale(i); }); 

}//init