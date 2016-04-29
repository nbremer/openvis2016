pt.legendCodeOrientation = pt.legendCodeOrientation || {};

pt.legendCodeOrientation.init = function() {

	//Remove any existing svgs
	d3.select("#legend-code-orientation #legendCodeOrientation svg").remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 10,
		right: 10,
		bottom: 10,
		left: 10
	};
	var width = $("#legendCodeOrientation").width() - margin.left - margin.right;
	var height = width;
				
	//SVG container
	pt.legendCodeOrientation.svg = d3.select('#legend-code-orientation #legendCodeOrientation')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	
	var svg = pt.legendCodeOrientation.svg.append("g")
		.attr("transform", "translate(" + (width/2 + margin.left*6) + "," + (height/2 + margin.top) + ")");

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Create the gradients //////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Container for the gradients
	pt.legendCodeOrientation.defs = pt.legendCodeOrientation.svg.append("defs");

	var colorsTwo = ["#F6416C", "#3E1E68"];

	//Gradient
	pt.legendCodeOrientation.gradient = pt.legendCodeOrientation.defs.append("linearGradient")
		.attr("id", "linear-gradient")
		.selectAll("stop")
		.data([
				{offset: "0%", color: colorsTwo[0], className: "start"},
				{offset: "100%", color: colorsTwo[1], className: "end"}
			])
		.enter().append("stop")
		.attr("class", function(d) { return d.className; })
		.attr("offset", function(d) { return d.offset; })
		.attr("stop-color", function(d) { return d.color; });

	///////////////////////////////////////////////////////////////////////////
	/////////////////////// Calculate hexagon variables ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var SQRT3 = Math.sqrt(3);
	pt.legendCodeOrientation.hexRadius = width*0.3;
	var hexRadius = pt.legendCodeOrientation.hexRadius;
	pt.legendCodeOrientation.hexWidth = SQRT3 * hexRadius;
	var hexWidth = pt.legendCodeOrientation.hexWidth;
	pt.legendCodeOrientation.hexHeight = 2 * hexRadius;
	var hexHeight = pt.legendCodeOrientation.hexHeight;
	var hexagonPoly = [[0,-1],[SQRT3/2,0.5],[0,1],[-SQRT3/2,0.5],[-SQRT3/2,-0.5],[0,-1],[SQRT3/2,-0.5]];
	var hexagonPath = "m" + hexagonPoly.map(function(p){ return [p[0]*hexRadius, p[1]*hexRadius].join(','); }).join('l') + "z";

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Draw the Hexagon ////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	// //Place a rect behind the hexagon
	pt.legendCodeOrientation.rect = svg.append("rect")
		.attr("class", "backgroundRect")
		.attr("x", -hexWidth/2)
		.attr("y", -hexHeight/2)
		.attr("width", hexWidth)
		.attr("height", hexHeight)
		.style("fill", "url(#linear-gradient)")
		.style("opacity", 0.4);

	//Place a hexagon
	pt.legendCodeOrientation.hexagon = svg.append("path")
		.attr("class", "hexagon")
		.attr("d", function(d) { return "M" + 0 + "," + 0 + hexagonPath; })
		.style("fill", "url(#linear-gradient)"); 

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Draw the Arrow path ///////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Create arrow markers
	pt.legendCodeOrientation.defs.append("marker")
	    .attr("id", "arrowMarker")
	    .attr("viewBox", "0 -5 10 10")
	    .attr("refX", 8)
	    .attr("refY", 0)
	    .attr("markerWidth", 8)
	    .attr("markerHeight", 8)
	    .attr("orient", "auto")
	  .append("path")
	    .attr("d", "M0,-5 L10,0 L0,5")
	    .style("fill", "white");

	//Draw the line and arrowhead
	pt.legendCodeOrientation.arrow = svg.append("path")
		.attr("class", "directionArrow")
		//.attr("d", "M" + 0 + "," + (-hexHeight/2+10) + " L" + 0 + "," + (hexHeight/2-10))
		.style("fill", "none")
		.style("stroke", "white")
		.style("stroke-width", 2)
		.style("opacity", 0.8)
		.style("stroke-linecap", "round")
		.attr("marker-end", "url(#arrowMarker)");

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Draw x and y lines ///////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//x-line
	svg.append("line")
		.attr("class", "xyLine")
		.attr("x1", -hexWidth/2)
		.attr("y1", (hexHeight/2 + 30))
		.attr("x2", hexWidth/2)
		.attr("y2", (hexHeight/2 + 30));

	//y-line
	svg.append("line")
		.attr("class", "xyLine")
		.attr("x1", -(hexWidth/2 + 30))
		.attr("y1", -hexHeight/2)
		.attr("x2", -(hexWidth/2 + 30))
		.attr("y2", hexHeight/2);

	xyText = [
		{x: -(hexWidth/2 + 40), y: -hexHeight/2, anchor:"end", text: "0%", dy: 0.5},
		{x: -(hexWidth/2 + 40), y: hexHeight/2, anchor:"end", text: "100%", dy: 0.5},
		{x: -hexWidth/2, y: (hexHeight/2 + 35), anchor:"middle", text: "0%", dy: 1},
		{x: hexWidth/2, y: (hexHeight/2 + 35), anchor:"middle", text: "100%", dy: 1}
	];

	xyTitle = [
		{x: -(hexWidth/2 + 40), y: 0, anchor:"end", text: "y", dy: 0.5},
		{x: 0, y: (hexHeight/2 + 35), anchor:"middle", text: "x", dy: 1}
	];

	//append labels
	svg.selectAll(".xyText")
		.data(xyText)
		.enter().append("text")
		.attr("class", "xyText")
		.attr("x", function(d) { return d.x; })
		.attr("y", function(d) { return d.y; })
		.attr("dy", function(d) { return d.dy + "em"; })
		.style("text-anchor", function(d) { return d.anchor; })
		.text(function(d) { return d.text; });

	svg.selectAll(".xyTitle")
		.data(xyTitle)
		.enter().append("text")
		.attr("class", "xyTitle")
		.attr("x", function(d) { return d.x; })
		.attr("y", function(d) { return d.y; })
		.attr("dy", function(d) { return d.dy + "em"; })
		.style("text-anchor", function(d) { return d.anchor; })
		.text(function(d) { return d.text; });

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Draw x1 ... y2 text //////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	svg.append("text")
		.attr("class", "xyPos xy1")
		.text("x1, y1");

	svg.append("text")
		.attr("class", "xyPos xy2")
		.text("x2, y2");

	///////////////////////////////////////////////////////////////////////////
	/////////////////////// Set it right for the last part ////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var x1 = -3*hexWidth/10,
		x2 = 3*hexWidth/10,
		b = 2/Math.sqrt(3);

	pt.legendCodeOrientation.arrow
		//.transition().duration(1000)
		.style("opacity", 1)
		.attr("d", "M" + x1 + "," + (b*x1) + " L" + x2 + "," + (b*x2));

	//Set the [x1,y1] locations
	d3.select("#legendCodeOrientation .xy1")
		.attr("x", -55)
		.attr("y", (-hexHeight/2+80));
	d3.select("#legendCodeOrientation .xy2")
		.attr("x", 55)
		.attr("y", (hexHeight/2-75));

	//Change the direction of the gradient
	d3.select("#legendCodeOrientation #linear-gradient")
		.attr("x1", "10%")
	    .attr("y1", "10%")
	    .attr("x2", "90%")
	    .attr("y2", "90%");

}//init

