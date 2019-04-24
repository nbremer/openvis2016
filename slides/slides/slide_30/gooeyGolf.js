pt.gooeyGolf = pt.gooeyGolf || {};

pt.gooeyGolf.init = function() {
	
	//Remove any existing svgs
	d3.select('#gooey-golf #gooeyGolf svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin  = {
		top: 20,
		right: 60,
		bottom: 20,
		left: 60
	};

	var width = $(".slides").width()*0.7 - margin.left - margin.right;
	var height = 150;

	//SVG container
	pt.gooeyGolf.svg = d3.select('#gooey-golf #gooeyGolf')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + (margin.top + height/2) + ")");

	pt.gooeyGolf.data = [];
	pt.gooeyGolf.numSwings = 0;

 	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// SVG Filter //////////////////////////////////
	///////////////////////////////////////////////////////////////////////////       

	//SVG filter for the gooey effect
	//Code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
	var defs = pt.gooeyGolf.svg.append("defs");
	var filter = defs.append("filter").attr("id","gooeyGolfFilter"); //Give this a truly unique unique ID otherwise Firefox will not show anything
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
	filter.append("feBlend")
		.attr("in","SourceGraphic")
		.attr("in2","gooey");

 	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Set-up Chart /////////////////////////////////
	/////////////////////////////////////////////////////////////////////////// 
		
	//Create axes for the Ball Speed chart
	pt.gooeyGolf.ballSpeedScale = d3.scale.linear()
		.domain([0, 160])
		.range([0, width]);
	pt.gooeyGolf.ballSpeedAxis = d3.svg.axis()
		.scale(pt.gooeyGolf.ballSpeedScale)
		.orient("bottom")
		.tickSize(8)
		.outerTickSize(0)
		.tickFormat(d3.format("d"));
		
	//Append x axis to chart
	pt.gooeyGolf.svg.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate(0," + 50 + ")")
	  .call(pt.gooeyGolf.ballSpeedAxis);

	//Outer wrapper for the circles
	pt.gooeyGolf.ballOuterWrapper = pt.gooeyGolf.svg.append("g")
	  .attr("class", "ballOuterWrapper");
	  
	//Append circle at starting point
	pt.gooeyGolf.ballOuterWrapper.append("circle")
			.attr("class", "startCircle")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", 0)
			.style("fill", "#81BC00");

}//init

pt.gooeyGolf.swingSimple = function() {

	//Remove previous circles
	d3.selectAll("#gooeyGolf .ballSpeedCircle")
		.transition().duration(500)
		.attr("r", 0)
		.remove();

	//Clear previous intervals
	clearInterval(pt.gooeyGolf.swingInterval);
	pt.gooeyGolf.data = [];
	pt.gooeyGolf.numSwings = 0;

	//Hide starting circle
	d3.select("#gooeyGolf .startCircle")
		.transition().duration(1000)
		.attr("r", 0);

	setTimeout(function() {

		swingSimple(pt.gooeyGolf.numSwings); 
		pt.gooeyGolf.numSwings++; 

		pt.gooeyGolf.swingInterval = setInterval( function () { 
			swingSimple(pt.gooeyGolf.numSwings);
			pt.gooeyGolf.numSwings++;  
		}, 1500);

	}, 700);

	function swingSimple(numSwings) {

		var ballSpeedDelay = 0,
			ballSpeedDuration = 1000,
			meanBallSpeed = 160;

		//Add a new datapoint
		pt.gooeyGolf.data.push({
	        BallSpeed: rnd2() * 60 + meanBallSpeed,
	        id: numSwings
		});
		var index = pt.gooeyGolf.data.length-1;

		//Updates scale
		pt.gooeyGolf.ballSpeedScale.domain([0, Math.max(meanBallSpeed, d3.max(pt.gooeyGolf.data, function(d) { return d.BallSpeed; }))*1.2]);
		//Update the x axis
		pt.gooeyGolf.ballSpeedAxis.scale(pt.gooeyGolf.ballSpeedScale);
		pt.gooeyGolf.svg.select(".x.axis")
			.transition().duration(ballSpeedDuration).delay(ballSpeedDelay)
			.call(pt.gooeyGolf.ballSpeedAxis);
		
	  	//DATA JOIN
		//Join new data with old elements, if any
		var ballSpeedWrapper = pt.gooeyGolf.ballOuterWrapper.selectAll(".ballSpeedCircle")
			.data(pt.gooeyGolf.data, function(d) { return d.id; });
	  
		//UPDATE
		ballSpeedWrapper
			.transition().duration(ballSpeedDuration).delay(ballSpeedDelay)
				.style("opacity", 0.5)
				.attr("r", 6)
				.attr("cx", function(d) { return pt.gooeyGolf.ballSpeedScale(d.BallSpeed); });	
	
		//ENTER 
		ballSpeedWrapper
			.enter().append("circle")
				.attr("class", "ballSpeedCircle")
				.attr("cx", function(d) { return pt.gooeyGolf.ballSpeedScale(d.BallSpeed); })
				.attr("cy", 0)
				.attr("r", 0)
				.style("fill", "#81BC00")
				.transition().duration(1000)
				.attr("r", 15);
				
		//EXIT
		ballSpeedWrapper.exit().remove();	
		
	}//swingSimple

}//swingSimple

