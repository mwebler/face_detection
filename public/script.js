function updateChart(data){
    var yes = 0;
    var no = 0;

    var neutral = 0,
    anger = 0,
    contempt = 0,
    disgust = 0,
    fear = 0,
    happiness= 0,
    sadness = 0,
    surprise= 0;

    for(var i = 0; i < data.length; i++) {
        var item = data[i];
        if(item.PRESENCE == "yes")
            yes++;
        else
            no++;

        switch (item.MOOD) {
          case "neutral": neutral++; break;
          case "anger": anger++; break;
          case "contempt": contempt++; break;
          case "disgust": disgust++; break;
          case "fear": fear++; break;
          case "happiness": happiness++; break;
          case "sadness": sadness++; break;
          case "surprise": surprise++; break;

          default:
              break;
        }

    }

    var yes_perc = yes*100.0 / (yes + no)
    var no_perc = 100.0 - yes_perc;

    var data = {
        labels: ["Presence in the booth (%)"],
        datasets: [
            {
                label: "Yes",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [yes_perc]
            },
            {
                label: "No",
                fillColor: "rgba(0,255,0,0.5)",
                strokeColor: "rgba(0,255,0,0.8)",
                highlightFill: "rgba(0,255,0,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [no_perc]
            }
        ]
    };

    var ctx = document.getElementById("canvas").getContext("2d");
    window.myLine = new Chart(ctx).Bar(data, {
        responsive: true,
    });

    var emotion_data = {
        labels: ["Emotions"],
        datasets: [
            {
                label: "neutral",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [neutral]
            },
            {
                label: "anger",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [anger]
            },
            {
                label: "contempt",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [contempt]
            },
            {
                label: "disgust",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [disgust]
            },
            {
                label: "fear",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [fear]
            },
            {
                label: "happiness",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [happiness]
            },
            {
                label: "sadness",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [sadness]
            },
            {
                label: "surprise",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [surprise]
            }
        ]
    };

    var ctx = document.getElementById("canvas-emotion").getContext("2d");
    window.emotions = new Chart(ctx).Bar(emotion_data, {
        responsive: true,
    });
}

function updateEmotionChart(data){

    var neutral = 0,
    anger = 0,
    contempt = 0,
    disgust = 0,
    fear = 0,
    happiness= 0,
    sadness = 0,
    surprise= 0;

    for(var i = 0; i < data.length; i++) {
        var item = data[i];
        switch (item.MOOD) {
          case "neutral": neutral++; break;
          case "anger": anger++; break;
          case "contempt": contempt++; break;
          case "disgust": disgust++; break;
          case "fear": fear++; break;
          case "happiness": happiness++; break;
          case "sadness": sadness++; break;
          case "surprise": surprise++; break;

          default:
              break;
        }

    }

    var emotion_data = {
        labels: ["Emotions"],
        datasets: [
            {
                label: "neutral",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [neutral]
            },
            {
                label: "anger",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [anger]
            },
            {
                label: "contempt",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [contempt]
            },
            {
                label: "disgust",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [disgust]
            },
            {
                label: "fear",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [fear]
            },
            {
                label: "happiness",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [happiness]
            },
            {
                label: "sadness",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [sadness]
            },
            {
                label: "surprise",
                fillColor: "rgba(0,0,255,0.5)",
                strokeColor: "rgba(0,0,255,0.8)",
                highlightFill: "rgba(0,0,255,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [surprise]
            }
        ]
    };

    var ctx = document.getElementById("canvas-emotion").getContext("2d");
    window.emotions = new Chart(ctx).Bar(emotion_data, {
        responsive: true,
    });
}


function carouselLoad(){
  var host = "http://192.168.1.1:3000/VISITOR";

  $.ajax({
      type: "get",
      async: true,
      url: host,
      success: function (data) {
        var active = false;
        for(var i = 0; i < data.length; i++) {

            var item = data[i];
            if(active)
              $('.carousel-inner').append('<div class="item"><img src="img/'+item.ID_VISITOR+'.jpg" alt=""></div>');
            else{
              $('.carousel-inner').append('<div class="item active"><img src="img/'+item.ID_VISITOR+'.jpg" alt=""></div>');
              active = true;
            }
        }
        $(function(){
        $('.carousel').carousel({
          interval: 2000
        });
      });


      },
      error: function (xhr, textStatus, errorMessage) {
          alert(errorMessage);
      }
  });
}

window.onload = function(){
  carouselLoad();

  var host = "http://192.168.1.1:3000/PRESENCE";
  $.ajax({
      type: "get",
      async: true,
      url: host,
      success: function (data) {
          updateChart(data);

      },
      error: function (xhr, textStatus, errorMessage) {
          alert(errorMessage);
      }
  });

  var host = "http://192.168.1.1:3000/VISITOR_MOOD";
  $.ajax({
      type: "get",
      async: true,
      url: host,
      success: function (data) {
          updateEmotionChart(data);

      },
      error: function (xhr, textStatus, errorMessage) {
          alert(errorMessage);
      }
  });

}
