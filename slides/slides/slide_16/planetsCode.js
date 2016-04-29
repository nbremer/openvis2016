pt.planetsCode = pt.planetsCode || {};

pt.planetsCode.init = function() {

	//Remove any existing svgs
	d3.select("#planets-code #planetsCode svg").remove();

	pt.planetsCode.temp = "#FA7806";//"#2C6792";

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 100,
		right: 0,
		bottom: 10,
		left: 0
	};
	var width = $(".slides").width() - margin.left - margin.right;
	var height = 450; //$("#planetsCodeWrapper").height() - margin.top - margin.bottom;
				
	//SVG container
	pt.planetsCode.svg = d3.select('#planets-code #planetsCode')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("class", "svgWrapper")
		.attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")");

	pt.planetsCode.update();

}//init

pt.planetsCode.update = function() {

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Create the gradients //////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Container for the gradients
	pt.planetsCode.defs = pt.planetsCode.svg.append("defs");

	//Sun gradient
	pt.planetsCode.defs.append("radialGradient")
		.attr("id", "sun")
		.selectAll("stop")
		.data([
				{offset: "0%", color: "#FFF76B"},
				{offset: "50%", color: "#FFF845"},
				{offset: "90%", color: "#FFDA4E"},
				{offset: "100%", color: "#FB8933"}
			])
		.enter().append("stop")
		.attr("offset", function(d) { return d.offset; })
		.attr("stop-color", function(d) { return d.color; });

	//Create data based planet gradient
	pt.planetsCode.gradientRadialLighter = pt.planetsCode.defs.append("radialGradient")
		.attr('id', "gradientPlanetLight");
	pt.planetsCode.gradientRadialLighter.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", d3.rgb(pt.planetsCode.temp).brighter(1.5) );
	pt.planetsCode.gradientRadialLighter.append("stop")
		.attr("offset", "70%")
		.attr("stop-color", pt.planetsCode.temp );

	pt.planetsCode.gradientRadial = pt.planetsCode.defs.append("radialGradient")
		.attr('id', "gradientPlanet")
		.attr("cx", "25%")
		.attr("cy", "25%")
		.attr("r", "65%");
	pt.planetsCode.gradientRadial.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", d3.rgb(pt.planetsCode.temp).brighter(1) );
	pt.planetsCode.gradientRadial.append("stop")
		.attr("offset", "40%")
		.attr("stop-color", pt.planetsCode.temp );
	pt.planetsCode.gradientRadial.append("stop")
		.attr("offset",  "100%")
		.attr("stop-color", d3.rgb(pt.planetsCode.temp).darker(1) );

	///////////////////////////////////////////////////////////////////////////
	////////////////////////////// Plot the planet ////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Draw the planets
	pt.planetsCode.planet = pt.planetsCode.svg.append("circle")
		.attr("class", "exampleCircle")
		.attr("r", 100)
		.style("fill", "url(#gradientPlanet)");

	pt.planetsCode.direction = "forward";

};//init

// pt.planetsCode.black = function() {
// 	//Fill the circle with black color
// 	pt.planetsCode.planet
// 		.style("fill", "#222");
// }//black

pt.planetsCode.sunGradient = function() {
	//Fill the circle with the sun gradient
	pt.planetsCode.planet
		.style("fill", "url(#sun)");
}//sunGradient

pt.planetsCode.oneColor = function() {
	//Fill the circle with a color
	pt.planetsCode.planet
		.style("fill", pt.planetsCode.temp);
}//oneColor

pt.planetsCode.gradientLighter = function() {
	//Fill the circle with the simple gradient
	pt.planetsCode.planet
		.style("fill", "url(#gradientPlanetLight)");
	if(pt.planetsCode.direction === "forward") d3.select("#planets-code").attr("data-autoslide", 1500);
}//gradientLighter

pt.planetsCode.gradientDarker = function() {

	//Turn back the last step (in case you move backward)
	pt.planetsCode.gradientRadial
		.attr("cx", "50%")
		.attr("cy", "50%")
		.attr("r", "50%");

	pt.planetsCode.planet
		.style("fill", "url(#gradientPlanet)");
}//gradientDarker

pt.planetsCode.gradientOffset = function() {

	//Turn back the last step (in case you move backward)
	pt.planetsCode.gradientRadial
		.attr("r", "50%");

	//Move the center location
	pt.planetsCode.gradientRadial
		.attr("cx", "25%")
		.attr("cy", "25%");
		
}//gradientOffset

pt.planetsCode.gradientRadius = function() {
	//Increase the gradient radius
	pt.planetsCode.gradientRadial
		.attr("r", "65%");

	//clearInterval(pt.planetsCode.timer);

	d3.select("#planets-code").attr("data-autoslide", 0);
	pt.planetsCode.direction = "backward";
}//gradientRadius

// pt.planetsCode.gradientRotate = function() {

// 	//Set the planet gradient (in case you move backwards)
// 	pt.planetsCode.planet
// 		.style("fill", "url(#gradientPlanet)");

// 	var t0 = Date.now();
// 	pt.planetsCode.timer = setInterval(function() {
// 		var delta = (Date.now() - t0);
// 		pt.planetsCode.planet
// 			.attr("transform", "rotate(" + (delta/20) + ")");
// 	}, 1);

// }//gradientRotate
