pt.animalSpeeds = pt.animalSpeeds || {};

pt.animalSpeeds.init = function() {
	
	//Remove any existing svgs
	d3.select('#animal-speeds #animalSpeeds svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 200,
		right: 30,
		bottom: 100,
		left: 170
	};

	var width = $(".slides").width()*0.7 - margin.left - margin.right,
		height = $(".slides").height()*0.95 - margin.top - margin.bottom;
	pt.animalSpeeds.height = height;

	//SVG container
	pt.animalSpeeds.svg = d3.select("#animal-speeds #animalSpeeds")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.animalSpeeds.svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////////// Create Data //////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var animals = [
		{id: 1, animal: 'Cheetah', speed: 120, image: 'cheetah'},
		{id: 2, animal: 'Horse', speed: 88, image: 'horse'},
		{id: 3, animal: 'Lion', speed: 80, image: 'lion'},
		{id: 4, animal: 'Ostrich', speed: 70, image: 'ostrich'},
		{id: 5, animal: 'Greyhound', speed: 63.5, image: 'greyhound'},
		{id: 6, animal: 'Grizzly bear', speed: 56, image: 'grizzly_bear'},
		{id: 7, animal: 'Rabbit', speed: 48, image: 'rabbit'},
		{id: 8, animal: 'Cat', speed: 48, image: 'cat'},
		{id: 9, animal: 'Usain Bolt', speed: 45, image: 'human'},
		{id: 10, animal: 'Squirrel', speed: 20, image: 'squirrel'},
		{id: 11, animal: 'House mouse', speed: 13, image: 'house_mouse'},
		{id: 12, animal: 'Giant tortoise', speed: 0.3, image: 'tortoise'}
	];
	pt.animalSpeeds.animals = animals;

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Create fuzzy filter //////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//SVG filter for the fuzzy effect
	//Code based on http://tympanus.net/codrops/2015/04/08/motion-blur-effect-svg/
	var defs = svg.append("defs");

	defs.selectAll("filter")
		.data(animals)
		.enter().append("filter")
		.attr("id",function(d,i) { return "fuzzy-" + d.id; })
		.attr("width", "500%")	//increase the width of the filter region to remove blur "boundary"
		.attr("x", "-200%") //make sure the center of the "width" lies in the middle
		.attr("color-interpolation-filters","sRGB") //to fix safari: http://stackoverflow.com/questions/24295043/svg-gaussian-blur-in-safari-unexpectedly-lightens-image
		.append("feGaussianBlur")
		.attr("class", function(d,i) { return "blurValues"; })
		.attr("in","SourceGraphic")
		.attr("stdDeviation","0,0");

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Create title and credit ////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Title on top
    svg.append("text")
    	.attr("class", "title")
        .attr("x", width/2)
        .attr("y", - 120)
        .style("text-anchor", "middle")
        .text("Top running speeds");

    //Append credit at bottom
    svg.append("text")
    	.attr("class", "credit")
        .attr("x", width/2)
        .attr("y", height + 70)
        .text("Data and animal images from SpeedOfAnimals.com");

  	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Create scales and axes /////////////////////////
	///////////////////////////////////////////////////////////////////////////	
      
	var axisGroup = svg.append("g").attr("class", "axisWrapper");

	pt.animalSpeeds.maxSpeed = d3.max(animals, function(d) { return d.speed; });
	pt.animalSpeeds.kmScale = d3.scale.linear()
		.range([0, width])
		.domain([0, pt.animalSpeeds.maxSpeed]);

	var milesScale = d3.scale.linear()
		.range([0, width])
		.domain([0, 0.621371192*d3.max(animals, function(d) { return d.speed; })] );

    //Bottom x axis
    var xAxisBottom = d3.svg.axis()
        .scale(pt.animalSpeeds.kmScale)
        .orient("bottom")
        .tickFormat(d3.format(".0f"))
        //.outerTickSize(0)
        .ticks(5);
	//Add the X bottom Axis
    axisGroup.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height + -20) + ")")
        .call(xAxisBottom);
    //Append x-axis bottom title
    axisGroup.append("text")
    	.attr("class", "axisTitle")
    	.attr("x", width/2)
    	.attr("y", height + 25)
    	.text("Speed [km/h]");

    //Top x axis
    var xAxisTop = d3.svg.axis()
        .scale(milesScale)
        .orient("top")
        .ticks(5);
    //Add the X top Axis
    axisGroup.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + -30 + ")")
        .call(xAxisTop); 
    //Append x-axis top title
    axisGroup.append("text")
    	.attr("class", "axisTitle")
    	.attr("x", width/2)
    	.attr("y", -63)
    	.text("Speed [mph]");

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Create animal images and labels //////////////////////
	///////////////////////////////////////////////////////////////////////////	
	
	var animalImageWrapper = svg.append("g").attr("class", "animalImageWrapper");

	//All animal images from http://www.speedofanimals.com/
	//Running man from https://www.svgimages.com/running-silhouette-47889.html
	pt.animalSpeeds.ImageWidth = 64*0.6;
	animalImages = animalImageWrapper.selectAll(".animalImages")
		.data(animals)
		.enter().append("g")
		.attr("class", "animalImages")
		.attr("transform", function(d,i) { return "translate(0," + i*(height/animals.length) + ")"; });

	animalImages.append("text")
		.attr("class", function(d,i) { return "animalLabel " + d.image; })
		.attr("x", -40)
		.attr("dy", "0.3em")
		.text(function(d) { return d.animal; });

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Create circles ////////////////////////////////
	///////////////////////////////////////////////////////////////////////////	
	

	var animalCircleWrapper = svg.append("g")
		.attr("class", "animalCircleWrapper")
		.style("opacity", 0);
	
	//Set up the circle wrapper
	var animalGroups = animalCircleWrapper.selectAll(".animalGroups")
		.data(animals)
		.enter().append("g")
		.attr("class", "animalGroups")
		.attr("transform", function(d,i) { return "translate(0," + i*(height/animals.length) + ")"; })

	animalGroups.append("circle")
		.attr("class", "animalCircle")
		.attr("cx", 0)
		.attr("cy", 0)
		.attr("r", 0)
		.style("fill", "#F92672")
		.style("filter", function(d,i) { return "url(#fuzzy-" + d.id + ")"; });

	animalGroups.append("image")
		.attr("class", "animalImage")
		.attr("xlink:href", function(d) { return "slides/slide_43/animals/" + d.image + ".png"; })
		.attr("x", -pt.animalSpeeds.ImageWidth/2)
		.attr("y", -pt.animalSpeeds.ImageWidth/2)
		.attr("width", pt.animalSpeeds.ImageWidth)
		.attr("height", pt.animalSpeeds.ImageWidth)
		.attr("text-anchor", "middle")
		.style("filter", function(d,i) { return "url(#fuzzy-" + d.id + ")"; });

	pt.animalSpeeds.direction = "forward";
}//init


