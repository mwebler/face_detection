var raspicam = require("raspicam");
var fs = require('fs');
var https = require('https');
var gm = require('gm').subClass({imageMagick: true});

module.exports = function() {

  var objInterval = null;

  var currentVisitors = [];

  function new_photo(file){
    var header = {
      "Content-Type": "application/octet-stream",
      "Ocp-Apim-Subscription-Key": "8472487fa26441be88add23236b26a6c"
    }

    var req = https.request({
      hostname: 'api.projectoxford.ai',
      path: '/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender',
      method: 'POST',
      headers: header,
    }, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        var faces = JSON.parse(chunk);
        console.log(faces);

        for (var i = 0; i < faces.length; i++) {
          var face = faces[i];
          var width = face.faceRectangle.width;
          var height = face.faceRectangle.height;
          var x = face.faceRectangle.left;
          var y = face.faceRectangle.top;
          console.log(width + ' ' + height + ' ' + x + ' ' + y);

          gm(file)
          .crop(width, height, x, y)
          .toBuffer('JPG',function (err, buffer) {
            if (err) return handle(err);
            visitor = {
              faceId: face.faceId,
              age: face.age,
              gender: face.gender,
              img: buffer
            }
            currentVisitors.push(visitor);

          });
        }

      });
      res.on('end', function() {
        console.log('No more data in response.')
      })
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(file);
    req.end();
  }

  function capture(){
    var camera = new raspicam({ mode:"photo", output:"img.jpg", w:1024, h:768, t: 1});
    camera.start();
    camera.on("exit", function(err, filename){
      console.log('send photo: ' + "img.jpg");

      var file = fs.readFileSync("img.jpg");
      new_photo(file);
    });
  }

  return {
    start: function() {
      objInterval = setInterval(capture, 5000);
    },

    stop: function(){
      clearInterval(objInterval)
    }
  }
};
