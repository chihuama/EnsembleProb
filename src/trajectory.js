// draw peak trajectory on 2D map
// #1b9e77, #d95f02, #7570b3, #e7298a, #66a61e, #e6ab02


function projection2DMap(where, ylabel, xlabel, shift, row, col, data, dataPeak) {
  d3.select(where).selectAll("*").remove();
  // d3.select(where).selectAll("#trajectory").remove();

  var that = this;

  // this.row = row;
  // this.col = col;
  this.row = PaMax;
  this.col = PbMax;
  this.cellSize = 80;

  this.w = this.col * this.cellSize + this.cellSize;
  this.h = this.row * this.cellSize + this.cellSize;

  this.selectedX;
  this.selectedY;

  this.rowData = [];
  this.colData = [];
  this.probData = [];

  for (var i=0; i<data.length; i++) {
    this.probData.push(data[i]);
    this.rowData.push(dataPeak[i][0]);
    this.colData.push(dataPeak[i][1]);
  }


  var svg = d3.select(where).append("svg")
    .attr("preserveAspectRatio", "none")
    .attr("viewBox", "0 0 " + this.w + " " + this.h);
    // .style("background-color", "pink");

  // 2D grid map
  for (var i=0; i<this.row; i++) {
    for (var j=0; j<this.col; j++) {
      var cell = svg.append("rect")
        .attr("x", this.cellSize + j * this.cellSize)
        .attr("y", (this.row - i - 1) * this.cellSize)
        .attr("width", this.cellSize)
        .attr("height", this.cellSize)
        .attr("stroke", "darkgray")
        .attr("stroke-width", 1)
        .attr("fill", "lightgray")
        .on("mouseover", function() {
          that.selectedX = (this.x.baseVal.value - that.cellSize) / that.cellSize;
          that.selectedY = that.row - 1 - this.y.baseVal.value / that.cellSize + shift;

          d3.selectAll("#hightlight").remove();

          var hightlight = svg.append("rect")
            .attr("id", "hightlight")
            .attr("x", that.cellSize + that.selectedX * that.cellSize)
            .attr("y", (that.row - that.selectedY - 1 + shift) * that.cellSize)
            .attr("width", that.cellSize)
            .attr("height", that.cellSize)
            .style("stroke", "black")
            .style("stroke-width", 5)
            .style("fill", "none");
        })
        .on("click", function() {
          that.selectedX = (this.x.baseVal.value - that.cellSize) / that.cellSize;
          that.selectedY = that.row - 1 - this.y.baseVal.value / that.cellSize + shift;
          console.log([that.selectedX, that.selectedY]);
          timeCurvesDetail(".detailDiv", ylabel, xlabel, row, col, data, [that.selectedX, that.selectedY]);

          d3.selectAll("#hightlight").remove();
          d3.selectAll("#select").remove();
          // console.log((that.row - that.selectedY - 1) * that.cellSize - shift);
          var select = svg.append("rect")
            .attr("id", "select")
            .attr("x", that.cellSize + that.selectedX * that.cellSize)
            .attr("y", (that.row - that.selectedY - 1 + shift) * that.cellSize)
            .attr("width", that.cellSize)
            .attr("height", that.cellSize)
            .style("stroke", "darkred")
            .style("stroke-width", 5)
            .style("fill", "none");
        });
    }
  }

  /**************************************************/
  // x/y labels
  var xLabel = svg.append("text")
    .attr("x", this.w / 2)
    .attr("y", this.h)
    .style("fill", "black")
    .style("font-size", 60)
    .style("text-anchor", "middle")
    .text(xlabel);

  var xLabel = svg.append("text")
    .attr("x", this.cellSize + this.cellSize / 2)
    .attr("y", this.h - this.cellSize / 3)
    .style("fill", "black")
    .style("font-size", 60)
    .style("text-anchor", "middle")
    .text("0");

  var xLabel = svg.append("text")
    .attr("x", this.w - this.cellSize / 2)
    .attr("y", this.h - this.cellSize / 3)
    .style("fill", "black")
    .style("font-size", 60)
    .style("text-anchor", "middle")
    .text(this.col-1);


  var yLabel = svg.append("text")
    .attr("transform", "translate(" + this.cellSize / 2 + "," + (this.h - this.cellSize) / 2 + ") rotate(-90)")
    .style("fill", "black")
    .style("font-size", 60)
    .style("text-anchor", "middle")
    .text(ylabel);

  var yLabel = svg.append("text")
    .attr("x", this.cellSize * 2 / 3)
    .attr("y", this.h - this.cellSize * 4 / 3)
    .style("fill", "black")
    .style("font-size", 60)
    .style("text-anchor", "middle")
    .text(shift);

  var yLabel = svg.append("text")
    .attr("x", this.cellSize / 2)
    .attr("y", this.cellSize * 2 / 3)
    .style("fill", "black")
    .style("font-size", 60)
    .style("text-anchor", "middle")
    .text(this.row-1+shift);

  /**************************************************/
  // timevurves
  var gTimeCurve = svg.append("g").attr("class", "timeCurves");

  var max = [];
  for (var i=0;  i<data.length; i++) {
    max[i] = findMax(data[i], 2);
  }
  var maxPeak = Math.ceil(d3.max(max) * 100) / 100;
  console.log(maxPeak);


  var xScale = d3.scaleLinear()
    .domain([0, TimeSteps-1])
    .range([2, this.cellSize-2]);

  var yScale = d3.scaleLinear()
    .domain([0, maxPeak])
    .range([this.cellSize, 0]);

  var pathFunc = d3.line()
    .x(function(d, i) {return xScale(i)})
    .y(function(d, i) {return yScale(d)});


  for (var i=0; i<data.length; i++) {
    // var group = svg.append("g").attr("id", "run"+i);
    var group = gTimeCurve.append("g").attr("id", "run"+i);

    for (var j=0; j<data[i].length; j++) {

      // not draw timecurves outside of the div
      if (+d3.values(data[i][j])[0] >= shift && +d3.values(data[i][j])[0] < this.row + shift
          && +d3.values(data[i][j])[1] >= 0 && +d3.values(data[i][j])[1] < this.col) {

        var prob = [];
        for (var k=0; k<TimeSteps; k++) {
          prob.push(+d3.values(data[i][j])[k+2]);
        }

        // not draw timecurves if they are flat (50 and 5 are thresholds)
        if ( (Math.max(...prob) - Math.min(...prob)) > (maxPeak / 50) || Math.max(...prob) > (maxPeak / 5)) {
          //
          var x = +d3.values(data[i][j])[1] * this.cellSize + this.cellSize;
          var y = (this.row - 1 - (+d3.values(data[i][j])[0]) + shift) * this.cellSize;

          var path = group.append("path")
            .attr("transform", "translate(" + x + "," + y + ")")
            .attr("d", pathFunc(prob))
            .style("fill", "none")
            .style("stroke", runColor[i])
            .style("stroke-width", 4);
        }
      } // end - if
    }
  }

  /**************************************************/
  // peak trajectory
  var gTrajectory = svg.append("g").attr("class", "trajectory");

  for (var i=0; i<data.length; i++) {
    trajectory(gTrajectory, i, [row, col], data, ylabel, xlabel, shift, this.row, this.col, this.cellSize, this.rowData[i], this.colData[i], this.probData[i], 30 * i);
  }

  // trajectory2(gTrajectory, 3, [row, col], data, shift, this.row, this.col, this.cellSize, this.rowData[3], this.colData[3], this.probData[3], maxPeak, 90);

  /**************************************************/

  for (var i=0; i<data.length; i++) {
    if (d3.select("#"+runFolder[i]).property("checked")) {
      d3.selectAll("#run"+i).style("display", "initial");
    } else {
      d3.selectAll("#run"+i).style("display", "none");
    }
  }

  this.update = function(runID, checked) {
    for (var i=0; i<data.length; i++) {
      if (runID === runFolder[i]) {
        // console.log(runID);
        // console.log(d3.selectAll(".run"+i));
        if (checked) {
          // d3.selectAll(".run"+i).style("display", "initial");
          d3.selectAll("#run"+i).style("display", "initial");
        } else {
          // d3.selectAll(".run"+i).style("display", "none");
          d3.selectAll("#run"+i).style("display", "none");
        }
      }
    }
  } // update

}


