pt.fuzzyIntro = pt.fuzzyIntro || {};

pt.fuzzyIntro.init = function() {
	
	//Remove any existing svgs
	d3.select('#intro-fuzzy #introFuzzy svg').remove();

	//Let the repeat function run again once called
	pt.fuzzyIntro.stopRepeat = false;

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
	pt.fuzzyIntro.svg = d3.select('#intro-fuzzy #introFuzzy')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.fuzzyIntro.svg.append("g")
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
	//////////////////////////////// Create Data //////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Create dataset with random initial positions
	var randStart = [],
		numCircles = 50,
		radius = (hexHeight / numCircles)/2 * 0.98, //radius of each circle
		maxMove = hexWidth/2 - radius; //maximum displacement

	for(var i = 0; i < (numCircles-2); i++) {
		//y location of each circle
		var h = -hexHeight/2 + (i+1) * hexHeight/(numCircles-1);

		//Find the x location that belongs to the height
		if (h <= -hexHeight/4) {
			var w = -1*(h + hexRadius)*SQRT3 + 2.6*radius;
		} else if(h > -hexHeight/4 && h < hexHeight/4) {
			var w = -hexWidth/2 + 1.4*radius;
		} else if (h >= hexHeight/4) {
			var w = (h - hexRadius)*SQRT3 + 2.6*radius;;
		}//else if

		randStart.push({
			id: i,
			yLoc: h,
			xLoc: w,
			maxValue: -6 * w/maxMove //The extent of the blur depends on the distance to cross. Less distance is less blur
		});
	}//for i

	pt.fuzzyIntro.delay = 50;
	pt.fuzzyIntro.dur = 900;

	//var colors = ['#261c21','#6a224c','#b3274d','#db5b2d','#eb9605'];
	//var colors = ["#3FB8AF","#7FC7AF","#DAD8A7","#FF9E9D","#FF3D7F"];
	var colors = ["#004358","#1F8A70","#BEDB39","#FFE11A","#FD7400"];
	pt.fuzzyIntro.colorScale = d3.scale.linear()
		.domain(d3.range(0,randStart.length-1,(randStart.length-1)/colors.length))
		.range(colors);

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create gradient /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//SVG filter for the fuzzy effect
	//Code based on http://tympanus.net/codrops/2015/04/08/motion-blur-effect-svg/
	var defs = svg.append("defs");

	//Create a filter per circle so we can adjust the fuzzyness per circle that is flying out
	defs.selectAll("filter")
		.data(randStart)
		.enter().append("filter")
		.attr("id",function(d,i) { return "fuzzy-" + d.id; })
		.attr("color-interpolation-filters","sRGB") //to fix safari: http://stackoverflow.com/questions/24295043/svg-gaussian-blur-in-safari-unexpectedly-lightens-image
		.append("feGaussianBlur")
		.attr("class", "blurValues")
		.attr("in","SourceGraphic")
		.attr("stdDeviation","0,0");

	//Create a clip path that is the same as the top hexagon
	svg.append("clipPath")
        .attr("id", "clip")
        .append("path")
        .attr("d", "M" + (width/2) + "," + (height/2) + hexagonPath);
		
	///////////////////////////////////////////////////////////////////////////
	////////////////////// Place circles inside hexagon ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //First append a group for the clip path, then a new group that can be transformed
	var circleWrapperClip = svg.append("g")
		.attr("clip-path", "url(#clip")
		.style("clip-path", "url(#clip)") //make it work in safari
		.append("g")
		.attr("transform", "translate(" + (width/2) + "," + (height/2) + ")");

	//Outer group wrapper for a fixed y location
	var circleWrapperOuter = circleWrapperClip.selectAll(".circleWrapperOuter")
    	.data(randStart)
    	.enter().append("g")
    	.attr("class", ".circleWrapperOuter")
    	.attr("transform", function(d) { return "translate(" + 0 + "," + d.yLoc + ")" ;})
    	.style("opacity", 0);

    //Group wrapper for the rect and circle - set motion blur filter 
    circleGroups = circleWrapperOuter.append("g")
    	.attr("class", "circleGroups")
    	.attr("transform", function(d) { return "translate(" + d.xLoc + ",0)" ;})
    	.style("filter", function(d,i) { return "url(#fuzzy-" + d.id + ")"; });

    //Append rect behind the visible circles so the circles have a large enough "bleed" area
    circleGroups.append("rect")
		.attr("class", "rectBottom")
		.attr("x", -radius*2)
		.attr("y", -radius)
		.attr("width", radius*4)
		.attr("height", radius*2)
		.style("fill", "white");

	//Finally append the visible circles
    var circles = circleGroups.append("circle")
    	.attr("class", "circles")
      	.attr("r", 0)
      	.style("fill", function(d,i) { return pt.fuzzyIntro.colorScale(i); });

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
	////////////////////////// Starting transitions ///////////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //Better overlap with colored background of previous slide (spirograph)
    circleWrapperOuter.transition().duration(1500)
		.style("opacity", 1);

    //Let the circles grow at the start
    circles.transition().duration(pt.fuzzyIntro.dur)
     	.delay(function(d,i) { return i * pt.fuzzyIntro.delay*2; })
     	.attr("r", radius);

    //Initialize the chain of movement
	circleGroups.transition().duration(pt.fuzzyIntro.dur)
	    .delay(function(d,i) { return i * pt.fuzzyIntro.delay; })
	    .each(slide);

	///////////////////////////////////////////////////////////////////////////
	////////////////////// Circle movement inside hexagon /////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Function based on http://blockbuilder.org/mbostock/1125997
	function slide(d) {
		var group = d3.select(this);
		var element = d;
		(function repeat() {

			if(pt.fuzzyIntro.stopRepeat) return;

		    group = group.transition().duration(pt.fuzzyIntro.dur)
		        .attr("transform", "translate(" + -1*element.xLoc + ",0)")
		      .transition().duration(pt.fuzzyIntro.dur)
		        .attr("transform", "translate(" + element.xLoc + ",0)")
		        .each("end", repeat);

		    //Interpolate the fuzzyness
			d3.selectAll("#introFuzzy #fuzzy-" + element.id + " .blurValues")
				.transition().duration(pt.fuzzyIntro.dur*0.3) //Move right
				.delay(200)
				.attrTween("stdDeviation", function(d,i) {
		    		var interpolate = d3.interpolate(0, element.maxValue);
				    return function(t) {
				      	var value = interpolate(t);
				      	return value + " 0";
				    };
			  	})
			  	.transition().duration(pt.fuzzyIntro.dur*0.3)
			  	.attrTween("stdDeviation", function(d) {
		    		var interpolate = d3.interpolate(element.maxValue, 0);
				    return function(t) {
				      	var value = interpolate(t);
				      	return value + " 0";
				    };
			  	})
			  	.transition().duration(pt.fuzzyIntro.dur*0.3) //Move left
				.delay(pt.fuzzyIntro.dur + 200)
				.attrTween("stdDeviation", function(d,i) {
		    		var interpolate = d3.interpolate(0, element.maxValue);
				    return function(t) {
				      	var value = interpolate(t);
				      	return value + " 0";
				    };
			  	})
			  	.transition().duration(pt.fuzzyIntro.dur*0.3)
			  	.attrTween("stdDeviation", function(d) {
		    		var interpolate = d3.interpolate(element.maxValue, 0);
				    return function(t) {
				      	var value = interpolate(t);
				      	return value + " 0";
				    };
			  	});
		})();
	}//slide

}//init
