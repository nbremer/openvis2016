pt.starsHRDiagram = pt.starsHRDiagram || {};

pt.starsHRDiagram.svg = null;

pt.starsHRDiagram.init = function(stars) {

	//Remove any existing svgs
	d3.select("#stars-hr-diagram #starsHRDiagram svg").remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	pt.starsHRDiagram.margin = {
		top: 40,
		right: 450,
		bottom: 80,
		left: 610
	};
	pt.starsHRDiagram.height = $(".slides").height()*0.95 - pt.starsHRDiagram.margin.top - pt.starsHRDiagram.margin.bottom;
	//	pt.starsHRDiagram.width = $(".slides").width() - pt.starsHRDiagram.margin.left - pt.starsHRDiagram.margin.right;
	pt.starsHRDiagram.width = $(".slides").width()*0.9 - pt.starsHRDiagram.margin.left - pt.starsHRDiagram.margin.right;

	var width = pt.starsHRDiagram.width,
		height = pt.starsHRDiagram.height,
		margin = pt.starsHRDiagram.margin;

	//SVG container
	pt.starsHRDiagram.svg = d3.select('#stars-hr-diagram #starsHRDiagram')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

	pt.starsHRDiagram.placeStars(stars);

}//init

pt.starsHRDiagram.placeStars = function(stars) {

	//var stars = _.sample(stars, 400);

	var width = pt.starsHRDiagram.width,
		height = pt.starsHRDiagram.height,
		margin = pt.starsHRDiagram.margin;

	pt.starsHRDiagram.absMagSun = 4.83,
	pt.starsHRDiagram.tempSun = 5800;

	var svg = pt.starsHRDiagram.svg.append("g")
		.attr("class", "svgWrapper")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Create color scale /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Create color gradient for planets based on the temperature of the star that they orbit
	var colors = ["#FB1108","#FD150B","#FA7806","#FBE426","#FCFB8F","#F3F5E7","#C7E4EA","#ABD6E6","#9AD2E1","#42A1C1","#1C5FA5", "#172484"];
	var temps = [2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 14000, 20000, 30000];
	pt.starsHRDiagram.colorScale = d3.scale.linear()
		  .domain(temps)
		  .range(colors);
	var colorScale = pt.starsHRDiagram.colorScale;

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Create Titles ////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var textWrapper = svg.append("g")
		.attr("class", "textWrapper")
		.attr("transform", "translate(" + (-margin.left + 20) + ",0)");

    //Append title to the top
    textWrapper.append("text")
    	.attr("class", "title")
        .attr("x", 0)
        .attr("y", 15)
        .text("Our nearest Stars");
    textWrapper.append("text")
    	.attr("class", "subtitle")
        .attr("x", 0)
        .attr("y", 40)
        .text("In a Hertzsprung-Russell diagram");

    //Append credit at bottom
    textWrapper.append("text")
    	.attr("class", "credit")
        .attr("x", 0)
        .attr("y", height + 45)
        .text("Data sampled from HYG database");

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Create axis scales /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	function BVtoTemp(d) {
		return 4600*(1/(0.92*d + 1.7) + 1/(0.92*d + 0.62));
	}

	function magToLum(d) {
		return Math.pow(10,0.4*(pt.starsHRDiagram.absMagSun - d));
	}

	var axisGroup = svg.append("g").attr("class", "axisWrapper");

	var BVmin = -0.3, BVmax = 2.2;
	// var BVScale = d3.scale.linear()
	// 	.range([0, width])
	// 	//.domain(d3.extent(stars, function(d) { return d.BV; }) )
	// 	.domain([BVmin, BVmax]);

	pt.starsHRDiagram.tempScale = d3.scale.log()
		.range([0, width])
		//.domain(d3.extent(stars, function(d) { return d.temp; }) );
		.domain([BVtoTemp(BVmin), BVtoTemp(BVmax)]);

	var absMagMin = -11, absMagMax = 16;
	// var absMagScale = d3.scale.linear()
	// 	.range([0, height])
	// 	//.domain(d3.extent(stars, function(d) { return d.absMag; }) )
	// 	.domain([absMagMin, absMagMax])
	// 	.nice();

	pt.starsHRDiagram.lumScale = d3.scale.log()
		.range([0, height])
		.domain([ magToLum(absMagMin), magToLum(absMagMax) ]);

	//Set scale for radius of circles
	pt.starsHRDiagram.rScale = d3.scale.sqrt()
		.range([2, 40])
		//.domain(d3.extent(stars, function(d) { return d.radiusSun; }))
		.domain( [0.005, 300]);

	pt.starsHRDiagram.rScaleLinear = d3.scale.linear()
		.range([0, 300])
		.domain([0, d3.max(stars, function(d) { return d.radiusSun; })] );

    //Define the axes
    var xAxisBottom = d3.svg.axis()
        .scale(pt.starsHRDiagram.tempScale)
        .orient("bottom")
        .tickFormat(d3.format(".0f"))
        .outerTickSize(0)
        .ticks(3);
	//Add the X bottom Axis
    axisGroup.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisBottom);
    //Append x-axis bottom title
    axisGroup.append("text")
    	.attr("class", "axisTitle")
    	.attr("x", width/2)
    	.attr("y", height + 48)
    	.text("Temperature");
    axisGroup.append("text")
    	.attr("class", "axisSubtitle")
    	.attr("x", width/2)
    	.attr("y", height + 67)
    	.text("in Kelvin");

    // var xAxisTop = d3.svg.axis()
    //     .scale(xScale)
    //     .orient("top")
    //     .ticks(5);
    // //Add the X top Axis
    // svg.append("g")
    //     .attr("class", "x axis")
    //     .attr("transform", "translate(0," + 0 + ")")
    //     .call(xAxisTop); 
    // //Append x-axis top title
    // svg.append("text")
    // 	.attr("class", "axisTitle")
    // 	.attr("x", width/2)
    // 	.attr("y", -30)
    // 	.text("B-V (color)");

  	//Define the Y axis
    var yAxis = d3.svg.axis()
        .scale(pt.starsHRDiagram.lumScale)
        .orient("left")
        .outerTickSize(0);

	function powerOfTen(d) {
	  return d / Math.pow(10, Math.ceil(Math.log(d) / Math.LN10 - 1e-12)) === 1;
	}

    //Add the Y Axis with very specific tick values
    var axisTicks = [0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000, 100000, 1000000],
    	axisTicksText = [0.0001, 0.001, 0.01, 0.1, 1, 10, 100, "1,000", "10,000", "100,000", "1,000,000"];
    axisGroup.append("g")
        .attr("class", "y axis")
        .call(yAxis)
       	.selectAll(".tick text")
		.text(null)
		.filter(powerOfTen)
		.text(function(d,i) { 
			return axisTicksText[_.findIndex(axisTicks, function(num){ return num == d; })];
		});

	//Hide all the sub tick marks
	d3.selectAll(".y .tick line")
		.style("opacity", 0)
		.filter(powerOfTen)
		.style("opacity", function(d,i) { 
			return ( _.find(axisTicks, function(num){ return num == d; }) >= 0 ? 1 : 0);
		});

	//Append y-axis title
    axisGroup.append("text")
    	.attr("class", "axisTitle")
    	.attr("x", -110)
    	.attr("y", height/2)
    	.text("Luminosity");
    axisGroup.append("text")
    	.attr("class", "axisSubtitle")
    	.attr("x", -110)
    	.attr("y", height/2+21)
    	.text("compared to the Sun");

    // //Right y-axis
    // var yAxisRight = d3.svg.axis()
    //     .scale(yScale)
    //     .orient("right")
    //     .outerTickSize(0);
    // //Add axis
    // axisGroup.append("g")
    //     .attr("class", "y axis")
    //     .attr("transform", "translate(" + width + ",0)")
    //     .call(yAxisRight);

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create gradient /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var defsContainer = svg.append("defs");

	//Calculate the variables for the temp gradient
	var numStops = 10;
	tempRange = pt.starsHRDiagram.tempScale.domain(); //d3.extent(stars, function(d) { return d.BV; });
	tempRange[2] = tempRange[0] - tempRange[1];
	tempPoint = [];
	for(var i = 0; i < numStops; i++) {
		tempPoint.push(i * tempRange[2]/(numStops-1) + tempRange[1]);
	}
	tempPoint = tempPoint.reverse();

	//Create the gradient for the colored temp bar at the bottom axis
	defsContainer.append("linearGradient")
		.attr("id", "gradientTemp")
		.attr("x1", "0%").attr("y1", "0%")
		.attr("x2", "100%").attr("y2", "0%")
		.selectAll("stop") 
		.data(d3.range(numStops))                
		.enter().append("stop") 
		.attr("offset", function(d,i) { 
			return pt.starsHRDiagram.tempScale(tempPoint[i])/width;
		})   
		.attr("stop-color", function(d,i) { 
			return colorScale( tempPoint[i] ); 
		});

	//Filter for the outside glow of the Sun
	var filter = defsContainer.append('filter').attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
		feMerge = filter.append('feMerge');
		feMerge.append('feMergeNode').attr('in','coloredBlur');
		feMerge.append('feMergeNode').attr('in','SourceGraphic');

	//Create data based gradients for each planet
	var gradientCenter = defsContainer.selectAll(".gradientCenter")
		.data(stars).enter()
		.append("radialGradient")
		.attr("class", "gradientCenter")
		.attr('id', function(d,i){ return "gradCenter-"+i; })
	gradientCenter.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", function(d) {return d3.rgb(colorScale(d.temp)).brighter(1.75);});
	gradientCenter.append("stop")
		.attr("offset", "60%")
		.attr("stop-color", function(d) {return d3.rgb(colorScale(d.temp)).brighter(0.7);});
	gradientCenter.append("stop")
		.attr("offset", "90%")
		.attr("stop-color", function(d) {return colorScale(d.temp);}); 
	gradientCenter.append("stop")
		.attr("offset",  "110%")
		.attr("stop-color", function(d) {return d3.rgb(colorScale(d.temp)).darker(0.5);});

	var gradientOffset = defsContainer.selectAll(".gradientOffset")
		.data(stars).enter()
		.append("radialGradient")
		.attr("class", "gradientOffset")
		.attr("cx", "25%")
		.attr("cy", "25%")
		.attr("r", "65%")
		.attr("id", function(d,i){ return "gradOffset-"+i; })
	gradientOffset.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", function(d) {return d3.rgb(colorScale(d.temp)).brighter(1);});
	gradientOffset.append("stop")
		.attr("offset", "40%")
		.attr("stop-color", function(d) {return colorScale(d.temp);}); 
	gradientOffset.append("stop")
		.attr("offset",  "100%")
		.attr("stop-color", function(d) {return d3.rgb(colorScale(d.temp)).darker(1.5);});

	///////////////////////////////////////////////////////////////////////////
	////////////////////////////// Plot the stars /////////////////////////////
	///////////////////////////////////////////////////////////////////////////

  	//Append temperature colored rect
	axisGroup.append("rect")
		.attr("width", width)
		.attr("height", 5)
		.attr("x", -1)
		.attr("y", height - 4)
		.style("fill", "url(#gradientTemp)");

	//Drawing the planets (in their circular orbits, not elliptical)			
	var starContainer = svg.append("g").attr("class","starContainer");

	//Draw the stars
	pt.starsHRDiagram.stars = starContainer.selectAll(".star")
		.data(stars).enter()				
		.append("circle")
		.attr("class", "star")
		.attr("r", 0)
		.attr("cx", function(d) { return pt.starsHRDiagram.tempScale(d.temp); })
		.attr("cy", function(d) {return pt.starsHRDiagram.lumScale(d.lum); })
		.style("opacity", 0.9)
		.style("fill", function(d,i){return "url(#gradOffset-" + i + ")";});

	//Place marker for the Sun
	starContainer.append("circle")
		.attr("class", "sunIndicator")
		.attr("r", 0)
		.attr("cx", function(d) { return pt.starsHRDiagram.tempScale(pt.starsHRDiagram.tempSun); })
		.attr("cy", function(d) { return pt.starsHRDiagram.lumScale(1); })
		.style("fill", "none")
		.style("stroke", "#fa4f06")
		.style("stroke-width", 4)

}//placeStars

