pt.stretchedChordFinal = pt.stretchedChordFinal || {};

pt.stretchedChordFinal.init = function() {
	
	//Remove any existing svgs
	d3.select('#stretched-chord-final #stretchedChordFinal svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 140,
		right: 0,
		bottom: 50,
		left: 0
	};
	var width = $(".slides").width() - margin.left - margin.right;
	var height = $(".slides").height()*0.95 - margin.top - margin.bottom;
		
	var outerRadius = Math.min(width, height) / 2  - 100,
		innerRadius = outerRadius * 0.95,
		opacityDefault = 0.7, //default opacity of chords
		opacityLow = 0.02,
		pullOutSize = 70;

	//SVG container
	pt.stretchedChordFinal.svg = d3.select("#stretched-chord-final #stretchedChordFinal")
		.append("svg")
		.attr("class", "svgWrapper")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.stretchedChordFinal.svg.append("g")
		.attr("transform", "translate(" + (margin.left + width/2) + "," + (margin.top+height/2) + ")");

	//////////////////////////////////////////////////////
	//////////////// add animated gradient ///////////////
	//////////////////////////////////////////////////////

	var defs = svg.append("defs");
	var linearGradient = defs.append("linearGradient")
		.attr("id","animatedGradient");
		
	//The gradient definition below isn't the fastest or most optimal way
	//but because safari can't handle spreadMethod reflect I had to make
	//changes. This will result in an optically indefinite flow
	linearGradient.attr("x1","-100%")
		.attr("y1","0%")
		.attr("x2","100%")
		.attr("y2","0%")
		.attr("spreadMethod", "reflect");

	linearGradient.selectAll(".stop")
		.data([
			{className: "stop1", offset: 0, color: "#E8E8E8"},
			{className: "stop2", offset: 0.125, color: "#A3A3A3"},
			{className: "stop3", offset: 0.25, color: "#E8E8E8"},
			{className: "stop4", offset: 0.375, color: "#A3A3A3"},
			{className: "stop5", offset: 0.5, color: "#E8E8E8"},
			{className: "stop6", offset: 0.625, color: "#A3A3A3"},
			{className: "stop7", offset: 0.75, color: "#E8E8E8"},
			{className: "stop8", offset: 0.875, color: "#A3A3A3"},
			{className: "stop9", offset: 1, color: "#E8E8E8"}
			
			// //Other possibility
			// {className: "stop1", offset: 0, color: "#E8E8E8"},
			// {className: "stop2", offset: 0.25, color: "#A3A3A3"},
			// {className: "stop3", offset: 0.5, color: "#E8E8E8"},
			// {className: "stop4", offset: 0.75, color: "#A3A3A3"},
			// {className: "stop5", offset: 1, color: "#E8E8E8"}
		])
		.enter().append("stop")
		.attr("class", function(d) { return d.className; })
		.attr("offset", function(d) { return d.offset; })
		.attr("stop-color", "#CDCDCD");

	linearGradient.append("animate")
		.attr("attributeName","x1")
		.attr("values","-100%;0%")
		.attr("dur","7s")
		.attr("repeatCount","indefinite");

	linearGradient.append("animate")
		.attr("attributeName","x2")
		.attr("values","100%;200%")
		.attr("dur","7s")
		.attr("repeatCount","indefinite");

	//////////////////////////////////////////////////////
	//////////////////// Titles on top ///////////////////
	//////////////////////////////////////////////////////

	var titleWrapper = svg.append("g").attr("class", "chordTitleWrapper"),
		titleOffset = -height/2 + 40;

	//Append title to the top
    titleWrapper.append("text")
    	.attr("class", "title")
        .attr("x", 0)
        .attr("y", titleOffset - 80)
        .text("How much does your education define where you end up working?");

	//Title	top left
	titleWrapper.append("text")
		.attr("class","subtitle left")
		.attr("x", -outerRadius)
		.attr("y", titleOffset)
		.text("Education");
	titleWrapper.append("line")
		.attr("class","titleLine left")
		.attr("x1", -outerRadius*0.6)
		.attr("x2", -outerRadius*1.4)
		.attr("y1", titleOffset+8)
		.attr("y2", titleOffset+8);
	//Title top right
	titleWrapper.append("text")
		.attr("class","subtitle right")
		.attr("x", outerRadius)
		.attr("y", titleOffset)
		.text("Occupation");
	titleWrapper.append("line")
		.attr("class","titleLine right")
		.attr("x1", -outerRadius*0.6 + 2*outerRadius)
		.attr("x2", -outerRadius*1.4 + 2*outerRadius)
		.attr("y1", titleOffset+8)
		.attr("y2", titleOffset+8);
		
	////////////////////////////////////////////////////////////
	////////////////////////// Data ////////////////////////////
	////////////////////////////////////////////////////////////

	var Names = ["Administrative Staff","Crafts","Business Management","Basic Occupations","Health",
				"IT","Juridical & Cultural","Management functions","Teachers",
				"Salesmen & Service providers","Caretakers","Science & Engineering", "Other", "",
				"Engineering","Education","Agriculture","Art, Language & Culture","Health","Behavior & Social Sciences","Economy",""];

	var respondents = 17533, //Total number of respondents (i.e. the number that make up the total group
		emptyPerc = 0.5, //What % of the circle should become empty
		emptyStroke = Math.round(respondents*emptyPerc); 
	var matrix = [
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,65,44,57,39,123,1373,0], //Administratief personeel
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,11,0,0,24,0], //Ambachtslieden
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,173,43,52,55,36,125,2413,0], //Bedrijfsbeheer (vak)specialisten
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,16,13,23,10,37,54,0], //Elementaire beroepen
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,161,24,17,0,2089,85,60,0], //Gezondheidszorg (vak)specialisten
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,510,0,0,57,0,0,251,0], //IT (vak)specialisten
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,118,10,454,99,1537,271,0], //Juridisch en culturele (vak)specialisten
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,76,21,10,15,125,41,261,0], //Leidinggevende functies
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,2206,37,292,32,116,76,0], //Onderwijsgevenden
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,74,43,116,51,135,752,0], //Verkopers en verleners persoonlijke diensten
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,34,0,22,27,156,36,0], //Verzorgend personeel
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1141,0,111,291,0,0,48,0], //Wetenschap en techniek (vak)specialisten
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,39,0,0,20,109,0], //Other
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,emptyStroke], //dummyBottom
		[232,32,173,32,161,510,16,76,32,96,15,1141,36,0,0,0,0,0,0,0,0,0], //Techniek
		[65,0,43,16,24,0,118,21,2206,74,34,0,0,0,0,0,0,0,0,0,0,0], //Onderwijs
		[44,0,52,13,17,0,10,10,37,43,0,111,39,0,0,0,0,0,0,0,0,0], //Landbouw
		[57,11,55,23,0,57,454,15,292,116,22,291,0,0,0,0,0,0,0,0,0,0], //Kunst, Taal en Cultuur
		[39,0,36,10,2089,0,99,125,32,51,27,0,0,0,0,0,0,0,0,0,0,0], //Gezondheidszorg
		[123,0,125,37,85,0,1537,41,116,135,156,0,20,0,0,0,0,0,0,0,0,0], //Gedrag & Maatschappij
		[1373,24,2413,54,60,251,271,261,76,752,36,48,109,0,0,0,0,0,0,0,0,0], //Economie
		[0,0,0,0,0,0,0,0,0,0,0,0,0,emptyStroke,0,0,0,0,0,0,0,0] //dummyTop
	];
	//Calculate how far the Chord Diagram needs to be rotated clockwise to make the dummy
	//invisible chord center vertically
	var offset = (2 * Math.PI) * (emptyStroke/(respondents + emptyStroke))/4;

	//Custom sort function of the chords to keep them in the original order
	var chord = pt.stretchedChord.customChordLayout() //d3.layout.chord()
		.padding(.02)
		.sortChords(d3.descending) //which chord should be shown on top when chords cross. Now the biggest chord is at the bottom
		.matrix(matrix);

	var arc = d3.svg.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius)
		.startAngle(startAngle) //startAngle and endAngle now include the offset in degrees
		.endAngle(endAngle);

	var path = pt.stretchedChord.stretchedChord() //Call the stretched chord function 
		.radius(innerRadius)
		.startAngle(startAngle)
		.endAngle(endAngle)
		.pullOutSize(pullOutSize);

	////////////////////////////////////////////////////////////
	//////////////////// Draw outer Arcs ///////////////////////
	////////////////////////////////////////////////////////////

	// //Get a better overview of the gradient - for testing
	// svg.append("rect")
	// 	.attr("x", -width/2)
	// 	.attr("y", -height/2)
	// 	.attr("width", width)
	// 	.attr("height", height)
	// 	.style("fill", "url(#animatedGradient)");
		
	var g = svg.selectAll("g.group")
		.data(chord.groups)
		.enter().append("g")
		.attr("class", "group")
		//.on("mouseover", fade(opacityLow))
		//.on("mouseout", fade(opacityDefault))
		;

	g.append("path")
		.style("stroke", function(d,i) { return (Names[i] === "" ? "none" : "#00A1DE"); })
		.style("fill", function(d,i) { return (Names[i] === "" ? "none" : "#00A1DE"); })
		.style("pointer-events", function(d,i) { return (Names[i] === "" ? "none" : "auto"); })
		.attr("d", arc)
		.attr("transform", function(d, i) { //Pull the two slices apart
					d.pullOutSize = pullOutSize * ( d.startAngle + 0.001 > Math.PI ? -1 : 1);
					return "translate(" + d.pullOutSize + ',' + 0 + ")";
		});

	////////////////////////////////////////////////////////////
	////////////////////// Append Names ////////////////////////
	////////////////////////////////////////////////////////////

	//The text also needs to be displaced in the horizontal directions
	//And also rotated with the offset in the clockwise direction
	g.append("text")
		.each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2) + offset;})
		.attr("dy", ".35em")
		.attr("class", "titles")
		// .style("font-size", "10px")
		.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
		.attr("transform", function(d,i) { 
			var c = arc.centroid(d);
			return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")"
			+ "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
			+ "translate(" + 20 + ",0)"
			+ (d.angle > Math.PI ? "rotate(180)" : "")
		})
	  .text(function(d,i) { return Names[i]; })
	  .call(wrapChord, 100);

	////////////////////////////////////////////////////////////
	//////////////////// Draw inner chords /////////////////////
	////////////////////////////////////////////////////////////
	 
	svg.selectAll(".chord")
		.data(chord.chords)
		.enter().append("path")
		.attr("class", "chord")
		.style("stroke", "none")
		//.style("fill", "#CDCDCD")
		.style("fill", "url(#animatedGradient)") //An SVG Gradient to give the impression of a flow from left to right
		.style("opacity", function(d) { return (Names[d.source.index] === "" ? 0 : opacityDefault); }) //Make the dummy strokes have a zero opacity (invisible)
		.style("pointer-events", function(d,i) { return (Names[d.source.index] === "" ? "none" : "auto"); }) //Remove pointer events from dummy strokes
		.attr("d", path)
		//.on("mouseover", fadeOnChord)
		//.on("mouseout", fade(opacityDefault))
		;	

	////////////////////////////////////////////////////////////
	////////////////// Extra Functions /////////////////////////
	////////////////////////////////////////////////////////////

	//Include the offset in de start and end angle to rotate the Chord diagram clockwise
	function startAngle(d) { return d.startAngle + offset; }
	function endAngle(d) { return d.endAngle + offset; }

	//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text
	function wrapChord(text, width) {
	  text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.1, // ems
			y = 0,
			x = 0,
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		  }
		}
	  });
	}//wrapChord
}//init

