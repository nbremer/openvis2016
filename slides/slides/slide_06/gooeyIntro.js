pt.gooeyIntro = pt.gooeyIntro || {};

pt.gooeyIntro.init = function() {
	
	//Remove any existing svgs
	d3.select('#intro-gooey #introGooey svg').remove();

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
	pt.gooeyIntro.svg = d3.select('#intro-gooey #introGooey')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.gooeyIntro.svg.append("g")
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

	//SVG filter for the gooey effect
	//Code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
	var defs = svg.append("defs");
	var filter = defs.append("filter").attr("id","gooeyIntro");
	filter.append("feGaussianBlur")
		.attr("in","SourceGraphic")
		.attr("stdDeviation","10")
		.attr("color-interpolation-filters","sRGB") //to fix safari: http://stackoverflow.com/questions/24295043/svg-gaussian-blur-in-safari-unexpectedly-lightens-image
		.attr("result","blur");
	filter.append("feColorMatrix")
		.attr("in","blur")
		.attr("mode","matrix")
		.attr("values","1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7")
		.attr("result","gooey");
	// filter.append('feComposite') //feBlend?
	// 	.attr('in','SourceGraphic')
	// 	.attr('in2','gooey')
	// 	.attr('operator','atop');	

	//var colors = ["#3EC1D3", "#83CC61", "#FF9A00", "#FF165D"];
	var colors = ["#490A3D","#BD1550","#E97F02","#F8CA00","#8A9B0F"];

	defs.append("linearGradient")
		.attr("id", "gradientRainbow")
		.attr("gradientUnits", "userSpaceOnUse") 
		.attr("x1", -hexWidth/2*0.85).attr("y1", 0)
		.attr("x2", hexWidth/2*0.85).attr("y2", 0)
		.selectAll("stop") 
		.data(d3.range(colors.length))                  
		.enter().append("stop") 
		.attr("offset", function(d,i) { return (i/(colors.length-1)*100) + "%"; })   
		.attr("stop-color", function(d) { return colors[d]; });

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
		.attr("transform", "translate(" + (width/2) + "," + (height/2) + ")")
		.style("filter", "url(#gooeyIntro)");

	//Create dataset with random initial positions
	randStart = [];
	for(var i = 0; i < 30; i++) {
		randStart.push({
			rHex: Math.random() * hexWidth,
			theta: Math.random() * 2 * Math.PI,
			r: 18 + Math.random() * 35
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
      	.style("fill", "url(#gradientRainbow)")
      	//.style("fill", function(d,i) { return colors[i%colors.length]; })
		.style("opacity", 1)
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
