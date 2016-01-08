var raspicam = require("raspicam");
var fs = require('fs');
var https = require('https');
var gm = require('gm').subClass({imageMagick: true});
const low = require('lowdb');
const storage = require('lowdb/file-async');

const db = low('db.json', { storage });

db.object.similarStack = [];
db.object.emotionStack = [];
db.object.visitors = [];
db.object.faceList = [];
db.write();

module.exports = function() {

  var objInterval = null;
  var findSimilarInterval = null;
  var faceListid = "matheusweblerdkom";

  var visitors = [];
  function saveVisitor(visitor) {
    db.object.visitors.push(visitor);
    db.write();
    detectEmotions(visitor.img, function(emotion){
      db('visitors')
        .chain()
        .find({ faceId: visitor.faceId })
        .assign({ emotions: [{img: visitor.img, emotion: emotion, date: visitor.date}]})
        .value();
    });
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
      //  console.log(faces);
      console.log('emotions from: ' + imageFile);
        var face = faces[0]; //there sould be only 1 face
        if(!face)
          callback('neutral');
        var emotion = getHighestEmotion(face);
        callback(emotion);
      });
    });
    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
      callback('neutral');
    });

    // write data to request body
    req.write(image);
    req.end();
  }

  function addFace(visitor) {
    db.object.faceList.push(visitor.faceId);
    db.write();
  }

  function findSimilar(){

    var visitor = db.object.similarStack.pop();
    db.write();
    if(visitor == null)
      return;

      console.log("check similar");
      console.log("facelist size: " + db('faceList').size());

      var header = {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": "8472487fa26441be88add23236b26a6c"
      }

      var reqBody = {
        faceId: visitor.faceId,
        faceIds: db.object.faceList,
        maxNumOfCandidatesReturned: 1
      };

      var req = https.request({
        hostname: 'api.projectoxford.ai',
        path: '/face/v1.0/findsimilars',
        method: 'POST',
        headers: header,
      }, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          var faces = JSON.parse(chunk);
          console.log(chunk);
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
              var v = db('visitors').find({ faceId: face.faceId });
              console.log(face.faceId);
              console.log(v);
              var emotions = v.emotions;
              emotions.push({img: visitor.img, emotion: emotion, date: visitor.date});
              db('visitors')
                .chain()
                .find({ faceId: face.faceId })
                .assign({ emotions: emotions})
                .value();
            });

          }
          else{
            console.log("its a new face");
            addFace(visitor);
            saveVisitor(visitor);
          }
        });
      }
    );


    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(JSON.stringify(reqBody));
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
            db.write();
          });
        }

      });
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(file);
    req.end();
  }

  function capture(){
    var camera = new raspicam({ mode:"photo", output:"img.jpg", w:1024, h:768, t: 1, ex:"antishake"});
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
