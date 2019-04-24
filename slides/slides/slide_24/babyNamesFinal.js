pt.babyNamesFinal = pt.babyNamesFinal || {};

pt.babyNamesFinal.init = function() {
	
	//Remove any existing svgs
	d3.selectAll('#baby-names-final svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Brush is the higher focus chart, All is the smaller context chart	
	pt.babyNamesFinal.margin = {top: 20, right: 30, bottom: 30, left: 50};
	pt.babyNamesFinal.marginAll = {top: 20, right: 30, bottom: 30, left: 50};
	var margin = pt.babyNamesFinal.margin,
		marginAll = pt.babyNamesFinal.marginAll;

	pt.babyNamesFinal.width = $(".slides").width()*0.8 - margin.left - margin.right;
	pt.babyNamesFinal.heightBrush = 600 - margin.top - margin.bottom;
	pt.babyNamesFinal.heightAll = 100 - marginAll.top - marginAll.bottom;

	var width = pt.babyNamesFinal.width,
		heightBrush = pt.babyNamesFinal.heightBrush,
		heightAll = pt.babyNamesFinal.heightAll;

	//var width = $(".slides").width()*0.9 - margin.left - margin.right;
	//var height = $(".slides").height()*0.9 - margin.top - margin.bottom;

	//Create context SVG
	pt.babyNamesFinal.context = d3.select("#baby-names-final #babyNamesFinalContext").append("svg")
		.attr("width", width + marginAll.left + marginAll.right)
	    .attr("height", heightAll + marginAll.top + marginAll.bottom)
	  .append("g")
		.attr("class", "contextWrapper")
	    .attr("transform", "translate(" + marginAll.left + "," + marginAll.top + ")");

	//Create focus SVG
	pt.babyNamesFinal.focus = d3.select("#baby-names-final #babyNamesFinalFocus").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", heightBrush + margin.top + margin.bottom)
	  .append("g")
		.attr("class", "focusWrapper")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	///////////////////////////////////////////////////////////////////////////
	//////////////////////// Set up legend svg containers /////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var marginLegend = {top: 15, right: 30, bottom: 10, left: 30},
	    widthLegend = 350 - marginLegend.left - marginLegend.right,
		heightLegend = 30;
	pt.babyNamesFinal.widthLegend = widthLegend;

	//Create color legend SVG
	pt.babyNamesFinal.colorLegend = d3.select("#baby-names-final #babyNamesFinalColorLegend").append("svg")
	    .attr("width", widthLegend + marginLegend.left + marginLegend.right)
	    .attr("height", heightLegend + marginLegend.top + marginLegend.bottom)
	  .append("g")
		.attr("class", "colorLegendWrapper")
	    .attr("transform", "translate(" + marginLegend.left + "," + marginLegend.top + ")");

	//Create stroke width legend SVG
	pt.babyNamesFinal.strokeLegend = d3.select("#baby-names-final #babyNamesFinalWidthLegend").append("svg")
	    .attr("width", widthLegend + marginLegend.left + marginLegend.right)
	    .attr("height", heightLegend + marginLegend.top + marginLegend.bottom)
	  .append("g")
		.attr("class", "strokeLegendWrapper")
	    .attr("transform", "translate(" + marginLegend.left + "," + marginLegend.top + ")");

	pt.babyNamesFinal.update();

}//init

pt.babyNamesFinal.update = function() {

	var margin = pt.babyNamesFinal.margin,
		marginAll = pt.babyNamesFinal.marginAll,
		width = pt.babyNamesFinal.width,
		heightBrush = pt.babyNamesFinal.heightBrush,
		heightAll = pt.babyNamesFinal.heightAll,
		widthLegend = pt.babyNamesFinal.widthLegend;

	var context = pt.babyNamesFinal.context,
		focus = pt.babyNamesFinal.focus,
		colorLegend = pt.babyNamesFinal.colorLegend,
		strokeLegend = pt.babyNamesFinal.strokeLegend;

	var startYear = 1880,
		endYear = 2014,
		yearRange = endYear - startYear;
	
	//Stroke width per max position
	var strokeWidth = [12,8,8,6,6,4,4,2,2,2];

	////////////////////////////////////////////////////////////// 
	////////////////////////// Girls ///////////////////////////// 
	////////////////////////////////////////////////////////////// 

	allNames = [];
	namesByID = [];
	girls.forEach(function(d,i) {
	    allNames[i] = d.name;
		namesByID[d.name] = i;
	});
	var color = d3.scale.ordinal()
			.range(["#FFC600", "#FEC606", "#FEC60B", "#FDC710", "#FDC716", "#FCC61B", "#FCC61F", "#FCC523", "#FBC427", 
			"#FBC22B", "#FBC02D", "#FBBD2F", "#FBBA31", "#FBB632", "#FBB132", "#FCAC31", "#FCA730", "#FDA12F", "#FD9B2D", 
			"#FE952C", "#FE8F2A", "#FF8929", "#FF8428", "#FF7E27", "#FF7927", "#FF7527", "#FF7128", "#FE6E29", "#FE6A2B", 
			"#FD682D", "#FC652F", "#FB6330", "#FA6032", "#F95E33", "#F85C34", "#F65A34", "#F55733", "#F35432", "#F15230", 
			"#F04F2D", "#EE4B2A", "#EC4827", "#EA4524", "#E84221", "#E63E1F", "#E43B1D", "#E2381C", "#E0351C", "#DD321E", 
			"#DB3020", "#D92E25", "#D62C2B", "#D42A31", "#D22939", "#CF2841", "#CD274A", "#CB2754", "#C8275D", "#C62866", 
			"#C4296F", "#C22A77", "#BF2C7F", "#BD2E86", "#BB308C", "#B93391", "#B73596", "#B5389A", "#B33B9D", "#B13EA0", 
			"#AE41A2", "#AC43A3", "#A946A4", "#A648A4", "#A349A4", "#9F4AA3", "#9B4BA2", "#974BA1", "#934B9F", "#8E4A9D", 
			"#8A499A", "#854897", "#804795", "#7B4692", "#76448E", "#71438B", "#6C4188"])
			.domain(allNames);

	////////////////////////////////////////////////////////////// 
	////////////////////// Color Legend ////////////////////////// 
	////////////////////////////////////////////////////////////// 

	//Create the gradient to fill the legend rect when girls are selected
	var legendGradientGirl = colorLegend.append("defs")
		.append("linearGradient")
		.attr("id", "legendGradientGirl")
		.attr("gradientUnits", "userSpaceOnUse") 
		.attr("x1", "0%").attr("y1", "0%")
		.attr("x2", "100%").attr("y2", "0%")
		.attr("spreadMethod", "pad")
		.selectAll("stop") 
		.data(color.range())                 
		.enter().append("stop") 
		.attr("offset", function(d,i) { return Math.floor(i/(color.range().length+20)*100) + "%"; })   
		.attr("stop-color", function(d) { return d; });

	//Create the rectangle to be filled with color	
	colorLegend.append("rect")
			.attr("class", "colorkey")
			.attr("x", 0)
			.attr("y", -8)
			.attr("width", widthLegend)
			.attr("height", 16)
			.style("opacity", 0.7)
			.attr("fill", "url(#legendGradientGirl)");

	//Append the A, Z and explanation around the rectangle
	colorLegend.append("text")
		.attr("class", "strokeKeyText")
		.attr("x", 0)
		.attr("y", 22)
		.style("font-size", 11)
		.style("text-anchor", "middle")
		.text("A");
	colorLegend.append("text")
		.attr("class", "strokeKeyText")
		.attr("x", widthLegend)
		.attr("y", 22)
		.style("font-size", 11)
		.style("text-anchor", "middle")
		.text("Z");

	////////////////////////////////////////////////////////////// 
	/////////////////// Stroke width Legend ////////////////////// 
	////////////////////////////////////////////////////////////// 

	//Width of one rectangle
	var rectWidth = widthLegend/strokeWidth.length * 0.8;
	//Create the rectangles per stroke thickness
	strokeLegend.selectAll(".strokeKey")
			.data(strokeWidth)
			.enter().append("rect")
				.attr("class", "strokeKey")
				.attr("x", function (d,i) { return widthLegend/strokeWidth.length * i; })
				.attr("y", function(d,i) { return -d/2 ;})
				.attr("width",rectWidth)
				.attr("height", function(d,i) { return d * 1.2; })
				.style("opacity", 0.7)
				.style("shape-rendering", "crispEdges")
				.attr("fill", "#9C9C9C");
	//Number below each rectangle		
	strokeLegend.selectAll(".strokeKeyText")
			.data(strokeWidth)
			.enter().append("text")
				.attr("class", "strokeKeyText")
				.attr("x", function (d,i) { return widthLegend/strokeWidth.length * i + rectWidth/2; })
				.attr("y", 22)
				.style("text-anchor", "middle")
				.text(function(d,i) { return i+1; });
			
	////////////////////////////////////////////////////////////// 
	///////////////////// Scales & Axes ////////////////////////// 
	////////////////////////////////////////////////////////////// 

	var xAll = d3.scale.linear().domain([startYear, endYear]).range([0, width]),
		xBrush = d3.scale.linear().domain([startYear, endYear]).range([0, width]),
		yAll = d3.scale.linear().domain([0.5,10.5]).range([0, heightAll]),
		yBrush = d3.scale.linear().domain([0.5,10.5]).range([0, heightBrush]);

	var xAxisAll = d3.svg.axis().scale(xAll).orient("bottom").tickFormat(d3.format("d")),
		xAxisBrush = d3.svg.axis().scale(xBrush).orient("bottom").tickFormat(d3.format("d")).tickSize(0),
		yAxisBrush = d3.svg.axis().scale(yBrush).orient("left").tickSize(0);

	////////////////////////////////////////////////////////////// 
	/////////////// Other initializations //////////////////////// 
	////////////////////////////////////////////////////////////// 
		
	var lineAll = d3.svg.line()
	    .x(function(d) { return xAll(d.year); })
	    .y(function(d) { return yAll(d.position); });

	var lineBrush = d3.svg.line()
		.interpolate("monotone") //Slight rounding without too much deviation
	    .x(function(d) { return xBrush(d.year); })
	    .y(function(d) { return yBrush(d.position); });
	
	////////////////////////////////////////////////////////////// 
	//////////////////////// Context ///////////////////////////// 
	////////////////////////////////////////////////////////////// 
	
	//Append clippath to context chart
	context.append("defs").append("clipPath")
	    .attr("id", "clipContext")
	    .append("rect")
	    .attr("width", width)
	    .attr("height", heightAll);
	
	//Append x axis to context chart
	context.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate(0," + (heightAll+5) + ")")
	  .call(xAxisAll);

	//Girls - For the context the line needs to start put grey
	//then be coloured to the name and after the brush handle be grey again
	var linearGradientGirls = context.selectAll(".linearGradientGirls")
		.data(girls).enter()
		.append("linearGradient")
		.attr("class", "linearGradientGirls")
		.attr("gradientUnits", "userSpaceOnUse")    
		.attr("x1", xAll(startYear)).attr("y1", "0")         
		.attr("x2", xAll(endYear)).attr("y2", "0")                 
		.attr("id", function(d) {return "line-gradient-girls-" + d.name; });
	linearGradientGirls.append("stop").attr("class", "start") .attr("offset", "0%").attr("stop-color", "#9E9E9E").attr("stop-opacity", 0.5); 
	linearGradientGirls.append("stop").attr("class", "left") .attr("offset", "40%").attr("stop-color", "#9E9E9E").attr("stop-opacity", 0.5); 
	linearGradientGirls.append("stop").attr("class", "left") .attr("offset", "40%").attr("stop-color", function(d) { return color(d.name); }).attr("stop-opacity", 1); 
	linearGradientGirls.append("stop").attr("class", "right") .attr("offset", "60%").attr("stop-color", function(d) { return color(d.name); }).attr("stop-opacity", 1); 
	linearGradientGirls.append("stop").attr("class", "right") .attr("offset", "60%").attr("stop-color", "#9E9E9E").attr("stop-opacity", 0.5); 
	linearGradientGirls.append("stop").attr("class", "end") .attr("offset", "100%").attr("stop-color", "#9E9E9E").attr("stop-opacity", 0.5); 

	////////////////////////////////////////////////////////////// 
	////////////////////////// Focus ///////////////////////////// 
	////////////////////////////////////////////////////////////// 

	//Append clippath to focus chart
	focus.append("defs").append("clipPath")
	    .attr("id", "clipFocus")
	    .append("rect")
	    .attr("width", width)
	    .attr("height", heightBrush);	

	//Append x axis to focus chart	
	focus.append("g")
	  .attr("class", "x axis")
	  .style("font-size", 13)
	  .attr("transform", "translate(0," + (heightBrush + 9) + ")")
	  .call(xAxisBrush);
	  
	//Append y axis to focus chart	
	focus.append("g")
	  .attr("class", "y axis")
	  .attr("transform", "translate(-10,0)")
	  .call(yAxisBrush)
	.append("text")
	  .attr("class", "titles")
	  .attr("transform", "rotate(-90)")
	  .attr("x", -(heightBrush/2))
	  .attr("y", -35)
	  .attr("dy", ".71em")
	  .style("font-size", 16)
	  .style("text-anchor", "middle")
	  .text("Position in Top 10");

	////////////////////////////////////////////////////////////// 
	//////////////////////// Tooltip ///////////////////////////// 
	////////////////////////////////////////////////////////////// 
	 
	var popUpName = focus.append("g")
	    .attr("transform", "translate(-100,-100)")
	    .attr("class", "popUpName")
		.style("pointer-events", "none");

	popUpName.append("circle")
		.attr("class", "tooltipCircle")
	    .attr("r", 3.5);

	popUpName.append("text")
		.attr("class", "titles")
	    .attr("y", -20);

	////////////////////////////////////////////////////////////// 
	//////////////////////// Voronoi ///////////////////////////// 
	////////////////////////////////////////////////////////////// 

	 //Create a flat data version for the Voronoi per gender
	/*************************************************************/
	var flatData = [];
	for (k in girls) {
			var k_data = girls[k];
			k_data.values.forEach(function(d) {  
				if (d.position <= 10) flatData.push({name: k_data.name, year: d.year, position: d.position});                               
			});
	}//for k
	var maxPosition = d3.nest()
		.key(function(d) { return d.name; })
		.rollup(function(d) {return d3.min(d, function(g) {return g.position;});})
		.entries(flatData);
		
	var nestedFlatData = d3.nest().key(function(d) { return d.name; }).entries(flatData);
	/*************************************************************/

	//Initiate the voronoi function
	var voronoi = d3.geom.voronoi()
	    .x(function(d) { return xBrush(d.year); })
	    .y(function(d) { return yBrush(d.position); })
	    .clipExtent([[-margin.left, -margin.top], [width + margin.right, heightBrush + margin.bottom]]);
		
	//Initiate the voronoi group element	
	var voronoiGroup = focus.append("g")
		.attr("class", "voronoi");

	//Voronoi mouseover and mouseout functions	
	function mouseover(d) {
	    focus.selectAll(".focus").style("opacity", 0.1);
	    d3.selectAll(".focus."+d.name).style("opacity", 0.8);

		context.selectAll(".context").selectAll(".line").style("opacity", 0.1);	
		context.selectAll(".context."+d.name).selectAll(".line")
			.style("opacity", 1)
			.style("stroke", color(d.name));
		
		//Move the tooltip to the front
		d3.select(".popUpName").moveToFront();
		//Change position, size of circle and text of tooltip
	    popUpName.attr("transform", "translate(" + xBrush(d.year) + "," + yBrush(d.position) + ")");
		var circleSize = parseInt(d3.selectAll(".focus."+d.name).selectAll(".line").style("stroke-width"));
		popUpName.select(".tooltipCircle").style("fill", color(d.name)).attr("r", circleSize);
	    popUpName.select("text").text(d.name);
	}//mouseover

	function mouseout(d) {
	    focus.selectAll(".focus").style("opacity", 0.7);
		
		context.selectAll(".context").selectAll(".line")
			.style("opacity", null)
			.style("stroke", function(c) { return "url(#line-gradient-girls-" + c.name + ")"; });
	    
		popUpName.attr("transform", "translate(-100,-100)");
	}//mouseout

	////////////////////////////////////////////////////////////// 
	/////////////////////// Brushing ///////////////////////////// 
	////////////////////////////////////////////////////////////// 

	//Taken and adjusted from: http://bl.ocks.org/mbostock/6498580
	var centering = false,
		alpha = 1,
	    center,
		moveType;
		
	var arc = d3.svg.arc()
	    .outerRadius(heightAll / 4)
	    .startAngle(0)
	    .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

	var brush = d3.svg.brush()
		.x(xAll)
		.extent([endYear - 35, endYear - 15])
	    .on("brush", brushmove)
	    .on("brushend", brushend);;

	//Set up the brush
	var gBrush = context.append("g")
		.attr("class", "brush")
		.call(brush);

	gBrush.selectAll(".resize").append("line")
		.attr("y2", heightAll);

	gBrush.selectAll(".resize").append("path")
		.attr("d", d3.svg.symbol().type("triangle-up").size(100))
		.attr("transform", function(d,i) { return i ? "translate(" + -7 + "," +  heightAll / 2 + ") rotate(-90)" : "translate(" + 7 + "," +  heightAll / 2 + ") rotate(90)"; });

	gBrush.selectAll("rect")
		.attr("height", heightAll);

	gBrush.select(".background")
		.on("mousedown.brush", brushcenter)
		.on("touchstart.brush", brushcenter);

	gBrush.call(brush.event);
		
	function brushmove() {
		var extent = brush.extent();
		
		//Reset the x-axis brush domain and redraw the lines, circles and axis
		xBrush.domain(brush.empty() ? xAll.domain() : brush.extent());
		
		//Adjust the paths
		focus.selectAll(".line").attr("d", function(d) { return lineBrush(d.values); });
		//Update the x axis and grid
		focus.select(".x.axis").call(xAxisBrush);
	  
		//Reset the grey regions of the context chart
	    d3.selectAll(".left").attr("offset", ((xBrush.domain()[0] - startYear)/yearRange*100) + "%");
		d3.selectAll(".right").attr("offset", ((xBrush.domain()[1] - startYear)/yearRange*100) + "%");
		
		//Remove the previous voronoi map
		voronoiGroup.selectAll("path").remove();
		//Create a new voronoi map including only the visible points
		voronoiGroup.selectAll("path")
			.data(voronoi(flatData.filter(function(d) {return d.year >= xBrush.domain()[0] &  d.year <= xBrush.domain()[1]; })))
			.enter().append("path")
			.attr("d", function(d) { return "M" + d.join("L") + "Z"; })
			.datum(function(d) { return d.point; })
			//.style("stroke", "red")
			.attr("class", "voronoiCells");

		//If the brush move is called because the viewer clicked or searched a name
		//the mouse events should be delayed, otherwise you never see the full line
		//that was clicked
		if (moveType === "still") {
			setTimeout(function() {
				voronoiGroup.selectAll(".voronoiCells")
					.on("mouseover", mouseover)
					.on("mouseout", mouseout);
			}, 2000);
		} else {
			voronoiGroup.selectAll(".voronoiCells")
				.on("mouseover", mouseover)
				.on("mouseout", mouseout);		
		}
			
	}//brushmove

	function brushend() {
	  if (!d3.event.sourceEvent) return; // only transition after input
	  d3.select(this).transition()
	      .call(brush.extent(brush.extent().map(function(d) { return d3.round(d, 0); })))
	      .call(brush.event);
	}//brushend

	function brushcenter() {
	  var self = d3.select(window),
	      target = d3.event.target,
	      extent = brush.extent(),
	      size = extent[1] - extent[0],
	      domain = xAll.domain(),
	      x0 = domain[0] + size / 2,
	      x1 = domain[1] - size / 2,
	      odd = Math.round(size * 10) & 1;

	  recenter(true);
	  brushmove();

	  if (d3.event.changedTouches) {
	    self.on("touchmove.brush", brushmove).on("touchend.brush", brushend);
	  } else {
	    self.on("mousemove.brush", brushmove).on("mouseup.brush", brushend);
	  }

	  function brushmove() {
	    d3.event.stopPropagation();
	    center = d3.round(Math.max(x0, Math.min(x1, xAll.invert(d3.mouse(target)[0]) + odd * .05)), 1) - odd * .05;
	    recenter(false);
	  }

	  function brushend() {
	    brushmove();
	    self.on(".brush", null);
	  }
	}//brushcenter

	function recenter() {
	  if (centering) return; // timer is active and already interpolating
	  centering = true;
	  d3.timer(function() {
	    var extent = brush.extent(),
	        size = extent[1] - extent[0],
	        center1 = center * alpha + (extent[0] + extent[1]) / 2 * (1 - alpha);
		
	    if (!(centering = Math.abs(center1 - center) > 1e-3)) center1 = center;

	    gBrush
	        .call(brush.extent([center1 - size / 2, center1 + size / 2]))
	        .call(brush.event);

	    return !centering;
	  });
	}//recenter
 

	////////////////////////////////////////////////////////////// 
	///////////////////// Helper functions /////////////////////// 
	////////////////////////////////////////////////////////////// 
	//Move selected element to the front
	d3.selection.prototype.moveToFront = function() {
	  return this.each(function(){
	    this.parentNode.appendChild(this);
	  });
	};

	////////////////////////////////////////////////////////////// 
	////////////////////////// Draw ////////////////////////////// 
	////////////////////////////////////////////////////////////// 

	////////////////////////////////////////////////////////////// 
	///////////////////////// Context //////////////////////////// 
	////////////////////////////////////////////////////////////// 	

  	//Add the lines to context chart
	var contextWrapper = context.selectAll(".context")
		.data(girls, function(d) { return d.name; });
	  
	//UPDATE
	contextWrapper.attr("class", function(d) {return "focus " + d.name ;});
	contextWrapper.selectAll(".line")
		.attr("d", function(d) { return lineAll(d.values); })
		.style("stroke", function(d) {return "url(#line-gradient-girls-" + d.name + ")"; });	
	
	//ENTER 
	contextWrapper
		.enter().append("g")
		.attr("class", function(d) {return "context " + d.name ;})
		.append("path")
			.attr("class", "line")
			.attr("d", function(d) { return lineAll(d.values); })
			.style("stroke", function(d) {return "url(#line-gradient-girls-" + d.name + ")"; })
			.style("stroke-width", 1.25)
			.attr("clip-path", "url(#clipContext)")
			.style("opacity", 0)
			.transition().duration(750).delay(500)
			.style("opacity", 1);

	//EXIT
	contextWrapper.exit()
		.transition().duration(750)
		.style("opacity", 0)
		.remove();			

	////////////////////////////////////////////////////////////// 
	////////////////////////// Focus ///////////////////////////// 
	////////////////////////////////////////////////////////////// 	
	//Add a g element per name
	var focusWrapper = focus.selectAll(".focus")
		.data(girls, function(d) { return d.name; }); 
	 
	//UPDATE
	focusWrapper.attr("class", function(d) {return "focus " + d.name ;});
	focusWrapper.selectAll(".line")
		.attr("d", function(d) { return lineBrush(d.values); })
		.style("stroke-width", function(d) {return strokeWidth[maxPosition[namesByID[d.name]].values - 1] * 1.2; })
		.style("stroke", function(d) { return color(d.name); });
	 
	//ENTER
	//Add the lines of the boys to focus chart 
	focusWrapper
		.enter().append("g")
		.attr("class", function(d) {return "focus " + d.name ;})
		.append("path")
			.attr("class", "line")
			.attr("clip-path", "url(#clipFocus)")
			.style("pointer-events", "none")
			.style("stroke-linejoin", "round")
			.style("opacity", 0)
			.attr("d", function(d) { return lineBrush(d.values); })
			.style("stroke-width", function(d) {return strokeWidth[maxPosition[namesByID[d.name]].values - 1] * 1.2; })
			.style("stroke", function(d) {return color(d.name); });
	//Small delay so the brush can run first		
	focusWrapper.selectAll(".line")	
			.transition().duration(750).delay(500)
			.style("opacity", 0.7);
	
	//EXIT
	focusWrapper.exit()
		.transition().duration(750)
		.style("opacity", 0)
		.remove(); 
		
	////////////////////////////////////////////////////////////// 
	///////////////////////// Voronoi //////////////////////////// 
	////////////////////////////////////////////////////////////// 	

	//Remove the previous voronoi map
	voronoiGroup.selectAll("path").remove();
	//Create a new voronoi map including only the visible points
	voronoiGroup.selectAll("path")
		.data(voronoi(flatData.filter(function(d) {return d.year >= xBrush.domain()[0] &  d.year <= xBrush.domain()[1]; })))
		.enter().append("path")
		.attr("d", function(d) { return "M" + d.join("L") + "Z"; })
		.datum(function(d) { return d.point; })
		//.style("stroke", "red")
		.attr("class", "voronoiCells")
		.on("mouseover", mouseover)
		.on("mouseout", mouseout);
	
	//Move the brush handles to the front
	d3.select(".brush").moveToFront();

}//update