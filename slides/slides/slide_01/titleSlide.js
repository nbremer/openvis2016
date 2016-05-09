pt.titleSlide = pt.titleSlide || {};

pt.titleSlide.init = function() {
	
	//Remove any existing svgs
	d3.select('#title-slide #titleSlide svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 80,
		right: 60,
		bottom: 60,
		left: 50
	};

	var width = $(".slides").width() - margin.left - margin.right,
		height = $(".slides").height()*0.7 - margin.top - margin.bottom;

	//SVG container
	pt.titleSlide.svg = d3.select("#title-slide #titleSlide")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.titleSlide.svg.append("g")
		.attr("transform", "translate(" + (margin.left + width/2) + "," + (margin.top + height/2) + ")");

	///////////////////////////////////////////////////////////////////////////
	/////////////////////// Calculate hexagon variables ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var blockWidth = width / 9.75; //6;

	pt.titleSlide.SQRT3 = Math.sqrt(3)
	pt.titleSlide.hexRadius = blockWidth*0.95;
	pt.titleSlide.hexWidth = pt.titleSlide.SQRT3 * pt.titleSlide.hexRadius;
	pt.titleSlide.hexHeight = 2 * pt.titleSlide.hexRadius;
	var hexagonPoly = [[0,-1],[pt.titleSlide.SQRT3/2,0.5],[0,1],[-pt.titleSlide.SQRT3/2,0.5],[-pt.titleSlide.SQRT3/2,-0.5],[0,-1],[pt.titleSlide.SQRT3/2,-0.5]];
	var hexagonPath = "m" + hexagonPoly.map(function(p){ return [p[0]*pt.titleSlide.hexRadius, p[1]*pt.titleSlide.hexRadius].join(','); }).join('l') + "z";

	var blockHeightTop = pt.titleSlide.hexHeight/2,
		blockHeightBottom = height - pt.titleSlide.hexHeight/2;

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Calculate color scale //////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	pt.titleSlide.numColors = 10;
	pt.titleSlide.colorScale = d3.scale.linear()
	   .domain([0,(pt.titleSlide.numColors-1)/2,pt.titleSlide.numColors-1])
	   .range(["#2c7bb6", "#ffff8c", "#d7191c"])
	   .interpolate(d3.interpolateHcl);

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Create circle data /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Create dataset with random initial positions
	pt.titleSlide.randStart = [];
	for(var i = 0; i < 15; i++) {
		pt.titleSlide.randStart.push({
			rHex: Math.random() * pt.titleSlide.hexWidth,
			theta: Math.random() * 2 * Math.PI,
			r: 8 + Math.random() * 20
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
		{id: 1, subject: "gradient", x: -3*blockWidth, y:-1*blockWidth*pt.titleSlide.SQRT3/2},
		{id: 2, subject: "slider", x: -2*blockWidth, y:1*blockWidth*pt.titleSlide.SQRT3/2},
		{id: 3, subject: "gooey", x: -1*blockWidth, y:-1*blockWidth*pt.titleSlide.SQRT3/2},
		{id: 4, subject: "animated", x: 0*blockWidth, y:1*blockWidth*pt.titleSlide.SQRT3/2},
		{id: 5, subject: "colorAdd", x: 1*blockWidth, y:-1*blockWidth*pt.titleSlide.SQRT3/2},
		{id: 6, subject: "glow", x: 2*blockWidth, y:1*blockWidth*pt.titleSlide.SQRT3/2},
		{id: 7, subject: "planet", x: 3*blockWidth, y:-1*blockWidth*pt.titleSlide.SQRT3/2}
	];

	//Create a group for each hexagon in the hexLocation's data
	var hexGroups = svg.selectAll(".hexagonGroup")
		.data(hexLocations)
		.enter().append("g")
		.attr("class", function(d,i) { return "hexagonGroup " + d.subject; })
		.attr("transform", function(d,i) { return "translate(" + d.x + "," + d.y + ")"; })

	///////////////////////////////////////////////////////////////////////////
	////////////// Call the different functions for each hexagon //////////////
	///////////////////////////////////////////////////////////////////////////	

	pt.titleSlide.gradient(d3.selectAll("#titleSlide .hexagonGroup.gradient"));
	pt.titleSlide.slider(d3.selectAll("#titleSlide .hexagonGroup.slider"));
	pt.titleSlide.gooey(d3.selectAll("#titleSlide .hexagonGroup.gooey"));
	pt.titleSlide.animated(d3.selectAll("#titleSlide .hexagonGroup.animated"));
	pt.titleSlide.colorAdd(d3.selectAll("#titleSlide .hexagonGroup.colorAdd"));
	pt.titleSlide.glow(d3.selectAll("#titleSlide .hexagonGroup.glow"));
	pt.titleSlide.planet(d3.selectAll("#titleSlide .hexagonGroup.planet"));

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Place hexagons on top //////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Place hexagons paths on top
	hexGroups.append("path")
		.attr("class", "hexagon")
		.attr("d", "M0,0" + hexagonPath)
		//.style("stroke", function(d,i) { return pt.titleSlide.colorScale((i)*pt.titleSlide.numColors/(hexLocations.length)); })
		.style("stroke", "#F2F2F2")
		.style("stroke-width", "4px")
		.style("fill", "none");

}//init

pt.titleSlide.gradient = function(svg) {

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create gradient /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	svg.append("defs").append("linearGradient")
		.attr("id", "gradientRainbowIntro")
		.attr("gradientUnits", "userSpaceOnUse") 
		.attr("x1", -pt.titleSlide.hexWidth/2*0.9).attr("y1", 0)
		.attr("x2", pt.titleSlide.hexWidth/2*0.9).attr("y2", 0)
		.selectAll("stop") 
		.data(d3.range(pt.titleSlide.numColors))                  
		.enter().append("stop") 
		.attr("offset", function(d,i) { return (i/(pt.titleSlide.numColors-1)*100) + "%"; })   
		.attr("stop-color", function(d) { return pt.titleSlide.colorScale(d); });

	///////////////////////////////////////////////////////////////////////////
	////////////////////// Place circles inside hexagon ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //First append a group for the clip path, then a new group that can be transformed
	var circleWrapper = svg.append("g")
		.attr("clip-path", "url(#clip")
		.style("clip-path", "url(#clip)") //make it work in safari

    var circle = circleWrapper.selectAll("#titleSlide .dots")
    	.data(pt.titleSlide.randStart)
    	.enter().append("circle")
    	.attr("class", "dots")
    	.attr("cx", function(d) { return d.rHex * Math.cos(d.theta); })
    	.attr("cy", function(d) { return d.rHex * Math.sin(d.theta); })
      	.attr("r", 0)
      	.style("fill", "url(#gradientRainbowIntro)")
		.style("opacity", 0.8)
		.each(pt.titleSlide.move);

	circle.transition("grow")
		.duration(function(d,i) { return Math.random()*2000+500; })
		.delay(function(d,i) { return Math.random()*3000;})
		.attr("r", function(d,i) { return d.r; });

}//gradient

pt.titleSlide.slider = function(svg) {

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create gradient /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var defs = svg.append("defs");
	var linearGradient = defs.selectAll("linearGradient")
		.data(pt.titleSlide.randStart)
		.enter().append("linearGradient")
		.attr("gradientUnits", "userSpaceOnUse")    
		.attr("x1", -pt.titleSlide.hexWidth/2).attr("y1", 0)
		.attr("x2", pt.titleSlide.hexWidth/2).attr("y2", 0)             
		.attr("id", function(d,i) { return "gradientSliderIntro-" + i; });
	
	linearGradient.append("stop")
		.attr("class", "left")
		.attr("offset", 0.4)
		.attr("stop-color", "#9E9E9E")
		.attr("stop-opacity", 0.5); 
	
	linearGradient.append("stop")
		.attr("class", "left")
		.attr("offset", 0.4)
		.attr("stop-color", function(d,i) { return pt.titleSlide.colorScale(i%pt.titleSlide.numColors); })
		.attr("stop-opacity", 1); 

	linearGradient.append("stop")
		.attr("class", "right")
		.attr("offset", 0.6)
		.attr("stop-color", function(d,i) { return pt.titleSlide.colorScale(i%pt.titleSlide.numColors); })
		.attr("stop-opacity", 1); 
	
	linearGradient.append("stop")
		.attr("class", "right")
		.attr("offset", 0.6)
		.attr("stop-color", "#9E9E9E")
		.attr("stop-opacity", 0.5); 

	///////////////////////////////////////////////////////////////////////////
	////////////////////// Place circles inside hexagon ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //First append a group for the clip path, then a new group that can be transformed
	var circleWrapper = svg.append("g")
		.attr("clip-path", "url(#clip")
		.style("clip-path", "url(#clip)"); //make it work in safari

    var circle = circleWrapper.selectAll("#titleSlide .dots")
    	.data(pt.titleSlide.randStart)
    	.enter().append("circle")
    	.attr("class", "dots")
    	.attr("cx", function(d) { return d.rHex * Math.cos(d.theta); })
    	.attr("cy", function(d) { return d.rHex * Math.sin(d.theta); })
      	.attr("r", 0)
      	.style("fill", function(d,i) { return "url(#gradientSliderIntro-" + i + ")"; })
		.style("opacity", 0.9)
		.each(pt.titleSlide.move);

	circle.transition("grow")
		.duration(function(d,i) { return Math.random()*2000+500; })
		.delay(function(d,i) { return Math.random()*3000;})
		.attr("r", function(d,i) { return d.r; });
	
	function moveGradient() {
		
		//Safari can only handle this function when loaded from local host
		if(is_safari) return;

		//Move the left side of the gradient
		d3.selectAll("#titleSlide .left")
			.transition().duration(duration)
		    .attrTween("offset", function() { 
		    	return d3.interpolate(start, end); 
		    })
		    .call(endall, function() {
		    	d3.selectAll("#titleSlide .left")
					.transition().duration(duration)
			    	.attrTween("offset", function() { 
			    		return d3.interpolate(end, start); 
		    		})
		    		.call(endall, moveGradient);
		    });

		//Move the right side of the gradient
		d3.selectAll("#titleSlide .right")
			.transition().duration(duration)
		    .attrTween("offset", function() { 
		    	return d3.interpolate(start+range, end+range); 
		    })
		    .call(endall, function() {
		    	d3.selectAll("#titleSlide .right")
					.transition().duration(duration)
			    	.attrTween("offset", function() { 
			    		return d3.interpolate(end+range, start+range); 
		    		});
		    });
	}//moveGradient

	var start = 0,
		range = 0.40,
		end = 1-range,
		duration = 5000;

	moveGradient();

}//slider

pt.titleSlide.gooey = function(svg) {

	///////////////////////////////////////////////////////////////////////////
	////////////////////////////// Create filter //////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//SVG filter for the gooey effect
	//Code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
	var defs = svg.append('defs');
	var filter = defs.append('filter').attr('id','gooeyIntro');
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
		.attr("clip-path", "url(#clip")
		.style("clip-path", "url(#clip)") //make it work in safari
		.style("filter", "url(#gooeyIntro)");

	//Create dataset with random initial positions
	randStart = [];
	for(var i = 0; i < 10; i++) {
		randStart.push({
			rHex: Math.random() * pt.titleSlide.hexWidth,
			theta: Math.random() * 2 * Math.PI,
			r: 15 + Math.random() * 10
		});
	}//for i

	//var colors = ["#3EC1D3", "#83CC61", "#FF9A00", "#FF165D"];
    var circle = circleWrapper.selectAll(".dots")
    	.data(randStart)
    	.enter().append("circle")
    	.attr("class", "dots")
    	.attr("cx", function(d) { return d.rHex * Math.cos(d.theta); })
    	.attr("cy", function(d) { return d.rHex * Math.sin(d.theta); })
      	.attr("r", 0)
      	.style("fill", function(d,i) { return pt.titleSlide.colorScale(i%pt.titleSlide.numColors); })
		.style("opacity", 1)
		.each(pt.titleSlide.move);

	circle.transition("grow")
		.duration(function(d,i) { return Math.random()*2000+500; })
		.delay(function(d,i) { return Math.random()*3000;})
		.attr("r", function(d,i) { return d.r; });

}//gooey

pt.titleSlide.colorAdd = function(svg) {

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
    	.data(pt.titleSlide.randStart)
    	.enter().append("circle")
    	.attr("class", "dots")
    	.attr("cx", function(d) { return d.rHex * Math.cos(d.theta); })
    	.attr("cy", function(d) { return d.rHex * Math.sin(d.theta); })
      	.attr("r", 0)
      	.style("fill", function(d,i) { return pt.titleSlide.colorScale(i%pt.titleSlide.numColors); })
		.style("opacity", 1)
		.style("mix-blend-mode", "multiply")
		.each(pt.titleSlide.move);

	circle.transition("grow")
		.duration(function(d,i) { return Math.random()*2000+500; })
		.delay(function(d,i) { return Math.random()*3000;})
		.attr("r", function(d,i) { return d.r; });

}//colorAdd

pt.titleSlide.animated = function(svg) {

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create gradient /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var defs = svg.append("defs");
	var linearGradient = defs.append("linearGradient")
		.attr("gradientUnits", "userSpaceOnUse")
		.attr("id","animatedGradientIntroSlide");
		
	//The gradient definition below isn't the fastest or most optimal way
	//but because safari can't handle spreadMethod reflect I had to make
	//changes. This will result in an optically indefinite flow
	linearGradient.attr("x1","-75%")
		.attr("y1","0%")
		.attr("x2","25%")
		.attr("y2","0%")
		.attr("spreadMethod", "reflect");

	var colors = d3.range(pt.titleSlide.numColors).concat(d3.range(pt.titleSlide.numColors).reverse());
	colors = colors.concat(colors);
	
	linearGradient.selectAll("stop") 
		.data(colors)                  
		.enter().append("stop") 
		.attr("offset", function(d,i) { return (i/(colors.length-1)*100) + "%"; })   
		.attr("stop-color", function(d,i) { return pt.titleSlide.colorScale(d); });

	linearGradient.append("animate")
		.attr("attributeName","x1")
		.attr("values","-75%;-25%")
		.attr("dur","7s")
		.attr("repeatCount","indefinite");

	linearGradient.append("animate")
		.attr("attributeName","x2")
		.attr("values","25%;75%")
		.attr("dur","7s")
		.attr("repeatCount","indefinite");
	
	///////////////////////////////////////////////////////////////////////////
	////////////////////// Place circles inside hexagon ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //First append a group for the clip path, then a new group that can be transformed
	var circleWrapper = svg.append("g")
		.attr("clip-path", "url(#clip")
		.style("clip-path", "url(#clip)"); //make it work in safari

	// //Get a better overview of the gradient - for testing
	// circleWrapper.append("rect")
	// 	.attr("x", -pt.titleSlide.hexWidth)
	// 	.attr("y", -pt.titleSlide.hexHeight)
	// 	.attr("width", pt.titleSlide.hexWidth*2)
	// 	.attr("height", pt.titleSlide.hexHeight*2)
	// 	.style("fill", "url(#animatedGradientIntroSlide)");
		
    var circle = circleWrapper.selectAll(".dots")
    	.data(pt.titleSlide.randStart)
    	.enter().append("circle")
    	.attr("class", "dots")
    	.attr("cx", function(d) { return d.rHex * Math.cos(d.theta); })
    	.attr("cy", function(d) { return d.rHex * Math.sin(d.theta); })
      	.attr("r", 0)
      	.style("fill", "url(#animatedGradientIntroSlide)")
		.style("opacity", 0.9)
		.each(pt.titleSlide.move);

	circle.transition("grow")
		.duration(function(d,i) { return Math.random()*2000+500; })
		.delay(function(d,i) { return Math.random()*3000;})
		.attr("r", function(d,i) { return d.r; });

}//animated

pt.titleSlide.glow = function(svg) {

	///////////////////////////////////////////////////////////////////////////
	////////////////////////////// Create filter //////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//SVG filter for the glow effect
	var defs = svg.append("defs");

	//Filter for the outside glow
	var filter = defs.append("filter").attr("id","glowIntroSlide"),
		feGaussianBlur = filter.append("feGaussianBlur").attr("stdDeviation","2").attr("result","coloredBlur"),
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

    var circle = circleWrapper.selectAll(".dots")
    	.data(pt.titleSlide.randStart)
    	.enter().append("circle")
    	.attr("class", "dots")
    	.attr("cx", function(d) { return d.rHex * Math.cos(d.theta); })
    	.attr("cy", function(d) { return d.rHex * Math.sin(d.theta); })
      	.attr("r", 0)
      	.style("filter", "url(#glowIntroSlide)")
      	.style("fill", function(d,i) { return pt.titleSlide.colorScale(i%pt.titleSlide.numColors); })
		.style("opacity", 0.9)
		.each(pt.titleSlide.move);

	circle.transition("grow")
		.duration(function(d,i) { return Math.random()*2000+500; })
		.delay(function(d,i) { return Math.random()*3000;})
		.attr("r", function(d,i) { return Math.max(d.r, 12); });

}//glow

pt.titleSlide.planet = function(svg) {

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create gradient /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var gradientRadial = svg.append("defs").selectAll("radialGradient")
		.data(pt.titleSlide.randStart)
		.enter().append("radialGradient")
		.attr("cx", "25%")
		.attr("cy", "25%")
		.attr("r", "65%")
		.attr("id", function(d,i){ return "gradientPlanetIntro-"+i; });

	gradientRadial.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", function(d,i) { return d3.rgb(pt.titleSlide.colorScale(i%pt.titleSlide.numColors)).brighter(1); });

	gradientRadial.append("stop")
		.attr("offset", "40%")
		.attr("stop-color", function(d,i) { return pt.titleSlide.colorScale(i%pt.titleSlide.numColors); });
		 
	gradientRadial.append("stop")
		.attr("offset",  "100%")
		.attr("stop-color", function(d,i) { return d3.rgb(pt.titleSlide.colorScale(i%pt.titleSlide.numColors)).darker(1); });

	///////////////////////////////////////////////////////////////////////////
	////////////////////// Place circles inside hexagon ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //First append a group for the clip path, then a new group that can be transformed
	var circleWrapper = svg.append("g")
		.attr("clip-path", "url(#clip")
		.style("clip-path", "url(#clip)"); //make it work in safari

    var circle = circleWrapper.selectAll("#titleSlide .dots")
    	.data(pt.titleSlide.randStart)
    	.enter().append("circle")
    	.attr("class", "dots")
    	.attr("cx", function(d) { return d.rHex * Math.cos(d.theta); })
    	.attr("cy", function(d) { return d.rHex * Math.sin(d.theta); })
      	.attr("r", 0)
      	.style("fill", function(d,i) { return "url(#gradientPlanetIntro-" + i + ")"; })
		.style("opacity", 0.8)
		.each(pt.titleSlide.move);

	circle.transition("grow")
		.duration(function(d,i) { return Math.random()*2000+500; })
		.delay(function(d,i) { return Math.random()*3000;})
		.attr("r", function(d,i) { return d.r; });

}//planet

//General idea from Maarten Lambrecht's block: http://bl.ocks.org/maartenzam/f35baff17a0316ad4ff6
pt.titleSlide.move = function() {

	//return;
	
	var SQRT3 = pt.titleSlide.SQRT3,
		hexRadius = pt.titleSlide.hexRadius,
		hexWidth = pt.titleSlide.hexWidth,
		hexHeight = pt.titleSlide.hexHeight;

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
		.each("end", pt.titleSlide.move);

}//move
