var App = App || {};

/*** public varaibles ***/
const RUN_NUM = 6;  // # of sumulation runs
const FILE_NUM = 6;  // # of files for each simulation
const TIME_STEP = 101;

var runFolder = ["TIME_4_-2_4", "TIME_4_-2_10", "TIME_4_3_4", "TIME_10_-2_4", "TIME_10_-2_10", "TIME_10_3_4"];
// var runFile = ["Pa_t0-20", "Pb_t0-20", "Pc_t0-20", "Pab_t0-20", "Pac_t0-20", "Pbc_t0-20"];
var runFile = ["Pa_t100", "Pb_t100", "Pc_t100", "Pab_t100", "Pac_t100", "Pbc_t100"];


(function() {
  console.log("In iife in main.js");

  App.views = App.views || {};

  App.init = function() {
    loadData();

    // create views
    App.views.trajectoryCube.create("trajectoryCube");
    App.views.projectionMap.create("projectionMap");
    App.views.timeCurves.create("timeCurves");
    App.views.peakShapes.create("peakShapes");

    // add event listener for resize
    window.addEventListener('resize', resizeViews);
  };

  function loadData() {
    App.data = {
      peaks: [],
      peaksData: [],
      probData: []
    };

    var dataLoadQueue = d3.queue();

    for (let i = 0; i < RUN_NUM; i++) {
      for (let j = 0; j < FILE_NUM; j++) {
        dataLoadQueue.defer(d3.csv, "./data/" + runFolder[i] + "/" + runFile[j] + ".csv");
      }
    }

    dataLoadQueue.awaitAll(loadAllFiles);
  }


  function loadAllFiles(error, allData) {
    if (error) {
        console.log(error);
    }

    // [protein type][run]
    let peaks = App.data.peaks;
    let peaksData = App.data.peaksData;
    let probData = App.data.probData;

    for (let i = 0; i < FILE_NUM; i++) {
      if (i < FILE_NUM/2) {
        peaks[i] = [];
        peaksData[i] = [];
      }
      probData[i] = [];

      for (let j = 0; j < RUN_NUM; j++) {
        if (i < FILE_NUM/2) {
          peaks[i][j] = new Peaks(allData[j*RUN_NUM + i]);
          peaksData[i][j] = peaks[i][j].getPeaks();
        }
        probData[i].push(allData[j*RUN_NUM + i]);
      }
    }

    console.log(peaksData[0]);

    updateViewsWithData([probData, peaksData]);
  }

  function updateViewsWithData(data) {
    let views = App.views;

    for (let view in views) {
      views[view].setData(data);
      views[view].draw();
    }

    setInterval(views.trajectoryCube.draw, 10);
  }

  function resizeViews() {
    let views = App.views;

    for (let view in views) {
      views[view].size = views[view].resize();
    }
  }

})();
