var request = require("request");

module.exports = function() {

    var username = process.env.HANAUSER;
    var password = process.env.HANAPASS;
    var host = "http://54.172.186.47/booth/booth.xsodata/";
    var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
    var local = "http://localhost:3000/";

    var header = {
      "Content-Type": "application/json",
      "Authorization" : auth
    };

    function logPresence(presence){
        var myDate = new Date();
        var newEntry = {
            DATE: "/Date(" + myDate.getTime() + ")/", //getTime() produces the UNIX seconds dateformat
            PRESENCE: presence
        };

        var body = JSON.stringify(newEntry);
        var options = {
          url: host + "PRESENCE",
          headers: header,
          body: body
        };

        request.post(options, function (error, response, body) {
		if(!response)
			return;
            if (error ||
            (response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 202)) {
              console.log('error ' + response.statusCode + ': ' + error);
              console.log(body)
              return;
            }
        });

        var newEntry = {
            DATE: myDate.getTime(), //getTime() produces the UNIX seconds dateformat
            PRESENCE: presence
        };

        var body = JSON.stringify(newEntry);
        var options = {
          url: local + "PRESENCE",
          body: body,
          headers: {"Content-Type": "application/json"}
        };
        request.post(options, function (error, response, body) {
            if (error ||
            (response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 202)) {
              console.log('error ' + response.statusCode + ': ' + error);
              console.log(body)
              return;
            }
        });
    }

    function logVisitorEmotion(id, mood, date){
        var date = new Date(date);
        var newEntry = {
            DATE: "/Date(" + date.getTime() + ")/", //getTime() produces the UNIX seconds dateformat
            ID_VISITOR: id,
            MOOD: mood
        };

        var body = JSON.stringify(newEntry);
        var options = {
          url: host + "VISITOR_MOOD",
          headers: header,
          body: body
        };

        request.post(options, function (error, response, body) {
            if (error ||
            (response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 202)) {
              console.log('error ' + response.statusCode + ': ' + error);
              console.log(body)
              return;
            }
        });

        var newEntry = {
            DATE: date.getTime(), //getTime() produces the UNIX seconds dateformat
            ID_VISITOR: id,
            MOOD: mood
        };

        var body = JSON.stringify(newEntry);
        var options = {
          url: local + "VISITOR_MOOD",
          body: body,
          headers: {"Content-Type": "application/json"}
        };
        request.post(options, function (error, response, body) {
            if (error ||
            (response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 202)) {
              console.log('error ' + response.statusCode + ': ' + error);
              console.log(body)
              return;
            }
        });
    }

    function logVisitor(id){
      var newEntry = {
          ID_VISITOR:id
      };

      var body = JSON.stringify(newEntry);
      var options = {
        url: local + "VISITOR",
        body: body,
        headers: {"Content-Type": "application/json"}
      };
      request.post(options, function (error, response, body) {
          if (error ||
          (response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 202)) {
            console.log('error ' + response.statusCode + ': ' + error);
            console.log(body)
            return;
          }
      });
    }

    return {
      logVisitor: logVisitor,
      logPresence: logPresence,
      logVisitorEmotion: logVisitorEmotion
    }
};
