// Simplifies Leap data to round to the nearest 10 and 
// stay within range (Y min: 80 mm, Y max: 580 mm)
var mapY = function (input) {
	// Round input to the nearest 10 mm
	var cleanInput = Math.round(input/10) * 10;
	var fromCenter = cleanInput - 330;
	var output = 0;

	// Determine if it's within the correct range
	if (cleanInput < 80) {
		output = -5830;
	}
	else if (cleanInput > 580) {
		output = 5830;
	}else {
		// if input is within range, map the 
		// distance of the palm away from the center to 
		// the number of steps needed to achieve the same
		// distance of the stepper away from the center
		output = Math.round(fromCenter/250 * 5830);
	}

	return output;
}

// Simplifies Leap data to round to the nearest 10 and 
// stay within range (X min: -250 mm, X max: 250 mm)
var mapX = function (input) {
	// Round input to the nearest 10 mm
	var fromCenter = Math.round(input/10) * 10;
	var output = 0;

	// Determine if it's within the correct range
	if (fromCenter < -250) {
		output = -5830;
	}
	else if (fromCenter > 250) {
		output = 5830;
	}else {
		// if input is within range, map the 
		// distance of the palm away from the center to 
		// the number of steps needed to achieve the same
		// distance of the stepper away from the center
		output = Math.round(fromCenter/250 * 5830);
	}

	if(output==-0){return 0}
	return output;
}

console.log("mapX Test:");
var prev = 0;
var counter = 0;

for (i=-250; i<250; i++) {
	console.log(i,"maps to",mapX(i));
	if (mapX(i)!=prev) {
		counter += 1;
		prev = mapX(i);
	}
}

console.log("num different x positions: ",counter);