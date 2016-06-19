pt.biggestCities = pt.biggestCities || {};

pt.biggestCities.init = function() {
	
	//Remove any existing svgs
	d3.select('#biggest-cities #biggestCities svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin  = {
		top: 120,
		right: 20,
		bottom: 20,
		left: 20
	};

	var width = $(".slides").width() - margin.left - margin.right;
	var height = $(".slides").height()*0.75 - margin.left - margin.right;
	pt.biggestCities.width = width;
	pt.biggestCities.height = height;

	//SVG container
	pt.biggestCities.svg = d3.select('#biggest-cities #biggestCities')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

	var svg = pt.biggestCities.svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	pt.biggestCities.force = d3.layout.force();

 	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// SVG Filter //////////////////////////////////
	///////////////////////////////////////////////////////////////////////////       

	//SVG filter for the gooey effect
	//Code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
	var defs = svg.append("defs");
	var filter= defs.append("filter").attr("id","gooey");
	filter.append("feGaussianBlur")
		.attr("in","SourceGraphic")
		.attr("stdDeviation","8")
		.attr("color-interpolation-filters","sRGB") //to fix safari: http://stackoverflow.com/questions/24295043/svg-gaussian-blur-in-safari-unexpectedly-lightens-image
		.attr("result","blur");
	filter.append("feColorMatrix")
		.attr("class", "blurValues")
		.attr("in","blur")
		.attr("mode","matrix")
		.attr("values","1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -5")
		.attr("result","gooey");
	filter.append("feBlend")
		.attr("in","SourceGraphic")
		.attr("in2","gooey")
		.attr("operator","atop");

 	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Set-up Map /////////////////////////////////
	/////////////////////////////////////////////////////////////////////////// 

	//Variables for the map
	pt.biggestCities.projection = d3.geo.mercator()
			.scale(280)
			.translate([930,450]);
	var projection = pt.biggestCities.projection;
	  
	var path = d3.geo.path()
			.projection(projection);
	
	var map = svg.append("g")
				.attr("class", "map");

	//Initiate the world map
	map.selectAll(".geo-path")
		.data(countriesMap[0].features)
		.enter().append("path")
			.attr("class", function(d) { return "geo-path" + " " + d.id; })
			.attr("id", function(d) { return d.properties.name; })
			.attr("d", path)
			.style("stroke-opacity", 1)
			.style("fill-opacity", 0.5);	

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Add Titles //////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	svg.append("rect")
		.attr("x", 0)
		.attr("y", -(margin.top+3))
		.attr("width", width)
		.attr("height", margin.top+3)
		.style("fill", "white");

    //Append title to the top
    svg.append("text")
    	.attr("class", "title")
        .attr("x", width/2)
        .attr("y", -90)
        .style("text-anchor", "middle")
        .text("The 150 largest Cities in the World");
    svg.append("text")
    	.attr("class", "subtitle")
        .attr("x", width/2)
        .attr("y", -60)
        .style("text-anchor", "middle")
        .text("sized to population");

    // //Append credit at bottom
    // svg.append("text")
    // 	.attr("class", "credit")
    //     .attr("x", width/2)
    //     .attr("y", height + 10)
    //     .style("text-anchor", "middle")
    //     .text("Based on ");
    // //http://www.delimited.io/blog/2013/12/19/force-bubble-charts-in-d3

 	///////////////////////////////////////////////////////////////////////////
	//////////////////////////////// Cities ///////////////////////////////////
	/////////////////////////////////////////////////////////////////////////// 

	//Radius scale
	pt.biggestCities.rScale = d3.scale.sqrt()
		.range([0,18])
		.domain([0, d3.max(populations, function(d) { return d.population; })]);

	//Put the city locations into the data itself
	populations.forEach(function(d,i) {
			d.radius = pt.biggestCities.rScale(d.population);
			d.x = projection([d.longitude, d.latitude])[0];
			d.y = projection([d.longitude, d.latitude])[1];
	});

	//Wrapper for the cities
	pt.biggestCities.cityWrapper = svg.append("g")
		.attr("class", "cityWrapper")
		.style("filter", "url(#gooey)");
	//Place the city circles
	pt.biggestCities.cities = pt.biggestCities.cityWrapper.selectAll(".cities")
		.data(populations)
		.enter().append("circle")
		.attr("class", "cities")
		.attr("r", function(d) { return d.radius ;})
		.attr("cx", projection([0,0])[0])
		.attr("cy", projection([0,0])[1])
		.style("opacity", 1);

	pt.biggestCities.coverCirleRadius = 50;
	//Circle over all others
	pt.biggestCities.cityWrapper.append("circle")
		.attr("class", "cityCover")
		.attr("r", pt.biggestCities.coverCirleRadius)
		.attr("cx", projection([0,0])[0])
		.attr("cy", projection([0,0])[1]);

 	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Country Labels ////////////////////////////////
	/////////////////////////////////////////////////////////////////////////// 

	//Radial layout
	var getCenters = function (vname, size) {
	  	var centers, mapping;
	  	centers = _.uniq(_.pluck(populations, vname)).map(function (d) {
			return {name: d, value: 1};
	  	});
	  	centers.sort(function(a, b){ return d3.ascending(a.name, b.name); });

	  	mapping = d3.layout.pack()
	  		.sort(function(d) { return d.country; })
	  		.size(size);
	  	mapping.nodes({children: centers});

	  	return centers;
	}//getCenters

	/*//Rectangle layout
	var getCenters = function (vname, size) {
	  	var centers, 
		  	mapping;
		  
	  	centers = _.uniq(_.pluck(populations, vname)).map(function (d) {
			return {name: d, value: 1};
	  	});
	  	centers.sort(function(a, b){ return d3.ascending(a.name, b.name); });

	  	mapping = d3.layout.treemap().size(size).ratio(1/1);
	  	mapping.nodes({children: centers});

	  	return centers;
	};*/

	//Calculate the centers for each country
	pt.biggestCities.centers = getCenters("country", [width, height/0.8]);
	pt.biggestCities.centers.forEach(function(d) {
			d.y = d.y - 100;
			d.x = d.x + 0;
	})

	//Wrapper for the country labels
	pt.biggestCities.labelWrapper = svg.append("g")
		.attr("class", "labelWrapper");
	//Append the country labels
    pt.biggestCities.labelWrapper.selectAll(".label")
      	.data(pt.biggestCities.centers)
      	.enter().append("text")
      	.attr("class", "label")
      	.style("opacity", 0)
      	.attr("transform", function (d) {
        	return "translate(" + (d.x) + ", " + (d.y - 70) + ")";
      	})
      	.text(function (d) { return d.name });

    pt.biggestCities.previousStep = "start";

}//init