pt.legendCodeOrientation.toBlack = function() {

	//Hide the arrow
	pt.legendCodeOrientation.arrow
		.style("opacity", 0);
	//Make the hexagon black
	pt.legendCodeOrientation.hexagon
		.style("fill", "black");
	//Hide rect
	pt.legendCodeOrientation.rect
		.style("opacity", 0);

	d3.selectAll("#legendCodeOrientation .xyPos")
		.style("opacity", 0);

	d3.selectAll("#legend-code-orientation pre code")
		.html('var defs = svg.append("defs");<br><br>' + 
			'var linearGradient = defs.append("linearGradient")<br>' + 
    		'    .attr("id", "linear-gradient");<br><br><br><br><br><br><br><br>');
	//Update the code to its javascript highlight
	$("#legend-code-orientation pre code").each(function(i, block) {
	   hljs.highlightBlock(block);
	});

}//toBlack

pt.legendCodeOrientation.horizontal = function() {

	var hexHeight = pt.legendCodeOrientation.hexHeight;
	var hexWidth = pt.legendCodeOrientation.hexWidth;
	pt.legendCodeOrientation.arrow
		//.transition().duration(1000)
		.style("opacity", 0.8)
		.attr("d", "M" + -(hexWidth/2) + "," + 0 + " L" + (hexWidth/2 - 4) + "," + 0);

	//Set the [x1,y1] locations
	d3.select("#legendCodeOrientation .xy1")
		.attr("x", (-hexWidth/2+35))
		.attr("y", -20)
		.style("opacity", 1);
	d3.select("#legendCodeOrientation .xy2")
		.attr("x", (hexWidth/2-35))
		.attr("y", -20)
		.style("opacity", 1);

	//Change the direction of the gradient
	d3.select("#legendCodeOrientation #linear-gradient")
		.attr("x1", "0%")
	    .attr("y1", "0%")
	    .attr("x2", "100%")
	    .attr("y2", "0%");

	//Set the fill to the gradient
	pt.legendCodeOrientation.hexagon
		.style("fill", "url(#linear-gradient)");

	pt.legendCodeOrientation.updateCode("Horizontal","100%","0%");

}//horizontal