pt.animalSpeeds.setInPlace = function() {

	d3.selectAll("#animalSpeeds .animalCircleWrapper")
		.transition("show").duration(1000).delay(500)
		.style("opacity", 1);

	d3.selectAll("#animalSpeeds .animalCircle")
		.transition("changeRadius").duration(500)
		.attr("cx", 0)
		.attr("r", pt.animalSpeeds.ImageWidth/4);

	d3.selectAll("#animalSpeeds .animalImage")
		.transition("changeOpacity").duration(500)
		.attr("x", -pt.animalSpeeds.ImageWidth/2)
		.style("opacity", 0);	

}//setInPlace

pt.animalSpeeds.fuzzyInPlace = function() {
	
	if(pt.animalSpeeds.direction === "forward") {
		var dur = 1000,
			del = 100;	
			
		//Interpolate the motion blur settings
		d3.selectAll("#animalSpeeds  .blurValues")
			.transition("fuzzyIn").duration(dur*0.4)
			.delay(function(d,i) { return (i+1)*del + 200; })
			.attrTween("stdDeviation", function(d) { return d3.interpolateString("0 0", d.maxValue+" 0"); })
			.transition("fuzzyOut").duration(dur*0.2)
			.attrTween("stdDeviation", function(d) { return d3.interpolateString(d.maxValue+" 0", "0 0"); });

		//Move back in
		d3.selectAll("#animalSpeeds .animalCircle")
			.transition("moveIn").duration(dur)
			.delay(function(d,i) { return d.id*del; })
			.attr("cx", 0)
			.call(endall, onlyChangeFuzzy);
			
		d3.selectAll("#animalSpeeds .animalImage")
			.transition("moveInImage").duration(dur)
			.delay(function(d,i) { return d.id*del; })
			.attr("x", -pt.animalSpeeds.ImageWidth/2)

	} else {
		onlyChangeFuzzy();
	}//else

	function onlyChangeFuzzy() {
		var dur = 1500,
			del = 400;	

		//Interpolate the motion blur settings
		d3.selectAll("#animalSpeeds  .blurValues")
			.transition("fuzzyIn").duration(dur*0.4)
			.delay(function(d,i) { return i*del + 200; })
			.attrTween("stdDeviation", function(d) { return d3.interpolateString("0 0", d.maxValue+" 0"); })
			.transition("fuzzyOut").duration(dur*0.3)
			.attrTween("stdDeviation", function(d) { return d3.interpolateString(d.maxValue+" 0", "0 0"); });
			
	}//onlyChangeFuzzy
	
}//fuzzyInPlace

