pt.stretchedChord = pt.stretchedChord || {};

pt.stretchedChord.init = function() {
	
	//Remove any existing svgs
	d3.select('#stretched-chord #stretchedChord svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 20,
		right: 0,
		bottom: 0,
		left: 0
	};
	var width = $(".slides").width() - margin.left - margin.right;
	var height = $(".slides").height()*0.9 - margin.top - margin.bottom;
		
	pt.stretchedChord.outerRadius = Math.min(width, height) / 2  - 100;
	pt.stretchedChord.innerRadius = pt.stretchedChord.outerRadius * 0.95;
	pt.stretchedChord.opacityDefault = 0.7; //default opacity of chords
	pt.stretchedChord.pullOutSize = 0;
	pt.stretchedChord.direction = "forward";

	//SVG container
	pt.stretchedChord.svg = d3.select("#stretched-chord #stretchedChord")
		.append("svg")
		.attr("class", "svgWrapper")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.stretchedChord.svg.append("g")
		.attr("transform", "translate(" + (margin.left + width/2) + "," + (margin.top+height/2) + ")");

	////////////////////////////////////////////////////////////
	////////////////////////// Data ////////////////////////////
	////////////////////////////////////////////////////////////

	//Names of the arcs
	pt.stretchedChord.Names = ["to X","to Y","to Z","Dummy","From C","From B","From A","Dummy"];
	var Names = pt.stretchedChord.Names;

	//Color scale
	pt.stretchedChord.fill = d3.scale.ordinal()
	    .domain(d3.range(Names.length))
	    .range(["#C4C4C4","#C4C4C4","#C4C4C4","#E0E0E0","#EDC951","#CC333F","#00A0B0","#E0E0E0"]);

	//Start data
	pt.stretchedChord.svg.matrix = [
		[0,0,0,0,10,5,15,0], //X
		[0,0,0,0,5,15,20,0], //Y
		[0,0,0,0,15,5,5,0], //Z
		[0,0,0,0,0,0,0,0.1], //Dummy stroke
		[10,5,15,0,0,0,0,0], //C
		[5,15,5,0,0,0,0,0], //B
		[15,20,5,0,0,0,0,0], //A
		[0,0,0,0.1,0,0,0,0] //Dummy stroke
	];

	//Chord function
	pt.stretchedChord.chord = d3.layout.chord()//pt.stretchedChord.customChordLayout()
		.padding(.02)
		.sortChords(d3.descending) //which chord should be shown on top when chords cross. Now the biggest chord is at the bottom
		.matrix(pt.stretchedChord.svg.matrix);

	//Arc function
	pt.stretchedChord.arc = d3.svg.arc()
		.innerRadius(pt.stretchedChord.innerRadius)
		.outerRadius(pt.stretchedChord.outerRadius);

	//Path function for the chords
	pt.stretchedChord.path = pt.stretchedChord.stretchedChord() //d3.svg.chord()
		.radius(pt.stretchedChord.innerRadius);

	////////////////////////////////////////////////////////////
	///////////////////// Initiate ellipse /////////////////////
	////////////////////////////////////////////////////////////

	svg.append("ellipse")
		.attr("class", "batEllipse")
		.attr("cx", 0)
		.attr("cy", 0)
		.attr("ry", pt.stretchedChord.outerRadius + 50)
		.attr("rx", pt.stretchedChord.outerRadius * 2)
		.style("fill", "#FEE006")
		.style("stroke", "black")
		.style("stroke-width", 15)
		.style("opacity", 0);

	////////////////////////////////////////////////////////////
	//////////////////// Draw outer Arcs ///////////////////////
	////////////////////////////////////////////////////////////

	//Group wrapper for the arcs and text
	var arcWrapper = svg.selectAll("g.group")
		.data(pt.stretchedChord.chord.groups, function (d) { return d.index; })
		.enter().append("g")
		.attr("class", "arcgroup");

	//Create the arcs
	arcWrapper.append("path")
		.attr("class", "arcs")
		.style("stroke", function(d) { return pt.stretchedChord.fill(d.index); })
		.style("fill", function(d) { return pt.stretchedChord.fill(d.index); })
		.style("opacity", function(d,i) { return Names[i] === "Dummy" ? 0 : 1; })
		.attr("transform", function(d, i) {
			d.pullOutSize = pt.stretchedChord.pullOutSize * ( d.startAngle > Math.PI ? -1 : 1);
			return "translate(" + d.pullOutSize + ',' + 0 + ")";
		})
		.attr("d", pt.stretchedChord.arc);

	//Append the arc names
	arcWrapper.append("text")
		.each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2);})
		.attr("dy", ".35em")
		.attr("class", "titles")
		.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
		.attr("transform", function(d,i) { 
			var c = pt.stretchedChord.arc.centroid(d);
			return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
			+ "translate(" + (pt.stretchedChord.innerRadius + 55) + ")"
			+ (d.angle > Math.PI ? "rotate(180)" : "")
		})
		.style("opacity", function(d,i) { return Names[i] === "Dummy" ? 0 : 1; })
		.text(function(d,i) { return Names[i]; });

	////////////////////////////////////////////////////////////
	//////////////////// Draw inner chords /////////////////////
	////////////////////////////////////////////////////////////
	 
	//Draw the chords
	var chords = svg.selectAll("path.chord")
		.data(pt.stretchedChord.chord.chords, function (d) { return d.source.index + "-" + d.target.index; })
		.enter().append("path")
		.attr("class", "chord")
		.style("stroke", "none")
		.style("fill", function(d,i) { return pt.stretchedChord.fill(d.target.index); })
		.style("opacity", function(d,i) { 
			return  pt.stretchedChord.Names[d.source.index] === "Dummy" && pt.stretchedChord.Names[d.target.index] === "Dummy" ? 0 : pt.stretchedChord.opacityDefault; 
		})
		.attr("d", pt.stretchedChord.path);	

}//init

