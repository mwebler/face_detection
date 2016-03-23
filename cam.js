var raspicam = require("raspicam");
var fs = require('fs');
var https = require('https');
var gm = require('gm').subClass({imageMagick: true});
var request = require('request');
var hanadb = require("./hana.js");

module.exports = function() {

    var db = {object: {}};
    db.object.similarStack = [];
    db.object.emotionStack = [];
    db.object.visitors = [];
    db.object.faceList = [];

    var hana = new hanadb();

  var objInterval = null;
  var findSimilarInterval = null;

  var visitors = [];
  function saveVisitor(visitor) {
    db.object.visitors.push(visitor);
    visitor.emotions = [];
    detectEmotions(visitor.img, function(emotion){
        var v = findVisitor(visitor.faceId);
        if(v != null){
            v.emotions.push({img: visitor.img, emotion: emotion, date: visitor.date});
            hana.logVisitorEmotion(v.faceId, emotion, visitor.date);
            hana.logVisitor(v.faceId);
        }
    });
  }

  function findVisitor(faceId){
      for(var i = 0; i < db.object.visitors.length; i++) {
          var v = db.object.visitors[i];
          if(v.faceId = faceId){
              return v;
          }
      }
      return null;
  }

  function getHighestEmotion(face) {
    var emotion = Object.keys(face.scores)
    .reduce(function(keya, keyb) {
      return parseFloat(face.scores[keya]) > parseFloat(face.scores[keyb]) ? keya : keyb;
    });

    return emotion;
  }

  function detectEmotions(imageFile, callback){
    var image = fs.readFileSync(imageFile);

    var header = {
      "Content-Type": "application/octet-stream",
      "Ocp-Apim-Subscription-Key": "dbdba48816c44af8b9e40edff7d5a818"
    }

    var options = {
      url: 'https://api.projectoxford.ai/emotion/v1.0/recognize?',
      headers: header,
      body: image
    };

    request.post(options, function (error, response, body) {
        if (error || response.statusCode != 200) {
          console.log('emotion' + response.statusCode + ': ' + error);
          return;
        }
            var faces = JSON.parse(body);
              console.log(body);
            //  console.log(faces);
            console.log('emotions from: ' + imageFile);
              var face = faces[0]; //there sould be only 1 face
              if(!face || face == null || face == undefined){
                callback('neutral');
              }
              else{
                  var emotion = getHighestEmotion(face);
                  callback(emotion);
              }

    });
  }

  function addFace(visitor) {
    db.object.faceList.push(visitor.faceId);
  }

  function findSimilar(){

    var visitor = db.object.similarStack.pop();
    if(visitor == null)
      return;

      console.log("check similar");
      console.log("facelist size: " + db.object.faceList.length);
      if(db.object.faceList.length == 0){
          addFace(visitor);
          saveVisitor(visitor);
          return;
      }

      var header = {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": "8472487fa26441be88add23236b26a6c"
      }

      var reqBody = {
        faceId: visitor.faceId,
        faceIds: db.object.faceList,
        maxNumOfCandidatesReturned: 1
      };
      var body = JSON.stringify(reqBody);

      var options = {
        url: 'https://api.projectoxford.ai/face/v1.0/findsimilars',
        headers: header,
        body: body
      };

      request.post(options, function (error, response, body) {
          if(!response)
		return;
		if (error || response.statusCode != 200) {
            console.log('similar ' + response.statusCode + ': ' + error);
            return;
          }
              var faces = JSON.parse(body);
              console.log(body);
              if(faces.error != null || faces.length == 0 || !faces[0]) {
                console.log("add face");
                addFace(visitor);
                saveVisitor(visitor);
                return;
              }

              var face = faces[0];

              if(face.confidence >= 0.6){
                console.log("same face found");
                detectEmotions(visitor.img, function(emotion){

                  var v = findVisitor(face.faceId);
                  if(v != null){
                      console.log(face.faceId);
                      console.log(v);
                      v.emotions.push({img: visitor.img, emotion: emotion, date: visitor.date});
                      hana.logVisitorEmotion(face.faceId, emotion, visitor.date);
                  }
                });

              }
              else{
                console.log("its a new face");
                addFace(visitor);
                saveVisitor(visitor);
              }

      });
  }

  function new_photo(file){

    var header = {
      "Content-Type": "application/octet-stream",
      "Ocp-Apim-Subscription-Key": "8472487fa26441be88add23236b26a6c"
    }

    var options = {
      url: 'https://api.projectoxford.ai/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,smile,facialHair',
      headers: header,
      body: file
    };

    request.post(options, function (error, response, body) {
        if(!response)
		return;
	if (error || response.statusCode != 200) {
          console.log('face ' + response.statusCode + ': ' + error);
          return;
        }
          var faces = JSON.parse(body);

          for (var i = 0; i < faces.length; i++) {
            var face = faces[i];
            var width = face.faceRectangle.width;
            var height = face.faceRectangle.height;
            var x = face.faceRectangle.left;
            var y = face.faceRectangle.top;
            var fileName = 'img/'+face.faceId+'.jpg';
            gm(file)
            .crop(width, height, x, y)
            .write(fileName,function (err) {
              if (err) {console.log(err); return err};
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
                img: fileName
              }
              visitor.date = Date();
              db.object.similarStack.unshift(visitor);
            });
          }

    });
  }

  function capture(){
    var camera = new raspicam({ mode:"photo", output:"img.jpg", w:1024, h:768, t: 500, q:100});
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
      findSimilarInterval = setInterval(findSimilar, 10000); //max of 20 per minute
    },

    stop: function(){
      clearInterval(objInterval)
    }
  }
};
