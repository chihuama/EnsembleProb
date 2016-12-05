var PaMax = 21;
var PbMax = 51;
var PcMax = 111;
var TimeSteps = 21;

var runFolder = ["TIME_4_-2_4", "TIME_4_-2_10", "TIME_4_3_4", "TIME_10_-2_4", "TIME_10_-2_10", "TIME_10_3_4"];
var runColor = ["#1b9e77", "#d95f02", "#6159C9", "#e7298a", "#66a61e", "#e6ab02"];
// 162° 71% 36%, 26° 98% 43%, 244° 31% 57% (#7570b3), 329° 80% 53%, 88° 69% 38%, 44° 98% 45%
var runHSL = [[162, 0.71, 0.36], [26, 0.98, 0.43], [244, 0.51, 0.57], [329, 0.8, 0.53], [88, 0.69, 0.38], [44, 0.98, 0.45]];

var dataPab, dataPac, dataPbc;
var dataPeakPab, dataPeakPac, dataPeakPbc;

var spaghettiPa, spaghettiPb, spaghettiPc;
var peakTrajectory;
var stateDetail;


function init() {
  // d3.csv("./data/Pa_t0-20.csv", function(error,data){
  //   console.log(data[0]);
  // });

  queue()
    // .defer(d3.csv, "./data/Pa_t0-20.csv")
    // .defer(d3.csv, "./data/Pb_t0-20.csv")
    // .defer(d3.csv, "./data/Pc_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[0] + "/Pa_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[0] + "/Pb_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[0] + "/Pc_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[0] + "/Pab_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[0] + "/Pac_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[0] + "/Pbc_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[1] + "/Pa_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[1] + "/Pb_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[1] + "/Pc_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[1] + "/Pab_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[1] + "/Pac_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[1] + "/Pbc_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[2] + "/Pa_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[2] + "/Pb_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[2] + "/Pc_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[2] + "/Pab_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[2] + "/Pac_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[2] + "/Pbc_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[3] + "/Pa_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[3] + "/Pb_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[3] + "/Pc_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[3] + "/Pab_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[3] + "/Pac_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[3] + "/Pbc_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[4] + "/Pa_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[4] + "/Pb_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[4] + "/Pc_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[4] + "/Pab_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[4] + "/Pac_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[4] + "/Pbc_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[5] + "/Pa_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[5] + "/Pb_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[5] + "/Pc_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[5] + "/Pab_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[5] + "/Pac_t0-20.csv")
    .defer(d3.csv, "./data/" + runFolder[5] + "/Pbc_t0-20.csv")
    .await(loadAllFiles);

}


function loadAllFiles(error, Pa, Pb, Pc, Pab, Pac, Pbc, Pa2, Pb2, Pc2, Pab2, Pac2, Pbc2,
                      Pa3, Pb3, Pc3, Pab3, Pac3, Pbc3, Pa4, Pb4, Pc4, Pab4, Pac4, Pbc4,
                      Pa5, Pb5, Pc5, Pab5, Pac5, Pbc5, Pa6, Pb6, Pc6, Pab6, Pac6, Pbc6) {
  if (error) {
      console.log(error);
  }

  var Pa_Peaks = getPeaks(Pa);
  var Pb_Peaks = getPeaks(Pb);
  var Pc_Peaks = getPeaks(Pc);
  // console.log(Pa_Peaks);
  // console.log(Pb_Peaks);
  // console.log(Pc_Peaks);

  var Pa2_Peaks = getPeaks(Pa2);
  var Pb2_Peaks = getPeaks(Pb2);
  var Pc2_Peaks = getPeaks(Pc2);

  var Pa3_Peaks = getPeaks(Pa3);
  var Pb3_Peaks = getPeaks(Pb3);
  var Pc3_Peaks = getPeaks(Pc3);

  var Pa4_Peaks = getPeaks(Pa4);
  var Pb4_Peaks = getPeaks(Pb4);
  var Pc4_Peaks = getPeaks(Pc4);

  var Pa5_Peaks = getPeaks(Pa5);
  var Pb5_Peaks = getPeaks(Pb5);
  var Pc5_Peaks = getPeaks(Pc5);

  var Pa6_Peaks = getPeaks(Pa6);
  var Pb6_Peaks = getPeaks(Pb6);
  var Pc6_Peaks = getPeaks(Pc6);

  dataPab = [Pab, Pab2, Pab3, Pab4, Pab5, Pab6];
  dataPac = [Pac, Pac2, Pac3, Pac4, Pac5, Pac6];
  dataPbc = [Pbc, Pbc2, Pbc3, Pbc4, Pbc5, Pbc6];

  dataPeakPab = [[Pa_Peaks, Pb_Peaks], [Pa2_Peaks, Pb2_Peaks], [Pa3_Peaks, Pb3_Peaks],
                 [Pa4_Peaks, Pb4_Peaks], [Pa5_Peaks, Pb5_Peaks], [Pa6_Peaks, Pb6_Peaks]];
  dataPeakPac = [[Pa_Peaks, Pc_Peaks], [Pa2_Peaks, Pc2_Peaks], [Pa3_Peaks, Pc3_Peaks],
                 [Pa4_Peaks, Pc4_Peaks], [Pa5_Peaks, Pc5_Peaks], [Pa6_Peaks, Pc6_Peaks]];
  dataPeakPbc = [[Pb_Peaks, Pc_Peaks], [Pb2_Peaks, Pc2_Peaks], [Pb3_Peaks, Pc3_Peaks],
                 [Pb4_Peaks, Pc4_Peaks], [Pb5_Peaks, Pc5_Peaks], [Pb6_Peaks, Pc6_Peaks]];

  // 2D projection to Pa and Pb
  // var rowsPab = Pa.length < Pb.length ? Pa.length : Pb.length;
  // var colsPab = Pa.length < Pb.length ? Pb.length : Pa.length;
  // trajectory(".trajectoryDiv", Pa_Peaks, Pb_Peaks, rowsPab, colsPab);
  //
  // // 2D projection to Pa and Pc
  // var rowsPac = Pa.length < Pc.length ? Pa.length : Pc.length;
  // var colsPac = Pa.length < Pc.length ? Pc.length : Pa.length;
  // // trajectory(".trajectoryDiv", Pa_Peaks, Pc_Peaks, rowsPac, colsPac);
  //
  // // 2D projection to Pb and Pc
  // var rowsPbc = Pb.length < Pc.length ? Pb.length : Pc.length;
  // var colsPbc = Pb.length < Pc.length ? Pc.length : Pb.length;
  // // trajectory(".trajectoryDiv", Pb_Peaks, Pc_Peaks, rowsPbc, colsPbc);

  spaghettiPa = new spaghettiPlots(".spaghettiA", "ProteinA", 0.11, [Pa, Pa2, Pa3, Pa4, Pa5, Pa6]);
  spaghettiPb = new spaghettiPlots(".spaghettiB", "ProteinB", 0.275, [Pb, Pb2, Pb3, Pb4, Pb5, Pb6]);
  spaghettiPc = new spaghettiPlots(".spaghettiC", "ProteinC", 0.605, [Pc, Pc2, Pc3, Pc4, Pc5, Pc6]);

  peakTrajectory = new projection2DMap(".projectMapDiv", "ProteinA", "ProteinB", 0, PaMax, PbMax, dataPab, dataPeakPab);
  d3.select(".timeCurves").style("display", "none");

  stateDetail = new timeCurvesDetail(".detailDiv", "ProteinA", "ProteinB", PaMax, PbMax, dataPab, [0, 0]);

}