pt.gooeyGolf.swingFly = function() {

	//Remove previous circles
	d3.selectAll("#gooeyGolf .ballSpeedCircle")
		.transition().duration(500)
		.attr("r", 0)
		.remove();

	//Clear previous intervals
	clearInterval(pt.gooeyGolf.swingInterval);
	pt.gooeyGolf.data = [];
	pt.gooeyGolf.numSwings = 0;

	//Show starting circle
	d3.select("#gooeyGolf .startCircle")
		.transition().duration(1000)
		.attr("r", 20);

	//Remove gooey filter
	pt.gooeyGolf.ballOuterWrapper.style("filter", "none");

	setTimeout(function() {

		swingFly(pt.gooeyGolf.numSwings); 
		pt.gooeyGolf.numSwings++; 

		pt.gooeyGolf.swingInterval = setInterval( function () {
			swingFly(pt.gooeyGolf.numSwings); 
			pt.gooeyGolf.numSwings++;  
		}, 1500);

	}, 700);

	function swingFly(numSwings) {

		var ballSpeedDelay = 0,
			ballSpeedDuration = 1500,
			meanBallSpeed = 160;

		//Add a new datapoint
		pt.gooeyGolf.data.push({
	        BallSpeed: rnd2() * 40 + meanBallSpeed,
	        id: numSwings
		});
		var index = pt.gooeyGolf.data.length-1;

		//Updates scale
		pt.gooeyGolf.ballSpeedScale.domain([0, Math.max(meanBallSpeed, d3.max(pt.gooeyGolf.data, function(d) { return d.BallSpeed; }))*1.2]);
		//Update the x axis
		pt.gooeyGolf.ballSpeedAxis.scale(pt.gooeyGolf.ballSpeedScale);
		pt.gooeyGolf.svg.select(".x.axis")
			.transition().duration(ballSpeedDuration)
			.call(pt.gooeyGolf.ballSpeedAxis);
		
	  	//DATA JOIN
		//Join new data with old elements, if any
		var ballSpeedWrapper = pt.gooeyGolf.ballOuterWrapper.selectAll(".ballSpeedCircle")
			.data(pt.gooeyGolf.data, function(d) { return d.id; });
	  
		//UPDATE
		ballSpeedWrapper
			.transition().duration(ballSpeedDuration)
				.style("opacity", 0.5)
				.attr("r", 6)
				.attr("cx", function(d) { return pt.gooeyGolf.ballSpeedScale(d.BallSpeed); });	
	
		//ENTER 
		ballSpeedWrapper
			.enter().append("circle")
				.attr("class", "ballSpeedCircle")
				.attr("cx", 0)
				.attr("cy", 0)
				.attr("r", 15)
				.style("fill", "#81BC00")
				.transition().duration(ballSpeedDuration)
				.attr("cx", function(d) { return pt.gooeyGolf.ballSpeedScale(d.BallSpeed); });

		//EXIT
		ballSpeedWrapper.exit().remove();	
		
	}//swing

}//swingfly

