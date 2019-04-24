pt.animatedGradientCode = pt.animatedGradientCode || {};

pt.animatedGradientCode.init = function() {

	//Remove any existing svgs
	d3.select("#animated-gradient-code #animatedGradientCode svg").remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg container ////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 140,
		right: 30,
		bottom: 50,
		left: 30
	};
	var width = $(".slides").width()*0.9 - margin.left - margin.right;
	var height = 150;
				
	//SVG container
	pt.animatedGradientCode.svg = d3.select('#animated-gradient-code #animatedGradientCode')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.animatedGradientCode.svg.append("g")
		.attr("class", "svgWrapper")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Create the gradient ///////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Container for the gradients
	var defs = svg.append("defs");
	pt.animatedGradientCode.linearGradient = defs.append("linearGradient")
		//.attr("gradientUnits", "userSpaceOnUse")
		.attr("id","animated-gradient-id")
		.attr("x1","0%")
		.attr("y1","0%")
		.attr("x2","100%")
		.attr("y2","0")
		.attr("spreadMethod", "reflect");
		
	var colours = ["#FDA860", "#FC8669", "#E36172", "#C64277", "#E36172", "#FC8669" ,"#FDA860"];
	pt.animatedGradientCode.linearGradient.selectAll(".stop")
		.data(colours)
		.enter().append("stop")
		.attr("offset", function(d,i) { return i/(colours.length-1); })   
		.attr("stop-color", function(d) { return d; });

	pt.animatedGradientCode.linearGradient.append("animate")
		.attr("attributeName","x1")
		.attr("values","0%;100%")
		.attr("dur","7s")
		.attr("repeatCount","indefinite");

	pt.animatedGradientCode.linearGradient.append("animate")
		.attr("attributeName","x2")
		.attr("values","100%;200%")
		.attr("dur","7s")
		.attr("repeatCount","indefinite");

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Create the rectangle ////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	svg.append("rect")
		.attr("class", "animatedRect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width)
		.attr("height", height)
		.style("fill", "url(#animated-gradient-id)");

};//init

pt.animatedGradientCode.noAnimation = function() {

	d3.selectAll("#animatedGradientCode animate").remove();

	//Show the rect
	d3.selectAll("#animatedGradientCode .animatedRect")
		.transition().duration(500)
		.style("opacity", 1);

}//noAnimation

pt.animatedGradientCode.hide = function() {

    console.log("hide")
	//Hide the rect
	d3.selectAll("#animatedGradientCode .animatedRect")
		.transition().duration(500)
		.style("opacity", 0);

}//hide


pt.animatedGradientCode.animationX1 = function() {

	d3.selectAll("#animatedGradientCode animate").remove();

	pt.animatedGradientCode.linearGradient.append("animate")
		.attr("attributeName","x1")
		.attr("values","0%;100%")
		.attr("dur","7s")
		.attr("repeatCount","indefinite");

}//animationX1

pt.animatedGradientCode.animationX2 = function() {

	d3.selectAll("#animatedGradientCode animate").remove();

	pt.animatedGradientCode.linearGradient.append("animate")
		.attr("attributeName","x1")
		.attr("values","0%;100%")
		.attr("dur","7s")
		.attr("repeatCount","indefinite");

	pt.animatedGradientCode.linearGradient.append("animate")
		.attr("attributeName","x2")
		.attr("values","100%;200%")
		.attr("dur","7s")
		.attr("repeatCount","indefinite");

}//animationX2


