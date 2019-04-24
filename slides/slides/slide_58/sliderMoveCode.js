pt.sliderMoveCode = pt.sliderMoveCode || {};

pt.sliderMoveCode.init = function() {
	
	//Remove any existing svgs
	d3.select('#slider-move-code #sliderMoveCode svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 70,
		right: 30,
		bottom: 100,
		left: 30
	};
	var width = $(".slides").width()*0.9 - margin.left - margin.right;
	var height = 290 - margin.top - margin.bottom;
		
	pt.sliderMoveCode.width = width;
	pt.sliderMoveCode.height = height;
	pt.sliderMoveCode.margin = margin;	

	//SVG container
	pt.sliderMoveCode.svg = d3.select('#slider-move-code #sliderMoveCode')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

	pt.sliderMoveCode.update();

}//init

pt.sliderMoveCode.update = function() {

	var width = pt.sliderMoveCode.width,
		height = pt.sliderMoveCode.height,
		margin = pt.sliderMoveCode.margin;

	var svg = pt.sliderMoveCode.svg.append("g")
		.attr("class", "svgWrapper")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	//Stroke width per max position
	// var strokeWidth = [12,8,8,6,6,4,4,2,2,2];

	var startYear = 1880,
		endYear = 2014,
		yearRange = endYear - startYear;

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
	///////////////////// Scales & Axes ////////////////////////// 
	////////////////////////////////////////////////////////////// 

	var xAll = d3.scale.linear().domain([startYear, endYear]).range([0, width]),
		xBrush = d3.scale.linear().domain([startYear, endYear]).range([0, width]),
		yAll = d3.scale.linear().domain([0.5,10.5]).range([0, height]);
		
	var lineAll = d3.svg.line()
	    .x(function(d) { return xAll(d.year); })
	    .y(function(d) { return yAll(d.position); });
	
	////////////////////////////////////////////////////////////// 
	//////////////////////// Gradients /////////////////////////// 
	////////////////////////////////////////////////////////////// 
	
	var defs = svg.append("defs");

	//Initiate clippath to context chart
	defs.append("clipPath")
	    .attr("id", "clipContextSlider")
	    .append("rect")
	    .attr("width", width)
	    .attr("height", height);

	//Girls - For the context the line needs to start grey
	//then be coloured to the name and after the brush handle be grey again
	linearGradient = defs.selectAll("linearGradient")
		.data(girls).enter()
		.append("linearGradient")
		.attr("gradientUnits", "userSpaceOnUse")    
		.attr("x1", xAll(startYear)).attr("y1", "0")         
		.attr("x2", xAll(endYear)).attr("y2", "0")                 
		.attr("id", function(d) {return "line-gradient-" + d.name; });
	linearGradient.append("stop").attr("class", "left").attr("offset", "40%").attr("stop-color", "#D6D6D6");
	linearGradient.append("stop").attr("class", "left").attr("offset", "40%").attr("stop-color", function(d) { return color(d.name); });
	linearGradient.append("stop").attr("class", "right").attr("offset", "60%").attr("stop-color", function(d) { return color(d.name); }); 
	linearGradient.append("stop").attr("class", "right").attr("offset", "60%").attr("stop-color", "#D6D6D6");

	////////////////////////////////////////////////////////////// 
	/////////////////////// Brushing ///////////////////////////// 
	////////////////////////////////////////////////////////////// 

	//Taken and adjusted from: http://bl.ocks.org/mbostock/6498580
	var centering = false,
		alpha = 1,
	    center,
		moveType;
		
	var arc = d3.svg.arc()
	    .outerRadius(height / 4)
	    .startAngle(0)
	    .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

	var brush = d3.svg.brush()
		.x(xAll)
		.extent([(40*yearRange)/100+startYear, (60*yearRange)/100+startYear])
	    .on("brush", brushmove)
	    .on("brushend", brushend);;

	//Set up the brush
	var gBrush = svg.append("g")
		.attr("class", "brush")
		.call(brush);

	gBrush.selectAll(".resize").append("line")
		.attr("y2", height);

	gBrush.selectAll("rect")
		.attr("height", height);

	gBrush.select(".background")
		.on("mousedown.brush", brushcenter)
		.on("touchstart.brush", brushcenter);

	gBrush.call(brush.event);
		
	function brushmove() {
		var extent = brush.extent();
		
		//Reset the x-axis brush domain and redraw the lines, circles and axis
		xBrush.domain(brush.empty() ? xAll.domain() : brush.extent());

		var startOffset = (xBrush.domain()[0] - startYear)/yearRange*100,
			endOffset = (xBrush.domain()[1] - startYear)/yearRange*100;

		//Update the ext below each brush handle
		d3.select("#sliderMoveCode .stopTextAbove.left").text(Math.round(startOffset) + "%");
		d3.select("#sliderMoveCode .stopTextAbove.right").text(Math.round(endOffset) + "%");
	  
		//Reset the grey regions of the context chart
	    d3.selectAll("#sliderMoveCode .left").attr("offset", startOffset + "%");
		d3.selectAll("#sliderMoveCode .right").attr("offset",  endOffset + "%");

		//Update the text in the code block
		d3.selectAll("#slider-move-code pre code")
			.html('.on("brush", function(d) { <br><br>' + 
				'	/*Update the left gradient "border"*/ <br>' +
			 	'	d3.selectAll(".left").attr("offset", "' + Math.round(startOffset) + '%");<br><br>' +
			 	'	/*Update the right gradient "border"*/ <br>' + 
			 	'	d3.selectAll(".right").attr("offset", "' + Math.round(endOffset) + '%");<br><br>' +
			 	'  	/*...do other things...*/<br>' +
				'})')
		//Update the code to its javascript highlight
		$("#slider-move-code pre code").each(function(i, block) {
		   hljs.highlightBlock(block);
		});

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
	///////////////////////// Context //////////////////////////// 
	////////////////////////////////////////////////////////////// 	

	var contextWrapper = svg.append("g")
		.attr("class", "contextWrapper")
		.attr("clip-path", "url(#clipContextSlider)");
		
	//Add the lines to context chart
	contextWrapper.selectAll(".line")
		.data(girls, function(d) { return d.name; })
		.enter().append("path")
		.attr("class", "line")
		.attr("d", function(d) { return lineAll(d.values); })
		.style("stroke", function(d) {return "url(#line-gradient-" + d.name + ")"; })
		.style("stroke-width", 2.5)
		.style("fill","none")
		.style("opacity", 0)
		.transition().duration(750)
		.style("opacity", 1);

	////////////////////////////////////////////////////////////// 
	//////////////////////// Locations /////////////////////////// 
	////////////////////////////////////////////////////////////// 

	var textWrapper = svg.append("g")
		.attr("class", "textWrapper");

	var textHeight = height+60;
	stopText = [
		{x: 0.35*width, y: textHeight, text:"grey stop", className: "firstStop greyStop"},
		{x: 0.5*width, y: textHeight, text:"colored stop", className: "firstStop coloredStop"},
		{x: 0.65*width, y: textHeight, text:"grey stop", className: "secondStop greyStop"}
	];

	textWrapper.selectAll(".stopText")
		.data(stopText)
		.enter().append("text")
		.attr("class", function(d) { return "stopText " + d.className; })
		.attr("x", function(d) { return d.x; })
		.attr("y", function(d) { return d.y; })
		.text(function(d) { return d.text; });

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Draw the Arrow path ///////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Create arrow markers
	defs.append("marker")
	    .attr("id", "arrowMarkerSlider")
	    .attr("viewBox", "0 -5 10 10")
	    .attr("refX", 8)
	    .attr("refY", 0)
	    .attr("markerWidth", 8)
	    .attr("markerHeight", 8)
	    .attr("orient", "auto")
	  .append("path")
	    .attr("d", "M0,-5 L10,0 L0,5")
	    .style("fill", "#7F7F7F");

	stopArrows = [
		{x1: 0.35*width, x2: 0.4*width-5, className: "firstStop greyStop"},
		{x1: 0.45*width, x2: 0.4*width+5, className: "firstStop coloredStop"},
		{x1: 0.55*width, x2: 0.6*width-5, className: "secondStop coloredStop"},
		{x1: 0.65*width, x2: 0.6*width+5, className: "secondStop greyStop"}
	];
	//Draw the line and arrowhead
	textWrapper.selectAll(".stopArrow")
		.data(stopArrows)
		.enter().append("path")
		.attr("class", function(d) { return "stopArrow " + d.className; })
		.attr("d", function(d) { return "M" + d.x1 + "," + (textHeight - 20) + " L" + d.x2 + "," + (height + 10); })
		.style("fill", "none")
		.style("stroke", "#7F7F7F")
		.style("stroke-width", 1)
		.attr("marker-end", "url(#arrowMarkerSlider)");

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Draw the Gradient Rect /////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Example of how one gradient will look
	svg.append("rect")
		.attr("class", "gradRect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width)
		.attr("height", height+2)
		.style("fill", "url(#line-gradient-Michelle)")
		.style("opacity", 0);

	////////////////////////////////////////////////////////////// 
	//////////////////////// Text above ////////////////////////// 
	////////////////////////////////////////////////////////////// 

	//Append two texts below the brush to show at what percentage they are
	d3.selectAll("#sliderMoveCode .brush .resize.w").append("text")
		.attr("class", "stopTextAbove left")
		.attr("x", 0)
		.attr("y", -35)
		.style("text-anchor", "middle")
		.text("40%");	

	d3.selectAll("#sliderMoveCode .brush .resize.w").append("text")
		.attr("class", "stopTextAbove left classText")
		.attr("x", 0)
		.attr("y", -12)
		.style("font-size", 16)
		.style("text-anchor", "middle")
		.text('class="left"');	

	d3.selectAll("#sliderMoveCode .brush .resize.e").append("text")
		.attr("class", "stopTextAbove right")
		.attr("x", 0)
		.attr("y", -35)
		.style("text-anchor", "middle")
		.text("60%");

	d3.selectAll("#sliderMoveCode .brush .resize.e").append("text")
		.attr("class", "stopTextAbove right classText")
		.attr("x", 0)
		.attr("y", -12)
		.style("font-size", 16)
		.style("text-anchor", "middle")
		.text('class="right"');	

	////////////////////////////////////////////////////////////// 
	////////////////////////// Start ///////////////////////////// 
	////////////////////////////////////////////////////////////// 

	//Move selected element to the front
	d3.selection.prototype.moveToFront = function() {
	  return this.each(function(){
	    this.parentNode.appendChild(this);
	  });
	};

	//Move the brush handles to the front
	d3.selectAll("#sliderMoveCode .brush").moveToFront();	

}//update

pt.sliderMoveCode.showFirstGrey = function() {

	//Set the left offset to 100% so it seems all grey
	d3.selectAll("#sliderMoveCode .left")
		.attr("offset", "100%");
	d3.selectAll("#sliderMoveCode .right")
		.attr("offset", "100%");

	//Hide the second set of arrows and colored stop, Hide the 60% label
	d3.selectAll("#sliderMoveCode .secondStop, #sliderMoveCode .firstStop.coloredStop, #sliderMoveCode .stopTextAbove.right")
		.style("opacity", 0);

}//showFirstGrey

pt.sliderMoveCode.showFirstColored = function() {

	//Reset the left offset
	d3.selectAll("#sliderMoveCode .left")
		.attr("offset", "40%");
	//Set the right offset to 100% so it seems all colored after 40%
	d3.selectAll("#sliderMoveCode .right")
		.attr("offset", "100%");

	//Show the left side of the colored stop
	d3.selectAll("#sliderMoveCode .firstStop.coloredStop")
		.transition().duration(500)
		.style("opacity", 1);

	//Hide (in case you move backward)
	d3.selectAll("#sliderMoveCode .secondStop, #sliderMoveCode .stopTextAbove.right")
		.transition().duration(500)
		.style("opacity", 0);

}//showFirstColored

pt.sliderMoveCode.showSecondStop = function() {

	//Hide the rect (in case you move backward)
	d3.selectAll("#sliderMoveCode .gradRect")
		.transition().duration(500)
		.style("opacity", 0);

	//Show the second set of arrows, Show the 60% label
	d3.selectAll("#sliderMoveCode .secondStop, #sliderMoveCode .stopTextAbove.right")
		.transition().duration(500)
		.style("opacity", 1);

	//Set the right offsets to 60%
	d3.selectAll("#sliderMoveCode .right")
		.attr("offset", "60%");
		
}//showSecondStop

pt.sliderMoveCode.showRect = function() {

	//Show the gradient rect
	d3.selectAll("#sliderMoveCode .gradRect")
		.transition().duration(500)
		.style("opacity", 1);

	//Show the arrows, hide the bottom text (in case you move backward)
	d3.selectAll("#sliderMoveCode .textWrapper")
		.style("opacity", 1);
		
}//showRect

pt.sliderMoveCode.hideRect = function() {

	//Hide the gradient rect
	d3.selectAll("#sliderMoveCode .gradRect")
		.transition().duration(500)
		.style("opacity", 0);

	//Hide the arrows, hide the bottom text
	d3.selectAll("#sliderMoveCode .textWrapper")
		.style("opacity", 0);
		
}//hideRect
