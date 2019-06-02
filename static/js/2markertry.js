// Define SVG area dimensions
var svgWidth = 2000;
var svgHeight = 1000;

var origin = [600, 600], j = 20, scale = 20, beta = 0, alpha = 0, key = function(d){ return d.id; }, startAngle = Math.PI/4;
var svg    = d3.select('#scatter')
            .append("svg")
            .attr("height", svgHeight)
            .attr("width", svgWidth)
            .call(d3.drag().on('drag', dragged)
            .on('start', dragStart)
            .on('end', dragEnd))
            .append('g');
var color  = d3.scaleOrdinal(d3.schemeCategory20);
var mx, my, mouseX, mouseY;


////////////////////////////////////////////////////////////////////////////////////////
// create grid
var grid3d = d3._3d()
    .shape('GRID', j*2)
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

// create points
var point3d = d3._3d()
    .x(function(d){ return d.x; })
    .y(function(d){ return d.y; })
    .z(function(d){ return d.z; })
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);

// create y axis
var yScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(scale);




///////////////////////////////////////////////////////////////////////////////////////    
// function to plot data [input: data object with grid/points/axis parameters]
function processData(data, tt){

    //APPEND GRID
    var xGrid = svg.selectAll('path.grid').data(data[2][0], key);
        
    xGrid
        .enter()
        .append('path')
        .attr('class','_3d grid')
        .merge(xGrid)
        .attr('stroke','black')
        .attr('stroke-width', 0.1)
        .attr('fill', function(d){ return d.ccw ? 'lightgrey' : '#717171'; })
        .attr('fill-opacity', 0.1)
        .attr('d', grid3d.draw); 
    
    xGrid.exit().remove();

    //test
    test = [data[0], data[1], data[2], data[3], data[4], data[5]];

    //LINE ARRAYS
    center_face_array=[]
    grip_array=[]
    hosel_center_array=[]
    Lframe_face_array=[]
    Lframe_loft_array=[]

    //hosel_center
    data[2][1].forEach(function(d){
      hosel_center_array.push(d.projected)
    })

    //grip
    data[1][1].forEach(function(d){
      grip_array.push(d.projected)
    })

    //center_face
    data[0][1].forEach(function(d){
      center_face_array.push(d.projected)
    })

    //Lframe_face
    data[3][1].forEach(function(d){
      Lframe_face_array.push(d.projected)
    })

    //Lframe_loft
    data[4][1].forEach(function(d){
      Lframe_loft_array.push(d.projected)
    })

    
    //cross combine in order of lines you want to connect
    line_array = []
    line_array2 = []
    for (i=0; i<hosel_center_array.length; i++){
      line_array.push(grip_array[i])
      line_array.push(hosel_center_array[i])
      line_array2.push(center_face_array[i])
      line_array2.push(Lframe_face_array[i])
      line_array2.push(Lframe_loft_array[i])
      line_array2.push(center_face_array[i])
    }
    
    var line_updated = d3.line()
      .x(d => d.x)
      .y(d => d.y)


    points = svg.selectAll().data(test);
    

    lines = svg.selectAll("myLines").data(test).enter();


    //line 1 connection grip to hosel
    lines
      //.append("g")
      //.selectAll()
      .append("path")
      .attr('id', 'lines')
        .attr("d", line_updated(line_array))
        //.attr("d", line_updated(line_array2))
        .attr("stroke", "darkred")
        .attr('fill', 'none')
        .attr('opacity', .3)
        .style('stroke-width', 1);
      
    lines
      .append("path")
      .attr('id','lines')
        .attr("d", line_updated(line_array2))
        .attr("stroke", "blue")
        .attr('fill', 'blue')
        .attr('fill-opacity', .1)
        .attr('opacity', .3)
        .style('stroke-width', 1);
      
      var combinedD = "";

      lines.selectAll('id','lines').each(function() { combinedD += d3.select(this).attr("d"); });

      lines.remove();

      lines.append("path")
          .attr("d", combinedD)
          .attr("stroke", "red")
          .attr("stroke-width", 2)
          .attr("fill", "none");

    
    lines.exit().remove();


    points = svg
      .selectAll()
      .data(test)
      .enter()
      .append('g')
      .selectAll('circle')
      .data(function(d){return d[1]});

    points
      .enter()
      .append('circle')
      .attr('class', '_3d')
        //transition effect
        // .attr('opacity', 0)
        // .attr('cx', d => d.projected.x)
        // .attr('cy', d => d.projected.y)
        //.merge(points)
        // .transition().duration(tt)
      .attr('r', 2)
      .attr('stroke', 'gray')
      //.attr('fill', function(d){ return color(d.id); })\
      //.attr('fill', 'none')
      .attr('opacity', .9)
      .attr('cx', d => d.projected.x)
      .attr('cy', d => d.projected.y)



    points.exit().remove();

    // APPEND Y AXIS
    var yScale = svg.selectAll('path.yScale').data(data[0][2]);

    yScale
        .enter()
        .append('path')
        .attr('class', '_3d yScale')
        .merge(yScale)
        .attr('stroke', 'black')
        .attr('stroke-width', .5)
        .attr('tickFormat', 1)
        .attr('d', yScale3d.draw);

    yScale.exit().remove();

    // APPEND TEXT FOR Y AXIS
    var yText = svg.selectAll('text.yText').data(data[0][2][0]);

    yText
        .enter()
        .append('text')
        .attr('class', '_3d yText')
        .attr('dx', '.3em')
        .merge(yText)
        .each(function(d){
            d.centroid = {x: d.rotated.x, y: d.rotated.y, z: d.rotated.z};
        })
        .attr('x', function(d){ return d.projected.x; })
        .attr('y', function(d){ return d.projected.y; })
        .style('font', '10px times')
        .text(d => d[1]);

    yText.exit().remove();

    d3.selectAll('._3d').sort(d3._3d().sort);

}

