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
	// var myAccel = 60000;
	// var myDecel = 60000;
	var resetRatios = [];
	var isReset = true;

	for( i = 0.01; i <= 2*Math.PI; i+=0.01 ) {
		raw_ans = -1*Math.pow(Math.E,-0.3*i)*Math.sin(Math.PI*i);
		rounded = Math.round(raw_ans*10000);
		if(rounded==0){
			resetRatios.push(Math.pow(Math.E,-0.3*i)*Math.cos(Math.PI*i));
		}
	}

	// Add functionality to Johnny-Five Stepper class
	five.Stepper.prototype.position = 0;
	five.Stepper.prototype.isMoving = false;

	// This function can't use prototype because you need to pass the stepper in as a variable so that the isMoving
	// boolean can then be changed within the function
	var moveTo = function(stepper,pos) {
		var nextPos = 0;
		var end = false;

		if(typeof pos == 'number'){
			nextPos = pos;
		} else if (Array.isArray(pos)){
			// console.log("I'm an array");
			nextPos = pos.shift();
			if(Math.abs(nextPos)<500 || pos.length == 0){
				nextPos=0;
				end = true;
			}
		}

		if( stepper.position != nextPos ) {
			console.log("moving from ",stepper.position," to ",nextPos,"...");		
			stepper.isMoving = true;
			var dir = 0;
			var stepsToMove = nextPos-stepper.position;
			if(stepsToMove>0){dir=1;}
			// if(newRPM<1000){newRPM=1000;}

			stepper.step({
				steps: Math.abs(stepsToMove),
				direction: dir,
				rpm: myRPM
				// decel: myDecel
				},
				function(){
					if( typeof pos == 'number' || end == true ) {
						console.log("Done");
						stepper.isMoving = false;
						stepper.position = nextPos;
					}
					else{
						stepper.position = nextPos;
						moveTo(stepper,pos);
					}
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
		// if only one hand is present
		if (frame.hands && frame.hands.length == 1) {
			// console.log("hand in frame");
			// extract centre palm position in mm [x,y,z]
			var palm = frame.hands[0].palmPosition;
			var palmX = mapX(palm[0]);
			var palmY = mapY(palm[1]);
			// var velocity = frame.hands[0].palmVelocity;
			// var velX = velocity[0];
			// var velY = velocity[1];
			// console.log(stepsToMove);

			if (acceptingCommands == true) {	
				// console.log(stepsToMove);	
				acceptingCommands = false;
				moveTo(stepper1,palmX);
				moveTo(stepper2,palmY);
				// setTimeout(function(){},1000);
			}
		}
		else {
			if (acceptingCommands == true) {
				// console.log("resetting...");
				// reset(stepper1);
				// reset(stepper2);
				moveTo(stepper1,resetRatios.map(function(x){return Math.round(x*stepper1.position)}));
				moveTo(stepper2,resetRatios.map(function(x){return Math.round(x*stepper2.position)}));
				// setTimeout(function(){},1000);
			}
		}

		acceptingCommands = !(stepper1.isMoving||stepper2.isMoving);
		isReset = (stepper1.position == 0) && (stepper2.position == 0);
    });
});

// Simplifies Leap data to round to the nearest 10 and 
// stay within range (Y min: 80 mm, Y max: 580 mm)
var mapY = function (input) {
	// Round input to the nearest 10 mm
	var cleanInput = Math.round(input/10) * 10;
	var fromCenter = cleanInput - 310;
	var output = 0;

	// Determine if it's within the correct range
	if (cleanInput < 60) {
		output = -5830;
	}
	else if (cleanInput > 560) {
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