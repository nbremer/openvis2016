pt.growthBMI = pt.growthBMI || {};

pt.growthBMI.init = function() {

	//Remove any existing svgs
	d3.select('#growth-bmi #growthBMI svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 160,
		right: 180,
		bottom: 100,
		left: 170
	};

	var width = $(".slides").width()*0.9 - margin.left - margin.right,
		height = $(".slides").height()*0.9 - margin.top - margin.bottom;

	//SVG container
	pt.growthBMI.svg = d3.select("#growth-bmi #growthBMI")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.growthBMI.svg.append("g")
		.attr("transform", "translate(" + (margin.left) + "," +(margin.top) + ")");

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////////// Append titles /////////////////////////////
	///////////////////////////////////////////////////////////////////////////

    //Append title to the top
    svg.append("text")
    	.attr("class", "title")
        .attr("x", width/2)
        .attr("y", -100)
        .style("text-anchor", "middle")
        .text("Mean Body Mass Index (BMI) per Country");
    svg.append("text")
    	.attr("class", "subtitle")
        .attr("x", width/2)
        .attr("y", -50)
        .style("text-anchor", "middle")
        .text("Men");

    //Append credit at bottom
    svg.append("text")
    	.attr("class", "credit")
        .attr("x", width/2)
        .attr("y", height + 90)
        .style("text-anchor", "middle")
        .text("Data from NCD Risk Factor Collaboration");

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////////// Create axes //////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	pt.growthBMI.xScale = d3.scale.linear()
	    .range([0, width])
	    .domain(d3.extent(bmi, function(d) { return d.year; }))
	   	.nice();
	var x = pt.growthBMI.xScale;

	pt.growthBMI.yScale = d3.scale.linear()
	    .range([height, 0])
	    .domain(d3.extent(bmi, function(d) { return d.mean_bmi; }))
	   	.nice();
	var y = pt.growthBMI.yScale;

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom")
	    .tickFormat(d3.format("d"));
	svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");
	svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    //Color legend
   	svg.append("text")
    	.attr("class", "axisLegend")
      	.attr("transform", "rotate(-90)")
      	.attr("y", width)
      	.attr("x", -y(32))
      	.style("fill", "#c91010")
      	.text("Obese");
    svg.append("text")
    	.attr("class", "axisLegend")
      	.attr("transform", "rotate(-90)")
      	.attr("y", width)
      	.attr("x", -y(27.5))
      	.style("fill", "#e87109")
      	.text("Overweight");
    svg.append("text")
    	.attr("class", "axisLegend")
      	.attr("transform", "rotate(-90)")
      	.attr("y", width)
      	.attr("x", -y(22.5))
      	.style("fill", "#9C9C9C")
      	.text("Normal weight");

	////////////////////////////////////////////////////////////// 
	//////////////////////// Gradients /////////////////////////// 
	////////////////////////////////////////////////////////////// 
	
	var defs = svg.append("defs");

	linearGradient = defs.append("linearGradient")
		.attr("id", "gradient-bmi")
		.attr("gradientUnits", "userSpaceOnUse")    
		.attr("x1", 0)
		.attr("y1", 0)         
		.attr("x2", 0)
		.attr("y2", height);

	linearGradient.append("stop")
		.attr("class", "left")
		.attr("offset", y(30)/y.range()[0])
		.attr("stop-color", "#c91010");
	linearGradient.append("stop")
		.attr("class", "left")
		.attr("offset", y(30)/y.range()[0])
		.attr("stop-color", "#e87109");
	linearGradient.append("stop")
		.attr("class", "left")
		.attr("offset", y(25)/y.range()[0])
		.attr("stop-color", "#e87109");
	linearGradient.append("stop")
		.attr("class", "left")
		.attr("offset", y(25)/y.range()[0])
		.attr("stop-color", "#a0a0a0");

	///////////////////////////////////////////////////////////////////////////
	////////////////////////////////// Voronoi ////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Initiate the voronoi function
	pt.growthBMI.voronoi = d3.geom.voronoi()
	    .x(function(d) { return x(d.year); })
	    .y(function(d) { return y(d.mean_bmi); })
	    .clipExtent([[0, y(35)], [width, y(17)]]);

	//Prepare the data
	pt.growthBMI.gender = d3.nest()
		.key(function(d) { return d.sex; })
		.entries(bmi);

	//Initiate the voronoi group element	
	var voronoiGroup = svg.append("g")
		.attr("class", "voronoiWrapper");

	//Create a new voronoi map including only the visible points
	voronoiGroup.selectAll("path")
		.data(pt.growthBMI.voronoi(pt.growthBMI.gender[0].values))
		.enter().append("path")
		.attr("class", function(d) { return "voronoi " + d.point.iso; })
		.attr("d", function(d) { return "M" + d.join("L") + "Z"; })
		.datum(function(d) { return d.point; })
		.attr("class", "voronoiCells")
		.on("mouseover", pt.growthBMI.mouseoverVor)
		.on("mouseout", pt.growthBMI.mouseoutVor);

 	///////////////////////////////////////////////////////////////////////////
	//////////////////////////////// Plot Data ////////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	pt.growthBMI.line = d3.svg.line()
	    .interpolate("basis")
	    .x(function(d) { return x(d.year); })
	    .y(function(d) { return y(d.mean_bmi); });

	//Wrapper for all the lines
	var countriesWrapper = svg.append("g")
		.attr("class","countryWrapper");

	//Prepare the data
	var countries = d3.nest()
		.key(function(d) { return d.iso; })
		.key(function(d) { return d.sex; })
		.entries(bmi);

	//Create a group for each country
	var countryGroup = countriesWrapper.selectAll(".countryGroup")
      	.data(countries, function(d) { return d.key; })
    	.enter().append("g")
    	.attr("class", function(d) { return "country " + d.key; });

    //Draw a line for each country
    countryGroup.append("path")
    	.attr("class", "country line")
      	.attr("d", function(d) { return pt.growthBMI.line(d.values[0].values); })
      	.style("stroke", "url(#gradient-bmi)");

	countryGroup.append("text")
		.attr("class", "countryName")
      	.datum(function(d) { return {country: d.values[0].values[0].country, valueMen: d.values[0].values[d.values[0].values.length - 1], valueWomen: d.values[1].values[d.values[1].values.length - 1]}; })
      	.attr("transform", function(d) { return "translate(" + x(d.valueMen.year) + "," + y(d.valueMen.mean_bmi) + ")"; })
      	.attr("x", 3)
      	.attr("dy", ".35em")
      	.text(function(d) { return d.country; });

    // //Append circles
    // countryGroup.selectAll(".countryCircle")
    // 	.data(function(d) { return d.values[0].values; })
    // 	.enter().append("circle")
    // 	.attr("class", "countryCircle")
    //   	.attr("cx", function(d) { return x(d.year); })
    //   	.attr("cy", function(d) { return y(d.mean_bmi); })
    //   	.attr("r", 2)
    //   	.style("opacity", 0.5)
    //   	.style("fill", "url(#gradient-bmi)");

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Threshold lines /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	// svg.append("path")
 //      .attr("class", "threshold")
 //      .attr("d", "M" + 0 + "," + y(25) + " L" + width + "," + y(25))
 //      .style("stroke", "#F7804B");

 //    svg.append("path")
 //      .attr("class", "threshold")
 //      .attr("d", "M" + 0 + "," + y(30) + " L" + width + "," + y(30))
 //      .style("stroke", "#D62C2B");



}//init

