var App = App || {};
App.views = App.views || {};

App.views.projectionMap = (function() {
  let targetElement = null;

  let svg = null;
  let grid = null;
  let peaks = null;

  let size = null;

  let fullData = null;
  let currentTimestep = 0;
  let xProjection = 1;
  let yProjection = 0;


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
    draw();
  }

  function draw() {
    // if this view does not yet have data
    if (!fullData) return;

    // let currentProb = fullData[0][currentTimestep];

    let currentPeaks = aggregatePeaksInTimestep();
    // draw grid
    let maxPeakBound = App.data.projectionBounds.twoD[xProjection][yProjection];
    let stateSpaceSize = App.data.stateSpaceSize.twoD[xProjection][yProjection];

    // calculate what the shown dimensions will be (since the apsect ratios may be different)
    let gridDimensions = calculateShownGridDimensions(maxPeakBound);
    let gridSize = size.width / (gridDimensions.width[1] - gridDimensions.width[0]);
    // draw grid

    let xScale = d3.scaleLinear()
      .domain(gridDimensions.width)
      .range([0, size.width]);

    let yScale = d3.scaleLinear()
      .domain(gridDimensions.height)
      .range([0, size.height].reverse());

    let radiusScale = d3.scaleLinear()
      .domain([1, 6])
      .range([gridSize/6, gridSize]);

    let colorScale = d3.scaleOrdinal()
      .domain(d3.range(1,6))
      .range(['#ffffb2','#fed976','#feb24c','#fd8d3c','#f03b20','#bd0026']);

    let xStart = d3.max([Math.ceil(gridDimensions.width[0]), 0]),
      xEnd = d3.min([Math.floor(gridDimensions.width[1]), stateSpaceSize.x]);

    let yStart = d3.max([Math.ceil(gridDimensions.height[0]), 0]),
      yEnd = d3.min([Math.floor(gridDimensions.height[1]), stateSpaceSize.y]);

    if (!grid) {
      grid = svg.append("g")
        .attr("class", targetElement + "_grid");

      // horizontal lines
      for (let y = yStart; y <= yEnd; y++) {
        grid.append("line")
          .attr("class", targetElement + "_horizLine")
          .attr("x1", xScale(xStart))
          .attr("x2", xScale(xEnd))
          .attr("y2", yScale(y))
          .attr("y1", yScale(y))
          .style("stroke", "#AAA");
      }

      for (let x = xStart; x <= xEnd; x++) {
        // vertical lines
        grid.append("line")
          .attr("class", targetElement + "_vertLine")
          .attr("x1", xScale(x))
          .attr("x2", xScale(x))
          .attr("y1", yScale(yStart))
          .attr("y2", yScale(yEnd))
          .style("stroke", "#AAA");
      }
    }

    if (!peaks) {
      peaks = svg.append("g")
        .attr("class", targetElement + "_peaks");
    }

    let peakUpdate = peaks.selectAll(".peak")
      .data(currentPeaks);

    peakUpdate.exit().remove();

    peaks.selectAll(".peak")
      .attr("cx", (d) => xScale(d.coord.x) + gridSize/2)
      .attr("cy", (d) => yScale(d.coord.y) + gridSize/2)
      .attr("r", (d) => radiusScale(d.runs.length))
      .style("fill", (d) => colorScale(d.runs.length));

    peakUpdate.enter().append("circle")
      .attr("class", "peak")
      .attr("cx", (d) => xScale(d.coord.x) + gridSize/2)
      .attr("cy", (d) => yScale(d.coord.y) + gridSize/2)
      .attr("r", (d) => radiusScale(d.runs.length))
      .style("fill", (d) => colorScale(d.runs.length))
      .style("stroke", "black");


  }

  function calculateShownGridDimensions(projectionBounds) {
    let svgAspect = size.width / size.height;
    let dataAspect = (projectionBounds.x.max - projectionBounds.x.min) / (projectionBounds.y.max - projectionBounds.y.min);

    let spacesShown = {};

    // data is wider than svg
    if (dataAspect >= svgAspect) {
      // expand height, width stays same
      spacesShown.width = [projectionBounds.x.min, projectionBounds.x.max];

      let numSpacesHigh = (projectionBounds.x.max - projectionBounds.x.min) / svgAspect;

      spacesShown.height = [
        (projectionBounds.y.max + projectionBounds.y.min - numSpacesHigh) / 2,
        (projectionBounds.y.max + projectionBounds.y.min + numSpacesHigh) / 2
      ];
    } else {
      // expand width, height stays same
      spacesShown.height = [projectionBounds.y.min, projectionBounds.y.max];

      let numSpacesWide = svgAspect * (projectionBounds.y.max - projectionBounds.y.min);

      spacesShown.width = [
        (projectionBounds.x.max + projectionBounds.x.min - numSpacesWide) / 2,
        (projectionBounds.x.max + projectionBounds.x.min + numSpacesWide) / 2
      ];
    }

    return spacesShown;
  }

  function aggregatePeaksInTimestep() {
    // extract projection->run->peak data for only the current timestep
    let currentPeaks = fullData[1].map(proj => proj.map(run => run[currentTimestep]));

    let xPeaks = currentPeaks[xProjection];
    let yPeaks = currentPeaks[yProjection];

    let peakPairDictionary = {};
    let peakPairs = [];

    for (let run = 0; run < RUN_NUM; run++) {
      for (let x of xPeaks[run]) {
        for (let y of yPeaks[run]) {
          let coordString = "x" + x.index + "y" + y.index;

          if (!peakPairDictionary[coordString]) {
            peakPairDictionary[coordString] = {
              coord: {
                x: x.index,
                y: y.index
              },
              runs: []
            };
          }

          // add this run to the run list for the peak at this coordinate
          peakPairDictionary[coordString].runs.push(run);
        }
      }
    }

    for (let loc of Object.keys(peakPairDictionary)) {
      peakPairs.push(peakPairDictionary[loc]);
    }

    return peakPairs;
  }

  function setData(data) {
    // data[0]: probVal, data[1]: peakInfo
    // Pa: data[1][0][0~5], Pb: data[1][1][0~5], Pc: data[1][2][0~5]

    fullData = data;

    xProjection = App.currentProjection && App.currentProjection.x != undefined ? App.currentProjection.x : 1;
    yProjection = App.currentProjection && App.currentProjection.y != undefined ? App.currentProjection.y : 0;
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
