// One revolution with stepsPerRev = 200 is about 1700
// 1 revolution = 1.75" lateral movement

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


  five.Stepper.prototype.position = 330;
  five.Stepper.prototype.getPosition = function(){return this.position};


  var stepper1 = new five.Stepper({
    type: five.Stepper.TYPE.DRIVER,
    stepsPerRev: 200,
    pins: {
      step: 6,
      dir: 5
    }
  });

  // var myStepper = {
  //   stepper = stepper1,
  //   getStepper : function() {
  //     return this.stepper;
  //   },
  //   position : 0,
  //   setPosition : function(newPosition) {
  //     this.position = newPosition;
  //   },
  //   isMoving : false,
  //   setIsMoving : function(bool) {
  //     this.isMoving = bool;
  //   }
  // };

  var stepper2 = new five.Stepper({
    type: five.Stepper.TYPE.DRIVER,
    stepsPerRev: 200,
    pins: {
      step: 4,
      dir: 3
    }
  });

  var _steps = 1700;

  // Make 10 full revolutions counter-clockwise at 180 rpm with acceleration and deceleration
  stepper1.step({
    steps: _steps,
    direction: five.Stepper.DIRECTION.CCW,
    rpm: 1000
  }, function() {
    console.log("Done moving CCW");
    console.log("Position: ",stepper1.position);

    // once first movement is done, make 10 revolutions clockwise at previously
    //      defined speed, accel, and decel by passing an object into stepper.step
    stepper1.step({
      steps: _steps,
      direction: five.Stepper.DIRECTION.CW
    }, function() {
      console.log("Done moving CW");
    });

  });

  // Make 10 full revolutions counter-clockwise at 180 rpm with acceleration and deceleration
  stepper2.rpm(1000).ccw().step(_steps, function() {

    console.log("Done moving CCW");

    // once first movement is done, make 10 revolutions clockwise at previously
    //      defined speed, accel, and decel by passing an object into stepper.step
    stepper2.step({
      steps: _steps,
      direction: five.Stepper.DIRECTION.CW
    }, function() {
      console.log("Done moving CW");
    });
  });
});