// peak trajectory on 2D projection map


function projectionMap(where, id, data, peak) {

  this.container = d3.select(where);
  this.data = data;  // [[{}], [], ... []], [], ... []
  this.peak = peak;  // peak[0]: vertical; peak[1]: honrizontal

  this.runNum = this.data.length;  // === this.peak[0].length
  this.theda = 180 / this.runNum;

  this.row = +d3.values(this.data[0][this.data[0].length-1])[0] + 1;
  this.col = +d3.values(this.data[0][this.data[0].length-1])[1] + 1;

  this.width = this.container.node().clientWidth;
  this.height = this.width * (this.row + 1) / (this.col + 1);

  this.svg = this.container.append("svg")
    .attr("id", id)
    .attr("width", this.width)
    .attr("height", this.height);

  this.cellSize = this.width / (this.col + 1);

  this.drawGrid();

  for (let i = 0; i < this.runNum; i++) {
    this.drawPeak(i, [this.peak[0][i], this.peak[1][i]]);
  }

}


projectionMap.prototype.drawGrid = function() {
  let _this = this;

  for (let i = 0; i < this.row; i++) {
    for (let j = 0; j < this.col; j++) {
      let cell = this.svg.append("rect")
        .attr("x", (j + 1) * this.cellSize)
        .attr("y", (this.row - i - 1) * this.cellSize)
        .attr("width", this.cellSize)
        .attr("height", this.cellSize)
        .style("stroke", "darkgray")
        .style("stroke-width", 1)
        .style("fill", "lightgray")
        .on("mouseover", function() {
          _this.hightlight(this);
        })
        .on("click", function() {
          _this.selection(this);
        });
    }
  }

}


projectionMap.prototype.hightlight = function(evt) {
  let selectX = (evt.x.baseVal.value - this.cellSize) / this.cellSize;
  let selectY = this.row - 1 - evt.y.baseVal.value / this.cellSize;

  d3.select("#hightlight").remove();

  let hightlightCell = this.svg.append("rect")
    .attr("id", "hightlight")
    .attr("x", (selectX + 1) * this.cellSize)
    .attr("y", (this.row - 1 - selectY) * this.cellSize)
    .attr("width", this.cellSize)
    .attr("height", this.cellSize)
    .style("stroke", "black")
    .style("stroke-width", 2)
    .style("fill", "none");
}


projectionMap.prototype.selection = function(evt) {
  let selectX = (evt.x.baseVal.value - this.cellSize) / this.cellSize;
  let selectY = this.row - 1 - evt.y.baseVal.value / this.cellSize;

  d3.select("#hightlight").remove();
  d3.select("#select").remove();

  let selectCell = this.svg.append("rect")
    .attr("id", "select")
    .attr("x", (selectX + 1) * this.cellSize)
    .attr("y", (this.row - 1 - selectY) * this.cellSize)
    .attr("width", this.cellSize)
    .attr("height", this.cellSize)
    .style("stroke", "darkred")
    .style("stroke-width", 2)
    .style("fill", "none");
}


// draw peak trajectory
projectionMap.prototype.drawPeak = function(id, peak) {
  let group = this.svg.append("g").attr("id", "run" + id);

  for (let t = 0; t < TIME_STEP; t++) {
    let pos = [];
    let peakNum_X = peak[1][t].length;
    let peakNum_Y = peak[0][t].length;
    let color = d3.hsl(runHSL[id][0], 0.3 + (runHSL[id][1] - 0.3) * t / (TIME_STEP - 1),
                       0.7 - (0.7 - runHSL[id][2]) * t / (TIME_STEP - 1));

    for (let i = 0; i < peakNum_Y; i++) {
      for (let j = 0; j < peakNum_X; j++) {
        let x = (peak[1][t][j].index + 1) * this.cellSize;
        let y = (this.row - 1 - peak[0][t][i].index) * this.cellSize;

        pos.push({xPos: x, yPos: y});
      }
    }

    this.drawPeakGlyph(id, pos, color);
  }

}


projectionMap.prototype.drawPeakGlyph = function(id, pos, color) {
  let group = this.svg.append("g").attr("class", "peakGlyph").attr("id", "run" + id);

  let peakGlyph = group.append("g").selectAll("ellipse")
    .data(pos)
    .enter()
    .append("ellipse")
    .attr("transform", (d) => {
      return "translate(" + (d.xPos + this.cellSize/2) + "," + (d.yPos + this.cellSize/2) + ") rotate(" + (this.theda * id) + ")";
    })
    .attr("rx", this.cellSize / 4)
    .attr("ry", this.cellSize / 1.5)
    .style("stroke", color)
    .style("stroke-width", 3)
    .style("fill", "none");

  // d3.selectAll(".peakGlyph").style("display", "initial");
}