pt.stretchedChordFinal.greyChords = function() {

	//Update all stop-colors to the same color
	d3.selectAll("#stretchedChordFinal stop")
		.transition().duration(1000)
		.attr("stop-color","#CDCDCD");

}//greyChords

pt.stretchedChordFinal.animatedChords = function() {

	//Update the stop colors to 2 different sets so the flow becomes visible
	d3.selectAll("#stretchedChordFinal stop")
		.transition().duration(1500)
		.attr("stop-color",function(d) { return d.color; });

}//animatedChords

pt.stretchedChordFinal.stretchedChord = function() {
    var source = d3_source, 
		target = d3_target, 
		radius = d3_svg_chordRadius, 
		startAngle = d3_svg_arcStartAngle, 
		endAngle = d3_svg_arcEndAngle,
		pullOutSize = 0;
		
	var π = Math.PI,
		halfπ = π / 2;

    function subgroup(self, f, d, i) {
		var subgroup = f.call(self, d, i), 
			r = radius.call(self, subgroup, i), 
			a0 = startAngle.call(self, subgroup, i) - halfπ, 
			a1 = endAngle.call(self, subgroup, i) - halfπ;
      return {
        r: r,
        a0: [a0],
        a1: [a1],
        p0: [ r * Math.cos(a0), r * Math.sin(a0)],
        p1: [ r * Math.cos(a1), r * Math.sin(a1)]
      };
    }

    function arc(r, p, a) {
		var sign = (p[0] >= 0 ? 1 : -1);
		return "A" + r + "," + r + " 0 " + +(a > π) + ",1 " + (p[0] + sign*pullOutSize) + "," + p[1];
    }


    function curve(p1) {
		var sign = (p1[0] >= 0 ? 1 : -1);
		return "Q 0,0 " + (p1[0] + sign*pullOutSize) + "," + p1[1];
    }
	
	/*
	M = moveto
	M x,y
	Q = quadratic Bézier curve
	Q control-point-x,control-point-y end-point-x, end-point-y
	A = elliptical Arc
	A rx, ry x-axis-rotation large-arc-flag, sweep-flag  end-point-x, end-point-y
	Z = closepath

	M251.5579641956022,87.98204731514328
	A266.5,266.5 0 0,1 244.49937503334525,106.02973926358392
	Q 0,0 -177.8355222451483,198.48621369706098
	A266.5,266.5 0 0,1 -191.78901944612068,185.0384338992728
	Q 0,0 251.5579641956022,87.98204731514328
	Z
	*/	
    function chord(d, i) {
		var s = subgroup(this, source, d, i), 
			t = subgroup(this, target, d, i);
					
	return "M" + (s.p0[0] + pullOutSize) + "," + s.p0[1] + 
			arc(s.r, s.p1, s.a1 - s.a0) + 
			curve(t.p0) + 
			arc(t.r, t.p1, t.a1 - t.a0) + 
			curve(s.p0) + 
			"Z";
   }//chord

    chord.radius = function(v) {
      if (!arguments.length) return radius;
      radius = d3_functor(v);
      return chord;
    };
    chord.pullOutSize = function(v) {
      if (!arguments.length) return pullOutSize;
      pullOutSize = v;
      return chord;
    };
    chord.source = function(v) {
      if (!arguments.length) return source;
      source = d3_functor(v);
      return chord;
    };
    chord.target = function(v) {
      if (!arguments.length) return target;
      target = d3_functor(v);
      return chord;
    };
    chord.startAngle = function(v) {
      if (!arguments.length) return startAngle;
      startAngle = d3_functor(v);
      return chord;
    };
    chord.endAngle = function(v) {
      if (!arguments.length) return endAngle;
      endAngle = d3_functor(v);
      return chord;
    };
	function d3_svg_chordRadius(d) {
	    return d.radius;
	}
	function d3_source(d) {
		return d.source;
	}
	function d3_target(d) {
	    return d.target;
	}
	function d3_svg_arcStartAngle(d) {
	    return d.startAngle;
	}
	function d3_svg_arcEndAngle(d) {
	    return d.endAngle;
	}
	function d3_functor(v) {
		return typeof v === "function" ? v : function() {
			return v;
		};
	}//function d3_functor
	return chord;
}//stretchedChord