pt.animalSpeeds.switchImage = function() {

	d3.selectAll("#animalSpeeds .animalCircle")
		.transition("changeRadius").duration(1000)
		.attr("cx", 0)
		.attr("r", pt.animalSpeeds.direction === "forward" ? 0 : pt.animalSpeeds.ImageWidth/4);

	d3.selectAll("#animalSpeeds .animalImage")
		.transition("changeOpacity").duration(1000)
		.attr("x", -pt.animalSpeeds.ImageWidth/2)
		.style("opacity", pt.animalSpeeds.direction === "forward" ? 1 : 0);		

}//switchImage

pt.animalSpeeds.flyOut = function(direction) {

	pt.animalSpeeds.direction = direction;

	var dur = 1500,
		del = 100;

	//In case you move backward
	if(pt.animalSpeeds.direction === "backward") {
		d3.selectAll("#animalSpeeds .animalCircleWrapper")
			.transition("show").duration(0)
			.style("opacity", 1);
		d3.selectAll("#animalSpeeds .animalCircle")
			.transition("changeRadius").duration(500)
			.attr("r", 0);
		d3.selectAll("#animalSpeeds .animalImage")
			.transition("changeOpacity").duration(500)
			.style("opacity", 1);	
	}//if

	//Interpolate the motion blur settings
	d3.selectAll("#animalSpeeds  .blurValues")
		.transition("fuzzyIn").duration(dur*0.4) //Outward movement
		//.delay(function(d,i) { return (i+1)*100 + 200; })
		.delay(200)
		.attrTween("stdDeviation", function(d) { 
			d.maxValue = d.speed * 12 / pt.animalSpeeds.maxSpeed;
			return d3.interpolateString("0 0", d.maxValue+" 0"); 
		})
		.transition("fuzzyOut").duration(dur*0.3)
		.attrTween("stdDeviation", function(d) { return d3.interpolateString(d.maxValue+" 0", "0 0"); });
   
	//Move the circles outward
	d3.selectAll("#animalSpeeds .animalCircle")
		.transition("moveOut")
		.duration(dur)
		//.delay(function(d,i) { return d.id*del; })
		.attr("cx", function(d,i) { return pt.animalSpeeds.kmScale(d.speed); });
	//Move the images outward
	d3.selectAll("#animalSpeeds .animalImage")
		.transition("moveOutImage")
		.duration(dur)
		//.delay(function(d,i) { return d.id*del; })
		.attr("x", function(d,i) { return pt.animalSpeeds.kmScale(d.speed) - pt.animalSpeeds.ImageWidth/2; });

}//flyOut