//Start | normal chord diagram
pt.stretchedChord.step1 = function() {

	//Update the matrix
	pt.stretchedChord.svg.matrix = [
		[0,0,0,0,10,5,15,0], //X
		[0,0,0,0,5,15,20,0], //Y
		[0,0,0,0,15,5,5,0], //Z
		[0,0,0,0,0,0,0,0.1], //Dummy stroke
		[10,5,15,0,0,0,0,0], //C
		[5,15,5,0,0,0,0,0], //B
		[15,20,5,0,0,0,0,0], //A
		[0,0,0,0.1,0,0,0,0] //Dummy stroke
	];

	//Update the data in the chord function
	pt.stretchedChord.chord
		.matrix(pt.stretchedChord.svg.matrix);

	//Update the data of the arc group
	var arcWrapper = d3.selectAll("#stretchedChord .arcgroup")

	//Update the data of the arcs and change to the new arc d
	arcWrapper.select(".arcs")
		.data(pt.stretchedChord.chord.groups, function (d) { return d.index; })
		.transition("step1Arcs").duration(1000)
		.style("opacity", function(d,i) { return pt.stretchedChord.Names[i] === "Dummy" ? 0 : 1; })
		.attr("d", pt.stretchedChord.arc);

	//Update the text to the new location
	arcWrapper.select(".titles")
		.data(pt.stretchedChord.chord.groups, function (d) { return d.index; })
		.each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2);})
		.transition("step1Titles").duration(1000)
		.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
		.attr("transform", function(d,i) { 
			var c = pt.stretchedChord.arc.centroid(d);
			return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
			+ "translate(" + (pt.stretchedChord.innerRadius + 55) + ")"
			+ (d.angle > Math.PI ? "rotate(180)" : "")
		});

	//Update the chords
	d3.selectAll("#stretchedChord .chord")
		.data(pt.stretchedChord.chord.chords)
		.transition("step1Chords").duration(1000)
		.style("opacity", function(d,i) { 
			return  pt.stretchedChord.Names[d.source.index] === "Dummy" && pt.stretchedChord.Names[d.target.index] === "Dummy" ? 0 : pt.stretchedChord.opacityDefault; 
		})
		.attr("d", pt.stretchedChord.path);

}//step1

