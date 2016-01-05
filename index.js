var five = require("johnny-five"),
    board = new five.Board({port: "COM13"});

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
  });

  // "motionend" events are fired following a "motionstart" event
  // when no movement has occurred in X ms
  motion.on("motionend", function() {
    console.log("off");
    led.off();
  });

});

navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

if (navigator.getUserMedia) {
  navigator.getUserMedia(

    // constraints
    {
      video: true,
      audio: true
    },

    // successCallback
    function(localMediaStream) {
      var video = document.querySelector('video');
      video.src = window.URL.createObjectURL(localMediaStream);
      // Do something with the video here, e.g. video.play()
    },

    // errorCallback
    function(err) {
      console.log("The following error occured: " + err);
    });
} else {
  console.log("getUserMedia not supported");
}
