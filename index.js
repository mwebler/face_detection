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


var jsonServer = require('json-server');
// Returns an Express server
var server = jsonServer.create();
// Set default middlewares (logger, static, cors and no-cache)
server.use(jsonServer.defaults());
// Add custom routes
// server.get('/custom', function (req, res) { res.json({ msg: 'hello' }) })
// Returns an Express router
var router = jsonServer.router('db.json');
server.use(router);
server.listen(3000);


var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname+"/public/")).listen(8080);
