var five = require("johnny-five");
var hanadb = require("./hana.js");


module.exports = function(callbackStart, callbackStop) {

  var board = new five.Board({});
  var hana = new hanadb();

  var motionSensor = false;
  var proximitySensor = false;
  var status = false;
  var start = callbackStart;
  var stop = callbackStop;
  var led;

  board.on("ready", function() {
    // Create an Led on pin 2
    led = new five.Led(2);

    var proximity = new five.Proximity({
      controller: "HCSR04",
      pin: 4,
      freq: 1000
    });

    proximity.on("data", function() {
      if(this.cm < 200)
        proximitySensor = true;
      else
        proximitySensor = false;
    });

    // Create a new `motion` hardware instance.
    var motion = new five.Motion(7);

    // "calibrated" occurs once, at the beginning of a session,
    motion.on("calibrated", function() {
      console.log("calibrated");
    });

    // "motionstart" events are fired when the "calibrated"
    // proximal area is disrupted, generally by some form of movement
    motion.on("motionstart", function() {
      console.log("on");

      motionSensor = true;
    });

    // "motionend" events are fired following a "motionstart" event
    // when no movement has occurred in X ms
    motion.on("motionend", function() {
      console.log("off");
      motionSensor = false;
    });
  });

  var interval = setInterval(checkSensor, 1000);
  var logInterval = setInterval(logPresence, 5000);

  function logPresence(){
      var presence = "no";
      if(status == true)
        presence = "yes";
      hana.logPresence(presence);
  }

  function checkSensor(){
    if(motionSensor == true || proximitySensor == true){
      if(status == false){
        start();
        led.on();
      }
      status = true;

    }
    else {
      if(status == true){
        stop();
        led.off();
      }
      status = false;
    }
  }

    return {
      start: callbackStart,
      stop: callbackStop
    }
};
