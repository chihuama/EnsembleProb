//

function timeSlider(where, curTime) {
  this.container = d3.select(where);
  this.curTime = curTime;

  this.width = this.container.node().clientWidth;
  this.height = this.width * 6.8;

  this.updateCallback = null;

  this.svg = this.container.append("svg")
    .attr("width", this.width)
    .attr("height", this.height);

  this.handleWidth = this.width * 0.3;
  this.handleHeight = this.width * 0.1;

  this.drawSliderBar();
  this.drawSliderHandle();
  this.drawLabel();
}


timeSlider.prototype.drawSliderBar = function() {
  let sliderBar = this.svg.append("rect")
    .attr("x", this.width * 0.5)
    .attr("y", 0)
    .attr("width", this.width * 0.1)
    .attr("height", this.height)
    .style("fill", "lightgray");
};


timeSlider.prototype.drawSliderHandle = function() {
  let _this = this;

  let drag = d3.drag()
    .on("drag", function() {
      _this.dragHandle(this);
    })
    .on("end", function() {
      _this.releaseHandle(this);
    });

  d3.selectAll(".sliderHandel").remove();

  let handleY = (this.height - this.handleHeight) * (1 - this.curTime / (TIME_STEP-1));
  let sliderHandel = this.svg.append("rect")
    .attr("class", "sliderHandel")
    .attr("x", this.width * 0.4)
    .attr("y", handleY)
    .attr("width", this.handleWidth)
    .attr("height", this.handleHeight)
    .style("fill", "darkgray")
    .call(drag);

  this.curTimeLabel(handleY);
}


timeSlider.prototype.dragHandle = function(obj) {
  let newY = d3.event.y;
  newY = newY < 0 ? 0 : newY;
  newY = newY > (this.height-this.handleHeight) ? this.height-this.handleHeight : newY;

  d3.select(obj).attr("y", newY);

  let newTimestepSelection = Math.round( (1 - newY / (this.height-this.handleHeight) ) * (TIME_STEP-1) );

  if ( newTimestepSelection != this.curTime ) {
    this.curTime = newTimestepSelection;
    this.updateCallback(this.curTime);
  }

  this.curTimeLabel(newY);
}

timeSlider.prototype.releaseHandle = function(obj) {
  console.log(this.curTime);
}


timeSlider.prototype.curTimeLabel = function(pos) {
  d3.selectAll(".timeLabel").remove();

  let curTimeLabel = this.svg.append("text")
    .attr("class", "timeLabel")
    .attr("x", this.width * 0.75)
    .attr("y", pos + this.handleHeight)
    .text("" + this.curTime)
    .style("text-anchor", "start")
    .style("font-size", "12px");
}


timeSlider.prototype.drawLabel = function() {
  let labels = [-1, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  let yScale = d3.scaleLinear()
    .domain([0, TIME_STEP-1])
    .range([this.height, this.handleHeight]);

  let label = this.svg.selectAll("text")
    .data(labels)
    .enter()
    .append("text")
    .attr("x", this.width * 0.25)
    .attr("y", yScale)
    .text((d) => {
      return d;
    })
    .style("text-anchor", "end")
    .style("font-size", "12px");
}

timeSlider.prototype.resize = function() {
  this.width = this.container.node().clientWidth;
  this.height = this.width * 6.8;

  this.svg.attr("width", this.width)
    .attr("height", this.height)
}

timeSlider.prototype.attachTimeUpdateCallback = function(callback) {
  this.updateCallback = callback;
};

// timeSlider.prototype.onUpdate = function() {
//   this.curTime = 0; // get time from slider position
//
//   this.updateCallback(this.curTime);
// };

timeSlider.prototype.reset = function() {
  this.curTime = 0;
  this.drawSliderHandle();
}
