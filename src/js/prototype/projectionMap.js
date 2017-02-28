var App = App || {};
App.views = App.views || {};

App.views.projectionMap = (function() {
  let targetElement = null;
  let svg = null;

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
      .style("background", "#AAA");

    // resize();
    draw();
  }

  function draw() {
    if (!fullData) return;

    // let currentProb = fullData[0][currentTimestep];

    let currentPeaks = aggregatePeaksInTimestep();
    // draw grid
    let maxPeakBound = App.data.projectionDimensions.twoD[xProjection][yProjection];

    // calculate what the shown dimensions will be (since the apsect ratios may be different)
    let gridDimensions = calculateShownGridDimensions(maxPeakBound);

    console.log("Peaks:", currentPeaks, "Grid:", gridDimensions);


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
