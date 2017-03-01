// get peaks on 1D projection

/* data format:
   [{protein_num: 0, time0: prob, ... time20: prob},
    {protein_num: 1, time0: prob, ... time20: prob},
    ...
    {protein_num: max, time0: prob, ... time20: prob}] */


function Peaks(data) {

  this.data = data;
  this.probThreshold = 1e-12;
  this.peaksOverTime = [];

  // this.getPeaks();
}


Peaks.prototype.getPeaks = function () {

  this.peaksOverTime = [];

  for (let t = 0; t < TIME_STEP; t++) {

    let peaksAtOneTime = [];

    // check the left boundary (the copy number of protein is 0)
    if (+d3.values(this.data[0])[t+1] >= +d3.values(this.data[1])[t+1] &&
        +d3.values(this.data[0])[t+1] > this.probThreshold) {
      peaksAtOneTime.push({index: 0, value: +d3.values(this.data[0])[t+1]});
    }

    let lastIndex = this.data.length-1;

    // compare the prob values with their left and right neighbours
    for (let i = 1; i < lastIndex; i++) {
      if (+d3.values(this.data[i])[t+1] >= +d3.values(this.data[i-1])[t+1] &&
          +d3.values(this.data[i])[t+1] >= +d3.values(this.data[i+1])[t+1] &&
          +d3.values(this.data[i])[t+1] > this.probThreshold) {
        peaksAtOneTime.push({index: i, value: +d3.values(this.data[i])[t+1]});
      }
    }

    // check the right boundary
    if (+d3.values(this.data[lastIndex])[t+1] >= +d3.values(this.data[lastIndex-1])[t+1] &&
        +d3.values(this.data[lastIndex])[t+1] > this.probThreshold) {
      peaksAtOneTime.push({index: lastIndex, value: +d3.values(this.data[lastIndex])[t+1]});
    }

    this.peaksOverTime.push(peaksAtOneTime);

  }

  return this.peaksOverTime;
}


Peaks.prototype.setThreshold = function(val) {
  this.probThreshold = val;
}
