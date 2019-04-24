pt.endSlide = pt.endSlide || {};

pt.endSlide.init = function() {
	
	setTimeout(function() {
		d3.select(".slide-background.stack.present").selectAll(".slide-background.present")
		.style("background", "white");
	},100);

	//Remove any existing svgs
	d3.select('#end-slide #endSlide svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 10,
		right: 10,
		bottom: 10,
		left: 10
	};

	pt.endSlide.width = $(".slides").width() - margin.left - margin.right,
	pt.endSlide.height = $(".slides").height()*0.7 - margin.top - margin.bottom;


	//SVG container
	pt.endSlide.svg = d3.select("#end-slide #endSlide")
		.append("svg")
		.attr("width", pt.endSlide.width + margin.left + margin.right)
		.attr("height", pt.endSlide.height + margin.top + margin.bottom);
		
	var svg = pt.endSlide.svg.append("g")
		.attr("transform", "translate(" + (margin.left + pt.endSlide.width/2) + "," + (margin.top + pt.endSlide.height/2) + ")");

	///////////////////////////////////////////////////////////////////////////
	/////////////////////// Calculate hexagon variables ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var blockWidth = pt.endSlide.width / 9.5; //6;

	pt.endSlide.SQRT3 = Math.sqrt(3);
	pt.endSlide.hexRadius = pt.endSlide.height/2;
	pt.endSlide.hexWidth = pt.endSlide.SQRT3 * pt.endSlide.hexRadius;
	pt.endSlide.hexHeight = 2 * pt.endSlide.hexRadius;
	var hexagonPoly = [[0,-1],[pt.endSlide.SQRT3/2,0.5],[0,1],[-pt.endSlide.SQRT3/2,0.5],[-pt.endSlide.SQRT3/2,-0.5],[0,-1],[pt.endSlide.SQRT3/2,-0.5]];
	var hexagonPath = "m" + hexagonPoly.map(function(p){ return [p[0]*pt.endSlide.hexRadius, p[1]*pt.endSlide.hexRadius].join(','); }).join('l') + "z";

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Calculate color scale //////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	pt.endSlide.numColors = 10;
	pt.endSlide.colorScale = d3.scale.linear()
	   .domain([0,(pt.endSlide.numColors-1)/2,pt.endSlide.numColors-1])
	   .range(["#2c7bb6", "#ffff8c", "#d7191c"])
	   .interpolate(d3.interpolateHcl);

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Create circle data /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Create dataset with random initial positions
	pt.endSlide.randStart = [];
	for(var i = 0; i < 20; i++) {
		pt.endSlide.randStart.push({
			rHex: Math.random() * pt.endSlide.hexWidth,
			theta: Math.random() * 2 * Math.PI,
			r: 12 + Math.random() * 30
		});
	}//for i

	///////////////////////////////////////////////////////////////////////////
	//////////////////////// Create the hexagon Groups ////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Create a clip path that is the same as the top hexagon
	svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("path")
        .attr("d", "M0,0" + hexagonPath);

	//Find the locations of each colored hexagon
	hexLocations = [
		{id: 1, subject: "gradient", x: -3*blockWidth, y:0},
		{id: 2, subject: "slider", x: -2*blockWidth, y:0},
		{id: 3, subject: "gooey", x: -1*blockWidth, y:0},
		{id: 4, subject: "animated", x: 0*blockWidth, y:0},
		{id: 5, subject: "colorAdd", x: 1*blockWidth, y:0},
		{id: 6, subject: "glow", x: 2*blockWidth, y:0},
		{id: 7, subject: "planet", x: 3*blockWidth, y:0}
	];

	//Create a group for each hexagon in the hexLocation's data
	var hexGroups = svg.selectAll(".hexagonGroup")
		.data(hexLocations)
		.enter().append("g")
		.attr("class", function(d,i) { return "hexagonGroup " + d.subject; })
		.attr("transform", function(d,i) { return "translate(" + pt.endSlide.width/4 + "," + 0 + ")"; });


	///////////////////////////////////////////////////////////////////////////
	////////////// Call the different functions for each hexagon //////////////
	///////////////////////////////////////////////////////////////////////////	
	
	pt.endSlide.gradient(d3.selectAll("#endSlide .hexagonGroup.gradient"));
	pt.endSlide.gooey(d3.selectAll("#endSlide .hexagonGroup.gooey"));
	pt.endSlide.colorAdd(d3.selectAll("#endSlide .hexagonGroup.colorAdd"));

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Place hexagons on top //////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Place hexagons paths on top
	svg.append("path")
		.attr("class", "hexagon")
		.attr("d", "M" + pt.endSlide.width/4 + ",0" + hexagonPath)
		.style("stroke", "#F2F2F2")
		.style("stroke-width", "5px")
		.style("fill", "none");

}//init

