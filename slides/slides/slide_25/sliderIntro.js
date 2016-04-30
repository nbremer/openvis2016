pt.sliderIntro = pt.sliderIntro || {};

pt.sliderIntro.init = function() {
	
	//Remove any existing svgs
	d3.select('#intro-slider #sliderIntro svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 10,
		right: 0,
		bottom: 10,
		left: 0
	};
	var width = $(".slides").width()*0.75 - margin.left - margin.right;
	var height = $(".slides").height()*0.75 - margin.top - margin.bottom;
		
	pt.sliderIntro.width = width;
	pt.sliderIntro.height = height;
	pt.sliderIntro.margin = margin;	

	//SVG container
	pt.sliderIntro.svg = d3.select('#intro-slider #sliderIntro')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	pt.sliderIntro.update();

}//init

pt.sliderIntro.update = function() {

	var width = pt.sliderIntro.width,
		height = pt.sliderIntro.height,
		margin = pt.sliderIntro.margin;

	var svg = pt.sliderIntro.svg.append("g")
		.attr("class", "svgWrapper")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	//Stroke width per max position
	var strokeWidth = [12,8,8,6,6,4,4,2,2,2];

	///////////////////////////////////////////////////////////////////////////
	/////////////////////// Calculate hexagon variables ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var SQRT3 = Math.sqrt(3),
		hexRadius = Math.min(width, height)/2,
		hexWidth = SQRT3 * hexRadius,
		hexHeight = 2 * hexRadius;
	var hexagonPoly = [[0,-1],[SQRT3/2,0.5],[0,1],[-SQRT3/2,0.5],[-SQRT3/2,-0.5],[0,-1],[SQRT3/2,-0.5]];
	var hexagonPath = "m" + hexagonPoly.map(function(p){ return [p[0]*hexRadius, p[1]*hexRadius].join(','); }).join('l') + "z";

	////////////////////////////////////////////////////////////// 
	////////////////////////// Girls ///////////////////////////// 
	////////////////////////////////////////////////////////////// 

	var startYear = 1950,
		endYear = 1990,
		yearRange = endYear - startYear;

	allNames = [];
	namesByID = [];
	girls.forEach(function(d,i) {
	    allNames[i] = d.name;
		namesByID[d.name] = i;
	});
	var color = d3.scale.ordinal()
			// .range(["#FFC600", "#FEC606", "#FEC60B", "#FDC710", "#FDC716", "#FCC61B", "#FCC61F", "#FCC523", "#FBC427", 
			// "#FBC22B", "#FBC02D", "#FBBD2F", "#FBBA31", "#FBB632", "#FBB132", "#FCAC31", "#FCA730", "#FDA12F", "#FD9B2D", 
			// "#FE952C", "#FE8F2A", "#FF8929", "#FF8428", "#FF7E27", "#FF7927", "#FF7527", "#FF7128", "#FE6E29", "#FE6A2B", 
			// "#FD682D", "#FC652F", "#FB6330", "#FA6032", "#F95E33", "#F85C34", "#F65A34", "#F55733", "#F35432", "#F15230", 
			// "#F04F2D", "#EE4B2A", "#EC4827", "#EA4524", "#E84221", "#E63E1F", "#E43B1D", "#E2381C", "#E0351C", "#DD321E", 
			// "#DB3020", "#D92E25", "#D62C2B", "#D42A31", "#D22939", "#CF2841", "#CD274A", "#CB2754", "#C8275D", "#C62866", 
			// "#C4296F", "#C22A77", "#BF2C7F", "#BD2E86", "#BB308C", "#B93391", "#B73596", "#B5389A", "#B33B9D", "#B13EA0", 
			// "#AE41A2", "#AC43A3", "#A946A4", "#A648A4", "#A349A4", "#9F4AA3", "#9B4BA2", "#974BA1", "#934B9F", "#8E4A9D", 
			// "#8A499A", "#854897", "#804795", "#7B4692", "#76448E", "#71438B", "#6C4188"])
			.range(["#B5C660", "#B3C762", "#B0C765", "#ADC767", "#AAC769", "#A7C76A", "#A3C66B", "#9FC46B", "#9AC26A", 
			"#94BF68", "#8EBB66", "#87B662", "#7FB05E", "#75AA5A", "#6BA354", "#609B4F", "#549249", "#478943", "#39803D", 
			"#2C7739", "#206F36", "#166A35", "#0F6638", "#0B663E", "#0C6A48", "#127257", "#1B7D6A", "#27897F", "#359795", 
			"#42A4AB", "#4EB0C0", "#58BAD3", "#5DBFE2", "#5DC0EC", "#5ABCF2", "#52B5F4", "#49ABF3", "#3E9FEE", "#3292E7", 
			"#2785DE", "#1E77D3", "#176AC7", "#125EBA", "#0F53AB", "#0E489C", "#0D3E8D", "#0E347D", "#0F2B6C", "#11215C"])
			.domain(allNames);

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
			
	////////////////////////////////////////////////////////////// 
	///////////////////// Scales & Axes ////////////////////////// 
	////////////////////////////////////////////////////////////// 

	var xBrush = d3.scale.linear().domain([startYear, endYear]).range([0, width]),
		yBrush = d3.scale.linear().domain([0.5,10.5]).range([0, height]);

	var lineBrush = d3.svg.line()
		.interpolate("monotone") //Slight rounding without too much deviation
	    .x(function(d) { return xBrush(d.year); })
	    .y(function(d) { return yBrush(d.position); });
	
	var defs = svg.append("defs");
	var linearGradient = defs.selectAll("linearGradient")
		.data(girls).enter()
		.append("linearGradient")
		.attr("gradientUnits", "userSpaceOnUse")    
		.attr("x1", xBrush(startYear))
		.attr("y1", "0")         
		.attr("x2", xBrush(endYear))
		.attr("y2", "0")                 
		.attr("id", function(d) {return "line-gradient-" + d.name; });
	linearGradient.append("stop").attr("class", "left").attr("offset", 0.4).attr("stop-color", "#9E9E9E").attr("stop-opacity", 0.5); 
	linearGradient.append("stop").attr("class", "left").attr("offset", 0.4).attr("stop-color", function(d) { return color(d.name); }).attr("stop-opacity", 1); 
	linearGradient.append("stop").attr("class", "right").attr("offset", 0.6).attr("stop-color", function(d) { return color(d.name); }).attr("stop-opacity", 1); 
	linearGradient.append("stop").attr("class", "right").attr("offset", 0.6).attr("stop-color", "#9E9E9E").attr("stop-opacity", 0.5); 

	//Create a clip path that is the same as the top hexagon
	defs.append("clipPath")
	    .attr("id", "clipSlider")
	    .append("path")
	    .attr("d", "M" + (width/2) + "," + (height/2) + hexagonPath);	
			
	////////////////////////////////////////////////////////////// 
	////////////////////////// Chart ///////////////////////////// 
	////////////////////////////////////////////////////////////// 

	var focusWrapper = svg.append("g")
		.attr("clip-path", "url(#clipSlider")
		.style("clip-path", "url(#clipSlider)"); //make it work in safari

	//Add the lines to focus chart 
	focusWrapper.selectAll(".focus")
		.data(girls, function(d) { return d.name; })
		.enter().append("path")
		.attr("class", "line")
		.style("opacity", 0.7)
		.attr("d", function(d) { return lineBrush(d.values); })
		.style("fill", "none")
		.style("stroke-width", function(d) {return strokeWidth[maxPosition[namesByID[d.name]].values - 1]*1.3; })
		.style("stroke", function(d) {return "url(#line-gradient-" + d.name + ")"; })

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Place Hexagon in center /////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Place a hexagon on the scene
	svg.append("path")
		.attr("class", "hexagon")
		.attr("d", "M" + (width/2) + "," + (height/2) + hexagonPath)
		.style("stroke", "#A0D3EE")
		.style("stroke-width", "7px")
		.style("fill", "none");

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Move colored region ///////////////////////////
	///////////////////////////////////////////////////////////////////////////	
		
	var start = 0.25,
		end = 0.55,
		range = 0.20;

	function moveGradient() {
		
		//Safari can only handle this function when loaded from local host
		if(is_safari) return;
		
		var duration = 5000;

		//Move the left side of the gradient
		d3.selectAll("#sliderIntro .left")
			.transition().duration(duration)
		    .attrTween("offset", function() { 
		    	return d3.interpolate(start, end); 
		    })
		    .call(endall, function() {
		    	d3.selectAll("#sliderIntro .left")
					.transition().duration(duration)
			    	.attrTween("offset", function() { 
			    		return d3.interpolate(end, start); 
		    		})
		    		.call(endall, moveGradient);
		    });

		//Move the right side of the gradient
		d3.selectAll("#sliderIntro .right")
			.transition().duration(duration)
		    .attrTween("offset", function() { 
		    	return d3.interpolate(start+range, end+range); 
		    })
		    .call(endall, function() {
		    	d3.selectAll("#sliderIntro .right")
					.transition().duration(duration)
			    	.attrTween("offset", function() { 
			    		return d3.interpolate(end+range, start+range); 
		    		});
		    });
	}//moveGradient

	moveGradient();

}//update