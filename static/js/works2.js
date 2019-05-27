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
        var formatDate = d3.time.format("%Y");
        //only get objects with data we need
        if (typeof(d['Total Distance']) != "undefined" && typeof(d['Total Drives']) != "undefined" &&
            typeof(d['Possible Fairways']) != "undefined" && typeof(d['Fairways Hit']) != "undefined"){
            //replace comma
            d['Total Distance'] = parseFloat(d['Total Distance'].replace(/,/g, ''))
            d['Total Drives'] = parseFloat(d['Total Drives'].replace(/,/g, ''))
            d['Possible Fairways'] = parseFloat(d['Possible Fairways'].replace(/,/g, ''))
            d['Fairways Hit'] = parseFloat(d['Fairways Hit'].replace(/,/g, ''))

            if (+d['Fairways Hit'] / +d['Possible Fairways'] * 100 < 40){
                var accuracy_avg_var = "<40%"}
            else if (+d['Fairways Hit'] / +d['Possible Fairways'] * 100 >= 40 &&
                    +d['Fairways Hit'] / +d['Possible Fairways'] * 100 <= 50){
                var accuracy_avg_var = "40%-50%"}
            else if (+d['Fairways Hit'] / +d['Possible Fairways'] * 100 > 50 &&
                    +d['Fairways Hit'] / +d['Possible Fairways'] * 100 <= 60){
                var accuracy_avg_var = "50%-60%"}   
            else if (+d['Fairways Hit'] / +d['Possible Fairways'] * 100 > 60 &&
                    +d['Fairways Hit'] / +d['Possible Fairways'] * 100 <= 70){
                    var accuracy_avg_var = "60%-70%"}
            else if (+d['Fairways Hit'] / +d['Possible Fairways'] * 100 > 70 &&
                    +d['Fairways Hit'] / +d['Possible Fairways'] * 100 <= 80){
                    var accuracy_avg_var = "70%-80%"}
            else{
                var accuracy_avg_var = ">80%"
            }

            //push new neatly formatted data
            new_data.push({ "name":d['name'],
                            "year": formatDate.parse(d['year']),
                            "total_distance": +d['Total Distance'],
                            "total_drives": +d['Total Drives'],
                            'possible_fairways': +d['Possible Fairways'],
                            'fairways_hit': +d['Fairways Hit'],
                            'distance_avg': +d['Total Distance'] / +d['Total Drives'],
                            'accuracy_avg': +d['Fairways Hit'] / +d['Possible Fairways'] * 100,
                            'accuracy_group': accuracy_avg_var
                            })
        }
    })

    console.log(new_data)
    
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
    var accgroupDim = ndx.dimension(d => d.accuracy_group)

    
    //GROUPS
    var yearGroup = yearDim.group()
    var accuracyGroup = accuracyDim.group()
    var distanceGroup = distanceDim.group()
    var accgroupGroup = accgroupDim.group()

    // CHARTS
    var yearChart = dc.barChart("#plot")
    var distanceChart = dc.barChart("#distance")
    var accgroupChart = dc.pieChart('#pie')
    //var finalChart = dc.lineChart('#line')
    var compChart = dc.compositeChart('#line2')



/////////////////////////////////////////////////////////////////////////

    accgroupChart
      .width(400)
      .height(400)
      .dimension(accgroupDim)
      .group(accgroupGroup)
      .innerRadius(40)
    

    distanceChart
        .width(1200)
        .height(450)
        .dimension(distanceDim)
        .group(distanceGroup)
        .x(d3.scale.linear().domain([230,330]))
        .y(d3.scale.linear().domain([0,10]))       
        //.elasticY(true)
        //.elasticX(true)
        .centerBar(true)
        .gap(8)
        .xAxisLabel('Driving Distance')
        .yAxisLabel('Number of Players')
        .margins({top: 10, right: 26, bottom: 50, left: 50})
        .round(dc.round.floor)


    yearChart
        .width(1500)
        .height(200)
        .dimension(yearDim)
        .group(yearGroup)
        .x(d3.time.scale().domain([new Date(1979, 0, 0), new Date(2020, 0, 0)]))  
        //.x(d3.scale.ordinal().domain(date)) // Need empty val to offset first value
        //.xUnits(dc.units.ordinal)      
        .elasticY(true)
        //.elasticX(true)
        .centerBar(true)
        .gap(-30)
        .xAxisLabel('Year')
        .yAxisLabel('Number of Players')
        .margins({top: 10, right: 26, bottom: 50, left: 50})

     var bla2 = yearDim.group().reduceSum(function (d) {
        return d.accuracy_avg;
    });

    console.log(bla2.all())

    
    function reduceAdd(p, v) {
        p.distance_avg = p.distance_avg + v.distance_avg;
        p.accuracy_avg = p.accuracy_avg + v.accuracy_avg;
        p.count = p.count + 1;
        p.d_avg = p.distance_avg / p.count;
        p.a_avg = p.accuracy_avg / p.count;
        return p;
    }
    function reduceRemove(p, v) {
        p.distance_avg = p.distance_avg - v.distance_avg;
        p.accuracy_avg = p.accuracy_avg - v.accuracy_avg;
        p.count = p.count - 1;
        p.d_avg = p.distance_avg / p.count;
        p.a_avg = p.accuracy_avg / p.count;
        return p;
    }
    function reduceInitial() {
        return {
            distance_avg: 0,
            accuracy_avg: 0,
            count: 0
        };
    }
 

    var bla = yearDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
    console.log(bla.all())


    // finalChart
    //     .renderArea(true)
    //     .width(1500)
    //     .height(600)
    //     .margins({
    //         top: 20,
    //         right: 10,
    //         bottom: 20,
    //         left: 50
    //     })
    //     .x(d3.time.scale().domain([new Date(1979, 0, 0), new Date(2020, 0, 0)])) 
    //     .y(d3.scale.linear().domain([0,300])) 
    //     .dimension(yearDim)
    //     .valueAccessor(function (d) {
    //         return d.value.d_avg;
    //     })
    //     .group(bla)
    //     .stack(bla, 'Monthly Index Move', function (d) {
    //         return d.value.a_avg;
    //     })

    compChart
        .width(1600)
        .height(600)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 25, left: 60})
        .dimension(yearDim)
        .mouseZoomable(true)
        //.shareTitle(false)
        .x(d3.time.scale().domain([new Date(1979, 0, 0), new Date(2020, 0, 0)])) 
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .legend(dc.legend().x(70).y(10).itemHeight(13).gap(5))
        .brushOn(false)
        .compose([
            dc.lineChart(compChart)
                    .group(bla, "Monthly Index Average")
                    .valueAccessor(function (d) {
                        return d.value.d_avg;
                    }),
            dc.lineChart(compChart)
                    .group(bla, "Monthly Index Move")
                    .valueAccessor(function (d) {
                        return d.value.a_avg;
                    })
                    .renderArea(true)
                    .colors(['rgb(215,48,39)'])
                    // .useRightYAxis(true)
                    //.y(d3.scale.linear().domain([0,100])) 

        ])
        //.useRightYAxis(true)
        .yAxisLabel("Distance Average")
        //.rightYAxisLabel("Accuracy Average")
        .renderHorizontalGridLines(true);



    dc.renderAll()



    console.log("done3")














});