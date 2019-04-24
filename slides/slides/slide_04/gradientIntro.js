pt.gradientIntro = pt.gradientIntro || {};

pt.gradientIntro.init = function() {
	
	//Remove any existing svgs
	d3.select('#intro-gradient #introGradient svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 10,
		right: 0,
		bottom: 10,
		left: 0
	};
	var width = $(".slides").width()*0.75 - margin.left - margin.right;
	var height = $(".slides").height()*0.75 - margin.top - margin.bottom;
				
	//SVG container
	pt.gradientIntro.svg = d3.select('#intro-gradient #introGradient')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.gradientIntro.svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
	///////////////////////////////////////////////////////////////////////////
	/////////////////////// Calculate hexagon variables ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var SQRT3 = Math.sqrt(3),
		hexRadius = Math.min(width, height)/2,
		hexWidth = SQRT3 * hexRadius,
		hexHeight = 2 * hexRadius;
	var hexagonPoly = [[0,-1],[SQRT3/2,0.5],[0,1],[-SQRT3/2,0.5],[-SQRT3/2,-0.5],[0,-1],[SQRT3/2,-0.5]];
	var hexagonPath = "m" + hexagonPoly.map(function(p){ return [p[0]*hexRadius, p[1]*hexRadius].join(','); }).join('l') + "z";

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create gradient /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var numColors = 10;
	var colorScale = d3.scale.linear()
	   .domain([0,(numColors-1)/2,numColors-1])
	   .range(["#2c7bb6", "#ffff8c", "#d7191c"])
	   .interpolate(d3.interpolateHcl);

	var defs = svg.append("defs");
	defs.append("linearGradient")
		.attr("id", "gradientRainbow")
		.attr("gradientUnits", "userSpaceOnUse") 
		.attr("x1", -hexWidth/2*0.9).attr("y1", 0)
		.attr("x2", hexWidth/2*0.9).attr("y2", 0)
		.selectAll("stop") 
		.data(d3.range(numColors))                  
		.enter().append("stop") 
		.attr("offset", function(d,i) { return (i/(numColors-1)*100) + "%"; })   
		.attr("stop-color", function(d) { return colorScale(d); });

	//Create a clip path that is the same as the top hexagon
	defs.append("clipPath")
        .attr("id", "clip")
        .append("path")
        .attr("d", "M" + (width/2) + "," + (height/2) + hexagonPath);
		
	///////////////////////////////////////////////////////////////////////////
	////////////////////// Place circles inside hexagon ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //First append a group for the clip path, then a new group that can be transformed
	var circleWrapper = svg.append("g")
		.attr("clip-path", "url(#clip")
		.style("clip-path", "url(#clip)") //make it work in safari
		.append("g")
		.attr("transform", "translate(" + (width/2) + "," + (height/2) + ")");

	//Create dataset with random initial positions
	randStart = [];
	for(var i = 0; i < 50; i++) {
		randStart.push({
			rHex: Math.random() * hexWidth,
			theta: Math.random() * 2 * Math.PI,
			r: 8 + Math.random() * 40
		});
	}//for i

    var circle = circleWrapper.selectAll(".dots")
    	.data(randStart)
    	.enter().append("circle")
    	.attr("class", "dots")
    	.attr("cx", function(d) { return d.rHex * Math.cos(d.theta); })
    	.attr("cy", function(d) { return d.rHex * Math.sin(d.theta); })
      	.attr("r", 0)
      	.style("fill", "url(#gradientRainbow)")
		.style("opacity", 0.7)
		.each(move);

	circle.transition("grow")
		.duration(function(d,i) { return Math.random()*2000+500; })
		.delay(function(d,i) { return Math.random()*3000;})
		.attr("r", function(d,i) { return d.r; });

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Place Hexagon in center /////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Place a hexagon on the scene
	svg.append("path")
		.attr("class", "hexagon")
		.attr("d", "M" + (width/2) + "," + (height/2) + hexagonPath)
		.style("stroke", "#F2F2F2")
		.style("stroke-width", "7px")
		.style("fill", "none");

	///////////////////////////////////////////////////////////////////////////
	////////////////////// Circle movement inside hexagon /////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//General idea from Maarten Lambrecht's block: http://bl.ocks.org/maartenzam/f35baff17a0316ad4ff6
	function move(d) {
		var currentx = parseFloat(d3.select(this).attr("cx")),
		 	//currenty = parseFloat(d3.select(this).attr("cy")),
			radius = d.r;

		//Randomly define which quadrant to move next
		var sideX = currentx > 0 ? -1 : 1,
			sideY = Math.random() > 0.5 ? 1 : -1,
			randSide = Math.random();

		var newx,
			newy;

		//Move new locations along the vertical sides in 33% of the cases
		if (randSide > 0.66) {
			newx = sideX * 0.5 * SQRT3 * hexRadius - sideX*radius;
			newy = sideY * Math.random() * 0.5 * hexRadius - sideY*radius;
		} else {
			//Choose a new x location randomly, 
			//the y position will be calculated later to lie on the hexagon border
			newx = sideX * Math.random() * 0.5 * SQRT3 * hexRadius;
			//Otherwise calculate the new Y position along the hexagon border 
			//based on which quadrant the random x and y gave
			if (sideX > 0 && sideY > 0) {
				newy = hexRadius - (1/SQRT3)*newx;
			} else if (sideX > 0 && sideY <= 0) {
				newy = -hexRadius + (1/SQRT3)*newx;
			} else if (sideX <= 0 && sideY > 0) {
				newy = hexRadius + (1/SQRT3)*newx;
			} else if (sideX <= 0 && sideY <= 0) {
				newy = -hexRadius - (1/SQRT3)*newx;
			}//else

			//Take off a bit so it seems that the circles truly only touch the edge
			var offSetX = radius * Math.cos( 60 * Math.PI/180),
				offSetY = radius * Math.sin( 60 * Math.PI/180);
			newx = newx - sideX*offSetX;
			newy = newy - sideY*offSetY;
		}//else

		//Transition the circle to its new location
		d3.select(this)
			.transition("moveing")
			.duration(3000 + 4000*Math.random())
			.ease("linear")
			.attr("cy", newy)
			.attr("cx", newx)
			.each("end", move);

	}//function move

}//init
