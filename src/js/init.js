/*** public varaibles ***/
const RUN_NUM = 6;  // # of sumulation runs
const FILE_NUM = 6;  // # of files for each simulation
const TIME_STEP = 101;

var runFolder = ["TIME_4_-2_4", "TIME_4_-2_10", "TIME_4_3_4", "TIME_10_-2_4", "TIME_10_-2_10", "TIME_10_3_4"];
// var runFile = ["Pa_t0-20", "Pb_t0-20", "Pc_t0-20", "Pab_t0-20", "Pac_t0-20", "Pbc_t0-20"];
var runFile = ["Pa_t100", "Pb_t100", "Pc_t100", "Pab_t100", "Pac_t100", "Pbc_t100"];
var runHSL = [[162, 0.71, 0.36], [26, 0.98, 0.43], [244, 0.51, 0.57], [329, 0.8, 0.53], [88, 0.69, 0.38], [44, 0.98, 0.45]];


function init() {
  var q = d3.queue();

  for (let i = 0; i < RUN_NUM; i++) {
    for (let j = 0; j < FILE_NUM; j++) {
      q.defer(d3.csv, "./data/" + runFolder[i] + "/" + runFile[j] + ".csv");
    }
  }

  q.awaitAll(loadAllFiles);
}


function loadAllFiles(error, allData) {
  if (error) {
      console.log(error);
  }

  // [protein type][run]
  let peaks = [];
  let peaksData = [];
  let probData = [];

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

  drawSpaghettiPlots([probData[0], probData[1], probData[2]]);
  drawProjectionMap([probData[3], probData[4], probData[5]], peaksData);

}


function drawSpaghettiPlots(data) {
  let spaghettiA = new spaghettiPlots(".spaghettiA", data[0]);
  let spaghettiB = new spaghettiPlots(".spaghettiB", data[1]);
  let spaghettiC = new spaghettiPlots(".spaghettiC", data[2]);
}


function drawProjectionMap(data, peak) {
  let ppMapAB = new projectionMap(".probprojmapdiv", "projectAB", data[0], [peak[0], peak[1]]);
  let ppMapAC = new projectionMap(".probprojmapdiv", "projectAC", data[1], [peak[0], peak[2]]);
  let ppMapBC = new projectionMap(".probprojmapdiv", "projectBC", data[2], [peak[1], peak[2]]);
  d3.selectAll("#projectAC").style("display", "none");
  d3.selectAll("#projectBC").style("display", "none");
}
