pt.spiroGraph = pt.spiroGraph || {};

pt.spiroGraph.init = function() {
	
	//Remove any existing svgs
	d3.select('#spiro-graph #spiroGraph svg').remove();

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
	var height = $(".slides").height()*0.95 - margin.top - margin.bottom;
				
	//SVG container
	pt.spiroGraph.svg = d3.select('#spiro-graph #spiroGraph')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.spiroGraph.svg.append("g")
		.attr("class","spiroWrapper")
		.attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")");
	
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create filter ///////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//SVG filter for the glow effect
	var defs = svg.append("defs");

	//Filter for the outside glow
	var filter = defs.append("filter").attr("id","glow"),
		feGaussianBlur = filter.append("feGaussianBlur").attr("stdDeviation","3.5").attr("result","coloredBlur"),
		feMerge = filter.append("feMerge"),
		feMergeNode_1 = feMerge.append("feMergeNode").attr("in","coloredBlur"),
		feMergeNode_2 = feMerge.append("feMergeNode").attr("in","SourceGraphic");

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create Titles ///////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var maxSize = Math.min(width, height) / 2 * 1.4,
		drawDuration = 10;
		
	var line = d3.svg.line()
		.x(function(d) { return d.x; })
		.y(function(d) { return d.y; });

	var colors = ["#00AC93", "#EC0080", "#FFE763"];	
	var numColors = 3;
	var startColor = getRandomNumber(0,numColors); //Loop through the colors, but the starting color is random
	
	var index = 0;
	var spiroData = [
		{R: 148, r: 102, alpha: 88, drawDuration: 16},
		{R: 144, r: 69, alpha: 43, drawDuration:  22},
		{R: 268, r: 83, alpha: 36, drawDuration:  15},
		{R: 276, r: 125, alpha: 74, drawDuration:  16},
		{R: 181, r: 89, alpha: 73, drawDuration:  25},
		{R: 230, r: 40, alpha: 38, drawDuration:  14},
		{R: 300, r: 53, alpha: 48, drawDuration:  19},
		{R: 376, r: 185, alpha: 104, drawDuration:  14},
		{R: 344, r: 68, alpha: 45, drawDuration:  24},
		{R: 395, r: 220, alpha: 173, drawDuration:  19},
		{R: 369, r: 68, alpha: 43, drawDuration: 20}
	];

	var spiroOrder = [
		[7,5,1],
		[6,1,7],
		[8,1,9],
		[9,3,8],
		[7,9,2],
		[2,8,0]
	];

	//Start drawing one spirograph after 1 second after reload
	//setTimeout (function() {
		addSpiro(spiroOrder[index][0], 0);
		addSpiro(spiroOrder[index][1], 1);
		addSpiro(spiroOrder[index][2], 2);
		setTimeout( function() { index += 1; }, 4000);
	//}, 500);

	d3.select("#spiro-graph").on("click", function() {
		d3.selectAll("#spiroGraph .spirograph").remove();
		addSpiro(spiroOrder[index][0], 0);
		addSpiro(spiroOrder[index][1], 1);
		addSpiro(spiroOrder[index][2], 2);
		setTimeout( function() { index += 1; }, 4000);
	})

	// //Start drawing one spirograph after 1 second after reload
	// setTimeout(function() {
	// 	index = Math.round(Math.random() * (spiroData.length-1));
	// 	console.log(index);
	// 	startColor = (startColor+1)%numColors;
	// 	addSpiro(index, startColor);
	// }, 1000);

	// d3.select("#spiro-graph").on("click", function() {
	// 	index = Math.round(Math.random() * (spiroData.length-1));
	// 	console.log(index);
	// 	startColor = (startColor+1)%numColors;
	// 	addSpiro(index, startColor);
	// })
	////////////////////////////////////////////////////////////
	//////////////////// Draw a Spirograph /////////////////////
	////////////////////////////////////////////////////////////

	function addSpiro(index, order) {
		var path = svg.append("path")
			.attr("class", "spirograph")
			.attr("transform", "scale(1.4)")
			.attr("d", line(plotSpiroGraph(index)) )
			.style("stroke", colors[order])
			//.style("stroke", "hsla(" + startColor/numColors * 360 + ", 100%, 50%, " + 0.9 + ")");	
			
		var totalLength = path.node().getTotalLength();	
		var dashArray = totalLength + " " + totalLength;
		
		//Animate the path by offsetting the path so all you see is the white last bit of dashArray 
		//(which has a length that is the same length as the entire path), and then slowly move this
		//out of the way so the rest of the path becomes visible (the stuff at the start of dashArray)
		path
		  	.attr("stroke-dasharray", dashArray)
		  	.attr("stroke-dashoffset", totalLength)
		  	.transition().duration(spiroData[index].drawDuration * 1000).delay(order * 2000)
		  	.ease("linear")
			//.transition().duration(0).ease("linear")
			.attr("stroke-dashoffset", 0);
			
	}//function addSpiro

	////////////////////////////////////////////////////////////
	////////////////// Spirograph functions ////////////////////
	////////////////////////////////////////////////////////////
					
    function plotSpiroGraph(index) {
        //Function adjusted from: https://github.com/alpha2k/HTML5Demos/blob/master/Canvas/spiroGraph.html
		
        // var R = getRandomNumber(60, maxSize);
        // var r = getRandomNumber(40, (R * 0.75));
        // var alpha = getRandomNumber(25, r);
        //console.log(index);

        var R = spiroData[index].R;
        var r = spiroData[index].r;
        var alpha = spiroData[index].alpha;
        var l = alpha / r;
        var k = r / R;
        
        //Create the x and y coordinates for the spirograph and put these in a variable
		var lineData = [];
        for(var theta=1; theta<=20000; theta += 1){
            var t = ((Math.PI / 180) * theta);
            var ang = ((l-k)/k) * t;
            var x = R * ((1-k) * Math.cos(t) + ((l*k) * Math.cos(ang)));
            var y = R * ((1-k) * Math.sin(t) - ((l*k) * Math.sin(ang)));
			
            lineData.push({x: x, y: y});                               
        }  
		
		//Output the variables of this spiro         
		//console.log("R: " + R + ", r: " + r + ", alpha: " + alpha);// + ", l: " + l + ", k: " + k);
		
		return lineData;
    }//plotSpiroGraph
    
}//init

pt.spiroGraph.noGlow = function() {

	d3.selectAll("#spiroGraph .spiroWrapper")
		.style("filter","none");

}//noGlow


pt.spiroGraph.withGlow = function() {

	d3.selectAll("#spiroGraph .spiroWrapper")
		.style("filter","url(#glow)");

}//withGlow