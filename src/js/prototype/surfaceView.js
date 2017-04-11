var App = App || {};
App.views = App.views || {};

App.views.surface = (function() {
  let targetElement = null;
  let svg = null;
  let size = null;

  let id = null;
  let data4plotly = null;

  let currentTime = 0;

  function setupView(targetID) {
      targetElement = d3.select("#" + targetID);
      id = targetID;

      calculateNewComponentSize();

      // svg = targetElement.append("svg")
      //     .attr("id", targetID + "_svg")
      //     .attr("width", size.width)
      //     .attr("height", size.height)
      //     .attr("viewBox", " 0 0 " + size.width + " " + size.height)
      //     .style("background", "#EEE");
  }

  function draw() {
    let layout = {
      title: 'surface view',
      autosize: false,
      width: size.width * 0.9,
      height: size.height * 0.9
    };

    // console.log(data4plotly);

    Plotly.newPlot(id, [data4plotly], layout);
  }

  function setData(data) {
    let index = (FILE_NUM / 2 - 1) + App.currentProjection.y + App.currentProjection.x;
    let newData = data[0][index][1];

    let xSize = App.data.stateSpaceSize.oneD[App.currentProjection.x];  // col
    let ySize = App.data.stateSpaceSize.oneD[App.currentProjection.y];  // row

    let prob = [];
    for (let i = 0; i < ySize; i++) {
      let prob_row = [];
      for (let j = 0; j < xSize; j++) {
        prob_row.push(d3.values(newData[i * xSize + j])[currentTime + 2]);
      }
      prob.push(prob_row);
    }

    data4plotly = {z: prob, colorscale: [[0, '#f2e1d9'], [1, '#f95706']], type: 'surface'};
  }

  function setTimestep(timestep) {
    currentTime = timestep;
    draw();
  }

  function resize() {
      calculateNewComponentSize();

      svg
          .attr("width", size.width)
          .attr("hright", size.height);
  }

  function calculateNewComponentSize() {
      size = {
          width: targetElement.node().clientWidth,
          height: targetElement.node().clientWidth
      };
  }

  function getSize() {
    return size;
  }

  return {
    // publi methods
    create: setupView,
    draw: draw,
    resize: resize,
    // getter / setter
    getSize: getSize,
    setData: setData,
    setTimestep: setTimestep
  }
})();
