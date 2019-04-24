pt.colorAddBlendModes = pt.colorAddBlendModes || {};

pt.colorAddBlendModes.init = function() {
	
	//Remove any existing svgs
	d3.select('#colorAdd-blend-modes #colorAddBlendModes svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 10,
		right: 10,
		bottom: 10,
		left: 10
	};

	var width = $(".slides").width() - margin.left - margin.right;
	var height = $(".slides").height()*0.6 - margin.top - margin.bottom;

	//SVG container
	pt.colorAddBlendModes.svg = d3.select('#colorAdd-blend-modes #colorAddBlendModes')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

	var svg = pt.colorAddBlendModes.svg.append("g")
		.attr("class", "svgWrapper")
		.attr("transform", "translate(" + (margin.left + width/2) + "," + (margin.top + height/2) + ")");

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Left Circle Group ///////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var multiplyWrapper = svg.append("g")
		.attr("class", "multiplyWrapper")
		.style("isolation", "isolate")
		.attr("transform", "translate(" + -width/4 + "," + 0 + ")");

    //Append title to the top
    multiplyWrapper.append("text")
    	.attr("class", "title")
        .attr("x", 0)
        .attr("y", -210)
        .style("text-anchor", "middle")
        .text("multiply");

	multiplyWrapper.append('circle')
		.attr('cx','0')
		.attr('cy','130')
		.attr('r','140')
		.style("mix-blend-mode", "multiply")
		.style('fill','#FF00FF');	
	multiplyWrapper.append('circle')
		.attr('cx','-90')
		.attr('cy','-30')
		.attr('r','140')
		.style("mix-blend-mode", "multiply")
		.style('fill','#FFFF00');	
	multiplyWrapper.append('circle')
		.attr('cx','90')
		.attr('cy','-30')
		.attr('r','140')
		.style("mix-blend-mode", "multiply")
		.style('fill','#00FFFF');

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Right Circle Group ///////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var screenWrapper = svg.append("g")
		.style("isolation", "isolate")
		.attr("class", "screenWrapper")
		.attr("transform", "translate(" + width/4 + "," + 0 + ")");

    //Append title to the top
    screenWrapper.append("text")
    	.attr("class", "title")
        .attr("x", 0)
        .attr("y", -210)
        .style("text-anchor", "middle")
        .text("screen");

	screenWrapper.append('circle')
		.attr('cx','0')
		.attr('cy','130')
		.attr('r','140')
		.style("mix-blend-mode", "screen")
		.style('fill','#00FF00'); //green 	
	screenWrapper.append('circle')
		.attr('cx','-90')
		.attr('cy','-30')
		.attr('r','140')
		.style("mix-blend-mode", "screen")
		.style('fill','#FF0000'); //red	
	screenWrapper.append('circle')
		.attr('cx','90')
		.attr('cy','-30')
		.attr('r','140')
		.style("mix-blend-mode", "screen")
		.style('fill','#0000FF'); //blue

}//init

pt.colorAddBlendModes.isolate = function() {
	d3.selectAll("#colorAdd-blend-modes .screenWrapper, #colorAdd-blend-modes .multiplyWrapper")
		.style("isolation", "isolate");
	pt.colorAddBlendModes.updateCode("isolate");
}//isolate

pt.colorAddBlendModes.noIsolateWhite = function() {
	d3.selectAll("#colorAdd-blend-modes .screenWrapper, #colorAdd-blend-modes .multiplyWrapper")
		.style("isolation", "auto");
	pt.colorAddBlendModes.updateCode("auto");
	pt.colorAddBlendModes.updateBackground("white");
}//noIsolateWhite

pt.colorAddBlendModes.noIsolateBlack = function() {
	d3.selectAll("#colorAdd-blend-modes .screenWrapper, #colorAdd-blend-modes .multiplyWrapper")
		.style("isolation", "auto");
	pt.colorAddBlendModes.updateCode("auto");
	pt.colorAddBlendModes.updateBackground("black");
}//noIsolateBlack

pt.colorAddBlendModes.updateBackground = function(backgroundColor) {
	//Update slide background
	d3.select(".slide-background.stack.present").selectAll(".slide-background.present")
		.style("background", backgroundColor);
}//updateBackground

pt.colorAddBlendModes.updateCode = function(isolateMode) {
	//Update the text in the code block
	d3.selectAll("#colorAdd-blend-modes pre code")
		.html('/*Set isolate on the group element*/ <br>' + 
				'.circleWrapper { isolation: ' + isolateMode + '; } <br><br>' +	
				'/*Set blend mode on SVG element: e.g. screen, multiply*/ <br>' + 
				'.circle { mix-blend-mode: screen;}')
	//Update the code to its javascript highlight
	$("#colorAdd-blend-modes pre code").each(function(i, block) {
	   hljs.highlightBlock(block);
	});
}//updateCode



