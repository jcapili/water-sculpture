// var Cylon = require('cylon');

// Cylon.robot({
//   connections: {
//     arduino: { adaptor: 'firmata', port: '/dev/cu.usbmodem1421' }
//   },

//   devices: {
//     servo: { driver: 'continuous-servo', pin: 2 }
//   },

//   work: function(my) {
//     var clockwise = true;

//     my.servo.clockwise();

//     every((1).second(), function() {
//       if (clockwise) {
//         my.servo.counterClockwise();
//         clockwise = false;
//       } else {
//         my.servo.clockwise();
//         clockwise = true;
//       }
//     });
//   }
// }).start();


var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  /**
   * In order to use the Stepper class, your board must be flashed with
   * either of the following:
   *
   * - AdvancedFirmata https://github.com/soundanalogous/AdvancedFirmata
   * - ConfigurableFirmata https://github.com/firmata/arduino/releases/tag/v2.6.2
   *
   */


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

  // Make 10 full revolutions counter-clockwise at 180 rpm with acceleration and deceleration
  stepper1.rpm(1000).ccw().accel(3200).decel(3200).step(10000, function() {

    console.log("Done moving CCW");

    // once first movement is done, make 10 revolutions clockwise at previously
    //      defined speed, accel, and decel by passing an object into stepper.step
    stepper1.step({
      steps: 10000,
      direction: five.Stepper.DIRECTION.CW
    }, function() {
      console.log("Done moving CW");
    });
  });

  // Make 10 full revolutions counter-clockwise at 180 rpm with acceleration and deceleration
  stepper2.rpm(1000).ccw().accel(3200).decel(3200).step(10000, function() {

    console.log("Done moving CCW");

    // once first movement is done, make 10 revolutions clockwise at previously
    //      defined speed, accel, and decel by passing an object into stepper.step
    stepper2.step({
      steps: 10000,
      direction: five.Stepper.DIRECTION.CW
    }, function() {
      console.log("Done moving CW");
    });
  });
});