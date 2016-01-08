var movement = require("./movement.js")
var cam = require("./cam.js");


function presenceStart(){
  camera.start();
}
function presenceStop(){
  camera.stop();
}

var camera = new cam();
var presence = new movement(presenceStart, presenceStop);



var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(8080);
