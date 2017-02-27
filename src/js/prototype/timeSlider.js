//

function timeSlider(where, curTime) {
  this.container = d3.select(where);
  this.curTime = curTime;

  this.width = this.container.node().parentNode.clientWidth;
  this.height = this.width * 0.05;

  this.updateCallback = null;

  this.svg = this.container.append("svg")
    .attr("width", this.width)
    .attr("height", this.height);

  this.drawSliderBar();
}


timeSlider.prototype.drawSliderBar = function() {
  let sliderBar = this.svg.append("rect")
    .attr("width", this.width)
    .attr("height", this.height/2)
    .style("fill", "lightgray");

};


timeSlider.prototype.attachTimeUpdateCallback = function(callback) {
  this.updateCallback = callback;
};


timeSlider.prototype.onUpdate = function() {
  this.curTime = 0; // get time from slider position

  this.updateCallback(this.curTime);
};
