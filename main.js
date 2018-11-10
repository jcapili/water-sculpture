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
	var acceptingCommands = true;
	var myRPM = 1200;
	var myAccel = 60000;
	var myDecel = 60000;

	// Add functionality to Johnny-Five Stepper class
	five.Stepper.prototype.position = 0;
	five.Stepper.prototype.isMoving = false;

	// This function can't use prototype because you need to pass the stepper in as a variable so that the isMoving
	// boolean can then be changed within the function
	var moveTo = function(stepper,pos,vel) {
		if( stepper.position != pos ) {
			console.log("moving from ",stepper.position," to ",pos,"...");		
			stepper.isMoving = true;
			var dir = 0;
			var stepsToMove = pos-stepper.position;
			var newRPM = myRPM*vel/1000;
			if(stepsToMove>0){dir=1;}
			if(newRPM<1000){newRPM=1000;}

			stepper.step({
				steps: Math.abs(stepsToMove),
				direction: dir,
				rpm: newRPM
				// decel: myDecel
				},
				function(){
					console.log("Done");
					stepper.isMoving = false;
					stepper.position = pos;
			});
		}
	};

	// Oscillates the stepper back to 0 from it's current position according to the dampened oscillation of water
	var reset = function(stepper) {

	}

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
			var palm = frame.hands[0].palmPosition;
			var palmX = mapX(palm[0]);
			var palmY = mapY(palm[1]);
			var velocity = frame.hands[0].palmVelocity;
			var velX = velocity[0];
			var velY = velocity[1];
			// console.log(frame.hands[0].palmVelocity);
			// console.log(stepsToMove);

			if (acceptingCommands == true) {	
				// console.log(stepsToMove);	
				acceptingCommands = false;
				moveTo(stepper1,palmX,Math.abs(velX));
				moveTo(stepper2,palmY,Math.abs(velY));
				// setTimeout(function(){},1000);
			}
		}
		else {
			if (acceptingCommands == true) {
				// console.log("resetting...");
				// acceptingCommands = false;
				moveTo(stepper1,0,myRPM);
				moveTo(stepper2,0,myRPM);
				// setTimeout(function(){},1000);
			}
		}

		acceptingCommands = !(stepper1.isMoving||stepper2.isMoving);
    });
});

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