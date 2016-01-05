var raspicam = require("raspicam");
var fs = require('fs');

module.exports = function() {

  var objInterval = null;

  function capture(){
    var camera = new raspicam({ mode:"photo", output:"img.jpg", w:800, h:600 });
    camera.start();
    camera.on("read", function(err, filename){
      var file = fs.readFileSync("img.jpg");
      console.log(file);
    });
  }

  return {
    start: function() {
      this.objInterval = setInterval(capture, 5000);
    },

    stop: function(){
      if(objInterval !== null)
      clearInterval(this.objInterval)
    }
  }
};
