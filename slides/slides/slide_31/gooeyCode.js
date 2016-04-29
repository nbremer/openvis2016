pt.gooeyCode = pt.gooeyCode || {};

pt.gooeyCode.init = function() {
	
	//Remove any existing svgs
	d3.select('#gooey-code #gooeyCode svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 280,
		right: 10,
		bottom: 220,
		left: 10
	};

	var width = 400;
	var height = width;//$(".slides").height()*0.75 - margin.top - margin.bottom;

	//SVG container
	pt.gooeyCode.svg = d3.select("#gooey-code #gooeyCode")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.gooeyCode.svg.append("g")
		.attr("transform", "translate(" + (width/2 + margin.left) + "," +(height/2 +  margin.top) + ")");

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Create gooey filter //////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//SVG filter for the gooey effect
	//Code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
	var defs = svg.append("defs");
	var filter = defs.append("filter").attr("id","gooeyCodeFilter");
	filter.append("feGaussianBlur")
		.attr("in","SourceGraphic")
		.attr("stdDeviation","10")
		.attr("color-interpolation-filters","sRGB") //to fix safari: http://stackoverflow.com/questions/24295043/svg-gaussian-blur-in-safari-unexpectedly-lightens-image
		.attr("result","blur");
	filter.append("feColorMatrix")
		.attr("in","blur")
		.attr("mode","matrix")
		.attr("values","1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9")
		.attr("result","gooey");
	//If you want the end shapes to be exactly the same size as without the filter
	//add the feComposite below. However this will result in a less beautiful gooey effect
	// filter.append("feComposite") //feBlend
	// 	.attr("in","SourceGraphic")
	// 	.attr("in2","gooey")
	// 	.attr("operator","atop");	

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Create circles ////////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Create scale
	pt.gooeyCode.xScale = d3.scale.linear()
		.domain([-1.25, 1.25])
		.range([-width/2, width/2]);
		
	var circleWrapper = svg.append("g")
		.style("filter", "url(#gooeyCodeFilter)");

	//Append circle at center
	circleWrapper.append("circle")
			.attr("class", "centerCircle")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", 30)
			.style("fill", "#81BC00");
	
	//Create the circles that will move out and in the center circle
	pt.gooeyCode.steps = 15;
	var colors = ["#F95B34", "#EE3E64", "#F36283", "#FF9C34", "#EBDE52", "#B7D84B", "#44ACCF"];
	var flyCircleData = [];
	for (var i = 0; i < pt.gooeyCode.steps; i++) {
		flyCircleData.push({ 
			fixedAngle: (i/pt.gooeyCode.steps)*(2*Math.PI),
			randomAngle: (i/pt.gooeyCode.steps)*(2*Math.PI),
			speed: Math.random() * 8000 + 3000,
			r: i%2 === 0 ? 0 : Math.floor(Math.random() * 20 + 15),
			color: colors[i%colors.length]
		})
	}//for i

	//Set up the circles
	pt.gooeyCode.flyCircles = circleWrapper.selectAll("#gooeyCode .flyCircle")
		.data(flyCircleData)
		.enter().append("circle")
		.attr("class", "flyCircle")
		.attr("cx", 0)
		.attr("cy", 0)
		.attr("r", 17)
		.style("fill", "#81BC00");

	pt.gooeyCode.fragment = "start";

}//init

pt.gooeyCode.moveOutIn = function() {
	
	var dur = 1500,
		del = 500;

	if(pt.gooeyCode.fragment !== "moveOutIn") {
		//Show center circle
		d3.select("#gooeyCode .centerCircle")
			.transition().duration(800)
			.attr("r", 30);

		//Set circles to begin position (in case you move backward)
		d3.selectAll("#gooeyCode .flyCircle")
			.transition().duration(800)
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", 17)
			.attr("transform", "rotate(0)")
			.style("fill", "#81BC00")
			.call(endall, repeat);
	}//if

	pt.gooeyCode.fragment = "moveOutIn";

	//Continuously moves the circles outward and inward	
	function repeat() {
		if(pt.gooeyCode.fragment !== "moveOutIn") return;
		d3.selectAll("#gooeyCode .flyCircle")
			.transition().duration(dur).delay(function(d,i) { return i*del; })
				.attr("cy", function(d) { return pt.gooeyCode.xScale(Math.sin(d.fixedAngle)); })
				.attr("cx", function(d) { return pt.gooeyCode.xScale(Math.cos(d.fixedAngle)); })
			.transition().duration(dur).delay(function(d,i) { return pt.gooeyCode.steps*del + i*del; })
				.attr("cx", 0)
				.attr("cy", 0)
			.call(endall, repeat);			
	};

}//moveOutIn

pt.gooeyCode.rotate = function() {

	if(pt.gooeyCode.fragment !== "rotate") {
		//Hide center circle
		d3.select("#gooeyCode .centerCircle")
			.transition().duration(800)
			.attr("r", 0);

		//Set up the cirlces in the right position
		d3.selectAll("#gooeyCode .flyCircle")
			.transition().duration(800)
			.attr("cy", function(d) { return pt.gooeyCode.xScale(Math.sin(d.fixedAngle)); })
			.attr("cx", function(d) { return pt.gooeyCode.xScale(Math.cos(d.fixedAngle)); })
			.attr("r", function(d) { return d.r; })
			.style("fill", function(d) { return d.color; })
			.each("end", goRound);
	}//if

	pt.gooeyCode.fragment = "rotate";

	//Continuously moves the circles in a circle with different speeds
	function goRound(d) {
		if(pt.gooeyCode.fragment !== "rotate") return;
		d3.select(this)
			.transition().duration(function(d) { return d.speed; })
			.ease("linear")
			.attrTween("transform", function() { return d3.interpolateString("rotate(0)", "rotate(360)"); })
			.each("end", goRound);
	}//function goRound

}//rotate