pt.starsHRDiagram.readableSize = function() {

	//Remove Sun indicator (in case you move backwards)
	d3.selectAll("#starsHRDiagram .sunIndicator")
		.transition().duration(1000)
		.attr("r", 0);

	//Update the radii
	d3.selectAll("#starsHRDiagram .star")
		.transition().duration(1000)
		.attr("r", function(d) {return pt.starsHRDiagram.rScale(d.radiusSun); });

}//trueSize

pt.starsHRDiagram.placeSun = function() {

	//Update the radii (in case you move backward)
	d3.selectAll("#starsHRDiagram .star")
		.transition().duration(1000)
		.attr("r", function(d) {return pt.starsHRDiagram.rScale(d.radiusSun); });

	d3.selectAll("#starsHRDiagram .sunIndicator")
		.transition().duration(1000)
		.attr("r", 45)
		.transition().duration(750)
		.attr("r", 14);

}//trueSize

pt.starsHRDiagram.trueSize = function() {

	//Set back the filter (in case you move backwards)
	d3.selectAll("#starsHRDiagram .star")
		.style("filter", "none")
		.style("fill", function(d,i){return "url(#gradOffset-" + i + ")";});

	//Change the radius to actual sizes
	d3.selectAll("#starsHRDiagram .star")
		.transition().duration(1000)
		.attr("r", function(d) {return pt.starsHRDiagram.rScaleLinear(d.radiusSun); });

}//trueSize

pt.starsHRDiagram.glow = function() {

	d3.selectAll("#starsHRDiagram .star")
		.transition().duration(1000)
		.attr("r", 0)
		.call(endall, function() {
			d3.selectAll("#starsHRDiagram .star")
				.style("filter", "url(#glow)")
				.style("fill", function(d,i){return "url(#gradCenter-" + i + ")";})
				.transition().duration(1000)
				.attr("r", function(d) { return pt.starsHRDiagram.rScale(d.radiusSun); });
		});

}//trueSize