pt.endSlide.gradient = function(svg) {

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create gradient /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var defs = svg.append("defs");

	defs.append("linearGradient")
		.attr("id", "gradientRainbowEnd")
		.attr("gradientUnits", "userSpaceOnUse") 
		.attr("x1", -pt.endSlide.hexWidth/2*0.9).attr("y1", 0)
		.attr("x2", pt.endSlide.hexWidth/2*0.9).attr("y2", 0)
		.selectAll("stop") 
		.data(d3.range(pt.endSlide.numColors))                  
		.enter().append("stop") 
		.attr("offset", function(d,i) { return (i/(pt.endSlide.numColors-1)*100) + "%"; })   
		.attr("stop-color", function(d) { return pt.endSlide.colorScale(d); });

	//Filter for the outside glow
	var filter = defs.append("filter").attr("id","glowEndSlide"),
		feGaussianBlur = filter.append("feGaussianBlur")
			.attr("stdDeviation","3")
			.attr("result","coloredBlur"),
		feMerge = filter.append("feMerge"),
		feMergeNode_1 = feMerge.append("feMergeNode").attr("in","coloredBlur"),
		feMergeNode_2 = feMerge.append("feMergeNode").attr("in","SourceGraphic");
	///////////////////////////////////////////////////////////////////////////
	////////////////////// Place circles inside hexagon ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //First append a group for the clip path, then a new group that can be transformed
	var circleWrapper = svg.append("g")
		.attr("clip-path", "url(#clip")
		.style("clip-path", "url(#clip)"); //make it work in safari

    var circle = circleWrapper.selectAll("#endSlide .dots")
    	.data(pt.endSlide.randStart)
    	.enter().append("circle")
    	.attr("class", "dots")
    	.attr("cx", function(d) { return d.rHex * Math.cos(d.theta); })
    	.attr("cy", function(d) { return d.rHex * Math.sin(d.theta); })
      	.attr("r", 0)
      	.style("fill", "url(#gradientRainbowEnd)")
      	.style("filter", "url(#glowEndSlide)")
		.style("opacity", 0.8)
		.each(pt.endSlide.move);

	circle.transition("grow")
		.duration(function(d,i) { return Math.random()*2000+500; })
		.delay(function(d,i) { return Math.random()*3000;})
		.attr("r", function(d,i) { return d.r; });

}//gradient

pt.endSlide.gooey = function(svg) {

	///////////////////////////////////////////////////////////////////////////
	////////////////////////////// Create filter //////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//SVG filter for the gooey effect
	//Code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
	var defs = svg.append('defs');
	var filter = defs.append('filter').attr('id','gooeyEnd');
	filter.append('feGaussianBlur')
		.attr('in','SourceGraphic')
		.attr('stdDeviation','8')
		.attr('result','blur');
	filter.append('feColorMatrix')
		.attr('in','blur')
		.attr('mode','matrix')
		.attr('values','1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7')
		.attr('result','gooey');

	///////////////////////////////////////////////////////////////////////////
	////////////////////// Place circles inside hexagon ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //First append a group for the clip path, then a new group that can be transformed
	var circleWrapper = svg.append("g")
		.style("filter", "url(#gooeyEnd)")
		.attr("clip-path", "url(#clip")
		.style("clip-path", "url(#clip)"); //make it work in safari

	// //Create dataset with random initial positions
	// randStart = [];
	// for(var i = 0; i < 10; i++) {
	// 	randStart.push({
	// 		rHex: Math.random() * pt.endSlide.hexWidth,
	// 		theta: Math.random() * 2 * Math.PI,
	// 		r: 15 + Math.random() * 10
	// 	});
	// }//for i

	//var colors = ["#3EC1D3", "#83CC61", "#FF9A00", "#FF165D"];
    var circle = circleWrapper.selectAll(".dots")
    	.data(pt.endSlide.randStart)
    	.enter().append("circle")
    	.attr("class", "dots")
    	.attr("cx", function(d) { return d.rHex * Math.cos(d.theta); })
    	.attr("cy", function(d) { return d.rHex * Math.sin(d.theta); })
      	.attr("r", 0)
      	.style("fill", function(d,i) { return pt.endSlide.colorScale(i%pt.endSlide.numColors); })
		.style("opacity", 1)
		.each(pt.endSlide.move);

	circle.transition("grow")
		.duration(function(d,i) { return Math.random()*2000+500; })
		.delay(function(d,i) { return Math.random()*3000;})
		.attr("r", function(d,i) { return d.r; });

}//gooey


pt.endSlide.colorAdd = function(svg) {

	///////////////////////////////////////////////////////////////////////////
	////////////////////// Place circles inside hexagon ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //First append a group for the clip path, then a new group that can be transformed
	var circleWrapperOuter = svg.append("g")
		.attr("clip-path", "url(#clip")
		.style("clip-path", "url(#clip)"); //make it work in safari

	var circleWrapperInner = circleWrapperOuter.append("g")
		.style("isolation", "isolate");

    var circle = circleWrapperInner.selectAll(".dots")
    	.data(pt.endSlide.randStart)
    	.enter().append("circle")
    	.attr("class", "dots")
    	.attr("cx", function(d) { return d.rHex * Math.cos(d.theta); })
    	.attr("cy", function(d) { return d.rHex * Math.sin(d.theta); })
      	.attr("r", 0)
      	.style("fill", function(d,i) { return pt.endSlide.colorScale(i%pt.endSlide.numColors); })
		.style("opacity", 1)
		.style("mix-blend-mode", "multiply")
		.each(pt.endSlide.move);

	circle.transition("grow")
		.duration(function(d,i) { return Math.random()*2000+500; })
		.delay(function(d,i) { return Math.random()*3000;})
		.attr("r", function(d,i) { return d.r; });

}//colorAdd

//General idea from Maarten Lambrecht's block: http://bl.ocks.org/maartenzam/f35baff17a0316ad4ff6
pt.endSlide.move = function() {

	//return;
	
	var SQRT3 = pt.endSlide.SQRT3,
		hexRadius = pt.endSlide.hexRadius,
		hexWidth = pt.endSlide.hexWidth,
		hexHeight = pt.endSlide.hexHeight;

	var currentx = parseFloat(d3.select(this).attr("cx")),
	 	//currenty = parseFloat(d3.select(this).attr("cy")),
		radius = parseFloat(d3.select(this).attr("r"));

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
		.each("end", pt.endSlide.move);

}//move