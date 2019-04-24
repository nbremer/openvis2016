pt.sankey = pt.sankey || {};

pt.sankey.init = function() {
	
	//Remove any existing svgs
	d3.select('#sankey-example #sankey svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 50,
		right: 100,
		bottom: 50,
		left: 100
	};
	var width = $(".slides").width()*0.6 - margin.left - margin.right;
	var height = $(".slides").height()*0.9 - margin.top - margin.bottom;

	//SVG container
	pt.sankey.svg = d3.select("#sankey-example #sankey")
		.append("svg")
		.attr("class", "svgWrapper")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.sankey.svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var colorScale = d3.scale.ordinal()
		.range(["#C4C4C4","#C4C4C4","#C4C4C4","#EDC951","#CC333F","#00A0B0"])
		.domain(["X","Y","Z","C","B","A"]);

	////////////////////////////////////////////////////////////
	/////////////////////// Data prep //////////////////////////
	////////////////////////////////////////////////////////////

	var data = [
		{source: "A", target: "X", value: 15},
		{source: "A", target: "Y", value: 20},
		{source: "A", target: "Z", value: 5},
		{source: "B", target: "X", value: 5},
		{source: "B", target: "Y", value: 15},
		{source: "B", target: "Z", value: 5},
		{source: "C", target: "X", value: 10},
		{source: "C", target: "Y", value: 5},
		{source: "C", target: "Z", value: 15}
	];

	//Set up graph in same style as original example but empty
  	graph = {"nodes" : [], "links" : []};

    data.forEach(function (d) {
      graph.nodes.push({ "name": d.source });
      graph.nodes.push({ "name": d.target });
      graph.links.push({ "source": d.source,
                         "target": d.target,
                         "value": d.value });
     });

     //Return only the distinct / unique nodes
     graph.nodes = d3.keys(d3.nest()
       .key(function (d) { return d.name; })
       .map(graph.nodes));

     //Loop through each link replacing the text with its index from node
     graph.links.forEach(function (d, i) {
       graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
       graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
     });

     //Now loop through each nodes to make nodes an array of objects rather than an array of strings
     graph.nodes.forEach(function (d, i) {
       graph.nodes[i] = { "name": d };
     });

	////////////////////////////////////////////////////////////
	///////////////////// Set-up Sankey ////////////////////////
	////////////////////////////////////////////////////////////


	// Set the sankey diagram properties
	var sankey = d3.sankey()
	    .nodeWidth(17)
	    .nodePadding(4)
	    .size([width, height])
	    .nodes(graph.nodes)
		.links(graph.links)
		.layout(32);

	var path = sankey.link();

	////////////////////////////////////////////////////////////
	////////////////////// Draw the links //////////////////////
	////////////////////////////////////////////////////////////

	//Add the links/chords
	var links = svg.append("g").attr("class","linkWrapper");

	links.selectAll(".link")
		.data(graph.links)
		.enter().append("path")
		.attr("class", "link")
		.attr("d", path)
		.style("fill", "none")
		.style("stroke", function(d){ return colorScale(d.source.name); })
		.style("stroke-opacity", 0.6)
		.style("stroke-width", function (d) { return Math.max(1, d.dy); })
		.on("mouseover", function() { d3.select(this).style("stroke-opacity", 0.9) } )
		.on("mouseout", function() { d3.select(this).style("stroke-opacity", 0.6) } )

	////////////////////////////////////////////////////////////
	//////////////////////// Draw nodes ////////////////////////
	////////////////////////////////////////////////////////////

	//Add the nodes
	var nodes = svg.append("g").attr("class", "nodeWrapper");

	var node = nodes.selectAll(".node")
		.data(graph.nodes)
		.enter().append("g")
		.attr("class", "node")
		.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })

	//Add the rectangles for the nodes
	node.append("rect")
		.attr("class", "sankeyRect")
		.attr("height", function (d) { return d.dy; })
		.attr("width", sankey.nodeWidth())
		.style("fill", function (d) { return colorScale(d.name); });

	////////////////////////////////////////////////////////////
	/////////////////////// Append labels //////////////////////
	////////////////////////////////////////////////////////////

	//Add the labels for the nodes
	node.append("text")
		.attr("x", function (d) { return (d.x < width / 2) ? -20 : 20 + sankey.nodeWidth(); })
		.attr("y", function (d) { return d.dy / 2; })
		.attr("dy", ".35em")
		.attr("text-anchor", function (d) { return (d.x < width / 2) ? "end" : "start" })
		.text(function (d) { return (d.x < width / 2 ? "From " : "to ") + d.name; });

}//init
