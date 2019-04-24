pt.collisionDetection = pt.collisionDetection || {};

pt.collisionDetection.init = function() {
	
	//Remove any existing svgs
	d3.select('#collision-detection #collisionDetection svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	const margin  = {
		top: 20,
		right: 20,
		bottom: 20,
		left: 20
	};

	const width = $(".slides").width()*0.9 - margin.left - margin.right
	const height = $(".slides").height()*0.9 - margin.left - margin.right

	//SVG container
	pt.collisionDetection.svg = d3.select('#collision-detection #collisionDetection')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

	const g = pt.collisionDetection.svg.append("g")
        .attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")")
        
    const rect = g.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", -width/2)
        .attr("y", -height/2)
        .style("fill", "none")
        .style("pointer-events", "all")

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Add Titles //////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

    //Append credit at bottom
    g.append("text")
    	.attr("class", "credit")
        .attr("x", 0)
        .attr("y", height/2 + 10)
        .style("text-anchor", "middle")
        .text("Based on Mike Bostock's Collision Detection block");

 	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// SVG Filter //////////////////////////////////
	///////////////////////////////////////////////////////////////////////////       

	//SVG filter for the gooey effect
	//Code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
    const defs = pt.collisionDetection.svg.append("defs")
    
	let filter = defs.append("filter").attr("id","gooeyCollision");
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

	let nodes = d3.range(200).map(function() { return { 
        r: Math.random() * 30 + 8,
        x: -width/2 + width * Math.random(),
        y: -height/2 + height * Math.random()
    }; })
    
    let root = nodes[0]
    root.r = 180
    root.x = root.fx = -width/2
    root.y = root.fy = -height/2

    pt.collisionDetection.simulation = d5.forceSimulation()
        .velocityDecay(0.2)
        .force("x", d5.forceX().strength(0.01))
        .force("y", d5.forceY().strength(0.01))
        .force("collide", 
            d5.forceCollide().radius(d => d.r + 1).strength(0.6)
        )
        .on("tick", function () {
            circleWrapper.selectAll("circle")
                .attr("cx", d => d.x )
                .attr("cy", d => d.y )
        })

 	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Place circles ////////////////////////////////
	/////////////////////////////////////////////////////////////////////////// 

	var circleWrapper = g.append("g")
		.attr("class", "circleWrapper")
		//.style("filter", "url(#gooeyCollision)");

	circleWrapper.selectAll("circle")
	    .data(nodes.slice(1))
        .enter().append("circle")
        .attr("class", "blobCircles")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
	    .attr("r", d => d.r)
        .style("fill", "#1A818C") //#FF2E63
        .style("pointer-events", "none")

    pt.collisionDetection.simulation
        .nodes(nodes)
        // .start()

	rect.on("mousemove", function() {
	  	var m = d3.mouse(this)
	  	root.fx = m[0]
	  	root.fy = m[1]
	  	pt.collisionDetection.simulation.alphaTarget(0.3).restart()
	});

}//init

pt.collisionDetection.noGooey = function() {
    d3.select("#collision-detection .circleWrapper").style("filter", "none")

    pt.collisionDetection.simulation
        .force("collide", d5.forceCollide().radius(d => d.r + 1.5).strength(0.6))
}//noGooey

pt.collisionDetection.gooey = function() {
    d3.select("#collision-detection .circleWrapper").style("filter", "url(#gooeyCollision)")
    
    pt.collisionDetection.simulation
        .force("collide", d5.forceCollide().radius(d => d.r).strength(0.6))
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



