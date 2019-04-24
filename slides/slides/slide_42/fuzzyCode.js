pt.fuzzyCode = pt.fuzzyCode || {};

pt.fuzzyCode.init = function() {
	
	//Remove any existing svgs
	d3.select('#fuzzy-code #fuzzyCode svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 280,
		right: 10,
		bottom: 220,
		left: 10
	};

	var width = $(".slides").width()*0.9 - margin.left - margin.right,
		height = 400;
	pt.fuzzyCode.height = height;

	//SVG container
	pt.fuzzyCode.svg = d3.select("#fuzzy-code #fuzzyCode")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.fuzzyCode.svg.append("g")
		//.style("filter", "url(#fuzzy)")
		.attr("transform", "translate(" + (width/2 + margin.left) + "," +(height/2 +  margin.top) + ")");

	var color = "#F92672";

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////////// Create Data //////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Create the circles that will move out and in the center circle
	pt.fuzzyCode.steps = 15;
	var flyCircleData = [];
	for (var i = 0; i < pt.fuzzyCode.steps; i++) {
		flyCircleData.push({ 
			id: i,
			fixedAngle: (i/pt.fuzzyCode.steps)*(2*Math.PI)
		})
	}//for i

	///////////////////////////////////////////////////////////////////////////
	/////////////////////// Create motion blur filter /////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//SVG filter for the motion blur effect
	//Code based on http://tympanus.net/codrops/2015/04/08/motion-blur-effect-svg/
	var defs = svg.append("defs");
	
	//Create a filter for the static example circles at the start
	var fuzzRanges = [0,2,4,6,8];
	defs.selectAll(".exampleFilters")
		.data(fuzzRanges)
		.enter().append("filter")
		.attr("class", "exampleFilters")
		.attr("id",function(d,i) { return "fuzzy-range-"+i; })
		.attr("width", "300%")	//increase the width of the filter region to remove blur "boundary"
		.attr("x", "-100%") //make sure the center of the "width" lies in the middle
		.attr("height", "150%")
		.attr("y", "-25%")
		.attr("color-interpolation-filters","sRGB") //to fix safari: http://stackoverflow.com/questions/24295043/svg-gaussian-blur-in-safari-unexpectedly-lightens-image
		.append("feGaussianBlur")
		.attr("in","SourceGraphic")
		.attr("stdDeviation",function(d) { return d + ",0"; });

	//Create a filter per circle so we can adjust the fuzzyness per circle that is flying out
	defs.selectAll(".flyCircleFilters")
		.data(flyCircleData)
		.enter().append("filter")
		.attr("class", "flyCircleFilters")
		.attr("id",function(d,i) { return "fuzzy-"+i; })
		.attr("width", "300%")	//increase the width of the filter region to remove blur "boundary"
		.attr("x", "-100%") //make sure the center of the "width" lies in the middle
		.attr("height", "200%")
		.attr("y", "-50%")
		.attr("color-interpolation-filters","sRGB") //to fix safari: http://stackoverflow.com/questions/24295043/svg-gaussian-blur-in-safari-unexpectedly-lightens-image
		.append("feGaussianBlur")
		.attr("class", "blurValues")
		.attr("in","SourceGraphic")
		.attr("stdDeviation","0,0");

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Create example circles //////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Create set of example circles along a vertical with increasing motion blur applied
	var exampleCircleWrapper = svg.append("g").attr("class", "exampleCirclerWapper");
	var exampleCircles = exampleCircleWrapper.selectAll(".rangeExamples")
		.data(fuzzRanges)
		.enter().append("circle")
		.attr("class", "rangeExamples")
		.attr("cy", function(d,i) { return -height*0.8/2 + i*height*0.8/(fuzzRanges.length-1); })
		.attr("r", 16)
		.style("fill", color)
		.style("filter", function(d,i) { return "url(#fuzzy-range-" + i + ")"; });

	///////////////////////////////////////////////////////////////////////////
	//////////////////////// Create fly out circles ///////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var circleWrapper = svg.append("g")
		.attr("class", "circleWrapper")
		.style("opacity", 0);

	//Title on top
    circleWrapper.append("text")
    	.attr("class", "title")
        .attr("x", 0)
        .attr("y", -height/2 - 60)
        .style("text-anchor", "middle")
        .text("With motion blur filter");

	//Since we can only do a blur in the x and y direction the group should be rotated
	//so the coordinated system turns along with the direction the circle
	//will be flying out from
	pt.fuzzyCode.flyCircles = circleWrapper.selectAll(".flyCircle")
		.data(flyCircleData)
		.enter().append("circle")
		.attr("class", "flyCircle")
		.attr("transform", function(d,i) { return "rotate(" + (d.fixedAngle*180/Math.PI - 90) + ")"; })
		.attr("cx", 0)
		.attr("cy", 0)
		.attr("r", 12)
		.style("fill", color)
		.style("filter", function(d,i) { return "url(#fuzzy-"+i+")"; });

	//Append circle at center
	circleWrapper.append("circle")
			.attr("class", "centerCircle")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", 25)
			.style("fill", color);

	//Start the animation
	//pt.fuzzyCode.repeat();

	pt.fuzzyCode.previousStep = "showExample";
	pt.fuzzyCode.direction = "backward";

}//init

