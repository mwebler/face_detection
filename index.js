var five = require("johnny-five");
var cam = require("./cam.js");
var board = new five.Board({});

var camera = new cam();

board.on("ready", function() {
  // Create an Led on pin 13
  var led = new five.Led(2);

  // Create a new `motion` hardware instance.
  var motion = new five.IR.Motion(7);

  // "calibrated" occurs once, at the beginning of a session,
  motion.on("calibrated", function() {
    console.log("calibrated");
  });

  // "motionstart" events are fired when the "calibrated"
  // proximal area is disrupted, generally by some form of movement
  motion.on("motionstart", function() {
    console.log("on");
    led.on();
    camera.start();
  });

  // "motionend" events are fired following a "motionstart" event
  // when no movement has occurred in X ms
  motion.on("motionend", function() {
    console.log("off");
    led.off();
    camera.stop();
  });

});