pt.legendCodeOrientation.vertical = function() {

	//Create the arrow
	var hexHeight = pt.legendCodeOrientation.hexHeight;
	pt.legendCodeOrientation.arrow
		//.transition().duration(1000)
		.style("opacity", 1)
		.attr("d", "M" + 0 + "," + -(hexHeight/2) + " L" + 0 + "," + (hexHeight/2 - 4) );

	//Set the [x1,y1] locations
	d3.select("#legendCodeOrientation .xy1")
		.attr("x", -35)
		.attr("y", (-hexHeight/2+55));
	d3.select("#legendCodeOrientation .xy2")
		.attr("x", -35)
		.attr("y", (hexHeight/2-55));

	//Change the direction of the gradient
	d3.select("#legendCodeOrientation #linear-gradient")
		.attr("x1", "0%")
	    .attr("y1", "0%")
	    .attr("x2", "0%")
	    .attr("y2", "100%");

	pt.legendCodeOrientation.updateCode("Vertical","0%","100%");

}//vertical

pt.legendCodeOrientation.diagonal = function() {

	//Hide rect (in case you move backward)
	pt.legendCodeOrientation.rect
		.transition().duration(300)
		.style("opacity", 0);

	var hexHeight = pt.legendCodeOrientation.hexHeight;
	var hexRadius = pt.legendCodeOrientation.hexRadius;
	var hexWidth = pt.legendCodeOrientation.hexWidth;

	var x1 = -3.3*hexWidth/10,
		x2 = 3.25*hexWidth/10,
		b = 2/Math.sqrt(3);

	pt.legendCodeOrientation.arrow
		//.transition().duration(1000)
		.style("opacity", 1)
		.attr("d", "M" + x1 + "," + (b*x1) + " L" + x2 + "," + (b*x2));

	//Set the [x1,y1] locations
	d3.select("#legendCodeOrientation .xy1")
		.attr("x", -60)
		.attr("y", -(hexHeight/2-80));
	d3.select("#legendCodeOrientation .xy2")
		.attr("x", 60)
		.attr("y", (hexHeight/2-75));

	//Change the direction of the gradient
	d3.select("#legendCodeOrientation #linear-gradient")
		.attr("x1", "10%")
	    .attr("y1", "10%")
	    .attr("x2", "90%")
	    .attr("y2", "90%");

	pt.legendCodeOrientation.updateCode("Diagonal","100%","100%");

}//diagonal