///////////////////////////////////////////////////////////////////////////////////////

function init(data, type_swing){
  
  swing = []
  var cnt = 0;

  // create scales based off of only one marker set (default: center_face)
  var xScale = d3.scaleLinear()
    .domain([d3.min(data[data.length-1], d => d.x),
    d3.max(data[data.length-1], d => d.x) 
    ])
    .range([-j, j]);

  var yScale = d3.scaleLinear()
    .domain([d3.min(data[data.length-1], d => d.y),
    d3.max(data[data.length-1], d => d.y) 
    ])
    .range([0, -j]);

  var zScale = d3.scaleLinear()
    .domain([d3.min(data[data.length-1], d => d.z),
    d3.max(data[data.length-1], d => d.z) 
    ])
    .range([-j, j]);
  
  //************* look at sections of the swing at a time  
  if (type_swing == 1){
    data.map(function(d){
      marker = []
      d.map(function(d){
        marker.push({x: xScale(d.x), y: yScale(d.y), z: zScale(d.z), id: 'point_' + cnt++});
      })
      swing.push(marker);
    });
  }

  //*********** individual swing sequence
  else if (type_swing == 0){
    var t;
   
    for (t = 0; t<data.length; t++){
     var marker = []
     if (t == data.length-1){
       data[t].map(function(d){
         marker.push({x: xScale(d.x), y: yScale(d.y), z: zScale(d.z), id: 'point_' + cnt++});
       })
       swing.push(marker)
     }
     else{
       marker.push({x: xScale(data[t].x), y: yScale(data[t].y), z: zScale(data[t].z), id: 'point_0'});
       swing.push(marker)
     }
    }
  }
  
  // create 20x20 grid
    var cnt = 0;
    xGrid = [], scatter = [], yLine = [];
    for(var z = -j; z < j; z++){
        for(var x = -j; x < j; x++){
            xGrid.push([x, 1, z]);
        }
    }

    //y axis line
    d3.range(-1, j+1, 1).forEach(function(d){ yLine.push([-j, -d, -j]); });

    // format data to be plotted in processData function
    var data_all = [];

    swing.forEach(function(d){
      var data = [
        grid3d(xGrid),
        point3d(d),
        yScale3d([yLine])
      ];
      data_all.push(data);
    })

    

    //ready to be plotted
    processData(data_all, 1000);

}


