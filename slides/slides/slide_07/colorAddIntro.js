pt.colorAddIntro = pt.colorAddIntro || {};

pt.colorAddIntro.init = function() {
	
	//Remove any existing svgs
	pt.colorAddIntro.svg = null;
	d3.select('#intro-colorAdd #introColorAdd svg').remove();

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
	pt.colorAddIntro.svg = d3.select("#intro-colorAdd #introColorAdd")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.colorAddIntro.svg.append("g")
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
	////////////////////// Place circles inside hexagon ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Create a clip path that is the same as the top hexagon
	svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("path")
        .attr("d", "M" + (width/2) + "," + (height/2) + hexagonPath);

    //First append a group for the clip path, then a new group that can be transformed
	var circleWrapperOuter = svg.append("g")
		.attr("clip-path", "url(#clip")
		.style("clip-path", "url(#clip)"); //make it work in safari

	var circleWrapperInner = circleWrapperOuter.append("g")
		.attr("transform", "translate(" + (width/2) + "," + (height/2) + ")")
		.style("isolation", "isolate");

	//var colors = ["#3EC1D3", "#83CC61", "#FF9A00", "#FF165D"];
	var colors = ["#2c7bb6", "#00a6ca","#00ccbc","#90eb9d","#ffff8c","#f9d057","#f29e2e","#e76818","#d7191c"];
	//var colors = ['#0000FF', '#FF0000', '#00FF00'];
	//var colors = ["#F95B34", "#EE3E64", "#F36283", "#FF9C34", "#EBDE52", "#B7D84B", "#44ACCF"];

	//Create dataset with random initial positions
	randStart = [];
	for(var i = 0; i < 6*colors.length; i++) {
		randStart.push({
			rHex: Math.random() * hexWidth,
			theta: Math.random() * 2 * Math.PI,
			r: 8 + Math.random() * 40
		});
	}//for i

	//Background rectangle
	circleWrapperInner.append("rect")
		.attr("x", -hexWidth/2)
		.attr("y", -hexHeight/2)
		.attr("width", hexWidth)
		.attr("height", hexHeight)
		.style("fill", "#262626");

    var circle = circleWrapperInner.selectAll(".dots")
    	.data(randStart)
    	.enter().append("circle")
    	.attr("class", "dots")
    	.attr("cx", function(d) { return d.rHex * Math.cos(d.theta); })
    	.attr("cy", function(d) { return d.rHex * Math.sin(d.theta); })
      	.attr("r", 0)
      	.style("fill", function(d,i) {
      		return colors[i%colors.length];
      	})
		.style("opacity", 1)
		.style("mix-blend-mode", "screen")
		//.style("mix-blend-mode", function(d) { return Math.random() > 0.5 ? "screen" : "multiply"; })
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
		.style("stroke", "#00a6ca")
		.style("stroke-width", "7px")
		.style("fill", "none");

	///////////////////////////////////////////////////////////////////////////
	////////////////////// Circle movement inside hexagon /////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//General idea from Maarten Lambrecht's block: http://bl.ocks.org/maartenzam/f35baff17a0316ad4ff6
	function move(d) {
		var currentx = parseFloat(d3.select(this).attr("cx")),
			mode = d3.select(this).style("mix-blend-mode"),
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
			.style("mix-blend-mode", "screen")
			//.style("mix-blend-mode", mode === "multiply" ? "screen" : "multiply")
			.each("end", move);

	}//function move

};
