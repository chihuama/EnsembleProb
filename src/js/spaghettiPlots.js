// 1D ensemble spaghetti plots
// data is an array of data files

function spaghettiPlots(where, data) {

  this.container = d3.select(where);
  this.data = data;

  this.xMax = data[0].length;
  this.yMax;
  this.spaghettiData = [];

  this.width = this.container.node().clientWidth;
  this.height = this.container.node().parentNode.clientWidth * 0.1;

  this.svg = this.container.append("svg")
    .attr("width", this.width)
    .attr("height", this.height);

  this.getMax();
  this.convertData();
  this.drawPlots();

}


spaghettiPlots.prototype.getMax = function() {
  var maxArray = [];

  for (var i = 0;  i < this.data.length; i++) {
    maxArray[i] = findMax(this.data[i], 1);
  }

  this.yMax = Math.ceil(d3.max(maxArray) * 100) / 100;

}


spaghettiPlots.prototype.convertData = function() {
  for (var i = 0; i < this.data.length; i++) {
    for (var t = 0; t < TIME_STEP; t++) {
      let prob = [];

      for (var j = 0; j < this.data[i].length; j++) {
        prob.push(+d3.values(this.data[i][j])[t+1]);
      }

      let color = d3.hsl(runHSL[i][0], 0.25 + (runHSL[i][1] - 0.25) * t / (TIME_STEP - 1),
                         0.75 - (0.75 - runHSL[i][2]) * t / (TIME_STEP - 1));

      this.spaghettiData.push({run:i, time: j, probPath: prob, colorPath: color});
    }
  }

}


spaghettiPlots.prototype.drawPlots = function() {
  var xScale = d3.scaleLinear()
    .domain([0, this.xMax])
    .range([10, this.width - 30]);

  var yScale = d3.scaleLinear()
    .domain([0, this.yMax])
    .range([this.height - 10, 10]);

  var pathFunc = d3.line()
    .x(function(d, i) {return xScale(i)})
    .y(function(d, i) {return yScale(d)});

  var path = this.svg.selectAll("path")
    .data(this.spaghettiData)
    .enter()
    .append("path")
    .attr("id", (d) => {
      return "run" + d.run;
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

}


// find max value in one data file
function findMax(data, dimension) {

  let max = 0;

  for (let t = 0; t < TIME_STEP; t++) {
    for (let i = 0; i < data.length; i++) {
      if ( +d3.values(data[i])[t+dimension] > max) {
        max = +d3.values(data[i])[t+dimension];
      }
    }
  }

  return max;
}
