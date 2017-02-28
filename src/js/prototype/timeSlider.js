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
    .attr("x", this.width * 0.4)
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

  let sliderHandel = this.svg.append("rect")
    .attr("x", this.width * 0.3)
    .attr("y", (this.height - this.handleHeight) * (1 - this.curTime / (TIME_STEP-1)))
    .attr("width", this.handleWidth)
    .attr("height", this.handleHeight)
    .style("fill", "darkgray")
    .call(drag);
}


timeSlider.prototype.dragHandle = function(obj) {
  let newY = d3.event.y;
  newY = newY < 0 ? 0 : newY;
  newY = newY > (this.height-this.handleHeight) ? this.height-this.handleHeight : newY;

  d3.select(obj).attr("y", newY);

  this.curTime = Math.round( (1 - newY / (this.height-this.handleHeight) ) * (TIME_STEP-1) );

  this.updateCallback(this.curTime);
}

timeSlider.prototype.releaseHandle = function(obj) {
  console.log(this.curTime);
}


timeSlider.prototype.drawLabel = function() {
  let labels = [];

  let yScale = d3.scaleLinear()
    .domain([0, TIME_STEP-1])
    .range([this.height, 0]);

  // let label = this.svg.selectAll("text")
  //   .data(labels)
  //   .enter()
  //   .append("text")
  //   .attr("x", )
  //   .attr("y", (d) => {
  //     return ;
  //   })
  //   .text((d) => {
  //     return d;
  //   })
  //   .style("font-size", "12px");
}


timeSlider.prototype.attachTimeUpdateCallback = function(callback) {
  this.updateCallback = callback;
};


timeSlider.prototype.onUpdate = function() {
  this.curTime = 0; // get time from slider position

  this.updateCallback(this.curTime);
};
