pt.collisionDetection = pt.collisionDetection || {};

pt.collisionDetection.init = function() {
	
	//Remove any existing svgs
	d3.select('#collision-detection #collisionDetection svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin  = {
		top: 20,
		right: 20,
		bottom: 20,
		left: 20
	};

	var width = $(".slides").width()*0.9 - margin.left - margin.right;
	var height = $(".slides").height()*0.9 - margin.left - margin.right;

	//SVG container
	pt.collisionDetection.svg = d3.select('#collision-detection #collisionDetection')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

	var svg = pt.collisionDetection.svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Add Titles //////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

    //Append credit at bottom
    svg.append("text")
    	.attr("class", "credit")
        .attr("x", width/2)
        .attr("y", height + 10)
        .style("text-anchor", "middle")
        .text("Based on Mike Bostock's Collision Detection block");

 	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// SVG Filter //////////////////////////////////
	///////////////////////////////////////////////////////////////////////////       

	//SVG filter for the gooey effect
	//Code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
	var defs = svg.append("defs");
	var filter= defs.append("filter").attr("id","gooeyCollision");
	filter.append("feGaussianBlur")
		.attr("in","SourceGraphic")
		.attr("stdDeviation","10")
		.attr("color-interpolation-filters","sRGB") //to fix safari: http://stackoverflow.com/questions/24295043/svg-gaussian-blur-in-safari-unexpectedly-lightens-image
		.attr("result","blur");
	filter.append("feColorMatrix")
		.attr("class", "blurValues")
		.attr("in","blur")
		.attr("mode","matrix")
		.attr("values","1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7")
		.attr("result","gooey");
	// filter.append("feBlend")
	// 	.attr("in","SourceGraphic")
	// 	.attr("in2","gooey");

 	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Set-up Force /////////////////////////////////
	/////////////////////////////////////////////////////////////////////////// 

	var nodes = d3.range(150).map(function() { return {radius: Math.random() * 15 + 8}; }),
	    root = nodes[0];

	root.radius = 0;
	root.fixed = true;

	var force = d3.layout.force()
	    .gravity(0.05)
	    .charge(function(d, i) { return i ? 0 : -2000; })
	    .nodes(nodes)
	    .size([width, height]);

	force.start();

	force.on("tick", function(e) {
	  var q = d3.geom.quadtree(nodes),
	      i = 0,
	      n = nodes.length;

	  while (++i < n) q.visit(collide(nodes[i]));

	  circleWrapper.selectAll("circle")
	      .attr("cx", function(d) { return d.x; })
	      .attr("cy", function(d) { return d.y; });
	});

	function collide(node) {
	  var r = node.radius + 10,
	      nx1 = node.x - r,
	      nx2 = node.x + r,
	      ny1 = node.y - r,
	      ny2 = node.y + r;
	  return function(quad, x1, y1, x2, y2) {
	    if (quad.point && (quad.point !== node)) {
	      var x = node.x - quad.point.x,
	          y = node.y - quad.point.y,
	          l = Math.sqrt(x * x + y * y),
	          r = node.radius + quad.point.radius;
	      if (l < r) {
	        l = (l - r) / l * .5;
	        node.x -= x *= l;
	        node.y -= y *= l;
	        quad.point.x += x;
	        quad.point.y += y;
	      }
	    }
	    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
	  };
	}

 	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Place circles ////////////////////////////////
	/////////////////////////////////////////////////////////////////////////// 

	var circleWrapper = svg.append("g")
		.attr("class", "circleWrapper")
		//.style("filter", "url(#gooeyCollision)");

	circleWrapper.selectAll("circle")
	    .data(nodes.slice(1))
	  .enter().append("circle")
	  	.attr("class", "blobCircles")
	    .attr("r", function(d) { return d.radius; })
	    .style("fill", "#1A818C"); //#FF2E63

	svg.on("mousemove", function() {
	  	var p1 = d3.mouse(this);
	  	root.px = p1[0];
	  	root.py = p1[1];
	  	force.resume();
	});

}//init

pt.collisionDetection.noGooey = function() {
	d3.select("#collision-detection .circleWrapper").style("filter", "none");
}//noGooey

pt.collisionDetection.gooey = function() {
	d3.select("#collision-detection .circleWrapper").style("filter", "url(#gooeyCollision)");
}//gooey


// pt.collisionDetection.oneColor = function() {
// 	d3.selectAll("#collision-detection .blobCircles")
// 		.transition().duration(1000)
// 		.style("fill", "#1A818C");
// }//oneColor

// pt.collisionDetection.multiColor = function() {
// 	var colors = ['#1B676B', '#519548', '#88C425', "#BEF202", "#EAFDE6"];
// 	d3.selectAll("#collision-detection .blobCircles")
// 		.transition().duration(1000)
// 		.style("fill", function(d, i) { return colors[i % colors.length]; });
// }//multiColor



