pt.colorAddCode = pt.colorAddCode || {};

pt.colorAddCode.init = function() {
	
	//Remove any existing svgs
	d3.select('#colorAdd-code #colorAddCode svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	};
	var width = $(".slides").width() - margin.left - margin.right;
	var height = $(".slides").height()*0.95 - margin.top - margin.bottom;
	pt.colorAddCode.width = width;
				
	//SVG container
	pt.colorAddCode.svg = d3.select("#colorAdd-code #colorAddCode")
		.append("svg")
		.attr("class", "svgWrapper")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + (margin.left + width/2) + "," + (margin.top+height/2) + ")");

	//Append credit at bottom
    pt.colorAddCode.svg.append("text")
    	.attr("class", "credit")
        .attr("x", 0)
        .attr("y", height/2-10)
        .style("text-anchor", "middle")
        .text("Circle decay based on Sketch.js' particle demo");

    pt.colorAddCode.start();

}//init

pt.colorAddCode.start = function() {

	var svg = pt.colorAddCode.svg,
		width = pt.colorAddCode.width;

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	//But adjusted for D3 and made to move along a path
	var ID = 0,	//makes all particles unique
		counter = 0; //counter for the infinity path
	pt.colorAddCode.colors = [ '#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900', '#FF4E50', '#F9D423' ];
	pt.colorAddCode.particles = [];
	pt.colorAddCode.colorMode = "screen";

	//Create the infinity path
	//Formula from http://gamedev.stackexchange.com/questions/43691/how-can-i-move-an-object-in-an-infinity-or-figure-8-trajectory
	var infScale = width/2*0.7;
	var x, y, scale;
	var infinityPath = [];
	for (var i = 0; i < 209; i++) {
		t = i*0.03;
		scale = 2 / (3 - Math.cos(2*t));
		x = scale * Math.cos(t);
		y = scale * Math.sin(2*t) / 2;
		//console.log("i: " + i + " x:" + x + " y:" + y);
		infinityPath.push({x: x*infScale, y: y*infScale});
	}//for i

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Wrapper for the circles
	var circleWrapper = svg.append("g").attr("class", "circleWrapper");

	//Create an interval that runs along the infinity path
	pt.colorAddCode.infinityLoop = setInterval( function() {

		//Create new particles
		for (var j = 0; j < Math.round(Math.random()*16); j++) spawn(infinityPath[counter].x, infinityPath[counter].y);

		//Remove non-alive particles
		pt.colorAddCode.particles = pt.colorAddCode.particles.filter(function(d) { return d.alive; });

	  	//DATA JOIN
		//Join new data with old elements, if any
		var circleGroup = circleWrapper.selectAll(".particle")
			.data(pt.colorAddCode.particles, function(d) { return d.id; });
	  
		//UPDATE
		circleGroup
			.style("mix-blend-mode", pt.colorAddCode.colorMode)
			.each(move)
			.transition("move").duration(50).ease("linear")
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; })
			.attr("r", function(d) { return d.radius; });	
	
		//ENTER 
		circleGroup
			.enter().append("circle")
			.attr("class", "particle")
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; })
			.style("fill", function(d) { return d.color; })
			.style("mix-blend-mode", pt.colorAddCode.colorMode)
			//.attr("r", 0)
			//.transition("grow").duration(50)
			.attr("r", function(d) { return d.radius; });
				
		//EXIT
		circleGroup.exit().remove();	

		counter = (counter + 1)%infinityPath.length;

	}, 50);

	//Code heavily based on http://codepen.io/soulwire/pen/foktm
	//Calculates new position
	function move(d) {

		d.x += d.vx;
		d.y += d.vy;

		d.vx *= d.drag;
		d.vy *= d.drag;

		d.theta += getRandomNumber( -0.5, 0.5 ) * d.wander;
		d.vx += Math.sin( d.theta ) * 0.5;
		d.vy += Math.cos( d.theta ) * 0.5;

		d.radius *= d.age;
		d.alive = d.radius > 0.5;

	}//move

	//Create a particle
	function spawn ( x, y ) {
		particle = {
			x: x,
			y: y,
			id: ID,
			alive: true,
			radius: getRandomNumber( 8, 34 ),
			wander: getRandomNumber( 1, 1.5 ),
			color: pt.colorAddCode.colors[ Math.round( getRandomNumber(0, pt.colorAddCode.colors.length-1)) ],
			drag: getRandomNumber( 0.2, 0.99 ),
			age:getRandomNumber( 0.92, 0.96 ),
			theta: getRandomNumber( 0,  2 * Math.PI ),
			force: getRandomNumber( 6, 10 )
		};

		ID += 1;

		particle.vx = Math.sin( particle.theta ) * particle.force;
		particle.vy = Math.cos( particle.theta ) * particle.force;

		pt.colorAddCode.particles.push( particle );
	}//spawn

	pt.colorAddCode.direction = "forward";

}// init