pt.gooeyGolf.swingFinal = function() {

	//Remove previous circles
	d3.selectAll("#gooeyGolf .ballSpeedCircle")
		.transition().duration(500)
		.attr("r", 0)
		.remove();

	//Clear previous intervals
	clearInterval(pt.gooeyGolf.swingInterval);
	pt.gooeyGolf.data = [];
	pt.gooeyGolf.numSwings = 0;

	//Show starting circle
	d3.select("#gooeyGolf .startCircle")
		.transition().duration(1000)
		.attr("r", 15);

	//Set gooey filter
	pt.gooeyGolf.ballOuterWrapper.style("filter", "url(#gooeyGolfFilter)");

	setTimeout(function() {

		swingFinal(pt.gooeyGolf.numSwings); 
		pt.gooeyGolf.numSwings++; 

		pt.gooeyGolf.swingInterval = setInterval( function () {
			swingFinal(pt.gooeyGolf.numSwings);  
			pt.gooeyGolf.numSwings++; 
		}, 3000);

	}, 700);
	
	function swingFinal(numSwings) {

		var ballSpeedDelay = 1000,
			ballSpeedDuration = 2000,
			meanBallSpeed = 160;

		//Add a new datapoint
		pt.gooeyGolf.data.push({
	        BallSpeed: rnd2() * 40 + meanBallSpeed,
	        id: numSwings
		});
		var index = pt.gooeyGolf.data.length-1;

		//Updates scale
		pt.gooeyGolf.ballSpeedScale.domain([0, Math.max(meanBallSpeed, d3.max(pt.gooeyGolf.data, function(d) { return d.BallSpeed; }))*1.2]);
		//Update the x axis
		pt.gooeyGolf.ballSpeedAxis.scale(pt.gooeyGolf.ballSpeedScale);
		pt.gooeyGolf.svg.select(".x.axis")
			.transition().duration(ballSpeedDuration).delay(ballSpeedDelay)
			.call(pt.gooeyGolf.ballSpeedAxis);
	
		//Increase size of circle at 0,0 (then the swing is "ejected" and then decrease size again
		pt.gooeyGolf.ballOuterWrapper.select(".startCircle")
			.transition("startCircleGrow").duration(1000)
			.delay((ballSpeedDelay-1000))
			.attr("r", 40)
			.transition("startCircleBounce").duration(ballSpeedDuration*1.5)
			.delay((ballSpeedDelay+400)).ease("elastic")
			.attr("r", 15);
		
	  	//DATA JOIN
		//Join new data with old elements, if any
		var ballSpeedWrapper = pt.gooeyGolf.ballOuterWrapper.selectAll(".ballSpeedCircle")
			.data(pt.gooeyGolf.data, function(d) { return d.id; });
	  
		//UPDATE
		ballSpeedWrapper
			.transition().duration(ballSpeedDuration).delay(ballSpeedDelay)
				.style("opacity", 0.5)
				.attr("r", 6)
				.attr("cx", function(d) { return pt.gooeyGolf.ballSpeedScale(d.BallSpeed); });	
	
		//ENTER 
		ballSpeedWrapper
			.enter().append("circle")
				.attr("class", "ballSpeedCircle")
				.attr("cx", 0)
				.attr("cy", 0)
				.attr("r", 0)
				.style("fill", "#81BC00")
				.transition().duration(1000).delay((ballSpeedDelay-1000))
				.attr("r", 25)
				.transition().duration(ballSpeedDuration)
				.attr("r", 15)
				.attr("cx", function(d) { return pt.gooeyGolf.ballSpeedScale(d.BallSpeed); });

		//EXIT
		ballSpeedWrapper.exit().remove();	
		
	}//swingFinal

}//swingFinal

