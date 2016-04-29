//Check if it's Safari
var is_safari = false;
if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
	is_safari = true;
}

//Function to only run once after the last transition ends
function endall(transition, callback) { 
	var n = 0; 
	transition 
		.each(function() { ++n; }) 
		.each("end", function() { if (!--n) callback.apply(this, arguments); }); 
}//endall

//Parses a string into a date
var parseDate = d3.time.format("%Y-%m-%d").parse;

//Normal random
//http://jsfiddle.net/guffa/tvt5k/
function rnd2() {
    return ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3;
}

function getRandomNumber(start, end) {
    return ((Math.random() * (end-start)) + start);
}	

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}//function

function cloneSelection(appendTo, toCopy, className, times) {
  toCopy.each(function() {
    for (var i = 0; i < times; i++) {
        var clone = appendTo.node().appendChild(this.cloneNode(true));
        d3.select(clone).attr("class", className);
    }
  });
  return appendTo.selectAll("." + className);
};