pt.growthBMI.men = function() { 

	//Change subtitle
	d3.select("#growthBMI .subtitle")
        .text("Men");

	//Change to females
	d3.selectAll("#growthBMI .country")
		.transition().duration(1000)
	     .attr("d", function(d) { return pt.growthBMI.line(d.values[0].values); });
	
	//Move labels to men
	d3.selectAll("#growthBMI .countryName")
      	.attr("transform", function(d) { return "translate(" + pt.growthBMI.xScale(d.valueMen.year) + "," + pt.growthBMI.yScale(d.valueMen.mean_bmi) + ")"; });

    //Create voronois
    setTimeout(function() {
	    d3.selectAll("#growthBMI .voronoiWrapper").selectAll("path")
			.data(pt.growthBMI.voronoi(pt.growthBMI.gender[0].values))
			.attr("d", function(d) { return "M" + d.join("L") + "Z"; })
			.datum(function(d) { return d.point; });
	},1000);

}//men

pt.growthBMI.women = function() { 

	//Change subtitle
	d3.select("#growthBMI .subtitle")
        .text("Women");

	//Change to females
	d3.selectAll("#growthBMI .country")
		.transition().duration(1000)
	     .attr("d", function(d) { return pt.growthBMI.line(d.values[1].values); });

	//Move labels to women
	d3.selectAll("#growthBMI .countryName")
      	.attr("transform", function(d) { return "translate(" + pt.growthBMI.xScale(d.valueWomen.year) + "," + pt.growthBMI.yScale(d.valueWomen.mean_bmi) + ")"; });

    //Create voronois
    setTimeout(function() {
	    d3.selectAll("#growthBMI .voronoiWrapper").selectAll("path")
			.data(pt.growthBMI.voronoi(pt.growthBMI.gender[1].values))
			.attr("d", function(d) { return "M" + d.join("L") + "Z"; })
			.datum(function(d) { return d.point; });
	},1000);

}//women

pt.growthBMI.mouseoverVor = function(d) {
		//Dim all lines
		d3.selectAll("#growthBMI .line")
			.style("opacity", 0.1);
		//Highlight selected line
		d3.select("#growthBMI .country." + d.iso + " .line")
			.style("stroke-width", 5)
			.style("opacity", 1);
		//Show selected country
		d3.select("#growthBMI .country." + d.iso + " .countryName")
			.style("opacity", 1);
		//Hide legends
		d3.selectAll("#growthBMI .axisLegend")
			.style("opacity", 0.1);
}//mouseover

pt.growthBMI.mouseoutVor = function(d) {
		//Remove stylings
		d3.selectAll("#growthBMI .line, #growthBMI .countryName, #growthBMI .axisLegend")
			.style("opacity", null);
		d3.select("#growthBMI .country." + d.iso + " .line")
			.style("stroke-width", null)
			.style("opacity", null);
}//mouseoutVor
