// 1D ensemble spaghetti plots

function spaghettiPlots(where, type, ratio, data) {
  d3.select(where).selectAll("*").remove();

  var w = window.innerWidth * ratio;
  var h = window.innerHeight * 0.23;

  // var w = window.clientWidth * ratio;
  // var h = window.clientHeight * 0.22;

  var that = this;

  var svg = d3.select(where).append("svg")
    .attr("preserveAspectRatio", "none")
    .attr("viewBox", "0 0 " + w + " " + h);


  var max = [];
  for (var i=0;  i<data.length; i++) {
    max[i] = findMax(data[i], 1);
  }
  var maxPeak = Math.ceil(d3.max(max) * 100) / 100;

  // console.log(max);
  // console.log(d3.max(max));
  // console.log(maxPeak);

  // type
  var title = svg.append("text")
    .attr("x", 35 + (w - 35) / 2)
    .attr("y", 15)
    .style("fill", "black")
    .style("font-size", 18)
    .style("text-anchor", "middle")
    .text(type);

  // x/y-axis
  var xAxis = svg.append("line")
    .attr("x1", 30)
    .attr("y1", h - 14)
    .attr("x2", w)
    .attr("y2", h - 14)
    .style("stroke", "black")
    .style("stroke-width", 2);

  var yAxis = svg.append("line")
    .attr("x1", 34)
    .attr("y1", 5)
    .attr("x2", 34)
    .attr("y2", h - 14)
    .style("stroke", "black")
    .style("stroke-width", 2);

  // x/y labels
  var xLabel = svg.append("text")
    .attr("x", 30)
    .attr("y", h - 2)
    .style("fill", "black")
    .style("font-size", 12)
    .style("text-anchor", "middle")
    .text("0");

  var xLabel = svg.append("text")
    .attr("x", 30 + (w - 30) / 2)
    .attr("y", h - 2)
    .style("fill", "black")
    .style("font-size", 12)
    .style("text-anchor", "middle")
    .text((data[0].length-1) / 2);

  var xLabel = svg.append("text")
    .attr("x", w)
    .attr("y", h - 2)
    .style("fill", "black")
    .style("font-size", 12)
    .style("text-anchor", "end")
    .text(data[0].length-1);

  var yLabel = svg.append("text")
    .attr("x", 30)
    .attr("y", 10 + (h- 20) / 2)
    .style("fill", "black")
    .style("font-size", 12)
    .style("text-anchor", "end")
    .text(maxPeak / 2);

  var yLabel = svg.append("text")
    .attr("x", 30)
    .attr("y", 10)
    .style("fill", "black")
    .style("font-size", 12)
    .style("text-anchor", "end")
    .text(maxPeak);

  //
  var xScale = d3.scaleLinear()
    .domain([0, data[0].length])
    .range([35, w]);

  var yScale = d3.scaleLinear()
    .domain([0, maxPeak])
    .range([h - 15, 5]);

  var pathFunc = d3.line()
    .x(function(d, i) {return xScale(i)})
    .y(function(d, i) {return yScale(d)});

  /**************************************************/

  var spaghettiPath = [];

  for (var i=0; i<data.length; i++) {
    var group = svg.append("g").attr("id", "run"+i);

    for (var j=0; j<TimeSteps; j++) {
      var groupTime = group.append("g").attr("class", "time"+j);

      var prob = [];
      for (var k=0; k<data[i].length; k++) {
        prob.push(+d3.values(data[i][k])[j+1]);
      }

      var color = d3.hsl(runHSL[i][0], 0.25 + (runHSL[i][1] - 0.25) * j / (TimeSteps-1), 0.75 - (0.75 - runHSL[i][2]) * j / (TimeSteps - 1));

      spaghettiPath.push({run:i, time: j, probPath: prob, colorPath: color});

      // var path = groupTime.append("path")
      //   .attr("d", pathFunc(prob))
      //   .style("fill", "none")
      //   // .style("stroke", runColor[i])
      //   .style("stroke", color)
      //   .style("stroke-width", 1)
      //   .style("opacity", 0.6)
      //   .on("mouseover", function() {
      //     console.log(i);
      //   });

    }
  }

  //
  // console.log(spaghettiPath);
  var path = svg.selectAll("path")
    .data(spaghettiPath)
    .enter()
    .append("path")
    .attr("id", (d) => {
      return "run"+d.run;
    })
    .attr("d", (d) => {
      return pathFunc(d.probPath);
    })
    .style("fill", "none")
    .style("stroke", (d) => {
      return d.colorPath;
    })
    .style("stroke-width", 1)
    .style("opacity", 0.6)
    .on("mouseover", (d) => {
      console.log(d.run);
    });


  this.update = function(runID, checked) {
    for (var i=0; i<data.length; i++) {
      if (runID === runFolder[i]) {
        // console.log(runID);
        // console.log(d3.selectAll("#run"+i));
        if (checked) {
          d3.select(where).selectAll("#run"+i).style("display", "initial");
        } else {
          d3.select(where).selectAll("#run"+i).style("display", "none");
        }
      }
    }
  }

}