pt.fuzzyCode.showExample = function() {

	//Show the example circles
	d3.selectAll("#fuzzyCode .exampleCirclerWapper")
		.transition().duration(500)
		.style("opacity", 1);

	//Hide the fly out circles
	d3.selectAll("#fuzzyCode .circleWrapper")
		.transition().duration(500)
		.style("opacity", 0);

	d3.selectAll("#fuzzyCode .blurValues")
		.transition().duration(0);
	d3.selectAll("#fuzzyCode .flyCircle")
		.transition("flyOut").duration(0)
		.attr("cx", 0);

	pt.fuzzyCode.direction = "forward";
	pt.fuzzyCode.previousStep = "showExample";

}//showExample

pt.fuzzyCode.noFuzzy = function() {

	if(pt.fuzzyCode.previousStep === "showExample") pt.fuzzyCode.repeat();

	//Hide the example circles
	d3.selectAll("#fuzzyCode .exampleCirclerWapper")
		.transition().duration(500)
		.style("opacity", 0);

	//Show the fly out circles
	d3.selectAll("#fuzzyCode .circleWrapper")
		.transition("changeOpacity").duration(500).delay(500)
		.style("opacity", 1);

	//Change title
	d3.selectAll("#fuzzyCode .title")
        .text("Without motion blur filter");

	//Remove filter from the circle wrapper
	d3.selectAll("#fuzzyCode .flyCircle")
		.style("filter", "none");

	pt.fuzzyCode.previousStep = "noFuzzyFilter";

}//noFuzzy

pt.fuzzyCode.fuzzy = function() {

	if(pt.fuzzyCode.direction === "backward") {
		//Negate what was still happening (I hope)
		d3.selectAll("#fuzzyCode .blurValues")
			.transition().duration(0);
		d3.selectAll("#fuzzyCode .flyCircle")
			.transition("flyOut").duration(0)
			.attr("cx", 0);

		pt.fuzzyCode.repeat();
	}//if

	//Hide the example circles (in case you move backward)
	d3.selectAll("#fuzzyCode .exampleCirclerWapper")
		.transition().duration(500)
		.style("opacity", 0);

	//Show the fly out circles (in case you move backward)
	d3.selectAll("#fuzzyCode .circleWrapper")
		.transition("changeOpacity").duration(500)
		.style("opacity", 1);

	//Change title
	d3.selectAll("#fuzzyCode .title")
        .text("With motion blur filter");

	//Put filter back on circle wrappers
	d3.selectAll("#fuzzyCode .flyCircle")
		.style("filter", function(d,i) { return "url(#fuzzy-"+i+")"; });

	pt.fuzzyCode.previousStep = "fuzzyFilter";

}//fuzzy

//Continuously moves the circles outward and inward	
pt.fuzzyCode.repeat = function() {

	if(pt.fuzzyCode.action === "showExample") {
		d3.selectAll("#fuzzyCode .blurValues")
			.transition().duration(0);
		d3.selectAll("#fuzzyCode .flyCircle")
			.transition("flyOut").duration(0)
			.attr("cx", 0);
		return;
	}//if

	var dur = 1000,
		del = 500;	
	
	//Interpolate the motion blur settings
	d3.selectAll("#fuzzyCode .blurValues")
		.transition().duration(dur*0.1)
		.delay(function(d,i) { return i*del; })
		.attrTween("stdDeviation", function() { return d3.interpolateString("0.1 0", "9 0"); })
		.transition().duration(dur*0.2)
		.attrTween("stdDeviation", function() { return d3.interpolateString("9 0", "0.1 0"); })
		.transition().duration(dur*0.4) //Another one for the circles moving back in
		.delay(function(d,i) { return pt.fuzzyCode.steps*del + i*del; })
		.attrTween("stdDeviation", function() { return d3.interpolateString("0.1 0", "9 0"); })
		.transition().duration(dur*0.3)
		.attrTween("stdDeviation", function() { return d3.interpolateString("9 0", "0.1 0"); });
				  
	//Move circles in an out
	d3.selectAll("#fuzzyCode .flyCircle")
		.transition("flyOut").duration(dur)
		.delay(function(d,i) { return d.id*del; })
		.ease("elastic")
		.attr("cx", pt.fuzzyCode.height/2*0.8 )
		.transition("flyIn").duration(dur/3)
		.delay(function(d,i) { return pt.fuzzyCode.steps*del + d.id*del; })
		.ease("exp")
		.attr("cx", 0)
		.call(endall, pt.fuzzyCode.repeat);

}//repeat