function checkbox(id, value) {
  // console.log(id);
  // console.log(value);
  spaghettiPa.update(id, value);
  spaghettiPb.update(id, value);
  spaghettiPc.update(id, value);
  peakTrajectory.update(id, value);
}


function radioption(id, value) {
  // for (var i=0; i<3; i++) {
  //   d3.select("#option"+i).property("checked", false);
  //   if (id === "option"+i) {
  //     d3.select("#"+id).property("checked", true);
  //   }
  // }

  if (id === "option0") {
    if (value) {
      d3.selectAll(".trajectory").style("display", "initial");
    } else {
      d3.selectAll(".trajectory").style("display", "none");
    }
  } else if (id === "option1") {
    if (value) {
      d3.selectAll(".timeCurves").style("display", "initial");
    } else {
      d3.selectAll(".timeCurves").style("display", "none");
    }
  }

}


function proteinoption(id, value) {
  d3.select("#ProteinAB").property("checked", false);
  d3.select("#ProteinAC").property("checked", false);
  d3.select("#ProteinBC").property("checked", false);

  if (id === "ProteinAB") {
    d3.select("#ProteinAB").property("checked", true);
    peakTrajectory = new projection2DMap(".projectMapDiv", "ProteinA", "ProteinB", 0, PaMax, PbMax, dataPab, dataPeakPab);
    d3.select(".trajectory").style("display", "none");
    d3.select(".timeCurves").style("display", "none");

    stateDetail = new timeCurvesDetail(".detailDiv", "ProteinA", "ProteinB", PaMax, PbMax, dataPab, [0, 0]);

    if (d3.select("#option0").property("checked")) {
      d3.select(".trajectory").style("display", "initial");
    }
    if (d3.select("#option1").property("checked")) {
      console.log("time curves ab");
      d3.select(".timeCurves").style("display", "initial");
    }
  } else if (id === "ProteinAC") {
    d3.select("#ProteinAC").property("checked", true);
    peakTrajectory = new projection2DMap(".projectMapDiv", "ProteinA", "ProteinC", 0, PaMax, PcMax, dataPac, dataPeakPac);
    d3.select(".trajectory").style("display", "none");
    d3.select(".timeCurves").style("display", "none");

    stateDetail = new timeCurvesDetail(".detailDiv", "ProteinA", "ProteinC", PaMax, PcMax, dataPac, [0, 0]);

    if (d3.select("#option0").property("checked")) {
      d3.select(".trajectory").style("display", "initial");
    }
    if (d3.select("#option1").property("checked")) {
      console.log("time curves ac");
      d3.select(".timeCurves").style("display", "initial");
    }
  } else if (id === "ProteinBC") {
    d3.select("#ProteinBC").property("checked", true);
    peakTrajectory = new projection2DMap(".projectMapDiv", "ProteinB", "ProteinC", 10, PbMax, PcMax, dataPbc, dataPeakPbc);
    d3.select(".trajectory").style("display", "none");
    d3.select(".timeCurves").style("display", "none");

    stateDetail = new timeCurvesDetail(".detailDiv", "ProteinB", "ProteinC", PbMax, PcMax, dataPbc, [0, 10]);

    if (d3.select("#option0").property("checked")) {
      d3.select(".trajectory").style("display", "initial");
    }
    if (d3.select("#option1").property("checked")) {
      console.log("time curves bc");
      d3.select(".timeCurves").style("display", "initial");
    }
  }
}
