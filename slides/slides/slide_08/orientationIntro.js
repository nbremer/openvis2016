pt.orientationIntro = pt.orientationIntro || {};

pt.orientationIntro.init = function() {
	
	//Remove any existing svgs
	d3.select('#intro-orientation #introOrientation svg').remove();

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
				
	//SVG container
	pt.orientationIntro.svg = d3.select("#intro-orientation #introOrientation")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.orientationIntro.svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	///////////////////////////////////////////////////////////////////////////
	/////////////////////// Calculate hexagon variables ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var SQRT3 = Math.sqrt(3),
		hexRadius = Math.min(width, height)/2,
		hexWidth = SQRT3 * hexRadius,
		hexHeight = 2 * hexRadius;
	var hexagonPoly = [[0,-1],[SQRT3/2,0.5],[0,1],[-SQRT3/2,0.5],[-SQRT3/2,-0.5],[0,-1],[SQRT3/2,-0.5]];
	var hexagonPath = "m" + hexagonPoly.map(function(p){ return [p[0]*hexRadius, p[1]*hexRadius].join(','); }).join('l') + "z";


	////////////////////////////////////////////////////////////
	/////////// Create scale and layout functions //////////////
	////////////////////////////////////////////////////////////

	var innerRadius = hexHeight/2,
	    Names = ["Black Widow","Captain America","Hawkeye","the Hulk","Iron Man","Thor"],
		colors = ["#EFB605", "#E34914", "#B90050", "#724097", "#0C8B8C", "#7EB852"],
		opacityDefault = 0.8;

	var matrix = [
		[0,4,9,5,5,2], //sum
		[5,0,6,4,7,3],
		[3,3,0,5,12,2], 
		[2,10,5,0,3,5],
		[6,5,7,5,0,2],
		[4,6,5,6,4,0],
	];

	// //Do the rows sum up?
	// for(var i=0; i<6; i++) {
	// 	var Total = 0;
	// 	for(var j=0; j<6; j++) {
	// 		Total += matrix[i][j];
	// 	}
	// 	console.log(Total);
	// }

	var colors = d3.scale.ordinal()
	    .domain(d3.range(Names.length))
		.range(colors);

	//A "custom" d3 chord function that automatically sorts the order of the chords 
	//in such a manner to reduce overlap	
	var chord = pt.orientationFinal.customChordLayout() //customChordLayout()
	    .padding(.15)
	    .sortChords(d3.descending)
		.matrix(matrix);

	var path = d3.svg.chord()
		.radius(innerRadius);

	////////////////////////////////////////////////////////////
	/////////////// Create the gradient fills //////////////////
	////////////////////////////////////////////////////////////

	//Function to create the id for each chord gradient
	function getGradID(d){ return "chordGrad-" + d.source.index + "-" + d.target.index; }

	var defs = svg.append("defs");
	
	//Create the gradients definitions for each chord
	var grads = defs.selectAll("linearGradient")
		.data(chord.chords())
	   .enter().append("linearGradient")
		.attr("id", getGradID)
		.attr("gradientUnits", "userSpaceOnUse")
		.attr("x1", function(d,i) { return innerRadius * Math.cos((d.source.endAngle-d.source.startAngle)/2 + d.source.startAngle - Math.PI/2); })
		.attr("y1", function(d,i) { return innerRadius * Math.sin((d.source.endAngle-d.source.startAngle)/2 + d.source.startAngle - Math.PI/2); })
		.attr("x2", function(d,i) { return innerRadius * Math.cos((d.target.endAngle-d.target.startAngle)/2 + d.target.startAngle - Math.PI/2); })
		.attr("y2", function(d,i) { return innerRadius * Math.sin((d.target.endAngle-d.target.startAngle)/2 + d.target.startAngle - Math.PI/2); })

	//Set the starting color (at 0%)
	grads.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", function(d){ return colors(d.source.index); });

	//Set the ending color (at 100%)
	grads.append("stop")
		.attr("offset", "100%")
		.attr("stop-color", function(d){ return colors(d.target.index); });

	//Create a clip path that is the same as the top hexagon
	defs.append("clipPath")
        .attr("id", "clip")
        .append("path")
        .attr("d", "M" + (width/2) + "," + (height/2) + hexagonPath);
		
	///////////////////////////////////////////////////////////////////////////
	////////////////////// Place circles inside hexagon ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //First append a group for the clip path, then a new group that can be transformed
	var arcWrapperOuter = svg.append("g")
		.attr("clip-path", "url(#clip")
		.style("clip-path", "url(#clip)"); //make it work in safari

	var arcWrapperInner = arcWrapperOuter.append("g")
		.attr("transform", "translate(" + (width/2) + "," + (height/2) + ") rotate(4.2)");
		
	////////////////////////////////////////////////////////////
	////////////////// Draw inner chords ///////////////////////
	////////////////////////////////////////////////////////////
	  
	arcWrapperInner.selectAll("path.chord")
		.data(chord.chords)
		.enter().append("path")
		.attr("class", "chord")
		.style("fill", function(d){ return "url(#" + getGradID(d) + ")"; })
		.style("opacity", opacityDefault)
		.attr("d", path);

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Place Hexagon in center /////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Place a hexagon on the scene
	svg.append("path")
		.attr("class", "hexagon")
		.attr("d", "M" + (width/2) + "," + (height/2) + hexagonPath)
		.style("stroke", "#F2F2F2")
		.style("stroke-width", "7px")
		.style("fill", "none");

}//init