function trajectory(where, runID, index, data, ylabel, xlabel, shift, row, col, cellSize, rowData, colData, probData, theda) {

  // var svg = d3.select(where);
  // var group = svg.append("g").attr("class", runID);

  var group = where.append("g").attr("id", "run"+runID);

  var selectedX;
  var selectedY;

  for (var t=0; t<TimeSteps; t++) {
    var n = rowData[t].length;
    var m = colData[t].length;
    var color = d3.hsl(runHSL[runID][0], 0.3 + (runHSL[runID][1] - 0.3) * t / (TimeSteps-1), 0.7 - (0.7 - runHSL[runID][2]) * t / (TimeSteps - 1));

    var pos = [];

    for (var i=0; i<n; i++) {
      for (var j=0; j<m; j++) {
        var x = cellSize + colData[t][j].index * cellSize;
        var y = (row - 1 - rowData[t][i].index + shift) * cellSize;

        pos.push({xPos: x, yPos: y});

        if (t>0) {
          var path = group.append("line")
            .attr("transform", "translate(" + cellSize/2 + "," + cellSize/2 + ")")
            .attr("x1", cellSize + colData[t-1][j].index * cellSize)
            .attr("y1", (row - 1 - rowData[t-1][i].index + shift) * cellSize)
            .attr("x2", cellSize + colData[t][j].index * cellSize)
            .attr("y2", (row - 1 - rowData[t][i].index + shift) * cellSize)
            .attr("stroke", color)
            .attr("stroke-width", 5);
            // .attr("opacity", 0.6);
        }
      }
    }

    var pCircle = group.append("g").selectAll("ellipse")
      .data(pos)
      .enter()
      .append("ellipse")
      // .attr("transform", "translate(" + ( x + cellSize/2) + "," + ( y + cellSize/2) + ") rotate(" + theda + ")")
      .attr("transform", (d) => {
        return "translate(" + ( d.xPos + cellSize/2) + "," + ( d.yPos + cellSize/2) + ") rotate(" + theda + ")";
      })
      // .attr("rx", (t+1) * cellSize / 10)
      // .attr("ry", (t+1) * cellSize / 5)
      // .attr("rx", (t+1) + cellSize / 8)
      // .attr("ry", (t+1) + cellSize / 2)
      .attr("rx", cellSize / 4)
      .attr("ry", cellSize / 1.5)
      .attr("stroke", color)
      .attr("stroke-width", 8)
      .attr("fill", "none")
      // .attr("fill", color)
      // .attr("fill-opacity", t * 0.3)
      .on("click", d => {
        selectedX = d.xPos / cellSize - 1;
        selectedY = row - 1 - d.yPos / cellSize + shift;
        // console.log([d.xPos / cellSize - 1, row - 1 - d.yPos / cellSize + shift]);
        // timeCurvesDetail(".detailDiv", index[0], index[1], data, [d.xPos / cellSize - 1, row - 1 - d.yPos / cellSize + shift]);
        console.log([selectedX, selectedY]);
        timeCurvesDetail(".detailDiv", ylabel, xlabel, index[0], index[1], data, [selectedX, selectedY]);

        d3.selectAll("#hightlight").remove();
        d3.selectAll("#select").remove();

        var select = group.append("rect")
          .attr("id", "select")
          .attr("x", cellSize + selectedX * cellSize)
          .attr("y", (row - 1 - selectedY + shift) * cellSize)
          .attr("width", cellSize)
          .attr("height", cellSize)
          .style("stroke", "darkred")
          .style("stroke-width", 5)
          .style("fill", "none");
      });

    var point = group.append("g").selectAll("circle")
      .data(pos)
      .enter()
      .append("circle")
      .attr("transform", (d) => {
        return "translate(" + ( d.xPos + cellSize/2) + "," + ( d.yPos + cellSize/2) + ")"
      })
      .attr("r", 8)
      .attr("fill", color)
      .attr("stroke", "none")
      .on("click", d => {
        selectedX = d.xPos / cellSize - 1;
        selectedY = row - 1 - d.yPos / cellSize + shift;

        console.log([selectedX, selectedY]);
        timeCurvesDetail(".detailDiv", ylabel, xlabel, index[0], index[1], data, [selectedX, selectedY]);

        d3.selectAll("#hightlight").remove();
        d3.selectAll("#select").remove();

        var select = group.append("rect")
          .attr("id", "select")
          .attr("x", cellSize + selectedX * cellSize)
          .attr("y", (row - 1 - selectedY + shift) * cellSize)
          .attr("width", cellSize)
          .attr("height", cellSize)
          .style("stroke", "darkred")
          .style("stroke-width", 5)
          .style("fill", "none");
      });

  }

}



