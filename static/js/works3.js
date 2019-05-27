//read in data from flask app
var url = "/data"

// Use d3 to select the panel with id of `#sample-metadata`
var testdata = d3.select('#test');

// Use `.html("") to clear any existing metadata
testdata.html("");

//call json data
d3.json(url).then(function(data){
//d3.json(url, function(data){
    
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
            name_test.push(d['name'])
            new_data.push({ "name":d['name'],
                            "year": formatDate(d['year']),
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
    console.log('name')

    const unique = (value, index, self) => {
        return self.indexOf(value) === index;
    }
    name_test = name_test.filter(unique).sort()
    console.log(name_test)


    
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
    var playerGroup = playerDim.group()
    var accuracyGroup = accuracyDim.group()
    var distanceGroup = distanceDim.group()
    var accgroupGroup = accgroupDim.group()

    // CHARTS

    var yearChart = dc.barChart("#plot")
    var distanceChart = dc.barChart("#distance")
    var accgroupChart = dc.pieChart('#pie')
    //var finalChart = dc.lineChart('#line')
    var compChart = dc.compositeChart('#line2')
    var nasdaqTable = dc.dataTable('.dc-data-table');
    var nasdaqCount = dc.dataCount('.dc-data-count');


    console.log(yearDim.group().top(10))

// /////////////////////////////////////////////////////////////////////////
    // var ndx = crossfilter(...)
    // var dim = ndx.dimension(...)
    // var group = dim.group(...) ... 

    // var filtered_group = remove_empty_bins(group) // or filter_bins, or whatever

    // chart.dimension(dim)
    //     .group(filtered_group)
    //     ...
    

    // function remove_empty_bins(source_group) {
    //     function non_zero_pred(d) {
    //         //return Math.abs(d.value) > 0.00001; // if using floating-point numbers
    //         return d.value !== 0; // if integers only
    //     }
    //     return {
    //         all: function () {
    //             return source_group.all().filter(non_zero_pred);
    //         },
    //         top: function(n) {
    //             return source_group.top(10)
    //                 .filter(non_zero_pred)
    //                 .slice(0, n);
    //         }
    //     };
    // }

    function top_bins(source_group) {
        return {
            all: function () {
                return source_group.top(10);}
        };
    }

    // var filteredGroup = remove_empty_bins(distanceGroup)


    accgroupChart
      .width(500)
      .height(400)
      .dimension(accgroupDim)
      .group(accgroupGroup)
      .innerRadius(40)
    

    distanceChart
        .width(1200)
        .height(450)
        .dimension(distanceDim)
        .group(distanceGroup)
        .x(d3.scaleLinear().domain([230,330]))
        .y(d3.scaleLinear().domain([0,10]))       
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
        .x(d3.scaleTime().domain([new Date(1979, 0, 0), new Date(2020, 0, 0)]))  
        //.x(d3.scale.ordinal().domain(date)) // Need empty val to offset first value
        //.xUnits(dc.units.ordinal)      
        .elasticY(true)
        //.elasticX(true)
        .centerBar(true)
        .gap(-30)
        .xAxisLabel('Year')
        .yAxisLabel('Number of Players')
        .margins({top: 10, right: 26, bottom: 50, left: 50})
        

     var bla2 = playerDim.group().reduceSum(function (d) {
        return d.distance_avg;
    });

    var bla3 = playerDim.group().reduceSum(function (d) {
        return d.accuracy_avg;
    });

    
    
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
 
    
    // var bla = distanceDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
    var bla = playerDim.group().reduce(reduceAdd, reduceRemove, reduceInitial);
    console.log('bla')
    console.log(bla.all())
    

    function order_group(group, order) {
        return {
            all: function() {
                var g = group.all(), map = {};
             
                g.forEach(function(kv) {
                    map[kv.key] = kv.value;
                });
                return order.map(function(k) {
                    return {key: k, value: map[k]};
                });
            }
        };
    };

    var filteredGroup = order_group(bla2)


    // finalChart
    //     .renderArea(true)
    //     .width(1600)
    //     .height(400)
    //     .transitionDuration(1000)
    //     .margins({top: 30, right: 50, bottom: 25, left: 60})
    //     .x(d3.scaleLinear().domain([220,330]))
    //     .y(d3.scaleLinear().domain([0,100]))
    //     .dimension(distanceDim)
    //     .group(bla)
    //     .valueAccessor(function (d) {
    //         return d.value.a_avg;
    //     })
    //     .mouseZoomable(true)
    //     .elasticY(false)
    //     .renderHorizontalGridLines(true)

    console.log(bla2.all())
    console.log(bla3.all())
    compChart
        .width(1600)
        .height(400)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 25, left: 60})
        .dimension(playerDim)
        .mouseZoomable(false)
        .shareTitle(false)
        //.x(d3.scaleTime().domain([new Date(1979, 0, 0), new Date(2020, 0, 0)])) 
        .x(d3.scaleBand().domain(name_test)) // Need empty val to offset first value
        .xUnits(dc.units.ordinal)   
        .y(d3.scaleLinear().domain([0,5000]))
        .elasticY(false)
        .renderHorizontalGridLines(true)
        .legend(dc.legend().x(90).y(300).itemHeight(30).gap(10))
        .brushOn(false)
        
        .compose([
            dc.lineChart(compChart)
                // .group(bla, "Yearly Average Distance")
                // .valueAccessor(function (d) {
                //     return d.value.d_avg;
                // })
                .group(bla2)
                .ordinalColors(["orange"])
                .useRightYAxis(true)
                .renderArea(true),

            dc.lineChart(compChart)
                // .group(bla, "Yearly Average Accuracy")
                // .valueAccessor(function (d) {
                //     return d.value.a_avg;
                // })
                .group(bla3)
                .renderArea(true)
        ])
        .yAxisLabel("Accuracy Average")
        .rightYAxisLabel("Distance Average")
        .renderHorizontalGridLines(true)




    nasdaqCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
        .crossfilter(ndx)
        .groupAll(all)
        .html({
            some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
            all: 'All records selected. Please click on the graph to apply filters.'
        });

    amazing = []
    nasdaqTable /* dc.dataTable('.dc-data-table', 'chartGroup') */
        .dimension(distanceDim)
        .section(d => {amazing.push(d.name)})
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
        .order(d3.descending)
        .on('renderlet', function (table) {
            table.selectAll('.dc-table-group').classed('info', true);
        });

        
        console.log(amazing)
    
    dc.renderAll()


    console.log(distanceGroup.top(25))






});