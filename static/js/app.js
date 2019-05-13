var url = "/data"

console.log("hello world")

// Use d3 to select the panel with id of `#sample-metadata`
var testdata = d3.select('#test');

// Use `.html("") to clear any existing metadata
testdata.html("");

d3.json(url).then(function(response) {

    //response.forEach(d => {console.log(d["all_stat_var"][0])})

    //declare variable of interest
    var measured_rounds = []
    var player_name = []

    //process to check if variable exists
    response.forEach(player => {
        console.log(player)
        //console.log(d['all_stat_var'].length)
        if (player["all_stat_var"].length != 0){

            var joey = player["all_stat_var"]["Driving Distance"]
            
            if (typeof(joey) != "undefined"){
                var player_name_2 = player["_id"]

                measured_rounds.push(joey)
                player_name.push(player_name_2)

                //append to html
                d3.select('#test')
                .append('div')
                .text(joey + " : " + player_name_2)
                .style("font-size", "15px")
            
            
            }
        }
    })

    //convert measured_rounds from string to int
    for(var i=0; i<measured_rounds.length; i++) { measured_rounds[i] = +measured_rounds[i]; } 
    
    console.log(player_name, measured_rounds)

    var trace = [
        {
          x: player_name,
          y: measured_rounds,
          type: 'bar'
        }
      ];
      
    Plotly.newPlot('plot', trace);

  
      
    // try {
    //     var joey = response.filter(d => d["all_stat_var"][0]['Measured Rounds'] == 7)
    //     console.log(joey)
    // }
    // catch {
    //     console.log("none")
    // }
    

    // response.forEach(d => {
    //     //var joey = d["all_stat_var"][0]["Measured Rounds"]
    //     try {
    //         var joey = d["all_stat_var"][0]["Measured Rounds"]

    //         d3.select('#test')
    //         .append('div')
    //         .text(joey)
    //         .style("font-size", "15px")
    //     }
    //     catch {console.log("NaN")}
    // })

    // Object.entries(response).forEach(d => 
    //     d3.select('#test')
    //     .append('div')
    //     .text(d[1]._id)
    //     .style("font-size", "10px")
    //     //console.log(d[1]._id, ":", d[1].player_intro[0]['Player Name'])
    // )
   
});