pt.biggestCities.flyOut = function () {

	//Stop the force layout (in case you move backward)
	pt.biggestCities.force.stop();

	//If you move backward interpolate the svg filter back to 25
	if(pt.biggestCities.previousStep === "placeCities") {
		d3.selectAll("#biggestCities .blurValues")
			.transition().duration(3000)
			.attrTween("values", function() { 
				return d3.interpolateString("1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 6 -5", 
											"1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -5"); 
			});
    }//if

   	//Make the cover cirlce to its true size again
    d3.selectAll("#biggestCities .cityCover")
		.transition().duration(5000)
		.attr("r", pt.biggestCities.coverCirleRadius);

    //Move the cities to the 0,0 coordinate
	d3.selectAll("#biggestCities .cities")
		.transition().duration(2000).delay(function(d,i) { return i*20; })
		.attr("cx", pt.biggestCities.projection([0, 0])[0])
		.attr("cy", pt.biggestCities.projection([0, 0])[1])
		.style("opacity", 1);

	pt.biggestCities.previousStep = "flyOut";

}//flyOut

pt.biggestCities.placeCities = function () {

	//Stop the force layout (in case you move backward)
	pt.biggestCities.force.stop();

	//Hide labels (in case you move backward)
	d3.selectAll("#biggestCities .label")
		.style("opacity", 0);

	//Show map (in case you move backward)
	d3.selectAll("#biggestCities .geo-path")
		.transition().duration(500)
		.style("fill-opacity", 0.5);

	//Make the cover circle shrink
	d3.selectAll("#biggestCities .cityCover")
			.transition().duration(5000)
			.attr("r", 0);

	//Put the cities in their geo location
	d3.selectAll("#biggestCities .cities")
		.transition("move").duration(2000)
		.delay(function(d,i) { return pt.biggestCities.previousStep === "flyOut" ? i*20 : 0; })
		.attr("r", function(d) {
			d.radius = pt.biggestCities.rScale(d.population);
			return d.radius;
		})
		.attr("cx", function(d) {
			d.x = pt.biggestCities.projection([d.longitude, d.latitude])[0];
			return d.x;
		})
		.attr("cy", function(d) {
			d.y = pt.biggestCities.projection([d.longitude, d.latitude])[1];
			return d.y;
		})

	d3.selectAll("#biggestCities .cities")
		.transition("dim").duration(2000)
		.delay(pt.biggestCities.previousStep === "flyOut" ? 4000 : 2000)
		.style("opacity", 0.8);

	//Remove gooey filter from cities
	d3.selectAll("#biggestCities .blurValues")
		.transition().duration(pt.biggestCities.previousStep === "flyOut" ? 4000 : 2000)
		.attrTween("values", function() { 
			return d3.interpolateString("1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -5", 
										"1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 6 -5"); 
		})
	 	.call(endall, function() {
	 		pt.biggestCities.previousStep = "placeCities";
	 	});

}//placeCities

