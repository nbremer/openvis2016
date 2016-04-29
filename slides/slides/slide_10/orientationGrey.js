pt.orientationGrey = pt.orientationGrey || {};

pt.orientationGrey.init = function() {
	
	//Remove any existing svgs
	d3.select('#orientation-grey #orientationGrey svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 10,
		right: 0,
		bottom: 10,
		left: 0
	};
	var width = $(".slides").width()*0.8 - margin.left - margin.right;
	var height = $(".slides").height()*0.8 - margin.top - margin.bottom;

	pt.orientationGrey.innerRadius = Math.min(width, height)/2 * .85;
	pt.orientationGrey.outerRadius = pt.orientationGrey.innerRadius * 1.1;
	pt.orientationGrey.opacityDefault = 0.8;
	var Names = ["Black Widow","Captain America","Hawkeye","the Hulk","Iron Man","Thor"],
		colorPerName = ["#301E1E", "#083E77", "#342350", "#567235", "#8B161C", "#DF7C00"];

	//Which arc to highlight later on
	pt.orientationGrey.chosenArc = 0;

	var matrix = [
		[0,4,3,2,5,2], //Black Widow
		[4,0,3,2,4,3], //Captain America
		[3,3,0,2,3,3], //Hawkeye
		[2,2,2,0,3,3], //The Hulk
		[5,4,3,3,0,2], //Iron Man
		[2,3,3,3,2,0], //Thor
	];

	//SVG container
	pt.orientationGrey.svg = d3.select("#orientation-grey #orientationGrey")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.orientationGrey.svg.append("g")
		.attr("class", "svgWrapper")
		.attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")");

	////////////////////////////////////////////////////////////
	/////////// Create scale and layout functions //////////////
	////////////////////////////////////////////////////////////

	pt.orientationGrey.colors = d3.scale.ordinal()
	    .domain(d3.range(Names.length))
		.range(colorPerName);

	//A "custom" d3 chord function that automatically sorts the order 
	//of the chords in such a manner to reduce overlap	
	pt.orientationGrey.chord = pt.orientationFinal.customChordLayout()
	    .padding(.15)
	    .sortChords(d3.descending)
		.matrix(matrix);
			
	var arc = d3.svg.arc()
	    .innerRadius(pt.orientationGrey.innerRadius*1.01)
	    .outerRadius(pt.orientationGrey.outerRadius);

	var path = d3.svg.chord()
		.radius(pt.orientationGrey.innerRadius);

	////////////////////////////////////////////////////////////
	////////////////////// Prepare data ////////////////////////
	////////////////////////////////////////////////////////////

	//Locate the center of each arc
	var Arcs = pt.orientationGrey.chord.chords();
	Arcs = Arcs.filter(function(d,i) {
		return d.source.index === pt.orientationGrey.chosenArc || d.target.index === pt.orientationGrey.chosenArc;
	})
	var numArcs = Arcs.length+1;
	//Find the radius onto which we should plot the points and arrows
	var centerArcRadius = (pt.orientationGrey.outerRadius - pt.orientationGrey.innerRadius)/2 + pt.orientationGrey.innerRadius;
	centerArcRadius = centerArcRadius * 0.9;
	//Prepare the data by claculating locations of each circle and arrow
	Arcs.forEach( function(d,i) { 
		//Which is the non-chosenArc chord
		if( d.source.index !== pt.orientationGrey.chosenArc) {
			var otherArc = d.source;
			var currentArc = d.target;
		} else {
			var otherArc = d.target;
			var currentArc = d.source;
		}//else

		//Location of the other side arcs
		d.otherSideIndex = otherArc.index;
		d.halfwayAngle = (otherArc.endAngle - otherArc.startAngle)/2 + otherArc.startAngle;
		d.xLoc = centerArcRadius * Math.cos(d.halfwayAngle);
		d.yLoc = centerArcRadius * Math.sin(d.halfwayAngle);
		//Location of the chord at the chosen arc side
		d.halfwayAngleChosen = (currentArc.endAngle - currentArc.startAngle)/2 + currentArc.startAngle;
		d.xLocChosen = centerArcRadius * Math.cos(d.halfwayAngleChosen);
		d.yLocChosen = centerArcRadius * Math.sin(d.halfwayAngleChosen);
	});//for each

	//Save for later use
	pt.orientationGrey.Arcs = Arcs;
			
	////////////////////////////////////////////////////////////
	////////////////// Draw outer Arcs /////////////////////////
	////////////////////////////////////////////////////////////

	var outerArcs = svg.selectAll("g.group")
		.data(pt.orientationGrey.chord.groups)
		.enter().append("g")
		.attr("class", "group");

	outerArcs.append("path")
		.style("fill", function(d) { return pt.orientationGrey.colors(d.index); })
		.attr("d", arc)
		.each(function(d,i) {
			//Search pattern for everything between the start and the first capital L
			var firstArcSection = /(^.+?)L/; 	

			//Grab everything up to the first Line statement
			var newArc = firstArcSection.exec( d3.select(this).attr("d") )[1];
			//Replace all the comma's so that IE can handle it
			newArc = newArc.replace(/,/g , " ");
			
			//If the end angle lies beyond a quarter of a circle (90 degrees or pi/2) 
			//flip the end and start position
			if (d.endAngle > 90*Math.PI/180 & d.startAngle < 270*Math.PI/180) {
				var startLoc 	= /M(.*?)A/,		//Everything between the first capital M and first capital A
					middleLoc 	= /A(.*?)0 0 1/,	//Everything between the first capital A and 0 0 1
					endLoc 		= /0 0 1 (.*?)$/;	//Everything between the first 0 0 1 and the end of the string (denoted by $)
				//Flip the direction of the arc by switching the start en end point (and sweep flag)
				//of those elements that are below the horizontal line
				var newStart = endLoc.exec( newArc )[1];
				var newEnd = startLoc.exec( newArc )[1];
				var middleSec = middleLoc.exec( newArc )[1];
				
				//Build up the new arc notation, set the sweep-flag to 0
				newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
			}//if
			
			//Create a new invisible arc that the text can flow along
			svg.append("path")
				.attr("class", "hiddenArcs")
				.attr("id", "arc"+i)
				.attr("d", newArc)
				.style("fill", "none");
		});

	////////////////////////////////////////////////////////////
	////////////////// Append Names ////////////////////////////
	////////////////////////////////////////////////////////////

	//Append the label names on the outside
	outerArcs.append("text")
		.attr("class", "titles")
		.attr("dy", function(d,i) { return (d.endAngle > 90*Math.PI/180 & d.startAngle < 270*Math.PI/180 ? 35 : -16); })
	   .append("textPath")
		.attr("startOffset","50%")
		.style("text-anchor","middle")
		.attr("xlink:href",function(d,i){return "#arc"+i;})
		.text(function(d,i){ return Names[i]; });
		
	////////////////////////////////////////////////////////////
	////////////////// Draw inner chords ///////////////////////
	////////////////////////////////////////////////////////////
	  
	svg.selectAll("path.chord")
		.data(pt.orientationGrey.chord.chords)
		.enter().append("path")
		.attr("class", "chord")
		//.style("fill", function(d){ return "url(#" + getGradID(d) + ")"; })
		.style("fill", function(d) { return pt.orientationGrey.colors(d.target.index); })
		.style("opacity", pt.orientationGrey.opacityDefault)
		.attr("d", path);

};//init