///////////////////////////////////////////////////////////////////////////////////////
//MAIN
d3.csv("static/js/swing_test.csv").then(function(data, key) {

  //start screen to show all data
  default_start = init_range(data, 0, 0)
  init(default_start, 1)


  //SIMPLE SLIDER BAR///////////////////////////////
  //generate slider bar values
  const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
  //var data2 = range(0,data.length,1);
  var data2 = range(0,data.length,1);

  var sliderStep = d3
      .sliderBottom()
      .min(d3.min(data2))
      .max(d3.max(data2))
      .width(800)
      .ticks(5)
      .step(1)
      .default(0)
      .fill('#2196f3');

  var gSimple = d3
      .select('#slider')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(30,30)')
      .call(sliderStep);
    
 
  //slider to change markers shown
  sliderStep
      .on('onchange', val => {
          d3.csv("static/js/swing_test.csv").then(function(data, key) {

              //refresh data points/lines
              d3.selectAll("path").attr('id','lines').remove();
              d3.selectAll("circle").remove();
              

              please = init_data_single(data, val)
              
              init(please, 0);
          });
      });


  //RANGE SLIDER BAR////////////////////////////////
var sliderRange = d3
  .sliderBottom()
  .min(d3.min(data2))
  .max(d3.max(data2))
  .width(800)
  .ticks(5)
  .default([1, 5])
  .step(1)
  .fill('#2196f3')

var gRange = d3
  .select('#range')
  .append('svg')
  .attr('width', 1000)
  .attr('height', 100)
  .append('g')
  .attr('transform', 'translate(30,30)')
  .call(sliderRange);

sliderRange
  .on('onchange', val => {
    d3.csv("static/js/swing_test.csv").then(function(data, key) {

      //refresh data points/lines
      d3.selectAll("path").attr('id','lines').remove();
      d3.selectAll("circle").remove();
      
      //console.log(val[1])
      please = init_range(data, val, 1)
      
      init(please, 1);
  });
  });


});

//function to prepare data for init
function init_data_single(data, slice_val){

  var columns = data.columns;

  //please_work = data.slice(slice_val)
  marker = data[slice_val]
  
  var center_face = {"x": +marker.xCenterFace, "y": +marker.yCenterFace, "z": +marker.zCenterFace};
  var grip = {"x": +marker.xGripTop, "y": +marker.yGripTop, "z": +marker.zGripTop};
  var hosel_center = {"x": +marker.xHoselCenter, "y": +marker.yHoselCenter, "z": +marker.zHoselCenter};
  var Lframe_face = {"x": +marker.xLFrameFace, "y": +marker.yLFrameFace, "z": +marker.zLFrameFace};
  var Lframe_loft = {"x": +marker.xLFrameLoft, "y": +marker.yLFrameLoft, "z": +marker.zLFrameLoft};
  
  var center_face_original = [];
  data.map(function(d){
    center_face_original.push({
      "x" : +d.xHoselCenter,
      "y": +d.yHoselCenter,
      "z": +d.zHoselCenter,
      })
  })

  var all_markers = [center_face, grip, hosel_center, Lframe_face, Lframe_loft, center_face_original]

  return(all_markers)
}

//function to prepare data for init
function init_range(data, slice_val, slider_val){

  var columns = data.columns;

  //default slice: use all and don't slice
  if (slider_val == 0){
  please_work = data}
  //range slider slice
  else if(slider_val == 1){
  please_work = data.slice(slice_val[0], slice_val[1])
  }
  
  var center_face_original = []
  var center_face = []
  var grip = []
  var Lframe_face = []
  var Lframe_loft = []
  var hosel_center = []

  data.map(function(d){
    center_face_original.push({
      "x" : +d.xHoselCenter,
      "y": +d.yHoselCenter,
      "z": +d.zHoselCenter,
      })
  })

  please_work.map(function(d){
    center_face.push({
      "x" : +d.xCenterFace,
      "y": +d.yCenterFace,
      "z": +d.zCenterFace,
      })
    grip.push({
      "x": +d.xGripTop,
      "y": +d.yGripTop,
      "z": +d.zGripTop
    })
    hosel_center.push({
      "x": +d.xHoselCenter,
      "y": +d.yHoselCenter,
      "z": +d.zHoselCenter
    })
    Lframe_face.push({
      "x": +d.xLFrameFace,
      "y": +d.yLFrameFace,
      "z": +d.zLFrameFace
    })
    Lframe_loft.push({
      "x": +d.xLFrameLoft,
      "y": +d.yLFrameLoft,
      "z": +d.zLFrameLoft
    })
    })

  var all_markers = [center_face, grip, hosel_center, Lframe_face, Lframe_loft, center_face_original]

  return(all_markers)
}


///////////////////////////////////////////////////////////////////////////////////////
//drag functions
function dragStart(){
  mx = d3.event.x;
  my = d3.event.y;
}

function dragged(){
    d3.selectAll("circle").remove();
    d3.selectAll("path").attr('id','lines').remove();
    
    mouseX = mouseX || 0;
    mouseY = mouseY || 0;
    beta   = (d3.event.x - mx + mouseX) * Math.PI / 230 ;
    alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1);

    var data_drag = []
    swing.forEach(function(d){
      data_drag.push([
        grid3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(xGrid),
        point3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(d),
        yScale3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)([yLine]),
      ])  
    })
    processData(data_drag, 0);
    
}

function dragEnd(){
    mouseX = d3.event.x - mx + mouseX;
    mouseY = d3.event.y - my + mouseY;
}