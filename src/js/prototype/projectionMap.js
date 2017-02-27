var App = App || {};
App.views = App.views || {};

App.views.projectionMap = (function() {
  let targetElement = null;
  let svg = null;

  let size = null;

  let fullData = null;
  let currentTimestep = 0;
  let xProjection = 0;
  let yProjection = 1;

  function setupView(targetID) {
    targetElement = d3.select("#" + targetID);

    calculateNewComponentSize();

    // create SVG for the view
    svg = targetElement.append("svg")
      .attr("id", targetID + "_svg")
      .attr("width", size.width)
      .attr("height", size.height)
      .attr("viewBox", "0 0 " + size.width + " " + size.height)
      .style("background", "#AAA");

    // resize();
    draw();
  }

  function draw() {
    if (!fullData) return;

    // let currentProb = fullData[0][currentTimestep];

    // extract projection->run->peak data for only the current timestep
    let currentPeaks = fullData[1].map(proj => proj.map(run => run[currentTimestep]));

    console.log("Timestep:", currentTimestep, "Peak Data:", currentPeaks);
  }

  function setData(data) {
    // data[0]: probVal, data[1]: peakInfo
    // Pa: data[1][0][0~5], Pb: data[1][1][0~5], Pc: data[1][2][0~5]

    fullData = data;
  }

  function setTimestep(timestep) {
    currentTimestep = timestep;

    draw();
  }

  function resize() {
    calculateNewComponentSize();

    // update svg size
    svg
      .attr("width", size.width)
      .attr("height", size.height);
  }

  function calculateNewComponentSize() {
    size = {
      width: targetElement.node().clientWidth,
      height: targetElement.node().clientWidth * 1.4
    };
  }

  function getSize() {
    return size;
  }

  // return public methods
  return {
    // public methods
    create: setupView,
    draw: draw,
    resize: resize,
    // getter / setter
    setData: setData,
    setTimestep: setTimestep,
    getSize: getSize,
  };

})();
