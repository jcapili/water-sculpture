// Cylon.Js
/** 
var Cylon = require('cylon');

Cylon.robot({
  connections: {
    arduino: { adaptor: 'firmata', port: '/dev/cu.usbmodem1421' }
  },

  devices: {
    led: { driver: 'led', pin: 13 }
  },

  work: function(my) {
    every((1).second(), my.led.toggle);
  }
}).start();
**/ 

// Johnny-Five
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var led = new five.Led(13);
  led.blink(500);
});