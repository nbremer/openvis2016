pt.slopeGraphAnimals = pt.slopeGraphAnimals || {};

pt.slopeGraphAnimals.init = function() {
	
	//Remove any existing svgs
	d3.select('#slopegraph-animals #slopeGraphAnimals svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 130,
		right: 120,
		bottom: 60,
		left: 120
	};
	var width = $(".slides").width()*0.9 - margin.left - margin.right;
	var height = $(".slides").height()*0.75 - margin.top - margin.bottom;
				
	//SVG container
	pt.slopeGraphAnimals.svg = d3.select("#slopegraph-animals #slopeGraphAnimals")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.slopeGraphAnimals.svg.append("g")
		.attr("transform", "translate(" + (margin.left + width/2) + "," + margin.top + ")");

	///////////////////////////////////////////////////////////////////////////
	/////////////////////// Plot the random slopegraph ////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var y = d3.scale.linear()
    	.range([height, 0])
    	.domain([0.3, 0.8]);

	var color = d3.scale.ordinal()
		.range(["#EFB605", "#E59202", "#E2331C", "#CF003E", "#AA065D", "#853187", "#4F54A8", "#138196", "#18AA69", "#7EB852"]);

	//Add title
	svg.append("text")
		.attr("class", "title")
		.attr("y", -100)
		.text("Random animal slopgraph");
	//Add subtitle
	svg.append("text")
		.attr("class", "subtitle")
		.attr("y", -65)
		.text("no blend mode");

	//x axis labels
	svg.append("text")
		.attr("class", "axisLabel")
		.attr("y", height + 60)
		.attr("x", -width*0.25)
		.text("Before");
	svg.append("text")
		.attr("class", "axisLabel")
		.attr("y", height + 60)
		.attr("x", width*0.25)
		.text("After");
	// //y axis label
	// svg.append("text")
	// 	.attr("class", "axisLabel")
	// 	.attr("y", -width*0.25 - 40)
	// 	.attr("x", -height/2)
	// 	.attr("transform", "rotate(-90)")
	// 	.text("Some value...");

  
	d3.csv("slides/slide_60/slopegraph_animals.csv", function(error, data) {
		if (error) throw error;

		data.forEach(function(d) {
		    d.start = +d.start;
		    d.end = +d.end;
		});

		//Create a group for the lines and isolate it so it doesn't interact with the background or the circles
		var lineWrapper = svg.append("g").attr("class","lineWrapper").style("isolation","isolate");

		lineWrapper.selectAll(".line")
		    .data(data)
		    .enter().append("line")
		    .attr("class", "line")
		    .attr("x1", -width*0.25)
		  	.attr("y1", function(d) { return y(d.start); })
		  	.attr("x2", width*0.25)
		  	.attr("y2", function(d) { return y(d.end); })
		    .style("stroke", function(d) { return color(d.company); });

		lineWrapper.selectAll(".label")
		    .data(data)
		    .enter().append("text")
		    .attr("class", "label")
		    .attr("transform", function(d) { return "translate(" + (width*0.25) + "," + y(d.end) + ")"; })
		    .attr("x", 16)
		    .attr("dy", ".35em")
		    .style("fill", function(d,i) { return color(d.company); })
		    .text(function(d) { return d.company; });

		//Create a group for the circles and isolate it so it doesn't interact with the background or the lines
		var circleWrapper = svg.append("g").attr("class","circleWrapper").style("isolation","isolate");
		
		circleWrapper.selectAll(".circle.left")
		    .data(data)
		    .enter().append("circle")
		    .attr("class", "circle left")
		    .attr("cx", -width*0.25)
		 	.attr("cy", function(d) { return y(d.start); })
		  	.attr("r", 11)
		    .style("fill", function(d) { return color(d.company); });

		circleWrapper.selectAll(".circle.right")
		    .data(data)
		    .enter().append("circle")
		    .attr("class", "circle right")
		    .attr("cx", width*0.25)
		 	.attr("cy", function(d) { return y(d.end); })
		  	.attr("r", 11)
		    .style("fill", function(d) { return color(d.company); });
	});//d3.csv

};//init

pt.slopeGraphAnimals.noBlendMode = function() {
	d3.selectAll("#slopeGraphAnimals .line, #slopeGraphAnimals .circle")
		.style("mix-blend-mode", null);
	d3.select("#slopeGraphAnimals .subtitle")
		.text("no blend mode");
}//noBlendMode

pt.slopeGraphAnimals.withBlendMode = function() {
	setTimeout(function() {
		d3.selectAll("#slopeGraphAnimals .line, #slopeGraphAnimals .circle")
			.style("mix-blend-mode", "multiply");
		d3.select("#slopeGraphAnimals .subtitle")
			.text("multiply blend mode");
	},100);
}//withBlendMode
