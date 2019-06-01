//read in data from flask app
var url = "/data"

// Use d3 to select the panel with id of `#sample-metadata`
var testdata = d3.select('#test');

// Use `.html("") to clear any existing metadata
testdata.html("");

//call json data
d3.json(url, function(data) {

    //data is nested so we need to flatten the performance data
    var stats = [];

    //add name key/value to each dict nested inside list and push dict to stats list
    data.forEach(function(d){
        d.all_stat_var.map(d2 =>{
            d2["name"]= d["_id"];
            stats.push(d2);
        })        
    })

    console.log(stats)

    //edit data set
    new_data = []
    stats.forEach(function(d) {
        
        //only get objects with data we need
        if (typeof(d['Total Distance']) != "undefined" && typeof(d['Total Drives']) != "undefined" &&
            typeof(d['Possible Fairways']) != "undefined" && typeof(d['Fairways Hit']) != "undefined"){

            d['Total Distance'] = parseFloat(d['Total Distance'].replace(/,/g, ''))
            new_data.push(d)
        }


        // //replace comma and convert to int
        // if (typeof(d['Total Distance']) != "undefined"){
        //     d['Total Distance'] = parseFloat(d['Total Distance'].replace(/,/g, ''))
        // }

        // //fill missing data
        // d['Total Drives'] = +d['Total Drives'] ? +d['Total Drives'] : "missing";
        // d['Total Distance'] = d['Total Distance'] ? d['Total Distance'] : "missing";
        // d['Fairways Hit'] = +d['Fairways Hit'] ? +d['Fairways Hit'] : "missing";
        // d['Possible Fairways'] = +d['Possible Fairways'] ? +d['Possible Fairways'] : "missing";

        // //variables we want for crossfilter
        // d.distance_avg = +(d['Total Distance'] / +d['Total Drives']).toFixed(2);
        // d.accuracy_avg = +(+d['Fairways Hit'] / +d['Possible Fairways'] * 100).toFixed(2);
        // //d.year = +d.year
        

        // var formatDate = d3.time.format("%Y");
        // d.year = formatDate.parse(d.year);
    });

    
    console.log(new_data)
//     //crossfilter
//     var ndx = crossfilter(stats);

//     //counter
//     var all = ndx.groupAll();

//     //dimensions
//     var allDim = ndx.dimension(d => d);
//     var accuracyDim = ndx.dimension(d => d.accuracy_avg);
//     var yearDim = ndx.dimension(d => d.year);
//     var distanceDim = ndx.dimension(d => d.distance_avg);
//     var playerDim = ndx.dimension(d => d.name);

//     var yearGroup = yearDim.group()
//     var playerGroup = playerDim.group()
//     var accuracyGroup = accuracyDim.group()
//     //var distanceGroup = distanceDim.group()

//     var accuracyChart = dc.barChart('#test')
//     var yearChart = dc.barChart("#plot")
//     var playerChart = dc.rowChart('#players')
//    // var distanceChart = dc.barChart("#test")
    


//     //date = date.sort()
//     //console.log(date)

//     // distanceChart
//     //     .width(1500)
//     //     .height(200)
//     //     .dimension(distanceDim)
//     //     .group(distanceGroup)
//     //     .x(d3.scale.linear().domain([200,320]))
//     //     .y(d3.scale.linear().domain([0,10]))       
//     //     //.elasticY(true)
//     //     //.elasticX(true)
//     //     .centerBar(true)
//     //     .gap(15)
//     //     .xAxisLabel('Driving Distance')
//     //     .yAxisLabel('Number of Players')
//     //     .margins({top: 10, right: 26, bottom: 50, left: 50})
//     //     .round(dc.round.floor)

//     accuracyChart
//         .width(1500)
//         .height(200)
//         .dimension(accuracyDim)
//         .group(accuracyGroup)
//         .x(d3.scale.linear().domain([20,90]))
//         //.x(d3.scale.ordinal().domain(date)) // Need empty val to offset first value
//         // .xUnits(dc.units.ordinal)      
//         // .y(d3.scale.linear().domain([0,50]))
//         .elasticY(true)
//         .elasticX(true)
//         .centerBar(true)
//         .gap(15)
//         .xAxisLabel('Fairway %')
//         .yAxisLabel('Number of Players')
//         .margins({top: 10, right: 26, bottom: 50, left: 50})

//     yearChart
//         .width(1500)
//         .height(200)
//         .dimension(yearDim)
//         .group(yearGroup)
//         .x(d3.time.scale().domain([new Date(1979, 0, 0), new Date(2020, 0, 0)]))  
//         //.x(d3.scale.ordinal().domain(date)) // Need empty val to offset first value
//         //.xUnits(dc.units.ordinal)      
//         .elasticY(true)
//         //.elasticX(true)
//         .centerBar(true)
//         .gap(-30)
//         .xAxisLabel('Year')
//         .yAxisLabel('Number of Players')
//         .margins({top: 10, right: 26, bottom: 50, left: 50})




//     playerChart
//         .height(30000)
//         .width(3500)
//         .margins({
//             top: 10,
//             right: 10,
//             bottom: 40,
//             left: 10
//         })
//         .dimension(playerDim)
//         .group(playerGroup)
        

//     dc.renderAll()

    console.log("hi")
    // console.log("yearDim",yearDim.group().top(Infinity   ))
    // yearDim.filter("2004")
    // console.log(all.value())


    //declare variable of interest
    // start_year = 2010;
    // end_year = 2019;

    // years = []
    // //process to check if variable exists
    // data.forEach(player => {
    //     console.log(player)
    //     console.log(player['player_intro']["Player Name"])
    //     player['all_stat_var'].forEach(stats =>{
    //         if (stats['year'] <= end_year && stats['year'] >= start_year){
    //             stats['year'] = +stats['year']
    //             years.push(stats['year'])
    //         }
    //     })
    // })














    //function to find unique values
    // const unique = (value, index, self) => {
    //     return self.indexOf(value) === index;
    // }
    //console.log(years.filter(unique).sort())

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
  


   
});