var raspicam = require("raspicam");
var fs = require('fs');
var https = require('https');

module.exports = function() {

  var objInterval = null;

  function capture(){
    var camera = new raspicam({ mode:"photo", output:"img.jpg", w:800, h:600, t: 1});
    camera.start();
    camera.on("exit", function(err, filename){
      var file = fs.readFileSync("img.jpg");
      console.log('send photo');

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
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          var parsed = JSON.parse(chunk);
          console.log(parsed);
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
    });
  }

  return {
    start: function() {
      this.objInterval = setInterval(capture, 5000);
    },

    stop: function(){
      clearInterval(this.objInterval)
    }
  }
};
