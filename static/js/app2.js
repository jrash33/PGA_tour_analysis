var url = "/data"

console.log("hello world")

// Use d3 to select the panel with id of `#sample-metadata`
var testdata = d3.select('#test');

// Use `.html("") to clear any existing metadata
testdata.html("");

d3.json(url).then(function(response) {

    //console.log(response)

    // //declare variable of interest
    // var measured_rounds = []
    // var player_name = []
    start_year = 2010;
    end_year = 2019;

    //process to check if variable exists
    response.forEach(player => {
        console.log(player)
        console.log(player['player_intro']["Player Name"])
        joey = []
        player['all_stat_var'].forEach(stats =>{
            if (stats['year'] <= end_year && stats['year'] >= start_year){
                console.log(stats['year'])
            }
        })

    //     //console.log(d['all_stat_var'].length)
    //     if (player["all_stat_var"].length != 0){

    //         var joey = player["all_stat_var"]["Driving Distance"]
            
    //         if (typeof(joey) != "undefined"){
    //             var player_name_2 = player["_id"]

    //             measured_rounds.push(joey)
    //             player_name.push(player_name_2)

    //             //append to html
    //             d3.select('#test')
    //             .append('div')
    //             .text(joey + " : " + player_name_2)
    //             .style("font-size", "15px")
    //         }
    //     }
    })

    // //convert measured_rounds from string to int
    // for(var i=0; i<measured_rounds.length; i++) { measured_rounds[i] = +measured_rounds[i]; } 
    
    // console.log(player_name, measured_rounds)

    // var trace = [
    //     {
    //       x: player_name,
    //       y: measured_rounds,
    //       type: 'bar'
    //     }
    //   ];
      
    // Plotly.newPlot('plot', trace);

   
});