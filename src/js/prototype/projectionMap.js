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

  let updateCallback = null;


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
      .range([gridSize/3, 2*gridSize/3]);

    let colorScale = d3.scaleOrdinal()
      .domain(d3.range(0,6))
      .range(['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f']);

    let xStart = d3.max([Math.ceil(gridDimensions.width[0]), 0]),
      xEnd = d3.min([Math.floor(gridDimensions.width[1]), stateSpaceSize.x]);

    let yStart = d3.max([Math.ceil(gridDimensions.height[0]), 0]),
      yEnd = d3.min([Math.floor(gridDimensions.height[1]), stateSpaceSize.y]);

    if (!grid) {
      grid = svg.append("g")
        .attr("class", targetElement + "_grid");

      // horizontal lines
      for (let y = yStart; y <= yEnd; y++) {
        for (let x = xStart; x <= xEnd; x++) {
        grid.append("rect")
          .datum({x: x, y: y})
          .attr("class", "gridSpace")
          .attr("x", xScale(x))
          .attr("y", yScale(y))
          .attr("width", gridSize)
          .attr("height", gridSize)
          .style("stroke", "#AAA")
          .style("fill", "#DDD")
          .on("click", function(d, i) {
            console.log("Click on Grid Space:", d);
            updateCallback([d.x, d.y]);
          });
        }
      }
      grid.append("rect")
        .attr("class", "stateSpaceBoundary")
        .attr("width", (stateSpaceSize.x + 1) * gridSize)
        .attr("height", (stateSpaceSize.y + 1) * gridSize)
        .attr("x", xScale(0))
        .attr("y", yScale(stateSpaceSize.y))
        .style("fill-opacity", 0)
        .style("stroke", "#888")
        .style("stroke-width", 3)
        .style("pointer-events", "none");

    }

    if (!peaks) {
      peaks = svg.append("g")
        .attr("class", targetElement + "_peaks");
    }

    let peakUpdate = peaks.selectAll(".peak")
      .data(currentPeaks);

    peakUpdate.exit().remove();

    peaks.selectAll(".peak")
      .attr("transform", (d) => "translate(" + (xScale(d.coord.x) + gridSize/2) + "," + (yScale(d.coord.y) + gridSize/2) + ")")
      .each(function(d, i) {
        // remove old arcs
        d3.select(this).selectAll(".arc").remove();

        let numRuns = d.runs.length;

        let outerRadius = radiusScale(numRuns); // 3px padding
        let innerRadius = 0;

        // create background
        d3.select(this).select("circle")
          .attr("r", radiusScale(numRuns));

        // create new arcs
        let arc = d3.arc();
        let arcAngle = (2 * Math.PI) / numRuns;

        d3.select(this).selectAll(".arc")
          .data(d.runs).enter()
        .append("path")
          .attr("class", "arc")
          .attr("d", function(d, i) {
            return arc({
              innerRadius: innerRadius,
              outerRadius: outerRadius,
              startAngle: i * arcAngle,
              endAngle: (i+1) * arcAngle
            });
          })
          .style("fill", colorScale)
          .style("stroke", "#444")
          .style("pointer-events", "none");
      });

    peakUpdate.enter().append("g")
      .attr("class", "peak")
      .attr("transform", (d) => "translate(" + (xScale(d.coord.x) + gridSize/2) + "," + (yScale(d.coord.y) + gridSize/2) + ")")
      .each(function(d, i) {
        // remove old arcs
        // d3.select(this).selectAll(".arc").remove();

        let numRuns = d.runs.length;

        let outerRadius = radiusScale(numRuns); // 3px padding
        let innerRadius = 0;

        // create background
        d3.select(this).append("circle")
          .attr("r", radiusScale(numRuns))
          .style("fill", "#BBB")
          .style("stroke", "#888")
          .on("click", function(d, i) {
            console.log("Click on Pie:", d);
            updateCallback([d.coord.x, d.coord.y]);
          });

        // create new arcs
        let arc = d3.arc();
        let arcAngle = (2 * Math.PI) / numRuns;

        d3.select(this).selectAll(".arc")
          .data(d.runs).enter()
        .append("path")
          .attr("class", "arc")
          .attr("d", function(d, i) {
            return arc({
              innerRadius: innerRadius,
              outerRadius: outerRadius,
              startAngle: i * arcAngle,
              endAngle: (i+1) * arcAngle
            });
          })
          .style("fill", colorScale)
          .style("stroke", "#444")
          .style("pointer-events", "none");
      });

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

  function stateUpdateCallback(callback) {
    updateCallback = callback;
  }

  // return public methods
  return {
    // public methods
    create: setupView,
    draw: draw,
    resize: resize,
    stateUpdateCallback: stateUpdateCallback,
    // getter / setter
    setData: setData,
    setTimestep: setTimestep,
    getSize: getSize,
  };

})();
