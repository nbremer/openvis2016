pt.cityTemperatures = pt.cityTemperatures || {};

pt.cityTemperatures.init = function() {
	
	//Remove any existing svgs
	d3.select('#city-temperatures #cityTemperatures svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 130,
		right: 120,
		bottom: 40,
		left: 120
	};
	var width = $(".slides").width()*0.9 - margin.left - margin.right;
	var height = $(".slides").height()*0.75 - margin.top - margin.bottom;
				
	//SVG container
	pt.cityTemperatures.svg = d3.select("#city-temperatures #cityTemperatures")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.cityTemperatures.svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
	svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width + margin.right)
        .attr("height", height);

    var lineWrapper = svg.append("g")
    	.attr("class", "lineWrapper")
    	.attr("clip-path", "url(#clip")
		.style("clip-path", "url(#clip)"); //make it work in safari

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Plot the time series //////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var parseDate = d3.time.format("%d/%m/%y").parse;

	var x = d3.time.scale()
    	.range([0, width]);

	var y = d3.scale.linear()
    	.range([height, 0])
    	.nice();

	var color = d3.scale.ordinal()
		.range(["#EFB605", "#E47D06", "#DB0131", "#AF0158", "#7F378D", "#3465A8", "#0AA174", "#7EB852"])
		.domain(["Dubai","Jakarta","Rio de Janeiro","Cape Town","Tokyo","New York","Amsterdam","Svalbard"]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .ticks(5)
	    .orient("left");

	var line = d3.svg.line()
	    .interpolate("basis")
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d.temperature); });


	//Add title
	svg.append("text")
		.attr("class", "title")
		.attr("x", width/2)
		.attr("y", -100)
		.text("Average daily temperatures in 2015");
	//Add subtitle
	svg.append("text")
		.attr("class", "subtitle")
		.attr("x", width/2)
		.attr("y", -65)
		.text("no blend mode");

  
	d3.csv("slides/slide_59/temperatures_2015_cities_2.csv", function(error, data) {
	  if (error) throw error;

	  //color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

	  data.forEach(function(d) {
	    d.date = parseDate(d.date);
	  });

	  var cities = color.domain().map(function(name) {
	    return {
	      name: name,
	      values: data.map(function(d) {
	        return {date: d.date, temperature: +d[name]};
	      })
	    };
	  });

	  x.domain(d3.extent(data, function(d) { return d.date; }));

	  y.domain([
	  	-10,
	    //d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
	    d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
	  ]);

	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	  svg.append("g")
	      	.attr("class", "y axis")
	      	.call(yAxis)
	    .append("text")
	    	.attr("class", "axisLabel")
	      	.attr("y", -10)
	      	.style("text-anchor", "start")
	      	.text("Temperature (ºC)");

	  lineWrapper.append("line")
	  	.attr("class", "zero-line")
	  	.attr("x1", x(parseDate("02/01/15")))
	  	.attr("y1", y(0))
	  	.attr("x2", x(parseDate("31/12/15")))
	  	.attr("y2", y(0));

	  var city = lineWrapper.selectAll(".city")
	      .data(cities)
	      .enter().append("g")
	      .attr("class", "city");

	  city.append("path")
	      .attr("class", "line")
	      .attr("d", function(d) { return line(d.values); })
	      .style("stroke", function(d) { return color(d.name); });

	  city.append("text")
	      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
	      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
	      .attr("x", 7)
	      .attr("dy", ".35em")
	      .style("fill", function(d,i) { return color(d.name); })
	      .text(function(d) { return d.name; });
	});

};//init

pt.cityTemperatures.noBlendMode = function() {
	d3.selectAll("#cityTemperatures .line")
		.style("mix-blend-mode", null);
	d3.select("#cityTemperatures .subtitle")
		.text("no blend mode");
}//noBlendMode

pt.cityTemperatures.withBlendMode = function() {
	setTimeout(function() {
		d3.selectAll("#cityTemperatures .line")
			.style("mix-blend-mode", "multiply");
		d3.select("#cityTemperatures .subtitle")
			.text("multiply blend mode");
	},100);
}//withBlendMode
