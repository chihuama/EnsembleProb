function getPeaks(data) {
  // console.log(data[0]);
  // console.log(d3.values(data[0]));
  // console.log(+d3.values(data[0])[1]);

  // array (time) of array (# of peaks) of objects (index & value)
  var peaksoverTime = [];

  // d3.values(data[i]) get the ith row: 0 ~ data.length
  // d3.values(data[i])[j] get the element at the jth column & the ith row (columns: Timesteps)
  // +d3.values(data[i])[j] convert string to number

  for (var j=0; j<TimeSteps; j++) {

    var peaks = [];

    if (+d3.values(data[0])[j+1] >= +d3.values(data[1])[j+1] && +d3.values(data[0])[j+1] > 1e-12) {
      peaks.push({index: 0, value: +d3.values(data[0])[j+1]});
    }

    for (var i=1; i<data.length-1; i++) {
      if ( +d3.values(data[i])[j+1] >= +d3.values(data[i-1])[j+1]
         && +d3.values(data[i])[j+1] >= +d3.values(data[i+1])[j+1]
         && +d3.values(data[i])[j+1] > 1e-12) {
           peaks.push({index: i, value: +d3.values(data[i])[j+1]});
         }
    }

    if (+d3.values(data[data.length-1])[j+1] >= +d3.values(data[data.length-2])[j+1] && +d3.values(data[data.length-1])[j+1] > 1e-12) {
      peaks.push({index: data.length-1, value: +d3.values(data[data.length-1])[j+1]});
    }

    peaksoverTime.push(peaks);
  }

  // console.log(peaks);
  return peaksoverTime;
}



function findMax(data, dimension) {

  var max = 0;

  for (var i=0; i<TimeSteps; i++) {
    for (var j=0; j<data.length; j++) {
      if ( +d3.values(data[j])[i+dimension] > max) {
        max = +d3.values(data[j])[i+dimension];
      }
    }
  }

  return max;
}