//Insert dummy arc
pt.stretchedChord.step2 = function() {

	if(pt.stretchedChord.direction === "forward") d3.select("#stretched-chord").attr("data-autoslide", 1200);
	
	//Update the matrix data
	var respondents = 95, //Total number of respondents (i.e. the number that makes up the group)
		emptyPerc = 0.4, //What % of the circle should become empty in comparison to the visible arcs
		emptyStroke = Math.round(respondents*emptyPerc); //How many "units" would define this empty percentage
	pt.stretchedChord.svg.matrix = [
		[0,0,0,0,10,5,15,0], //X
		[0,0,0,0,5,15,20,0], //Y
		[0,0,0,0,15,5,5,0], //Z
		[0,0,0,0,0,0,0,emptyStroke], //Dummy stroke
		[10,5,15,0,0,0,0,0], //C
		[5,15,5,0,0,0,0,0], //B
		[15,20,5,0,0,0,0,0], //A
		[0,0,0,emptyStroke,0,0,0,0] //Dummy stroke
	];

	//Set the arc function back (in case you move backward)
	pt.stretchedChord.arc = d3.svg.arc()
		.innerRadius(pt.stretchedChord.innerRadius)
		.outerRadius(pt.stretchedChord.outerRadius);
	//Set the path function back (in case you move backward)
	pt.stretchedChord.path = pt.stretchedChord.stretchedChord() 
		.radius(pt.stretchedChord.innerRadius);

	//Update the date in the chord layout
	pt.stretchedChord.chord
		.matrix(pt.stretchedChord.svg.matrix);

	var arcWrapper = d3.selectAll("#stretchedChord .arcgroup")

	//Update the arcs to their new position
	arcWrapper.select(".arcs")
		.data(pt.stretchedChord.chord.groups, function (d) { return d.index; })
		.transition("step2Arcs").duration(1000)
		.style("opacity", 1)
		.attr("d", pt.stretchedChord.arc);

	//Update the labels to their new position
	arcWrapper.select(".titles")
		.data(pt.stretchedChord.chord.groups, function (d) { return d.index; })
		.each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2);})
		.transition("step2Titles").duration(1000)
		.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
		.attr("transform", function(d,i) { 
			var c = pt.stretchedChord.arc.centroid(d);
			return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
			+ "translate(" + (pt.stretchedChord.innerRadius + 55) + ")"
			+ (d.angle > Math.PI ? "rotate(180)" : "")
		});

	//Update the chords
	d3.selectAll("#stretchedChord .chord")
		.data(pt.stretchedChord.chord.chords, function (d) { return d.source.index + "-" + d.target.index; })
		.transition("step2Chords").duration(1000)
		.style("opacity", pt.stretchedChord.opacityDefault)
		.attr("d", pt.stretchedChord.path);

}//step2

//Rotate to to center
pt.stretchedChord.step3 = function() {

	//Update the data
	var respondents = 95, //Total number of respondents (i.e. the number that makes up the group)
		emptyPerc = 0.4, //What % of the circle should become empty in comparison to the visible arcs
		emptyStroke = Math.round(respondents*emptyPerc); //How many "units" would define this empty percentage
	pt.stretchedChord.svg.matrix = [
		[0,0,0,0,10,5,15,0], //X
		[0,0,0,0,5,15,20,0], //Y
		[0,0,0,0,15,5,5,0], //Z
		[0,0,0,0,0,0,0,emptyStroke], //Dummy stroke
		[10,5,15,0,0,0,0,0], //C
		[5,15,5,0,0,0,0,0], //B
		[15,20,5,0,0,0,0,0], //A
		[0,0,0,emptyStroke,0,0,0,0] //Dummy stroke
	];
	pt.stretchedChord.offset = Math.PI * (emptyStroke/(respondents + emptyStroke)) / 2;

	//Update the chord data
	pt.stretchedChord.chord
		.matrix(pt.stretchedChord.svg.matrix);

	//Include the offset in de start and end angle to rotate the Chord diagram clockwise
	function startAngle(d) { return d.startAngle + pt.stretchedChord.offset; }
	function endAngle(d) { return d.endAngle + pt.stretchedChord.offset; }

	//startAngle and endAngle now include the offset in degrees
	pt.stretchedChord.arc = d3.svg.arc()
		.innerRadius(pt.stretchedChord.innerRadius)
		.outerRadius(pt.stretchedChord.outerRadius)
		.startAngle(startAngle)
		.endAngle(endAngle);
	//Update the chord path function
	pt.stretchedChord.path = pt.stretchedChord.stretchedChord() 
		.radius(pt.stretchedChord.innerRadius)
		.startAngle(startAngle)
		.endAngle(endAngle);


	var arcWrapper = d3.selectAll("#stretchedChord .arcgroup")

	//Update the arcs
	arcWrapper.select(".arcs")
		.data(pt.stretchedChord.chord.groups, function (d) { return d.index; })
		.transition("step3Arcs").duration(1000)
		.style("opacity", 1)
		//.style("stroke", function(d) { return pt.stretchedChord.fill(d.index); })
		//.style("fill", function(d) { return pt.stretchedChord.fill(d.index); })
		.attr("d", pt.stretchedChord.arc);

	//Update the labels
	arcWrapper.select(".titles")
		.data(pt.stretchedChord.chord.groups, function (d) { return d.index; })
        .each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2) + pt.stretchedChord.offset;})
        .transition("step3Titles").duration(1000)
		.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
		.attr("transform", function(d,i) { 
			var c = pt.stretchedChord.arc.centroid(d);
			return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
			+ "translate(" + (pt.stretchedChord.innerRadius + 55) + ")"
			+ (d.angle > Math.PI ? "rotate(180)" : "")
		});

	//Update the chords
	d3.selectAll("#stretchedChord .chord")
		.data(pt.stretchedChord.chord.chords, function (d) { return d.source.index + "-" + d.target.index; })
		.transition("step3Chords").duration(1000)
		//.style("fill", function(d,i) { return pt.stretchedChord.fill(d.target.index); })
		.style("opacity", pt.stretchedChord.opacityDefault)
		.attr("d", pt.stretchedChord.path);

}//step3

