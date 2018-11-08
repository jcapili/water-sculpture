/*
	Main program that controls the stepper motors
	in response to the Leap data.
*/

// grab the leap data
var webSocket = require('ws'),
	ws = new webSocket('ws://127.0.0.1:6437'),
	five = require('johnny-five'),
	board = new five.Board(),
	// mm range of leap motion to use, see leap-range.js to find
	leap_range = [50,550], // y of right hand
	frame, palm;

// activate the board and process the data
board.on("ready", function() {
	console.log("Main started");

	// global variables
	var currentX = 0;
	var currentY = 0;
	var movingX = false;
	var movingY = false;
	var isMoving = false;
	var myRPM = 1000;
	var myAccel = 60000;
	var myDecel = 60000;

   // declare steppers according to EasyDriver setup
	var stepper1 = new five.Stepper({
		type: five.Stepper.TYPE.DRIVER,
		stepsPerRev: 200,
		pins: {
			step: 6,
			dir: 5
		}
	});

	var stepper2 = new five.Stepper({
		type: five.Stepper.TYPE.DRIVER,
		stepsPerRev: 200,
		pins: {
			step: 4,
			dir: 3
		}
	});

	ws.on('message', function(data, flags) {
		frame = JSON.parse(data);
		// if only one hand is present
		if (frame.hands && frame.hands.length == 1) {
			// console.log("hand in frame");
			// extract centre palm position in mm [x,y,z]
			palm = frame.hands[0].palmPosition;
			palmY = palm[1].simplify();
			var stepsToMove = (palmY-currentY)*10;
			// console.log(stepsToMove);

			if (stepsToMove != 0 && isMoving == false) {	
				// console.log(stepsToMove);	
				console.log("moving from ",currentY," to ",palmY,"...");		
				isMoving = true;
				movingY = true;
				movingX = true;
				var dir = 1;
				if (stepsToMove<0) {
					dir = 0;
				}
				stepper1.step({
					steps: Math.abs(stepsToMove), 
					direction: dir, 
					rpm: myRPM,
					// accel: myAccel,
					decel: myDecel
					}, 
					function() {
						console.log("1 done");
						movingY = false;
						currentY = palmY;
				});
				stepper2.step({
					steps: Math.abs(stepsToMove), 
					direction: dir, 
					rpm: myRPM,
					// accel: myAccel,
					decel: myDecel
					}, 
					function() {
						console.log("2 done");
						movingX = false;
						currentY = palmY;
				});
				setTimeout(function(){},1000);
			}
		}
		else {
			if (isMoving == false) {
				console.log("resetting...");
				isMoving = true;
				movingX = true;
				movingY = true;
				console.log(currentY);
				stepper1.step({
					steps: currentY*10, 
					direction: 1}, 
					function() {
						movingY = false;
						currentY = 0;
						// console.log("1 is reset");
				});
				stepper2.step({
					steps: currentY*10,
					direction: 1}, 
					function() {
						movingX = false;
						currentY = 0;
						// console.log("2 is reset");
				});
				setTimeout(function(){},1000);
			}
			// setTimeout(function(){},1000);
		}

		isMoving = movingX || movingY;
    });

    // Oscillates servo back to origin
    function oscillate(stepper,position) {
    	var steps = position - 330;
    	if( steps > 0 ) {
    		stepper.step
    	}
    	else if( steps > 0 ) {

    	}
    }
});

// Simplifies Leap data to round to the nearest 10 and 
// stay within range
Number.prototype.simplify = function () {
	// Round input to the nearest 20 mm
	var output = Math.round(this/10) * 10;

	// Determine if it's within the correct range
	if (output < 80) {
		output = 80;
	}
	else if (output > 580) {
		output = 580;
	}

	return output;
}