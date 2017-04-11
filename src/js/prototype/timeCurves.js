var App = App || {};
App.views = App.views || {};

App.views.timeCurves = (function() {
  let targetElement = null;
  let svg = null;

  let size = null;
  let margin = null;

  let tcData = null;
  let maxProb = null;
  let currentState = [0, 0];
  let currentRow = null;
  let currentTime = 0;

  function setupView(targetID) {
    targetElement = d3.select("#" + targetID);

    calculateNewComponentSize();

    // create SVG for the view
    svg = targetElement.append("svg")
      .attr("id", targetID + "_svg")
      .attr("width", size.width)
      .attr("height", size.height)
      .attr("viewBox", "0 0 " + size.width + " " + size.height)
      .style("background", "#EEE");

    // resize();
    // draw();
  }

  function draw() {

    if (!tcData && !currentState) return;

    // let colors = ["#1b9e77", "#d95f02", "#6159C9", "#e7298a", "#66a61e", "#e6ab02"];
    let colors = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f'];

    let timeCurvesData = [];

    for (let i = 0; i < tcData.length; i++) {
      let probData = [];

      for (let t = 0; t < TIME_STEP; t++) {
        probData.push(+d3.values(tcData[i][currentRow])[t+2]);
      }

      timeCurvesData.push({run: i, prob: probData, color: colors[i]});
    }

    maxProb = getMax();

    let xScale = d3.scaleLinear()
      .domain([0, TIME_STEP-1])
      .range([margin.left, size.width-margin.right]);

    let yScale = d3.scaleLinear()
      .domain([0, maxProb])
      .range([size.height-margin.bottom, margin.top]);

    let pathFunc = d3.line()
      .x(function(d, i) {return xScale(i)})
      .y(function(d, i) {return yScale(d)});

    d3.selectAll(".selectedStateTimeCurves").remove();

    let timeCurves = svg.selectAll("path")
      .data(timeCurvesData)
      .enter()
      .append("path")
      .attr("class", "selectedStateTimeCurves")
      .attr("d", (d) => {
        return pathFunc(d.prob);
      })
      .style("fill", "none")
      .style("stroke", (d) => {
        return d.color;
      })
      .style("stroke-width", 2);

    drawTimeLine();
    drawTitle();
  }

  function setTimestep(timestep) {
    currentTime = timestep;

    drawTimeLine();
  }

  function drawTimeLine() {
    let xScale = d3.scaleLinear()
      .domain([0, TIME_STEP-1])
      .range([margin.left, size.width-margin.right]);

    d3.selectAll(".curTimeLine").remove();

    let curTimeLine = svg.append("line")
      .attr("class", "curTimeLine")
      .attr("x1", xScale(currentTime))
      .attr("y1", size.height-margin.bottom)
      .attr("x2", xScale(currentTime))
      .attr("y2", margin.top)
      .style("stroke", "#444")
      .style("stroke-width", 1);
  }

  function drawTitle() {
    d3.selectAll(".timeCurvesTitle").remove();
    
    let title = svg.append("text")
      .attr("class", "timeCurvesTitle")
      .attr("x", size.width/2)
      .attr("y", margin.top)
      .style("text-anchor", "middle")
      .text(protein[App.currentProjection.y] + ": " + currentState[1] + ", " + protein[App.currentProjection.x] + ": " + currentState[0]);
  }

  // get max probability value at the current state from all runs
  function getMax() {
    let max = [];

    for (let i = 0; i < tcData.length; i++) {
      max[i] = findMax(tcData[i], currentRow, 2);
    }
    // console.log(d3.max(max));
    // console.log(Math.ceil(d3.max(max) * 1000) / 1000);

    return (Math.ceil(d3.max(max) * 1000) / 1000);
  }

  // find max probability value at the current state in one run
  function findMax(data, row, dimension) {
    let max = 0;

    for (let t = 0; t < TIME_STEP; t++) {
      if ( +d3.values(data[row])[t+dimension] > max) {
        max = +d3.values(data[row])[t+dimension];
      }
    }

    return max;
  }

  function setState(state) {
    currentState = state;
    currentRow = currentState[1] * App.data.stateSpaceSize.oneD[App.currentProjection.x] + currentState[0];

    draw();
  }

  function setData(data) {
    let index = (FILE_NUM/2 - 1) + App.currentProjection.y + App.currentProjection.x;
    tcData = data[0][index];

    // initialize the state [x, y]
    // setState([10, 3]);
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
      height: targetElement.node().clientWidth * 0.925
    };

    margin = {
      left: targetElement.node().clientWidth * 0.03,
      right: targetElement.node().clientWidth * 0.02,
      top: targetElement.node().clientWidth * 0.05,
      bottom: targetElement.node().clientWidth * 0.03
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
    getSize: getSize,
    setState: setState,
    setTimestep: setTimestep,
  };

})();