//Update colors
pt.stretchedChord.step4 = function() {

	pt.stretchedChord.pullOutSize = 0;

	var arcWrapper = d3.selectAll("#stretchedChord .arcgroup")

	//Update the arcs
	arcWrapper.select(".arcs")
		.data(pt.stretchedChord.chord.groups, function (d) { return d.index; })
		.transition("step4Arcs").duration(1000)
		//.style("stroke", function(d,i) { return pt.stretchedChord.Names[i] === "Dummy" ? "#E0E0E0" : "#00A1DE"; })
		//.style("fill", function(d,i) { return pt.stretchedChord.Names[i] === "Dummy" ? "#E0E0E0" : "#00A1DE"; })
		.style("opacity", function(d,i) { return  pt.stretchedChord.Names[i] === "Dummy" ? 0 : 1; })
		.attr("transform", function(d, i) {
			d.pullOutSize = pt.stretchedChord.pullOutSize * ( d.startAngle > Math.PI ? -1 : 1);
			return "translate(" + d.pullOutSize + ',' + 0 + ")";
		})
		.attr("d", pt.stretchedChord.arc);

	//Update the labels
	arcWrapper.select(".titles")
		.data(pt.stretchedChord.chord.groups, function (d) { return d.index; })
        .each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2) + pt.stretchedChord.offset;})
        .transition("step4Titles").duration(1000)
		.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
		.attr("transform", function(d,i) { 
			var c = pt.stretchedChord.arc.centroid(d);
			return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
			+ "translate(" + (pt.stretchedChord.innerRadius + 55) + ")"
			+ (d.angle > Math.PI ? "rotate(180)" : "")
		});

	//Update the chords
	d3.selectAll("#stretchedChord .chord")
		.data(pt.stretchedChord.chord.chords, function (d) { return d.source.index + "-" + d.target.index; })
		.transition("step4Chords").duration(1000)
		//.style("fill", "#C4C4C4")
		.style("opacity", function(d,i) { 
			return  pt.stretchedChord.Names[d.source.index] === "Dummy" && pt.stretchedChord.Names[d.target.index] === "Dummy" ? 0 : pt.stretchedChord.opacityDefault; 
		})
		.attr("d", pt.stretchedChord.path);

}//step4

//Move out the arcs
pt.stretchedChord.step5 = function() {

	pt.stretchedChord.pullOutSize = 50;

	var arcWrapper = d3.selectAll("#stretchedChord .arcgroup");

	//Move the arcs outward
	arcWrapper.select(".arcs")
		.data(pt.stretchedChord.chord.groups, function (d) { return d.index; })
		.transition("step5Arcs").duration(1000)
		.attr("transform", function(d, i) {
			d.pullOutSize = pt.stretchedChord.pullOutSize * ( d.startAngle > (Math.PI-0.001) ? -1 : 1);
			return "translate(" + d.pullOutSize + ',' + 0 + ")";
		})
		.attr("d", pt.stretchedChord.arc);

	//Update the labels
	arcWrapper.select(".titles")
		.data(pt.stretchedChord.chord.groups, function (d) { return d.index; })
		.each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2) + pt.stretchedChord.offset;})
		.transition("step5Titles").duration(1000)
		.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
		.attr("transform", function(d,i) { 
		     var c = pt.stretchedChord.arc.centroid(d);
		     return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")" 
		     + "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
		     + "translate(" + 55 + ",0)" 
		     + (d.angle > Math.PI ? "rotate(180)" : ""); 
		});

	//Set the chords back to normal (in case you move backward)
	pt.stretchedChord.path
		.pullOutSize(0);

	//Update the chords (in case you move backward)
	d3.selectAll("#stretchedChord .chord")
		.data(pt.stretchedChord.chord.chords, function (d) { return d.source.index + "-" + d.target.index; })
		.transition("step5Chord").duration(1000)
		.attr("d", pt.stretchedChord.path);

}//step5

