//read in data from flask app
var url = "/data"

// Use d3 to select the panel with id of `#sample-metadata`
var testdata = d3.select('#test');

// Use `.html("") to clear any existing metadata
testdata.html("");

//call json data
d3.json(url).then(function(data){
    
    //data is nested so we need to flatten the performance data
    var player_intro = [];
    var stats = [];
    var tournament_history = [];

    //add name key/value to each dict nested inside list and push dict to stats list
    data.forEach(function(d){
        player_intro.push({
            "name": d.player_intro['Player Name'],
            "url": d.player_intro['photo_url']
        })

        d.all_stat_var.map(d2 =>{
            d2["name"]= d["_id"];
            stats.push(d2);
        })
        
        d.tournament_hist.map(d3 =>{
            d3["name"] = d["_id"];
            tournament_history.push(d3)
        })
    })

    //edit data set
    new_data = []
    name_test = []
    stats.forEach(function(d) {
        var formatDate = d3.timeParse("%Y");
        
        //only get objects with data we need
        if (typeof(d['Total Distance']) != "undefined" && typeof(d['Total Drives']) != "undefined" &&
            typeof(d['Possible Fairways']) != "undefined" && typeof(d['Fairways Hit']) != "undefined"){
            //replace comma
            d['Total Distance'] = parseFloat(d['Total Distance'].replace(/,/g, ''))
            d['Total Drives'] = parseFloat(d['Total Drives'].replace(/,/g, ''))
            d['Possible Fairways'] = parseFloat(d['Possible Fairways'].replace(/,/g, ''))
            d['Fairways Hit'] = parseFloat(d['Fairways Hit'].replace(/,/g, ''))

            if (+d['Fairways Hit'] / +d['Possible Fairways'] * 100 < 40 &&
                +d['Fairways Hit'] / +d['Possible Fairways'] * 100 > 0){
                var accuracy_avg_var = "<40%"}
            else if (+d['Fairways Hit'] / +d['Possible Fairways'] * 100 >= 40 &&
                    +d['Fairways Hit'] / +d['Possible Fairways'] * 100 <= 50){
                var accuracy_avg_var = "40%-50%"}
            else if (+d['Fairways Hit'] / +d['Possible Fairways'] * 100 > 50 &&
                    +d['Fairways Hit'] / +d['Possible Fairways'] * 100 <= 55){
                var accuracy_avg_var = "50%-55%"}
            else if (+d['Fairways Hit'] / +d['Possible Fairways'] * 100 >= 55 &&
                +d['Fairways Hit'] / +d['Possible Fairways'] * 100 <= 60){
                var accuracy_avg_var = "55%-60%"}   
            else if (+d['Fairways Hit'] / +d['Possible Fairways'] * 100 > 60 &&
                    +d['Fairways Hit'] / +d['Possible Fairways'] * 100 <= 65){
                var accuracy_avg_var = "60%-65%"}
            else if (+d['Fairways Hit'] / +d['Possible Fairways'] * 100 >= 65 &&
                +d['Fairways Hit'] / +d['Possible Fairways'] * 100 <= 70){
                var accuracy_avg_var = "65%-70%"}
            else if (+d['Fairways Hit'] / +d['Possible Fairways'] * 100 > 70 &&
                    +d['Fairways Hit'] / +d['Possible Fairways'] * 100 <= 80){
                var accuracy_avg_var = "70%-80%"}
            else if (+d['Fairways Hit'] / +d['Possible Fairways'] * 100 > 80 &&
                    +d['Fairways Hit'] / +d['Possible Fairways'] * 100 <= 100){
                var accuracy_avg_var = ">80%"
            }

            //push new neatly formatted data
            name_test.push(d['name'])
            new_data.push({ "name":d['name'],
                            "year": formatDate(d['year']),
                            "total_distance": +d['Total Distance'],
                            "total_drives": +d['Total Drives'],
                            'possible_fairways': +d['Possible Fairways'],
                            'fairways_hit': +d['Fairways Hit'],
                            'distance_avg': +(+d['Total Distance'] / +d['Total Drives']).toFixed(2),
                            'accuracy_avg': +(+d['Fairways Hit'] / +d['Possible Fairways'] * 100).toFixed(2),
                            'accuracy_group': accuracy_avg_var
                            })
        }
    })


    //get unique player names: long way for now
    const unique = (value, index, self) => {
        return self.indexOf(value) === index;
    }
    name_test = name_test.filter(unique).sort()

    console.log(new_data)

    /////////////////////////////////////////////////////////////////////////////////////////////////////
   // crossfilter
    var ndx = crossfilter(new_data);

    //counter
    var all = ndx.groupAll();

    //dimensions
    var allDim = ndx.dimension(d => d);
    var accuracyDim = ndx.dimension(d => d.accuracy_avg);
    var yearDim = ndx.dimension(d => d.year);
    var distanceDim = ndx.dimension(d => d.distance_avg);
    var playerDim = ndx.dimension(d => d.name);
    var accgroupDim = ndx.dimension(d => d.accuracy_group);

    //GROUPS
    var yearGroup = yearDim.group()
    var playerGroup = playerDim.group()
    var accuracyGroup = accuracyDim.group()
    var distanceGroup = distanceDim.group()
    var accgroupGroup = accgroupDim.group()

    // CHARTS
    var yearChart = dc.barChart("#plot")
    var distanceChart = dc.barChart("#distance")
    var accgroupChart = dc.pieChart('#pie')
    var compChart = dc.compositeChart('#line2')
    var nasdaqTable = dc.dataTable('.dc-data-table');
    var nasdaqCount = dc.dataCount('.dc-data-count');
    var number_dis = dc.numberDisplay('#numberd')
    var number_acc = dc.numberDisplay('#numbera')


    //pie chart to filter by fairway accuracy percentage
    accgroupChart
      .width(300)
      .height(250)
      .dimension(accgroupDim)
      .group(accgroupGroup)
      .innerRadius(40)
    
    //bar plot to filter by driving distance
    distanceChart
        .width(850)
        .height(300)
        .dimension(distanceDim)
        .group(distanceGroup)
        .x(d3.scaleLinear().domain([230,330]))
        .y(d3.scaleLinear().domain([0,10]))       
        .centerBar(true)
        .gap(6)
        .xAxisLabel('Driving Distance (yds)')
        .yAxisLabel('Number of Players')
        .margins({top: 10, right: 26, bottom: 50, left: 50})
        .round(dc.round.floor)

    //bar plot to filter by year
    yearChart
        .width(1300)
        .height(150)
        .dimension(yearDim)
        .group(yearGroup)
        .x(d3.scaleTime().domain([new Date(1979, 0, 0), new Date(2020, 0, 0)]))     
        .elasticY(true)
        .centerBar(true)
        .gap(-25)
        .xAxisLabel('Year')
        .yAxisLabel('# Players')
        .margins({top: 10, right: 26, bottom: 50, left: 50})
    

    //reduce/add/mean functions to filter data again
    function reduceAdd(p, v) {
        ++p.count;
        p.d_total += v.distance_avg;
        p.a_total += v.accuracy_avg;
        return p;
        }
    
        function reduceRemove(p, v) {
        --p.count;
        p.d_total -= v.distance_avg;
        p.a_total -= v.accuracy_avg;
        return p;
        }
    
        function reduceInitial() {
        return {count: 0, d_total: 0, a_total: 0};
        }

    //function to remove empty bins
    function remove_empty_bins(source_group) {
        return {
            all:function () {
                return source_group.all().filter(function(d) {
                    return d.value !== 0; // if integers only
                });
            }
        };
    }

    //apply reduction functions to player dimension to build line chart
    var group_reduce2 = playerDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
    var group_reduce3 = remove_empty_bins(group_reduce2)
   
 
    //composite chart to show average accuracy and distance of each player
    compChart
        .width(1300)
        .height(250)
        .transitionDuration(1000)
        .margins({top: 10, right: 50, bottom: 40, left: 25})
        .dimension(playerDim)
        .mouseZoomable(false)
        .shareTitle(false)
        .x(d3.scaleBand().domain(playerDim.group().all().map(function(d){return d['key']}))) // Need empty val to offset first value
        .xUnits(dc.units.ordinal)   
        .y(d3.scaleLinear().domain([0,100]))
        .elasticY(false)
        .renderHorizontalGridLines(true)
        .legend(dc.legend().x(90).y(300).itemHeight(30).gap(10))
        .brushOn(false)
        
        .compose([
            dc.lineChart(compChart)
                .group(group_reduce3, "Yearly Average Distance")
                .valueAccessor(function (p) {
                    return p.value.count ? p.value.d_total / p.value.count : 0;
                })
                //.group(bla2)
                .ordinalColors(["orange"])
                .useRightYAxis(true)
                .renderArea(true),

            dc.lineChart(compChart)
                .group(group_reduce3, "Yearly Average Accuracy")
                .valueAccessor(function (p) {
                    return p.value.count ? p.value.a_total / p.value.count : 0;
                })
                //.group(bla3)
                .renderArea(true)
        ])
        .yAxisLabel("Accuracy Average")
        .xAxisLabel('Players')
        .rightYAxisLabel("Distance Average")
        .renderHorizontalGridLines(true)


    //display records filtered and reset option
    nasdaqCount 
        .crossfilter(ndx)
        .groupAll(all)
        .html({
            some: '<h1 class="text-center"><strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a></h1><hr>',
            all: '<h1> All records selected. Please click on the graph to apply filters.</h1><hr><br>'
        });


    //table to filter top players by distance
    nasdaqTable 
        .dimension(distanceDim)
        .columns([
            'name',
            {
                label: 'Year',
                format: function (d) {
                    return d.year.getFullYear();
                }
            },
            'distance_avg',
            'accuracy_avg',

        ])
        .endSlice(10)
        .order(d3.descending)
        .on('renderlet', function (table) {
            table.selectAll('.dc-table-group').classed('info', true);
        });


    //apply reduce functions to all data
    var group_reduce = ndx.groupAll().reduce(reduceAdd, reduceRemove, reduceInitial);


    //average distance number display of filtered data
    number_dis
        .formatNumber(d3.format(".3s"))
        .group(group_reduce)
        .valueAccessor(function(p) { 
            return p.count ? p.d_total / p.count : 0;
        })
    
    //average accuracy number display of filtered data
    number_acc
        .formatNumber(d3.format(".3s"))
        .group(group_reduce)
        .valueAccessor(function(p) { 
            return p.count ? p.a_total / p.count : 0;
        })
    
    
    //create event on click of button to display additional stats for top 10 players in crossfilter table    
    d3.select('#download')
        .on('click', function() {

        //first clear html
        d3.select("#player_cards").html("");

        //get top 10 by distance to match table
        var data = distanceDim.top(10);

        //get data from table
        data = data.sort(function(a, b) {
            return nasdaqTable.order()(nasdaqTable.sortBy()(a), nasdaqTable.sortBy()(b));
        });

        data = data.map(function(d) {
            var row = {};
            nasdaqTable.columns().forEach(function(c) {
                row[nasdaqTable._doColumnHeaderFormat(c)] = nasdaqTable._doColumnValueFormat(c, d);
            });
            return row;
        });

        //get all the names and year from the table so that we can match these parameters to original data
        final = []
        data.forEach(function(d){
            final.push({
                "name": d['Name'],
                "year": d['Year'],
            })
        })

        //match table name/data to original data set to get more stats
        final.forEach(function(d){

            //filter parameters from table
            var name = d.name
            var year = d.year

            //player picture url
            var index_url = player_intro.findIndex(d => d.name == name)
            var pic_url = player_intro[index_url].url

            if (pic_url == "none"){
                var pic_url = "https://pga-tour-res.cloudinary.com/image/upload/c_fill,d_headshots_default.png,f_auto,g_face:center,h_350,q_auto,w_280/headshots_29936.png"
            }

            //find the index of the players/year that we want in data set (stats)
            var index = stats.findIndex(d => d.name == name && d.year == year)
            var additional_info = stats[index]

            //get extra variables that we will display under each player
            wanted_data = ["Club Head Speed","Total Drives","Possible Fwys","Distance from Edge of Fairway","Left Rough Tendency","Right Rough Tendency","Measured Rounds"]
            card_display_data = {}
            for(i=0; i<wanted_data.length; i++){
                if(typeof(additional_info[wanted_data[i]]) != "undefined"){
                    console.log("undefined!");
                    card_display_data[wanted_data[i]] = String(additional_info[wanted_data[i]]);
                }
            }

            //put new additional data in html format to be called
            function more_stats(d){
                x=""
                for (var key in d) {
                    x = x + key + ": " + d[key] + "<br>"
                }
                return(x)
            }

            //get tournament history for top 10 table players/year
            var tourney = tournament_history.filter(function(d) {
                return d.name == name;
            })

            //put tournament history data in html form to be called later on
            y=""
            for(i=0; i<tourney.length; i++){
                if(i <= 5){
                y = y + "<tr><td>"+tourney[i].Date+'</td><td>'+tourney[i]['Tournament Name']+'</td><td>'+
                    tourney[i]['Total Score']+'</td><td>'+tourney[i].POS+ "</td></tr>"
                }
            }

            //append top 10 player data to html
            d3.select('#player_cards')
                .append('div')
                .attr("id","player_views")
                .attr("class", "card border-primary mb-3")
                .append('div')
                .attr('class','card-body')
                .append('div')
                .attr('class', 'row')
                .html(
                    "<div class='col-lg-2'><img src=" + "'" + pic_url + "'" + "width='200'></div>"
                + "<div id=player_name class='col-lg-3'><h2>Additional Info</h2><hr>Player Name:  "+name+"<br> Year:  " + year +
                "<br> "+ more_stats(card_display_data) +
                "</div>"
                + "<div id=player_name class='col-lg-7'><h2>Recent Tournament Play</h2><hr>" + 
                "<table><tr><th>Date</th><th>Tournament Name</th><th>Total Score</th><th>POS</th></tr>" + y +" </div>"
                )
        })

    });
    
    //render all plots
    dc.renderAll()

    console.log("done");
});