pt.orientationGrey.toIndex = function() {

	//Make the chords colored
	d3.selectAll("#orientationGrey path.chord")
		.transition().duration(1000)
		.style("fill", function(d) { return pt.orientationGrey.colors(d.target.index); })
		.style("opacity", pt.orientationGrey.opacityDefault);

};//toIndex

pt.orientationGrey.toGrey = function() {

	//Change all the chords to grey
	d3.selectAll("#orientationGrey path.chord")
		.transition().duration(1000)
		.style("fill", "#B3B3B3")
		.style("opacity", pt.orientationGrey.opacityDefault);

	//Fade out and then remove the dots (if you move backwards through the slides)
	d3.selectAll("#orientationGrey .arcDotWrapper")
		.transition().duration(1000)
		.style("opacity", 0)
		.remove();

	//Show the title (if you move backwards through the slides)
	d3.select("#orientation-grey .title")
		.style("visibility", "visible");

};//toGrey

pt.orientationGrey.highlightOne = function() {
	var chosenArc = pt.orientationGrey.chosenArc;

	//Hide title in top left
	d3.select("#orientation-grey .title")
		.style("visibility", "hidden");

	//Fade out and then remove the dots (if you move backwards through the slides)
	d3.selectAll("#orientationGrey .arcDotWrapper")
		.transition().duration(1000)
		.style("opacity", 0)
		.remove();

	//Make all chords grey and barely visible instead of the chords coming from the chosen Arc
	d3.selectAll("#orientationGrey path.chord")
			.transition("background").duration(1500)
			.style("fill", "#B3B3B3")
	        .style("opacity", function(d,i) {
	        	return d.source.index !== chosenArc && d.target.index !== chosenArc ? 0.1 : 0.6; 
	        });

};//highlightOne

