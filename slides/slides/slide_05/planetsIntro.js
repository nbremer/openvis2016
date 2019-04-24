pt.planetsIntro = pt.planetsIntro || {};

pt.planetsIntro.init = function(planets) {

	//Remove any existing svgs
	d3.select("#intro-planets #introPlanets svg").remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	pt.planetsIntro.margin = {
		top: 10,
		right: 0,
		bottom: 10,
		left: 0
	};
	pt.planetsIntro.width = $(".slides").width()*0.75 - pt.planetsIntro.margin.left - pt.planetsIntro.margin.right;
	pt.planetsIntro.height = $(".slides").height()*0.75 - pt.planetsIntro.margin.top - pt.planetsIntro.margin.bottom;
				
	//SVG container
	pt.planetsIntro.svg = d3.select('#intro-planets #introPlanets')
		.append("svg")
		.attr("width", pt.planetsIntro.width + pt.planetsIntro.margin.left + pt.planetsIntro.margin.right)
		.attr("height", pt.planetsIntro.height + pt.planetsIntro.margin.top + pt.planetsIntro.margin.bottom);

	pt.planetsIntro.update(planets);
	//d3.json('slides/slide_05/exoplanets.json', pt.planetsIntro.update);
}

pt.planetsIntro.update = function(planets) {

	var planets = _.sample(planets, 150);

	var width = pt.planetsIntro.width,
		height = pt.planetsIntro.height,
		margin = pt.planetsIntro.margin;

	var svg = pt.planetsIntro.svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	//Set scale for radius of circles
	var rScale = d3.scale.linear()
		.range([1, 20])
		.domain([0, d3.max(planets, function(d) { return d.Radius; })]);	

	//Planet orbit variables
	//The larger this is the more accurate the speed is
	var speedUp = 800,
		au = 149597871, //km
		radiusSun = 695800, //km
		radiusSizer = 4; //Size increaser of radii of planets

	///////////////////////////////////////////////////////////////////////////
	/////////////////////// Calculate hexagon variables ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var SQRT3 = Math.sqrt(3),
		hexRadius = Math.min(width, height)/2,
		hexWidth = SQRT3 * hexRadius,
		hexHeight = 2 * hexRadius;
	var hexagonPoly = [[0,-1],[SQRT3/2,0.5],[0,1],[-SQRT3/2,0.5],[-SQRT3/2,-0.5],[0,-1],[SQRT3/2,-0.5]];
	var hexagonPath = "m" + hexagonPoly.map(function(p){ return [p[0]*hexRadius, p[1]*hexRadius].join(','); }).join('l') + "z";

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create gradient /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Create color gradient for planets based on the temperature of the star that they orbit
	var colors = ["#FB1108","#FD150B","#FA7806","#FBE426","#FCFB8F","#F3F5E7","#C7E4EA","#ABD6E6","#9AD2E1","#42A1C1","#1C5FA5", "#172484"];
	var colorScale = d3.scale.linear()
		  .domain([2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 14000, 20000, 30000]) // Temperatures
		  .range(colors);
	
	//Radial gradient with the center at one end of the circle, as if illuminated from the side
	//A gradient is created for each planet and colored to the temperature of its star
	var defsContainer = pt.planetsIntro.svg.append("defs");

	//Create a clip path that is the same as the top hexagon
	defsContainer.append("clipPath")
	    .attr("id", "clip")
	    .append("path")
	    .attr("d", "M" + (width/2) + "," + (height/2) + hexagonPath);
	
	//Create pattern container for the galaxy background
	defsContainer.append("pattern")
		.attr("id","galaxy")
		.attr("class", "pattern")
		.attr("patternUnits","userSpaceOnUse")
		.attr("width", "250px")
		.attr("height", "250px")
	   .append("image")
		.attr("class", "patternImage")
		.attr("xlink:href", "slides/slide_05/galaxy.jpg")
		.attr("width", "250px")
		.attr("height", "250px");

	//Filter for the outside glow of the Sun
	var filter = defsContainer.append("filter").attr("id","glow"),
		feGaussianBlur = filter.append("feGaussianBlur").attr("stdDeviation","3.5").attr("result","coloredBlur"),
		feMerge = filter.append("feMerge");
		feMerge.append("feMergeNode").attr("in","coloredBlur");
		feMerge.append("feMergeNode").attr("in","SourceGraphic");

	//Create a separate gradient for the Sun since this is the "lightsource"
	//This one is centered in the middle of the circle
	defsContainer.append("radialGradient")
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

	//Create data based gradients for each planet
	var gradientRadial = defsContainer.selectAll("radialGradient")
		.data(planets).enter()
		.append("radialGradient")
		.attr("cx", "50%")
		.attr("cy", "50%")
		.attr("r", "50%")
		.attr("fx", "25%")
		.attr("fy", "25%")
		.attr("gradientUnits", "objectBoundingBox")
		.attr('id', function(d){return "gradientRadial-"+d.ID})

	gradientRadial.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", function(d) {return d3.rgb(colorScale(d.temp)).brighter(1);});

	gradientRadial.append("stop")
		.attr("offset", "40%")
		.attr("stop-color", function(d) {return colorScale(d.temp);});
		 
	gradientRadial.append("stop")
		.attr("offset",  "100%")
		.attr("stop-color", function(d) {return d3.rgb(colorScale(d.temp)).darker(1.75);});

	///////////////////////////////////////////////////////////////////////////
	////////////////////// Place circles inside hexagon ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //First append a group for the clip path, then a new group that can be transformed
	var planetOuterWrapper = svg.append("g")
		.attr("class", "planetOuterWrapper")
		.attr("clip-path", "url(#clip")
		.style("clip-path", "url(#clip)") //make it work in safari;
		
	var planetInnerWrapper = planetOuterWrapper.append("g")
		.attr("class", "planetInnerWrapper")
		.attr("transform", "translate(" + (width/2) + "," + (height/2) + ")");

	//Add a background rectangle
	planetInnerWrapper.append("rect")
		.attr("x", -hexWidth/2)
		.attr("y", -hexHeight/2)
		.attr("width", hexWidth)
		.attr("height", hexHeight)
		.style("fill", "url(#galaxy)");

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Plot and move planets /////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Create star in the Middle - not scaled for this example
	planetInnerWrapper.append("circle")
		.attr("class", "sun")
		.attr("r", 30)
		.style("fill", "url(#sun)")
		.style("filter", "url(#glow)");

	//Drawing the planets (in their circular orbits, not elliptical)			
	var planetContainer = planetInnerWrapper.append("g").attr("class","planetContainer");

	//Filter out the planets that will never be visible inside the hexagon (or are too small)
	planets = planets.filter(function(d) { return d.x < hexHeight/2 && radiusSizer*d.Radius > 1; });

	//Draw the planets
	planetContainer.selectAll("g.planet")
		.data(planets).enter()				
		.append("circle")
		.attr("class", "planet")
		.attr("transform", function(d,i) {
			d.phi0 = Math.random() * 360;
			return "rotate(" + d.phi0 + ")";
		})
		.attr("r", function(d) {return radiusSizer*d.Radius;}) //rScale(d.Radius);})
		.attr("cx", function(d) { return d.x * 1.2; })
		.attr("cy", function(d) {return d.x * 1.2; })
		.style("fill", function(d){return "url(#gradientRadial-" + d.ID + ")";})
		.style("opacity", 0);

	d3.selectAll(".planet")
		.transition("appear").duration(1000).delay(function(d,i) { return 500+i*50; })
		.style("opacity", 0.8);

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Place Hexagon in center /////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Place a hexagon on the scene
	svg.append("path")
		.attr("class", "hexagon")
		.attr("d", "M" + (width/2) + "," + (height/2) + hexagonPath)
		.style("stroke", "#FFDA4E")
		.style("stroke-width", "7px")
		.style("fill", "none");

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Move the planets ////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var t0 = Date.now();

	//A very simple function to move the planets in a circular orbit (although not scientifically correct)
	setTimeout(function() {

		d3.timer(function() {
		    var delta = (Date.now() - t0);

		    //Stop the timer of there is no longer and SVG
		    if(d3.select("#intro-planets #introPlanets svg").empty()) {
		    	return true;
		    } else {
		    	d3.selectAll(".planet")
		    		.attr("transform", function(d,i) {
		      			return "rotate(" + (d.phi0 + delta * d.speed/8000) + ")";
		    	});
		    }//else

		  });

	}, 1000);

};
