var raspicam = require("raspicam");
var fs = require('fs');
var https = require('https');
var gm = require('gm').subClass({imageMagick: true});

module.exports = function() {

  var objInterval = null;

  var emotionStack = [];

  var visitors = [];
  function saveVisitor(visitor) {
    visitors.push(visitor);
  }

  function getHighestEmotion(face) {
    var emotion = Object.keys(face.scores)
    .reduce(function(keya, keyb) {
      return parseFloat(face.scores[keya]) > parseFloat(face.scores[keyb]) ? keya : keyb;
    });

    return emotion;
  }

  function detectEmotions(){
    var visitor = emotionStack.pop();
    if(visitor == null)
      return;

    var header = {
      "Content-Type": "application/octet-stream",
      "Ocp-Apim-Subscription-Key": "dbdba48816c44af8b9e40edff7d5a818"
    }

    var req = https.request({
      hostname: 'api.projectoxford.ai',
      path: '/emotion/v1.0/recognize?',
      method: 'POST',
      headers: header,
    }, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        var faces = JSON.parse(chunk);
        console.log(chunk);
        console.log(faces);
        var face = faces[0]; //there sould be only 1 face
        var emotion = getHighestEmotion(face);
        visitor.emotion = emotion;
        saveVisitor(visitor);
      });
      res.on('end', function() {
        console.log('No more data in response.')
      })
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(visitor.img);
    req.end();
  }

  function new_photo(file){
    var header = {
      "Content-Type": "application/octet-stream",
      "Ocp-Apim-Subscription-Key": "8472487fa26441be88add23236b26a6c"
    }

    var req = https.request({
      hostname: 'api.projectoxford.ai',
      path: '/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,smile,facialHair',
      method: 'POST',
      headers: header,
    }, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        var faces = JSON.parse(chunk);
        console.log(chunk);
        console.log(faces);

        for (var i = 0; i < faces.length; i++) {
          var face = faces[i];
          var width = face.faceRectangle.width;
          var height = face.faceRectangle.height;
          var x = face.faceRectangle.left;
          var y = face.faceRectangle.top;
          console.log(width + ' ' + height + ' ' + x + ' ' + y);
          console.log(face.faceAttributes.facialHair);
          console.log(face.faceAttributes.gender);
          gm(file)
          .crop(width, height, x, y)
          .toBuffer('JPG',function (err, buffer) {
            if (err) return handle(err);
            visitor = {
              faceId: face.faceId,
              age: face.faceAttributes.age,
              gender: face.faceAttributes.gender,
              smile: face.faceAttributes.smile,
              facialHair: {
                mustache: face.faceAttributes.facialHair.mustache,
                beard: face.faceAttributes.facialHair.beard,
                sideburns: face.faceAttributes.facialHair.sideburns
              },
              img: buffer
            }
            visitor.date = Date();
            emotionStack.unshift(visitor);

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
      objInterval = setInterval(capture, 5000); //max of 20 per minute
      objDetectEmotionInterval = setInterval(detectEmotions, 3500); //max of 20 per minute
    },

    stop: function(){
      clearInterval(objInterval)
    }
  }
};
