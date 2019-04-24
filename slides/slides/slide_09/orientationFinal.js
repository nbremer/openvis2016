pt.orientationFinal = pt.orientationFinal || {};

pt.orientationFinal.init = function() {
	
	//Remove any existing svgs
	pt.orientationFinal.svg = null;
	d3.select('#orientation-final #orientationFinal svg').remove();

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

	var innerRadius = Math.min(width, height)/2 * .85,
	    outerRadius = innerRadius * 1.1,
	    Names = ["Black Widow","Captain America","Hawkeye","the Hulk","Iron Man","Thor"],
		colors = ["#301E1E", "#083E77", "#342350", "#567235", "#8B161C", "#DF7C00"],
		opacityDefault = 0.8;

	var matrix = [
		[0,4,3,2,5,2], //Black Widow
		[4,0,3,2,4,3], //Captain America
		[3,3,0,2,3,3], //Hawkeye
		[2,2,2,0,3,3], //The Hulk
		[5,4,3,3,0,2], //Iron Man
		[2,3,3,3,2,0], //Thor
	];

	//SVG container
	pt.orientationFinal.svg = d3.select("#orientation-final #orientationFinal")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.orientationFinal.svg.append("g")
		.attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")");

	////////////////////////////////////////////////////////////
	/////////// Create scale and layout functions //////////////
	////////////////////////////////////////////////////////////

	var colors = d3.scale.ordinal()
	    .domain(d3.range(Names.length))
		.range(colors);

	//A "custom" d3 chord function that automatically sorts the order of the chords in such a manner to reduce overlap	
	var chord = pt.orientationFinal.customChordLayout()
	    .padding(.15)
	    .sortChords(d3.descending) //which chord should be shown on top when chords cross. Now the biggest chord is at the bottom
		.matrix(matrix);
			
	var arc = d3.svg.arc()
	    .innerRadius(innerRadius*1.01)
	    .outerRadius(outerRadius);

	var path = d3.svg.chord()
		.radius(innerRadius);
		
	////////////////////////////////////////////////////////////
	/////////////// Create the gradient fills //////////////////
	////////////////////////////////////////////////////////////

	//Function to create the id for each chord gradient
	function getGradID(d){ return "chordGrad-final-" + d.source.index + "-" + d.target.index; }

	//Create the gradients definitions for each chord
	var grads = svg.append("defs").selectAll("linearGradient")
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
			
	////////////////////////////////////////////////////////////
	////////////////// Draw outer Arcs /////////////////////////
	////////////////////////////////////////////////////////////

	var outerArcs = svg.selectAll("g.group")
		.data(chord.groups)
		.enter().append("g")
		.attr("class", "group");

	outerArcs.append("path")
		.style("fill", function(d) { return colors(d.index); })
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
		.data(chord.chords)
		.enter().append("path")
		.attr("class", "chord")
		.style("fill", function(d){ return "url(#" + getGradID(d) + ")"; })
		.style("opacity", opacityDefault)
		.attr("d", path);

	////////////////////////////////////////////////////////////
	////////////////// Extra Functions /////////////////////////
	////////////////////////////////////////////////////////////

	//Loop through the different avengers
	var counter  = 0;
	function loop() {
		var chosenChord = counter % chord.groups().length; //Math.round(Math.random() * (chord.groups().length-1));
		counter+=1;
		//Hide all none chosen chords and make the chosen chord more apperant
		svg.selectAll("path.chord")
			.transition().duration(1500)
	        .style("opacity", function(d,i) {
	        	return d.source.index !== chosenChord && d.target.index !== chosenChord ? 0.1: 1
	        })
	        .transition().duration(1500).delay(2500)
		    .style("opacity", opacityDefault);
	}//function loop

	//Start the first loop a bit faster
	setTimeout(function() {
		loop();
		//Loop throught the fades per arc
		setInterval( loop, 5000)
	}, 3000);

}//init

///////////////////////////////////////////////////////////////////////////
/////////////////////////// Custom Chord Sorting //////////////////////////
///////////////////////////////////////////////////////////////////////////	

pt.orientationFinal.customChordLayout = function() {
	var ε = 1e-6, ε2 = ε * ε, π = Math.PI, τ = 2 * π, τε = τ - ε, halfπ = π / 2, d3_radians = π / 180, d3_degrees = 180 / π;
    var chord = {}, chords, groups, matrix, n, padding = 0, sortGroups, sortSubgroups, sortChords;
    function relayout() {
		var subgroups = {}, groupSums = [], groupIndex = d3.range(n), subgroupIndex = [], k, x, x0, i, j;
		var numSeq;
		chords = [];
		groups = [];
		k = 0, i = -1;
		  
		while (++i < n) {
			x = 0, j = -1, numSeq = [];
			while (++j < n) {
			  x += matrix[i][j];
			}
			groupSums.push(x);
			//////////////////////////////////////
			////////////// New part //////////////
			//////////////////////////////////////
			for(var m = 0; m < n; m++) {	
				numSeq[m] = (n+(i-1)-m)%n;
			}
			subgroupIndex.push(numSeq);
			//////////////////////////////////////
			//////////  End new part /////////////
			//////////////////////////////////////
			k += x;
		  }//while
	  
		k = (τ - padding * n) / k;
		x = 0, i = -1;
		while (++i < n) {
			x0 = x, j = -1;
			while (++j < n) {
				var di = groupIndex[i], dj = subgroupIndex[di][j], v = matrix[di][dj], a0 = x, a1 = x += v * k;
				subgroups[di + "-" + dj] = {
					index: di,
					subindex: dj,
					startAngle: a0,
					endAngle: a1,
					value: v
				};
			}//while
			
			groups[di] = {
				index: di,
				startAngle: x0,
				endAngle: x,
				value: (x - x0) / k
			};
			x += padding;
		}//while

		i = -1;
		while (++i < n) {
			j = i - 1;
			while (++j < n) {
				var source = subgroups[i + "-" + j], target = subgroups[j + "-" + i];
				if (source.value || target.value) {
					chords.push(source.value < target.value ? {
						source: target,
						target: source
					} : {
						source: source,
						target: target
					});
				}//if
			}//while
		}//while
      if (sortChords) resort();
    }//function relayout
	
    function resort() {
      chords.sort(function(a, b) {
        return sortChords((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2);
      });
    }
    chord.matrix = function(x) {
      if (!arguments.length) return matrix;
      n = (matrix = x) && matrix.length;
      chords = groups = null;
      return chord;
    };
    chord.padding = function(x) {
      if (!arguments.length) return padding;
      padding = x;
      chords = groups = null;
      return chord;
    };
    chord.sortGroups = function(x) {
      if (!arguments.length) return sortGroups;
      sortGroups = x;
      chords = groups = null;
      return chord;
    };
    chord.sortSubgroups = function(x) {
      if (!arguments.length) return sortSubgroups;
      sortSubgroups = x;
      chords = null;
      return chord;
    };
    chord.sortChords = function(x) {
      if (!arguments.length) return sortChords;
      sortChords = x;
      if (chords) resort();
      return chord;
    };
    chord.chords = function() {
      if (!chords) relayout();
      return chords;
    };
    chord.groups = function() {
      if (!groups) relayout();
      return groups;
    };
    return chord;
}//customChordLayout
