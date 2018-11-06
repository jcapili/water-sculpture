"use strict";

var Cylon = require("cylon");

Cylon.robot({
  connections: {
    leap: { adaptor: "leapmotion" },
    arduino: { adaptor: 'firmata', port: '/dev/cu.usbmodem1421' }
  },

  devices: {
    led: { driver: "led", pin: 9, connection: "arduino" },
    leapmotion: {driver: "leapmotion", connection: "leap"}
  },

  // Turn on the LED if the hand is in the frame, turn off
  // LED if hand isn't in frame.
  work: function(my) {
    var brightness = 0;

    my.leapmotion.on("frame", function(frame) {
      if (frame.hands.length > 0) {
        var yPosition = frame.hands[0].palmPosition[1],
          fraction = yPosition/300;

        if (fraction > 1) {
          fraction = 1;
        }
        my.led.brightness(fraction*255)
      } else {
        brightness = 0;
        my.led.brightness(brightness);
      }
    });
  }

  // work: function(my) {
  //   my.leapmotion.on("hand", function(hand) {
  //     console.log(hand.palmPosition.join(","));
  //   });
  // }
}).start();