pt.trafficAccidents = pt.trafficAccidents || {};

pt.trafficAccidents.init = function() {
	
	//Remove any existing svgs
	d3.select('#traffic-accidents #trafficAccidents svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	pt.trafficAccidents.days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
   	pt.trafficAccidents.times = d3.range(24);

	pt.trafficAccidents.margin = {
		top: 170,
		right: 40,
		bottom: 70,
		left: 40
	};
	var margin = pt.trafficAccidents.margin;

	pt.trafficAccidents.width = $(".slides").width()*0.9 - margin.left - margin.right;
	var width = pt.trafficAccidents.width;

	pt.trafficAccidents.gridSize = Math.floor(width / pt.trafficAccidents.times.length);

	var height = pt.trafficAccidents.gridSize * (pt.trafficAccidents.days.length+2);

	//SVG container
	pt.trafficAccidents.svg = d3.select('#traffic-accidents #trafficAccidents')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

	pt.trafficAccidents.update();

}//init

pt.trafficAccidents.update = function() {

	var width = pt.trafficAccidents.width;
	var gridSize = pt.trafficAccidents.gridSize;

	var svg = pt.trafficAccidents.svg.append("g")
		.attr("transform", "translate(" + pt.trafficAccidents.margin.left + "," + pt.trafficAccidents.margin.top + ")");
	
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Draw Heatmap /////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
		
	//Based on the heatmap example of: http://blockbuilder.org/milroc/7014412

    var colorScale = d3.scale.linear()
		.domain([0, d3.max(accidents, function(d) {return d.count; })/2, d3.max(accidents, function(d) {return d.count; })])
		.range(["#FFFFDD", "#3E9583", "#1F2D86"])
		//.interpolate(d3.interpolateHcl);

    var dayLabels = svg.selectAll(".dayLabel")
        .data(pt.trafficAccidents.days)
        .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * gridSize; })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
        .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

    var timeLabels = svg.selectAll(".timeLabel")
        .data(pt.trafficAccidents.times)
        .enter().append("text")
        .text(function(d) { return d; })
        .attr("x", function(d, i) { return i * gridSize; })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
        .attr("class", function(d, i) { return ((i >= 8 && i <= 17) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

    var heatMap = svg.selectAll(".hour")
        .data(accidents)
        .enter().append("rect")
        .attr("x", function(d) { return (d.hour - 1) * gridSize; })
        .attr("y", function(d) { return (d.day - 1) * gridSize; })
        .attr("class", "hour bordered")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("stroke", "white")
        .style("stroke-opacity", 0.6)
        .style("fill", function(d) { return colorScale(d.count); });

    //Append title to the top
    svg.append("text")
    	.attr("class", "title")
        .attr("x", width/2)
        .attr("y", -90)
        .style("text-anchor", "middle")
        .text("Number of Traffic accidents per Day & Hour combination");
    svg.append("text")
    	.attr("class", "subtitle")
        .attr("x", width/2)
        .attr("y", -60)
        .style("text-anchor", "middle")
        .text("The Netherlands | 2014");

    //Append credit at bottom
    svg.append("text")
    	.attr("class", "credit")
        .attr("x", width/2)
        .attr("y", gridSize * (pt.trafficAccidents.days.length+1) + 80)
        .style("text-anchor", "middle")
        .text("Based on Miles McCrocklin's Heatmap block");

	///////////////////////////////////////////////////////////////////////////
	//////////////// Create the gradient for the legend ///////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Extra scale since the color scale is interpolated
	var countScale = d3.scale.linear()
		.domain([0, d3.max(accidents, function(d) {return d.count; })])
		.range([0, width])

	//Calculate the variables for the temp gradient
	var numStops = 10;
	countRange = countScale.domain();
	countRange[2] = countRange[1] - countRange[0];
	countPoint = [];
	for(var i = 0; i < numStops; i++) {
		countPoint.push(i * countRange[2]/(numStops-1) + countRange[0]);
	}//for i

	//Create the gradient
	svg.append("defs")
		.append("linearGradient")
		.attr("id", "legend-traffic")
		.attr("x1", "0%").attr("y1", "0%")
		.attr("x2", "100%").attr("y2", "0%")
		.selectAll("stop") 
		.data(d3.range(numStops))                
		.enter().append("stop") 
		.attr("offset", function(d,i) { 
			return countScale( countPoint[i] )/width;
		})   
		.attr("stop-color", function(d,i) { 
			return colorScale( countPoint[i] ); 
		});

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Draw the legend ////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var legendWidth = width*0.4;
	//Color Legend container
	var legendsvg = svg.append("g")
		.attr("class", "legendWrapper")
		.attr("transform", "translate(" + (width/2) + "," + (gridSize * (pt.trafficAccidents.days.length+1)) + ")");

	//Draw the Rectangle
	legendsvg.append("rect")
		.attr("class", "legendRect")
		.attr("x", -legendWidth/2)
		.attr("y", 0)
		//.attr("rx", hexRadius*1.25/2)
		.attr("width", legendWidth)
		.attr("height", 15)
		.style("fill", "url(#legend-traffic)");
		
	//Append title
	legendsvg.append("text")
		.attr("class", "legendTitle")
		.attr("x", 0)
		.attr("y", -10)
		.style("text-anchor", "middle")
		.text("Number of Accidents");

	//Set scale for x-axis
	var xScale = d3.scale.linear()
		 .range([-legendWidth/2, legendWidth/2])
		 .domain([ 0, d3.max(accidents, function(d) { return d.count; })] );

	//Define x-axis
	var xAxis = d3.svg.axis()
		  .orient("bottom")
		  .ticks(5)
		  //.tickFormat(formatPercent)
		  .scale(xScale);

	//Set up X axis
	legendsvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (15) + ")")
		.call(xAxis);
        

}//init