pt.colorAddCode.screenMode = function() {
	pt.colorAddCode.colorMode = "screen";
	pt.colorAddCode.colors = ['#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900', '#FF4E50', '#F9D423'];
	//pt.colorAddCode.updateCode(pt.colorAddCode.colorMode, "#262626");
}//screenMode

pt.colorAddCode.noMode = function() {
	pt.colorAddCode.colorMode = "none";
}//noMode


pt.colorAddCode.screenModeRainbow = function() {
	pt.colorAddCode.colorMode = "screen";
	pt.colorAddCode.colors = ["#2c7bb6", "#00a6ca","#00ccbc","#90eb9d","#ffff8c","#f9d057","#f29e2e","#e76818","#d7191c"];
	pt.colorAddCode.updateCode(pt.colorAddCode.colorMode, "#262626");
	if(pt.colorAddCode.direction === "forward") d3.select("#colorAdd-code").attr("data-autoslide", 5000);
}//multiplyModeRainbow

pt.colorAddCode.screenModeGreen = function() {
	pt.colorAddCode.colorMode = "screen";
	pt.colorAddCode.colors = ['#1B676B', '#519548', '#88C425', "#BEF202", "#EAFDE6"];
	pt.colorAddCode.updateCode(pt.colorAddCode.colorMode, "#262626");
}//screenModeGreen

pt.colorAddCode.multiplyModeGreen = function() {
	pt.colorAddCode.colorMode = "multiply";
	pt.colorAddCode.colors = ['#1B676B', '#519548', '#88C425', "#BEF202", "#EAFDE6"];
	pt.colorAddCode.updateCode(pt.colorAddCode.colorMode, "white");
}//multiplyModeGreen

pt.colorAddCode.multiplyModeRainbow = function() {
	pt.colorAddCode.colorMode = "multiply";
	pt.colorAddCode.colors = ["#2c7bb6", "#00a6ca","#00ccbc","#90eb9d","#ffff8c","#f9d057","#f29e2e","#e76818","#d7191c"];
	pt.colorAddCode.updateCode(pt.colorAddCode.colorMode, "white");
}//multiplyModeRainbow

pt.colorAddCode.multiplyModePurple = function() {
	pt.colorAddCode.colorMode = "multiply";
	pt.colorAddCode.colors = ['#490A3D', '#BD1550', '#E97F02', "#F8CA00", "#8A9B0F"];
	pt.colorAddCode.updateCode(pt.colorAddCode.colorMode, "#F8E8E8");

	d3.select("#colorAdd-code").attr("data-autoslide", 0);
	pt.colorAddCode.direction = "backward";
}//multiplyModePurple

pt.colorAddCode.updateCode = function(colorMode, backgroundColor) {

	//Update slide background
	d3.select(".slide-background.stack.present").selectAll(".slide-background.present")
		.style("background", backgroundColor);

	// //Update the text in the code block
	// d3.selectAll("#colorAdd-code pre code")
	// 	.html('/*Set isolate on the group element*/ <br>' + 
	// 			'.particleWrapper { isolation: isolate; } <br><br>' +	
	// 			'/*Set blend mode on SVG element*/ <br>' + 
	// 			'.particle { mix-blend-mode: ' + colorMode + ';}')
	// //Update the code to its javascript highlight
	// $("#colorAdd-code pre code").each(function(i, block) {
	//    hljs.highlightBlock(block);
	// });

}//updateCode


// pt.colorAddCode.darkenMode = function() {
// 	pt.colorAddCode.colorMode = "darken";
// }//darkenMode

// pt.colorAddCode.lightenMode = function() {
// 	pt.colorAddCode.colors = ['#0000FF', '#FF0000', '#00FF00'];
// 	pt.colorAddCode.colorMode = "lighten";
// }//lightenMode