pt.legendCodeOrientation.showRect = function() {

	var hexHeight = pt.legendCodeOrientation.hexHeight;
	var hexWidth = pt.legendCodeOrientation.hexWidth;

	//Show the rectangle
	pt.legendCodeOrientation.rect
		.transition().duration(300)
		.style("opacity", 0.4);

	pt.legendCodeOrientation.updateCode("Diagonal","100%","100%");

	//Change the direction of the gradient
	d3.select("#legendCodeOrientation #linear-gradient")
		.attr("x1", "0%")
	    .attr("y1", "0%")
	    .attr("x2", "100%")
	    .attr("y2", "100%");

	//Adjust arrow
	pt.legendCodeOrientation.arrow
		.transition().duration(750)
		.style("opacity", 1)
		.attr("d", "M" + -(hexWidth/2) + "," + -(hexHeight/2) + " L" + (hexWidth/2 - 4) + "," + (hexHeight/2 - 4) );

	//Set the [x1,y1] locations
	d3.select("#legendCodeOrientation .xy1")
		.transition().duration(750)
		.attr("x", -(hexWidth/2-70))
		.attr("y", -(hexHeight/2-25));
	d3.select("#legendCodeOrientation .xy2")
		.transition().duration(750)
		.attr("x", hexWidth/2-70)
		.attr("y", hexHeight/2-20);

}//showRect

pt.legendCodeOrientation.pullIn = function() {

	var hexHeight = pt.legendCodeOrientation.hexHeight;
	var hexWidth = pt.legendCodeOrientation.hexWidth;

	//Show the rectangle
	pt.legendCodeOrientation.rect
		.transition().duration(300)
		.style("opacity", 0.4);

	//Change the direction of the gradient
	d3.select("#legendCodeOrientation #linear-gradient")
		.attr("x1", "30%")
	    .attr("y1", "30%")
	    .attr("x2", "70%")
	    .attr("y2", "70%");

	pt.legendCodeOrientation.updateCode("Pull-in","70%","70%","30%","30%");

	//Reset arrow to new locations
	pt.legendCodeOrientation.arrow
		.transition().duration(750)
		.style("opacity", 1)
		.attr("d", "M" + (-hexWidth/2 + 0.3*hexWidth) + "," + (-hexHeight/2 + 0.3*hexHeight) + " L" + (-hexWidth/2 + 0.7*hexWidth) + "," + (-hexHeight/2 + 0.7*hexHeight) );

	// var x1 = (-hexWidth/2 + 0.3*hexWidth),
	// 	x2 = (-hexWidth/2 + 0.7*hexWidth),
	// 	b = 2/Math.sqrt(3);

	// pt.legendCodeOrientation.arrow
	// 	//.transition().duration(1000)
	// 	.style("opacity", 1)
	// 	.attr("d", "M" + x1 + "," + (b*x1) + " L" + x2 + "," + (b*x2));

	//Set the [x1,y1] locations
	d3.select("#legendCodeOrientation .xy1")
		.transition().duration(750)
		.attr("x", -20)
		.attr("y", -(hexHeight/2-120));
	d3.select("#legendCodeOrientation .xy2")
		.transition().duration(750)
		.attr("x", 20)
		.attr("y", (hexHeight/2-115));

}//pullIn

pt.legendCodeOrientation.updateCode = function(direction, x2, y2, x1, y1) {
	//Update the text in the code block
	d3.selectAll("#legend-code-orientation pre code")
		.html('var defs = svg.append("defs");<br><br>' + 
			'var linearGradient = defs.append("linearGradient")<br>' + 
    		'    .attr("id", "linear-gradient");<br><br>' + 
    		'/*' + direction + ' gradient*/<br>' +
			'linearGradient <br>' + 
    		'    .attr("x1", "' + (x1 || '0%') + '") <br>' +
    		'    .attr("y1", "' + (y1 || '0%') + '") <br>' +
    		'    .attr("x2", "' + x2 + '") <br>' +
    		'    .attr("y2", "' + y2 + '");');
	//Update the code to its javascript highlight
	$("#legend-code-orientation pre code").each(function(i, block) {
	   hljs.highlightBlock(block);
	});
}//updateCode