//Move out the chords
pt.stretchedChord.step6 = function() {

	pt.stretchedChord.pullOutSize = 50;

	//Update the date in the chord layout (in case you move backward)
	pt.stretchedChord.chord = d3.layout.chord()
		.padding(.02)
		.sortChords(d3.descending) 
		.matrix(pt.stretchedChord.svg.matrix);

	//Include the offset in de start and end angle to rotate the Chord diagram clockwise
	function startAngle(d) { return d.startAngle + pt.stretchedChord.offset; }
	function endAngle(d) { return d.endAngle + pt.stretchedChord.offset; }

	//Update the chord path function
	pt.stretchedChord.path = pt.stretchedChord.stretchedChord() 
		.radius(pt.stretchedChord.innerRadius)
		.startAngle(startAngle)
		.endAngle(endAngle)
		.pullOutSize(pt.stretchedChord.pullOutSize);

	var arcWrapper = d3.selectAll("#stretchedChord .arcgroup");

	//Update the chords to move outward
	d3.selectAll("#stretchedChord .chord")
		.data(pt.stretchedChord.chord.chords, function (d) { return d.source.index + "-" + d.target.index; })
		.transition("step6Chords").duration(1000)
		.attr("d", pt.stretchedChord.path);

}//step6

//Reorder the chords
pt.stretchedChord.step7 = function() {

	d3.select("#stretched-chord").attr("data-autoslide", 0);
	pt.stretchedChord.pullOutSize = 50;

	//Update the date in the chord layout
	pt.stretchedChord.chord = pt.stretchedChord.customChordLayout()
		.padding(.02)
		.sortChords(d3.descending) 
		.matrix(pt.stretchedChord.svg.matrix);

	var arcWrapper = d3.selectAll("#stretchedChord .arcgroup");

	//Reset colors (in case you move backward)
	arcWrapper.select(".arcs")
		.transition("step7Arcs").duration(1000)
		.style("stroke", function(d) { return pt.stretchedChord.fill(d.index); })
		.style("fill", function(d) { return pt.stretchedChord.fill(d.index); });
		//.style("stroke", function(d,i) { return pt.stretchedChord.Names[i] === "Dummy" ? "#E0E0E0" : "#00A1DE"; })
		//.style("fill", function(d,i) { return pt.stretchedChord.Names[i] === "Dummy" ? "#E0E0E0" : "#00A1DE"; });

	//Update the label opacity (in case you move backward)
	arcWrapper.select(".titles")
		.transition("step7Titles").duration(1000)
		.style("opacity", function(d,i) { return pt.stretchedChord.Names[i] === "Dummy" ? 0 : 1; });

	//Update the chords to move outward (and reset color in case you move backward)
	d3.selectAll("#stretchedChord .chord")
		.data(pt.stretchedChord.chord.chords, function (d) { return d.source.index + "-" + d.target.index; })
		.transition("step7Chords").duration(1000)
		//.style("fill", "#C4C4C4")
		.style("fill", function(d,i) { return pt.stretchedChord.fill(d.target.index); })
		//.style("opacity", function(d,i) { 
		//	return  pt.stretchedChord.Names[d.source.index] === "Dummy" && pt.stretchedChord.Names[d.target.index] === "Dummy" ? 0 : pt.stretchedChord.opacityDefault; 
		//})
		.attr("d", pt.stretchedChord.path);

	//Hide ellipse in case you move backward
	d3.select("#stretchedChord .batEllipse")
		.transition("step7Ellipse").duration(1000)
		.style("opacity", 0);

}//step7