pt.stretchedChordFinal.customChordLayout = function() {
	var ε = 1e-6, ε2 = ε * ε, π = Math.PI, τ = 2 * π, τε = τ - ε, halfπ = π / 2, d3_radians = π / 180, d3_degrees = 180 / π;
	var chord = {}, chords, groups, matrix, n, padding = 0, sortGroups, sortSubgroups, sortChords;
	function relayout() {
	  var subgroups = {}, groupSums = [], groupIndex = d3.range(n), subgroupIndex = [], k, x, x0, i, j;
	  chords = [];
	  groups = [];
	  k = 0, i = -1;

	  while (++i < n) {
	    x = 0, j = -1;
	    while (++j < n) {
	      x += matrix[i][j];
	    }
	    groupSums.push(x);
	    //////////////////////////////////////
		////////////// New part //////////////
		//////////////////////////////////////
	    subgroupIndex.push(d3.range(n).reverse());
	   	//////////////////////////////////////
		//////////  End new part /////////////
		//////////////////////////////////////
	    k += x;
	  }
	  if (sortGroups) {
	    groupIndex.sort(function(a, b) {
	      return sortGroups(groupSums[a], groupSums[b]);
	    });
	  }
	  if (sortSubgroups) {
	    subgroupIndex.forEach(function(d, i) {
	      d.sort(function(a, b) {
	        return sortSubgroups(matrix[i][a], matrix[i][b]);
	      });
	    });
	  }
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
	    }
	    groups[di] = {
	      index: di,
	      startAngle: x0,
	      endAngle: x,
	      value: (x - x0) / k
	    };
	    x += padding;
	  }
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
	      }
	    }
	  }
	  if (sortChords) resort();
	}
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
