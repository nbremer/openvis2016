pt.weatherRadial = pt.weatherRadial || {};

//Turn strings into actual numbers/dates
weatherDaily.forEach(function(d) {
	d.date = parseDate(d.date);
});

pt.weatherRadial.init = function() {
	
	//Remove any existing svgs
	d3.select('#weather-radial #weatherRadial svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 120,
		right: 20,
		bottom: 170,
		left: 20
	};
	var width = $(".slides").width()*0.9 - margin.left - margin.right;
	var height = $(".slides").height()*0.9 - margin.top - margin.bottom;

	//SVG container
	pt.weatherRadial.svg = d3.select('#weather-radial #weatherRadial')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)

	var svg = pt.weatherRadial.svg.append("g")
		.attr("transform", "translate(" + (margin.left + width/2) + "," + margin.top + ")");
	
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Create scales ////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Set the minimum inner radius and max outer radius of the chart
	var	outerRadius = Math.min(width, height)/2,
		innerRadius = outerRadius * 0.4;

	//Base the color scale on average temperature extremes
	var colorScale = d3.scale.linear()
		.domain([-10, 10, 30])
		.range(["#2c7bb6", "#ffff8c", "#d7191c"])
		.interpolate(d3.interpolateHcl);

	//Scale for the heights of the bar, not starting at zero to give the bars an initial offset outward
	var barScale = d3.scale.linear()
		.range([innerRadius, outerRadius])
		.domain([-10,30]); 

	//Scale to turn the date into an angle of 360 degrees in total
	//With the first datapoint (Jan 1st) on top
	var angle = d3.scale.linear()
		.range([-180, 180])
		.domain(d3.extent(weatherDaily, function(d) { return d.date; }));	 

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Create Titles ////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

    //Append title to the top
    svg.append("text")
    	.attr("class", "title")
        .attr("x", -width/2)
        .attr("y", -10)
        .text("Daily Temperatures in New York");
    svg.append("text")
    	.attr("class", "subtitle")
        .attr("x", -width/2)
        .attr("y", 15)
        .text("2015");

    //Append credit at bottom
    svg.append("text")
    	.attr("class", "credit")
        .attr("x", -width/2)
        .attr("y", (2*outerRadius + 130))
        .text("Based on weather-radials.com");

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create Axes /////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Wrapper for the bars and to position it downward
	var barWrapper = svg.append("g")
		.attr("transform", "translate(" + 0 + "," + (outerRadius + 10) + ")");
		
	//Draw gridlines below the bars
 	var axes = barWrapper.selectAll(".gridCircles")
	 	.data([-20,-10,0,10,20,30])
	 	.enter().append("g");
	//Draw the circles
	axes.append("circle")
	 	.attr("class", "axisCircles")
	 	.attr("r", function(d) { return barScale(d); });
	//Draw the axis labels
	axes.append("text")
		.attr("class", "axisText")
		.attr("y", function(d) { return barScale(d); })
		.attr("dy", "0.3em")
		.text(function(d) { return d + "°C"});

	//Add January for reference
	barWrapper.append("text")
		.attr("class", "january")
		.attr("x", 7)
		.attr("y", -outerRadius * 1.1)
		.attr("dy", "0.9em")
		.text("January");
	//Add a line to split the year
	barWrapper.append("line")
		.attr("class", "yearLine")
		.attr("x1", 0)
		.attr("y1", -outerRadius * 0.9)
		.attr("x2", 0)
		.attr("y2", -outerRadius * 1.1);

	///////////////////////////////////////////////////////////////////////////
	////////////////////////////// Draw bars //////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Draw a bar per day were the height is the difference between the minimum and maximum temperature
	//And the color is based on the mean temperature
 	barWrapper.selectAll(".tempBar")
	 	.data(weatherDaily)
	 	.enter().append("rect")
	 	.attr("class", "tempBar")
	 	.attr("transform", function(d,i) { return "rotate(" + (angle(d.date)) + ")"; })
	 	.attr("width", 2.5)
	 	.attr("rx", 1.25)
		.attr("height", function(d,i) { return barScale(d.max_temp) - barScale(d.min_temp); })
	 	.attr("x", -0.75)
	 	.attr("y", function(d,i) {return barScale(d.min_temp); })
	 	.style("fill", function(d) { return colorScale(d.mean_temp); });
		
	///////////////////////////////////////////////////////////////////////////
	//////////////// Create the gradient for the legend ///////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Extra scale since the color scale is interpolated
	var tempScale = d3.scale.linear()
		.domain([-10, 30])
		.range([0, width]);

	//Calculate the variables for the temp gradient
	var numStops = 10;
	tempRange = tempScale.domain();
	tempRange[2] = tempRange[1] - tempRange[0];
	tempPoint = [];
	for(var i = 0; i < numStops; i++) {
		tempPoint.push(i * tempRange[2]/(numStops-1) + tempRange[0]);
	}//for i

	//Create the gradient
	svg.append("defs")
		.append("linearGradient")
		.attr("id", "legend-weather")
		.attr("x1", "0%").attr("y1", "0%")
		.attr("x2", "100%").attr("y2", "0%")
		.selectAll("stop") 
		.data(d3.range(numStops))                
		.enter().append("stop") 
		.attr("offset", function(d,i) { return tempScale( tempPoint[i] )/width; })   
		.attr("stop-color", function(d,i) { return colorScale( tempPoint[i] ); });

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Draw the legend ////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var legendWidth = width*0.25;
	//Color Legend container
	var legendsvg = svg.append("g")
		.attr("class", "legendWrapper")
		.attr("transform", "translate(" + 0 + "," + (2*outerRadius + 110) + ")");

	//Draw the Rectangle
	legendsvg.append("rect")
		.attr("class", "legendRect")
		.attr("x", -legendWidth/2)
		.attr("y", 0)
		//.attr("rx", 8/2)
		.attr("width", legendWidth)
		.attr("height", 8)
		.style("fill", "url(#legend-weather)");
		
	//Append title
	legendsvg.append("text")
		.attr("class", "legendTitle")
		.attr("x", 0)
		.attr("y", -14)
		.style("text-anchor", "middle")
		.text("Average Daily Temperature");

	//Set scale for x-axis
	var xScale = d3.scale.linear()
		 .range([-legendWidth/2, legendWidth/2])
		 .domain([-10,30] );

	//Define x-axis
	var xAxis = d3.svg.axis()
		  .orient("bottom")
		  .ticks(5)
		  .tickFormat(function(d) { return d + "°C"; })
		  .scale(xScale);

	//Set up X axis
	legendsvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (10) + ")")
		.call(xAxis);

}//init