pt.orientationGrey.placeMarkers = function() {

	//Show the group (in case you move backwards)
	d3.selectAll("#orientationGrey .group")
		.transition().duration(1000)
		.style("opacity", 1);

	//Remove the stuff that is built here (in case you move backwards)
	d3.selectAll("#orientationGrey .arcDotWrapper").remove();

	var chosenArc = pt.orientationGrey.chosenArc,
		Arcs = pt.orientationGrey.Arcs;

	//Make all chords grey and barely visible instead of the chords coming from the chosen Arc
	//(in case you move backwards)
	d3.selectAll("#orientationGrey path.chord")
			.transition("background").duration(1500)
			.style("fill", "#B3B3B3")
	        .style("opacity", function(d,i) {
	        	return d.source.index !== chosenArc && d.target.index !== chosenArc ? 0.1 : 0.6; 
	        });

	////////////////////////////////////////////////////////////
	//////////////////// Prepare the lines /////////////////////
	////////////////////////////////////////////////////////////

	// //Create a new ordering so the index numbers are in the right order with respect to the chosen arc
	// //Only needed for curved arcs
	// var numSeq = [];
	// for(var m = 0; m < numArcs; m++) {	
	// 		numSeq[m] = (numArcs+(chosenArc-1)-m)%numArcs;
	// }//for i

	//Wrapper for the dots and arrows
	var arcDotWrapper = d3.selectAll("#orientationGrey .svgWrapper")
		.append("g")
		.attr("class", "arcDotWrapper")
		.attr("transform", "rotate(-90)");

	//Create the lines between the centers of each arc
	var arcArrows = arcDotWrapper.selectAll(".arcArrowsGradient")
		.data(Arcs)
		.enter().append("path")
		.attr("class", "arcArrowsGradient")
		.attr("d", function(d,i) {
			return "M" + d.xLocChosen + "," + d.yLocChosen + "L" + d.xLoc + "," + d.yLoc;
		})
		// .attr("d", function(d,i) {
		// 	var radius = Math.sqrt(Math.pow(d.xLocChosen - d.xLoc,2) + Math.pow(d.yLocChosen - d.yLoc,2));

		// 	//Base the path on the location of the neighbours with respect to the chose arc
		// 	if ( isInArray(d.otherSideIndex, numSeq.slice(0,(numArcs/2-1))) ) {
		// 		return "M" + d.xLocChosen + "," + d.yLocChosen + "A" + radius + "," + radius + " 0 0,1 " + d.xLoc + "," + d.yLoc;
		// 	} else if (d.otherSideIndex === numSeq[(numArcs/2-1)]) {
		// 		return "M" + d.xLocChosen + "," + d.yLocChosen + "L" + d.xLoc + "," + d.yLoc;
		// 	} else if ( isInArray(d.otherSideIndex, numSeq.slice(numArcs/2,numSeq.length)) ) {
		// 		return "M" + d.xLocChosen + "," + d.yLocChosen + "A" + radius + "," + radius + " 0 0,0 " + d.xLoc + "," + d.yLoc;
		// 	}//else if

		// })
		.style("stroke", "#404040")
		.style("stroke-width", 2)
		.style("fill", "none")
		.style("opacity", 0);

	////////////////////////////////////////////////////////////
	//////////// Draw the lines with arrow markers /////////////
	////////////////////////////////////////////////////////////

	//Create arrow markers
	arcDotWrapper.append("defs").append("marker")
	    .attr("id", "arrowMarker")
	    .attr("viewBox", "0 -5 10 10")
	    .attr("refX", 14.5)
	    .attr("refY", 0)
	    .attr("markerWidth", 8)
	    .attr("markerHeight", 8)
	    .attr("orient", "auto")
	  .append("path")
	    .attr("d", "M0,-5 L10,0 L0,5")
	    .style("fill", "#404040");

	//Clone the lines and place an arrow marker
	var arrowLineCloned = cloneSelection(arcDotWrapper, arcArrows, "arcArrowsLine", 1);
	arcDotWrapper.selectAll(".arcArrowsLine")
		.attr("marker-end", "url(#arrowMarker)");

	////////////////////////////////////////////////////////////
	/////////////////////// Draw the dots //////////////////////
	////////////////////////////////////////////////////////////

	//Place the circles on the center of each of the "other side" arcs
	var arcDots = arcDotWrapper.selectAll(".arcDots .arcDotsOtherSide")
		.data(Arcs)
		.enter().append("circle")
		.attr("class", "arcDots arcDotsOtherSide")
		.attr("cx", function(d) { return d.xLoc; })
		.attr("cy", function(d) { return d.yLoc; })
		.attr("r", 0)
		.style("fill", function(d) { return pt.orientationGrey.colors(d.otherSideIndex); })
		.style("stroke", "white")
		.style("stroke-width", 1)
		.style("stroke-opacity", 0);

	//Duplicate the dots and this time, place them on the chosen chord
	var arcDotsChosen = arcDotWrapper.selectAll(".arcDots .arcDotsChosen")
		.data(Arcs)
		.enter().append("circle")
		.attr("class", "arcDots arcDotsChosen")
		.attr("cx", function(d) { return d.xLocChosen; })
		.attr("cy", function(d) { return d.yLocChosen; })
		.attr("r", 0)
		.style("fill", function(d) { return pt.orientationGrey.colors(chosenArc); })
		.style("stroke", "white")
		.style("stroke-width", 1)
		.style("stroke-opacity", 0);

	////////////////////////////////////////////////////////////
	/////////////////////// Transitions ////////////////////////
	////////////////////////////////////////////////////////////

	//Make the circle grow
	arcDotWrapper.selectAll(".arcDots")
		.transition().duration(1000)
		.attr("r", 8)
		.style("stroke-opacity", 1);

	//Show the lines and arrow heads
	arcDotWrapper.selectAll(".arcArrowsLine")
		.transition("appear").duration(1000).delay(1000)
		.style("opacity", 0.8);

};//placeMarkers