pt.biggestCities.clusterCountry = function() {

	var width = pt.biggestCities.width;
	var height = pt.biggestCities.height;
	var force = pt.biggestCities.force;
	var centers = pt.biggestCities.centers;
			
	var padding = 0;
	var maxRadius = d3.max(_.pluck(populations, 'radius'));	

	///Set-up force
	force
		.gravity(.02)
    	.charge(0)
    	.on("tick", tick(centers, "country"))
		//.nodes(populations)
		.start();

	//Make the cover circle shrink
	d3.selectAll("#biggestCities .cityCover")
			.attr("r", 0);

	//Dim the map
	d3.selectAll("#biggestCities .geo-path")
		.transition().duration(1000)
		.style("fill-opacity", 0);

	//Show the labels
	d3.selectAll("#biggestCities .label")
		.transition().duration(500)
		.style("opacity", 1);

	d3.selectAll("#biggestCities .cities")
		.transition().duration(1000)
		.style("opacity", 1);

	//Reset gooey filter values
   	d3.selectAll("#biggestCities .blurValues")
		.transition().duration(2000)
		.attrTween("values", function() { 
			return d3.interpolateString("1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 6 -5", 
										"1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -5"); 
		})
      	.call(endall, function() {
	 		pt.biggestCities.previousStep = "clusterCountry";
	 	});

	//Radial lay-out
	function tick (centers, varname) {
		var foci = {};
		for (var i = 0; i < centers.length; i++) {
			foci[centers[i].name] = centers[i];
		}
		  
		return function (e) {
			for (var i = 0; i < populations.length; i++) {
			  var o = populations[i];
			  var f = foci[o[varname]];
			  o.y += (f.y - o.y) * e.alpha;
			  o.x += (f.x - o.x) * e.alpha;
			}//for

			d3.selectAll("#biggestCities .cities")
				.each(collide(.5))
				.attr("cx", function (d) { return d.x; })
				.attr("cy", function (d) { return d.y; });

		}//function
	}//tick
	
	/*
	//Rectangle lay-out	
	function tick (centers, varname) {
	  var foci = {};
	  for (var i = 0; i < centers.length; i++) {
		foci[centers[i].name] = centers[i];
	  }
	  return function (e) {
		for (var i = 0; i < populations.length; i++) {
		  var o = populations[i];
		  var f = foci[o[varname]];
		  o.y += ((f.y + (f.dy / 2)) - o.y) * e.alpha;
		  o.x += ((f.x + (f.dx / 2)) - o.x) * e.alpha;
		}
		d3.selectAll("#biggestCities .cities")
			.each(collide(.11))
		  	.attr("cx", function (d) { return d.x; })
		  	.attr("cy", function (d) { return d.y; });
	  }
	}//tick
	*/
	
	function collide(alpha) {
          var quadtree = d3.geom.quadtree(populations);
          return function (d) {
            var r = d.radius + maxRadius + padding,
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
              if (quad.point && (quad.point !== d)) {
                var x = d.x - quad.point.x,
                    y = d.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius + quad.point.radius + padding;
                if (l < r) {
                  l = (l - r) / l * alpha;
                  d.x -= x *= l;
                  d.y -= y *= l;
                  quad.point.x += x;
                  quad.point.y += y;
                }
              }
              return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
          };
    }//collide

}//clusterCountry

