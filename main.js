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
	var myRPM = 1000;
	var myAccel = 60000;
	var myDecel = 60000;

	// Add functionality to Johnny-Five Stepper class
	five.Stepper.prototype.position = 0;
	// five.Stepper.prototype.setPosition = function(pos){this.position=pos};
	five.Stepper.prototype.isMoving = false;
	// five.Stepper.prototype.setIsMoving = function(bool){this.isMoving=bool};
	five.Stepper.prototype.moveTo = function(pos) {
		if( this.position != pos ) {
			console.log("moving from ",position," to ",pos,"...");		
			this.isMoving = true;
			var dir = 0;
			var stepsToMove = pos-this.position;
			if(stepsToMove>0){dir=1;}

			this.step({
				steps: Math.abs(stepsToMove),
				direction: dir,
				rpm: myRPM,
				decel: myDecel},
				function(){
					console.log("Done");
					this.isMoving = false;
					this.position = pos;
			});
		}
	};

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
		console.log("here");
		// if only one hand is present
		if (frame.hands && frame.hands.length == 1) {
			// console.log("hand in frame");
			// extract centre palm position in mm [x,y,z]
			palm = frame.hands[0].palmPosition;
			palmX = mapX(palm[0]);
			palmY = mapY(palm[1]);
			// console.log(stepsToMove);

			if (acceptingCommands == true) {	
				// console.log(stepsToMove);	
				acceptingCommands = false;
				stepper1.moveTo(palmX);
				stepper2.moveTo(palmY);
				setTimeout(function(){},1000);
			}
		}
		else {
			console.log("no hand in frame");
			if (acceptingCommands == true) {
				console.log("resetting...");
				acceptingCommands = false;
				stepper1.moveTo(0);
				stepper2.moveTo(0);
				setTimeout(function(){},1000);
			}
		}

		acceptingCommands = !(stepper1.isMoving || stepper2.isMoving);
    });

    // // Oscillates servo back to origin
    // function oscillate(stepper,position) {
    // 	var steps = position - 330;
    // 	if( steps > 0 ) {
    // 		stepper.step
    // 	}
    // 	else if( steps > 0 ) {

    // 	}
    // }
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