pt.orientationGrey.placeRect = function() {

	var chosenArc = pt.orientationGrey.chosenArc;
	var Arcs = pt.orientationGrey.Arcs;

	//Make all chords grey and barely visible instead of the chords coming from the chosen Arc
	//(in case you move backwards)
	d3.selectAll("#orientationGrey path.chord")
			.transition("background").duration(1500)
			.style("fill", "#B3B3B3")
	        .style("opacity", function(d,i) {
	        	return d.source.index !== chosenArc && d.target.index !== chosenArc ? 0.1 : 0.6; 
	        });
	
	////////////////////////////////////////////////////////////
	///////////////////// Create gradient //////////////////////
	////////////////////////////////////////////////////////////

	//Function to create the id for each chord gradient
	function getGradID(d){ return "chordGrad" + d.source.index + "-" + d.target.index; }

	//Create the gradients definitions for each chord
	var grads = pt.orientationGrey.svg.selectAll(".svgWrapper")
		.append("defs").selectAll("linearGradient")
		.data(Arcs)
	   .enter().append("linearGradient")
		.attr("id", getGradID)
		.attr("gradientUnits", "userSpaceOnUse")
		.attr("x1", function(d,i) { return pt.orientationGrey.innerRadius * Math.cos((d.source.endAngle-d.source.startAngle)/2 + d.source.startAngle - 0); })
		.attr("y1", function(d,i) { return pt.orientationGrey.innerRadius * Math.sin((d.source.endAngle-d.source.startAngle)/2 + d.source.startAngle - 0); })
		.attr("x2", function(d,i) { return pt.orientationGrey.innerRadius * Math.cos((d.target.endAngle-d.target.startAngle)/2 + d.target.startAngle - 0); })
		.attr("y2", function(d,i) { return pt.orientationGrey.innerRadius * Math.sin((d.target.endAngle-d.target.startAngle)/2 + d.target.startAngle - 0); });

	//Set the starting color (at 0%)
	grads.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", function(d){ return pt.orientationGrey.colors(d.source.index); });

	//Set the ending color (at 100%)
	grads.append("stop")
		.attr("offset", "100%")
		.attr("stop-color", function(d){ return pt.orientationGrey.colors(d.target.index); });

	////////////////////////////////////////////////////////////
	///////////////// Create rectangle overlays ////////////////
	////////////////////////////////////////////////////////////

	//Dim the group
	d3.selectAll("#orientationGrey .group")
		.transition().duration(1000)
		.style("opacity", 0.6);

	//Make the line white
	d3.selectAll("#orientationGrey .arcArrowsLine")
		.style("stroke", "white")
		.style("opacity", 0.6);
	//Make the arrow marker white
 	d3.selectAll("#orientationGrey #arrowMarker path")
		.style("fill", "white");

	//Take one of the hidden sets of lines and show them with the new gradient
	d3.selectAll("#orientationGrey .arcArrowsGradient")
		.style("stroke-linecap","square")
		.style("stroke", function(d){ return "url(#" + getGradID(d) + ")"; })
		.style("stroke-width", 40)
		.transition("widen").duration(1000)
		.style("opacity", 1);

}//placeRect

