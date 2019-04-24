pt.minard = pt.minard || {};

pt.minard.init = function() {

	d3.select("#minard #svgMinard defs").remove();
	d3.selectAll("#minard #svgMinard .riverText").remove();

	///////////////////////////////////////////////////////////////////////////
	/////////////////////// Append defs to existing SVG ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Container for the gradients
	var defs = d3.select("#minard #svgMinard").append("defs");

	///////////////////////////////////////////////////////////////////////////
	////////////// Create the gradient for the return movement ////////////////
	///////////////////////////////////////////////////////////////////////////

	var backGradient = defs.append("linearGradient")
		//.attr("gradientUnits", "userSpaceOnUse")
		.attr("id","backGradient")
		.attr("x1","0%")
		.attr("y1","3%")
		.attr("x2","20%")
		.attr("y2","0%")
		.attr("spreadMethod", "reflect");
		
	backGradient.selectAll(".stop")
		.data([                             
		        {offset: "2%", color: "#1A1A1A"}, 
		        {offset: "48%", color: "#7F7F7F"}, 
		        {offset: "52%", color: "#7F7F7F"},            
		        {offset: "98%", color: "#1A1A1A"}    
		])                  
		.enter().append("stop")
		.attr("offset", function(d,i) { return d.offset; })   
		.attr("stop-color", function(d) { return d.color; });

	backGradient.append("animate")
		.attr("attributeName","x1")
		.attr("values","0%;-20%")
		.attr("dur","3s")
		.attr("repeatCount","indefinite");

	backGradient.append("animate")
		.attr("attributeName","x2")
		.attr("values","20%;0%")
		.attr("dur","3s")
		.attr("repeatCount","indefinite");

	backGradient.append("animate")
		.attr("attributeName","y1")
		.attr("values","3%;6%")
		.attr("dur","3s")
		.attr("repeatCount","indefinite");

	backGradient.append("animate")
		.attr("attributeName","y2")
		.attr("values","0%;3%")
		.attr("dur","3s")
		.attr("repeatCount","indefinite");

	///////////////////////////////////////////////////////////////////////////
	///// Create the gradient for the return movement of the small armies /////
	///////////////////////////////////////////////////////////////////////////

	var backSmallGradient = defs.append("linearGradient")
		//.attr("gradientUnits", "userSpaceOnUse")
		.attr("id","backSmallGradient")
		.attr("x1","0%")
		.attr("y1","-10%")
		.attr("x2","0%")
		.attr("y2","90")
		.attr("spreadMethod", "reflect");
		
	backSmallGradient.selectAll(".stop")
		.data([                             
		        {offset: "2.5%", color: "#7F7F7F"}, 
		        {offset: "47.5%", color: "#1A1A1A"},      
		        {offset: "52.5%", color: "#1A1A1A"},        
		        {offset: "97.5%", color: "#7F7F7F"}    
		])                  
		.enter().append("stop")
		.attr("offset", function(d,i) { return d.offset; })   
		.attr("stop-color", function(d) { return d.color; });

	backSmallGradient.append("animate")
		.attr("attributeName","y1")
		.attr("values","-10%;90%")
		.attr("dur","3s")
		.attr("repeatCount","indefinite");

	backSmallGradient.append("animate")
		.attr("attributeName","y2")
		.attr("values","90%;190%")
		.attr("dur","3s")
		.attr("repeatCount","indefinite");

	///////////////////////////////////////////////////////////////////////////
	///////////// Create the gradient for the forward movement ////////////////
	///////////////////////////////////////////////////////////////////////////

	var forwardGradient = defs.append("linearGradient")
		//.attr("gradientUnits", "userSpaceOnUse")
		.attr("id","forwardGradient")
		.attr("x1","0%")
		.attr("y1","3%")
		.attr("x2","30%")
		.attr("y2","0")
		.attr("spreadMethod", "reflect");
		
	forwardGradient.selectAll(".stop")
		.data([   
				{offset: "2.5%", color: "#bf8639"},                           
		        {offset: "47.5%", color: "#debd91"},      
		        {offset: "52.5%", color: "#debd91"},        
		        {offset: "97.5%", color: "#bf8639"}     
		])                  
		.enter().append("stop")
		.attr("offset", function(d,i) { return d.offset; })   
		.attr("stop-color", function(d) { return d.color; });

	forwardGradient.append("animate")
		.attr("attributeName","x1")
		.attr("values","0%;30%")
		.attr("dur","5s")
		.attr("repeatCount","indefinite");

	forwardGradient.append("animate")
		.attr("attributeName","x2")
		.attr("values","30%;60%")
		.attr("dur","5s")
		.attr("repeatCount","indefinite");

	forwardGradient.append("animate")
		.attr("attributeName","y1")
		.attr("values","3%;6%")
		.attr("dur","3s")
		.attr("repeatCount","indefinite");

	forwardGradient.append("animate")
		.attr("attributeName","y2")
		.attr("values","0%;3%")
		.attr("dur","3s")
		.attr("repeatCount","indefinite");

	// d3.select("#minard #svgMinard").append("rect")
	// 	.attr("width", 1920)
	// 	.attr("height",1080)
	// 	.style("fill", "url(#forwardGradient)");

	///////////////////////////////////////////////////////////////////////////
	//////////////// Set the gradients to the existing paths //////////////////
	///////////////////////////////////////////////////////////////////////////	
		
	//The path back
	d3.select("#path-group-1-back").style("fill", "url(#backGradient)");
	d3.select("#path-group-2-back").style("fill", "url(#backSmallGradient)");
	d3.select("#path-group-3-back").style("fill", "url(#backSmallGradient)");

	//The path forward
	d3.select("#path-forward").style("fill", "url(#forwardGradient)");

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Append river names along curve ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	d3.select("#niemenWrapper").append("text")
		.attr("class", "riverText")
		.attr("dy", -5)	
	   .append("textPath")
		.attr("xlink:href", "#niemen")
		.style("text-anchor","start")
		.attr("startOffset", "8%")	
		.style("fill", "#000000")
		.text("Niémen   R.");

	d3.select("#berezinaWrapper").append("text")
		.attr("class", "riverText")
		.attr("dy", -2)	
	   .append("textPath")
		.attr("xlink:href", "#berezina")
		.style("text-anchor","start")
		.attr("startOffset", "5%")	
		.style("fill", "#000000")
		.text("Bérézina   R.");

	d3.select("#moskowaWrapper").append("text")
		.attr("class", "riverText")
		.attr("dy", -2)	
	   .append("textPath")
		.attr("xlink:href", "#moskowa")
		.style("text-anchor","start")
		.attr("startOffset", "5%")	
		.style("fill", "#000000")
		.text("Moskowa   R.");

}//init
