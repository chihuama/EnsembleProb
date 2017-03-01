var App = App || {};
App.views = App.views || {};

App.views.peakShapes = (function() {
  let targetElement = null;

  let size = null;

  let psData = null;
  let neighborsRowIndex = null; // 3x3
  let minVal = null;
  let maxVal = null;
  let currentState = null;
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
      .style("background", "#999");

    // resize();
    // draw();
  }

  function draw() {

    if (!psData && !currentState) return;

    drawGrid();
    drawShapes();
  }

  function drawGrid() {

    let grid = svg.append("g");

    for (let i = 0; i < psData.length; i++) {
      let x  = size.width * (i+1) / (psData.length+1);

      grid.append("line")
        .attr("x1", x)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", size.height)
        .style("stroke", "black")
        .style("stroke-width", 1);
    }

    for (let j = 1; j < 4; j++) {
      let y = size.height * j / 4;

      grid.append("line")
        .attr("x1", 0)
        .attr("y1", y)
        .attr("x2", size.width)
        .attr("y2", y)
        .style("stroke", "black")
        .style("stroke-width", 1);
    }
  }

  function drawShapes() {
    d3.selectAll(".selectedStatePeakShapes").remove();
    
    let colors = ["#1b9e77", "#d95f02", "#6159C9", "#e7298a", "#66a61e", "#e6ab02"];

    let margin = {
      left: (size.width / (psData.length + 1)) * 0.03,
      right: (size.width / (psData.length + 1)) * 0.03,
      top: (size.height / 4) * 0.03,
      bottom: (size.height / 4) * 0.02
    }

    for (let i = 0; i < psData.length; i++) {
      for (let j = 0; j < 4; j++) {
        let x1 = (size.width / (psData.length + 1)) * (i+1);
        let x2 = (size.width / (psData.length + 1)) * (i+2);
        let y1 = (size.height / 4) * j;
        let y2 = (size.height / 4) * (j+1);

        let xScale = d3.scaleLinear()
          .domain([0, 2])
          .range([x1-margin.left, x2-margin.right]);

        let yScale = d3.scaleLinear()
          .domain([minVal, maxVal])
          .range([y2-margin.bottom, y1+margin.top]);

        let pathFunc = d3.line()
          .x(function(d, i) { return xScale(i)})
          .y(function(d, i) { return yScale(d)});

        let probData = [];
        probData.push(+d3.values(psData[i][neighborsRowIndex[j]])[currentTime+2]);
        probData.push(+d3.values(psData[i][neighborsRowIndex[4]])[currentTime+2]);
        probData.push(+d3.values(psData[i][neighborsRowIndex[neighborsRowIndex.length - j - 1]])[currentTime+2]);

        let shapeData = [];
        shapeData.push({run: i, prob: probData, color: colors[i]});

        console.log(shapeData);

        // d3.selectAll(".selectedStatePeakShapes").remove();

        let peakShapes = svg.append("g").selectAll("path")
          .data(shapeData)
          .enter()
          .append("path")
          .attr("class", "selectedStatePeakShapes")
          .attr("d", (d) => {
            return pathFunc(d.prob);
          })
          .style("fill", "none")
          .style("stroke", (d) => {
            return d.color;
          })
          .style("stroke-width", 2);
      }
    }

  }

  function calMinMax() {
    let probValue = [];
    let min = [], max = [];

    for (let i = 0; i < psData.length; i++) {
      probValue[i] = [];
      for (let j = 0; j < neighborsRowIndex.length; j++) {
        probValue[i][j] = +d3.values(psData[i][neighborsRowIndex[j]])[currentTime+2];
      }
      min[i] = d3.min(probValue[i]);
      max[i] = d3.max(probValue[i]);
    }

    // minVal = d3.min(min);
    minVal = Math.floor(d3.min(min) * 1000) / 1000;
    maxVal = Math.ceil(d3.max(max) * 1000) / 1000;

    console.log("min: ", minVal);
    console.log("max: ", maxVal);
  }

  function setState(state) {
    currentState = state;

    let xSize = App.data.stateSpaceSize.oneD[App.currentProjection.x];
    currentRow = currentState[1] * xSize + currentState[0];

    /* 0 1 2
       3 4 5
       6 7 8 */
    neighborsRowIndex.push( (currentState[1]+1) * xSize + (currentState[0]-1) );  // 0: i-1, j+1
    neighborsRowIndex.push( (currentState[1]+1) * xSize + currentState[0] );  // 1: i, j+1
    neighborsRowIndex.push( (currentState[1]+1) * xSize + (currentState[0]+1) );  // 2: i+1, j+1
    neighborsRowIndex.push( currentState[1] * xSize + (currentState[0]-1) );  // 3: i-1, j
    neighborsRowIndex.push( currentState[1] * xSize + currentState[0] );  // 4: i, j
    neighborsRowIndex.push( currentState[1] * xSize + (currentState[0]+1) );  // 5: i+1, j
    neighborsRowIndex.push( (currentState[1]-1) * xSize + (currentState[0]-1) );  // 6: i-1, j-1
    neighborsRowIndex.push( (currentState[1]-1) * xSize + currentState[0] );  // 7: i, j-1
    neighborsRowIndex.push( (currentState[1]-1) * xSize + (currentState[0]+1) );  // 8: i+1, j-1

    console.log(neighborsRowIndex);

    calMinMax();
    // draw();
  }

  function setData(data) {
    let index = (FILE_NUM/2 - 1) + App.currentProjection.y + App.currentProjection.x;
    psData = data[0][index];

    neighborsRowIndex = [];

    // initialize the state [x, y]
    setState([10, 3]);
  }

  function setTimestep(timestep) {
    currentTime = timestep;

    calMinMax();
    drawShapes();
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
    setTimestep: setTimestep,
  };

})();