//Turn into batplot
pt.stretchedChord.batplot = function() {

	pt.stretchedChord.pullOutSize = 50;
	pt.stretchedChord.direction = "backward";

	//Update the data (in case you move backward)
	var respondents = 95, //Total number of respondents (i.e. the number that makes up the group)
		emptyPerc = 0.4, //What % of the circle should become empty in comparison to the visible arcs
		emptyStroke = Math.round(respondents*emptyPerc); //How many "units" would define this empty percentage
	pt.stretchedChord.svg.matrix = [
		[0,0,0,0,10,5,15,0], //X
		[0,0,0,0,5,15,20,0], //Y
		[0,0,0,0,15,5,5,0], //Z
		[0,0,0,0,0,0,0,emptyStroke], //Dummy stroke
		[10,5,15,0,0,0,0,0], //C
		[5,15,5,0,0,0,0,0], //B
		[15,20,5,0,0,0,0,0], //A
		[0,0,0,emptyStroke,0,0,0,0] //Dummy stroke
	];
	pt.stretchedChord.offset = Math.PI * (emptyStroke/(respondents + emptyStroke)) / 2;

	//Update the date in the chord layout
	pt.stretchedChord.chord = pt.stretchedChord.customChordLayout()
		.padding(.02)
		.sortChords(d3.descending) 
		.matrix(pt.stretchedChord.svg.matrix);

	//Include the offset in de start and end angle to rotate the Chord diagram clockwise
	function startAngle(d) { return d.startAngle + pt.stretchedChord.offset; }
	function endAngle(d) { return d.endAngle + pt.stretchedChord.offset; }

	//startAngle and endAngle now include the offset in degrees
	pt.stretchedChord.arc = d3.svg.arc()
		.innerRadius(pt.stretchedChord.innerRadius)
		.outerRadius(pt.stretchedChord.outerRadius)
		.startAngle(startAngle)
		.endAngle(endAngle);
	//Update the chord path function
	pt.stretchedChord.path = pt.stretchedChord.stretchedChord() 
		.radius(pt.stretchedChord.innerRadius)
		.startAngle(startAngle)
		.endAngle(endAngle)
		.pullOutSize(pt.stretchedChord.pullOutSize);

	var arcWrapper = d3.selectAll("#stretchedChord .arcgroup");

	//Move the arcs outward (in case you move backward)
	arcWrapper.select(".arcs")
		.data(pt.stretchedChord.chord.groups, function (d) { return d.index; })
		.transition("step8Arcs").duration(1000)
		.style("stroke", "black")
		.style("fill", "black")
		.style("opacity", function(d,i) { return  pt.stretchedChord.Names[i] === "Dummy" ? 0 : 1; })
		.attr("transform", function(d, i) {
			d.pullOutSize = pt.stretchedChord.pullOutSize * ( d.startAngle > (Math.PI-0.001) ? -1 : 1);
			return "translate(" + d.pullOutSize + ',' + 0 + ")";
		})
		.attr("d", pt.stretchedChord.arc);

	//Update (& hide) the labels (in case you move backward)
	arcWrapper.select(".titles")
		.data(pt.stretchedChord.chord.groups, function (d) { return d.index; })
		.each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2) + pt.stretchedChord.offset;})
		.transition("step8Titles").duration(1000)
		.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
		.attr("transform", function(d,i) { 
		     var c = pt.stretchedChord.arc.centroid(d);
		     return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")" 
		     + "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
		     + "translate(" + 55 + ",0)" 
		     + (d.angle > Math.PI ? "rotate(180)" : ""); 
		})
		.style("opacity", 0);

	//Update the chords to move outward
	d3.selectAll("#stretchedChord .chord")
		.data(pt.stretchedChord.chord.chords, function (d) { return d.source.index + "-" + d.target.index; })
		.transition("step8Chords").duration(1000)
		.style("fill", "black")
		.style("opacity", function(d,i) { 
			return  pt.stretchedChord.Names[d.source.index] === "Dummy" && pt.stretchedChord.Names[d.target.index] === "Dummy" ? 0 : pt.stretchedChord.opacityDefault; 
		})
		.attr("d", pt.stretchedChord.path);

	//Show ellipse
	d3.select("#stretchedChord .batEllipse")
		.transition("step8Ellipse").duration(1000)
		.style("opacity", 1);

}//batplot

pt.stretchedChord.stretchedChord = function() {
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


pt.stretchedChord.customChordLayout = function() {
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
	    subgroupIndex.push(d3.range(n).reverse());
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