function trajectory2(where, runID, index, data, shift, row, col, cellSize, rowData, colData, probData, probMax, theda) {

  var group = where.append("g").attr("id", "run"+runID);

  var peakTrajs = []; // [[{}, {}, ... {}], [], ... []]

  var rowPeakNum = 0;
  var colPeakNum = 0;

  for (var t=0; t<TimeSteps; t++) {
    if (rowPeakNum < rowData[t].length) {
      rowPeakNum = rowData[t].length;
    }
    if (colPeakNum < colData[t].length) {
      colPeakNum = colData[t].length;
    }
    // var n = rowData[t].length;
    // var m = colData[t].length;
    // for (var i=0; i<n; i++) {
    //   for (var j=0; j<m; j++) {
    //     var x = colData[t][j].index * cellSize;
    //     var y = (row - 1 - rowData[t][i].index) * cellSize;
    //
    //
    //   }
    // }
  }

  console.log(rowPeakNum);
  console.log(colPeakNum);

  // for (var i=0; i<rowPeakNum; i++) {
  //   for (var j=0; j<colPeakNum; j++) {
  //     //...
  //     var peakTraj = [];
  //     for (var t=0; t<TimeSteps; t++) {
  //       //...
  //       if ( (colData[t][j].index != colData[t+1][j].index) || (colData[t][j].index != colData[t+1][j].index) ) {
  //
  //       }
  //       var l = rowData[t][i].index * col + colData[t][j].index;
  //       peakTraj.push({index: [colData[t][j].index, rowData[t][i].index], value: +d3.values(probData[l])[t+2]});
  //     }
  //     peakTrajs.push(peakTraj);
  //   }
  // }

}



