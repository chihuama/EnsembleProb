// check boxes and radio buttons

function checkRun(id, val) {
  if (val) {
    d3.selectAll("#run" + id).style("display", "initial");
  } else {
    d3.selectAll("#run" + id).style("display", "none");
  }
}


function checkPeakTrajectory(val) {
  if (val) {
    d3.selectAll(".peakGlyph").style("display", "initial");
  } else {
    d3.selectAll(".peakGlyph").style("display", "none");
  }
}


function checkTimeCurves(val) {
  if (val) {
    d3.selectAll(".timeCurves").style("display", "initial");
  } else {
    d3.selectAll(".timeCurves").style("display", "none");
  }
}


function chooseProteins(id, val) {
  d3.selectAll("#projectAB").style("display", "none");
  d3.selectAll("#projectAC").style("display", "none");
  d3.selectAll("#projectBC").style("display", "none");

  if (val) {
    d3.selectAll("#project" + id).style("display", "initial");
  } else {
    d3.selectAll("#project" + id).style("display", "none");
  }
}