function timeCurvesDetail(where,ylabel, xlabel, row, col, data, index) {
  d3.select(where).selectAll("*").remove();

  var w = 700;
  var h = 700;
  var margin = {left: 100, right: 10, top: 100, bottom: 100}

  this.row = row;
  this.col = col;
  this.data = data;

  this.x = index[0];
  this.y = index[1];
  this.probData = [];

  // var maxPeak = 0;
  var line = this.y * this.col + this.x;

  for (var i=0; i<data.length; i++) {
    var lineData = [];

    for (var j=0; j<TimeSteps; j++) {
      lineData.push(+d3.values(data[i][line])[j+2]);
    }
    this.probData.push({run: i, prob: lineData, color: runColor[i]});
    // local peak
    // if (maxPeak < d3.max(lineData)) {
    //   maxPeak = d3.max(lineData);
    // }
  }

  // global peak
  var max = [];
  for (var i=0;  i<data.length; i++) {
    max[i] = findMax(data[i], 2);
  }
  var maxPeak = Math.ceil(d3.max(max) * 100) / 100;

  // console.log(maxPeak);
  console.log(this.probData);


  var svg = d3.select(where).append("svg").attr("id", "timeCurves")
    .attr("preserveAspectRatio", "none")
    .attr("viewBox", "0 0 " + (w + margin.left + margin.right) + " " + (h + margin.top + margin.bottom))
    // .style("background-color", "lightgray");


  var xScale = d3.scaleLinear()
    .domain([0, TimeSteps-1])
    .range([margin.left, w + margin.left]);

  var yScale = d3.scaleLinear()
    .domain([0, maxPeak])
    .range([h + margin.top - 10, margin.top]);

  var pathFunc = d3.line()
    .x(function(d, i) {return xScale(i)})
    .y(function(d, i) {return yScale(d)});

  var rect = svg.append("rect")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", w)
    .attr("height", h)
    .style("fill", "lightgray");

  var path = svg.selectAll("path")
    .data(this.probData)
    .enter()
    .append("path")
    .attr("class", "detail")
    .attr("id", (d) => {
      return "run"+d.run;
    })
    .attr("d", (d) => {
      return pathFunc(d.prob);
    })
    .style("fill", "none")
    .style("stroke", (d) => {
      return d.color;
    })
    .style("stroke-width", 4);


  // x/y labels
  var label = svg.append("text")
    .attr("x", margin.left + w/2)
    .attr("y", margin.top/2)
    .style("fill", "black")
    .style("font-size", 60)
    .style("text-anchor", "middle")
    .text(ylabel + ":" + index[1] + ", " + xlabel + ":" + index[0]);

  var label = svg.append("text")
    .attr("x", margin.left/2)
    .attr("y", margin.top + 40)
    .style("fill", "black")
    .style("font-size", 40)
    .style("text-anchor", "middle")
    .text(maxPeak);

  var label = svg.append("text")
    // .attr("transform", "translate(" + margin.left + "," + margin.top + h/2 + ") rotate(-90)")
    // .attr("transform", "translate(" + margin.left + "," + margin.top + h/2 + ")")
    .attr("x", margin.left/2)
    .attr("y", margin.top + h/2)
    .style("fill", "black")
    .style("font-size", 40)
    .style("text-anchor", "middle")
    .text("Prob");

  var label = svg.append("text")
    .attr("x", margin.left)
    .attr("y", margin.top + h + 40)
    .style("fill", "black")
    .style("font-size", 40)
    .style("text-anchor", "start")
    .text("0");

  var label = svg.append("text")
    .attr("x", margin.left + w)
    .attr("y", margin.top + h + 40)
    .style("fill", "black")
    .style("font-size", 40)
    .style("text-anchor", "end")
    .text(TimeSteps-1);

  var label = svg.append("text")
    .attr("x", margin.left + w/2)
    .attr("y", margin.top + h + 40)
    .style("fill", "black")
    .style("font-size", 40)
    .style("text-anchor", "middle")
    .text("Time");
}
