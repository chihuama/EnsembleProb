var App = App || {};

/*** public varaibles ***/
const RUN_NUM = 6; // # of sumulation runs
const FILE_NUM = 6; // # of files for each simulation
const TIME_STEP = 101;

var runFolder = ["TIME_4_-2_4", "TIME_4_-2_10", "TIME_4_3_4", "TIME_10_-2_4", "TIME_10_-2_10", "TIME_10_3_4"];
// var runFile = ["Pa_t0-20", "Pb_t0-20", "Pc_t0-20", "Pab_t0-20", "Pac_t0-20", "Pbc_t0-20"];
var runFile = ["Pa_t100", "Pb_t100", "Pc_t100", "Pab_t100", "Pac_t100", "Pbc_t100"];
var protein = ["ProteinA", "ProteinB", "ProteinC"];


(function() {
    console.log("In iife in main.js");

    App.views = App.views || {};

    App.init = function() {
        loadData();

        App.currentProjection = {
            x: 2,
            y: 0
        };


        // create views
        App.views.trajectoryCube.create("trajectoryCube");
        App.views.projectionMap.create("projectionMap");
        App.views.timeCurves.create("timeCurves");
        App.views.peakShapes.create("peakShapes");
        App.views.stateGlyph.create("stateGlyph");
        // App.views.surface.create("surface");
        App.views.projectionMap.stateUpdateCallback(updateViewsWithStateSelection);

        // time slider
        App.timeSlider = new timeSlider("#timeSlider", 0);
        App.timeSlider.attachTimeUpdateCallback(updateViewsWithTimeSelection);

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
            if (i < FILE_NUM / 2) {
                peaks[i] = [];
                peaksData[i] = [];
            }
            probData[i] = [];

            for (let j = 0; j < RUN_NUM; j++) {
                if (i < FILE_NUM / 2) {
                    peaks[i][j] = new Peaks(allData[j * RUN_NUM + i]);
                    peaksData[i][j] = peaks[i][j].getPeaks();
                }
                probData[i].push(allData[j * RUN_NUM + i]);
            }
        }

        // console.log(peaksData[0]);

        // find min and max coordinates to draw for different projections
        let minsMaxs1d = new Array(3);
        let minsMaxs2d = new Array(3);

        // calculate 1d min/max
        for (let protein in peaksData) {
            let maxBoundary = probData[protein][0].length;
            let minBoundary = 0;

            minsMaxs1d[protein] = {
                min: d3.min(peaksData[protein], run => d3.min(run, timestep => d3.min(timestep, t => t.index))) - 3,
                max: d3.max(peaksData[protein], run => d3.max(run, timestep => d3.max(timestep, t => t.index))) + 3
            };

            if (minsMaxs1d[protein].min < minBoundary) {
                minsMaxs1d[protein].min = minBoundary;
            }

            if (minsMaxs1d[protein].max > maxBoundary) {
                minsMaxs1d[protein].max = maxBoundary;
            }
        }

        // project to 2d from 1d min/max
        for (let x = 0; x < 3; x++) {
            minsMaxs2d[x] = new Array(3);
            for (let y = 0; y < 3; y++) {
                minsMaxs2d[x][y] = {
                    x: minsMaxs1d[x],
                    y: minsMaxs1d[y]
                };
            }
        }

        App.data.projectionBounds = {
            oneD: minsMaxs1d,
            // [x][y]
            twoD: minsMaxs2d
        };

        console.log("Projection bounds:", App.data.projectionBounds);

        // get total state space size for all projections
        let stateSpaceSize1d = new Array(3);
        let stateSpaceSize2d = new Array(3);

        for (let protein in peaksData) {
            stateSpaceSize1d[protein] = probData[protein][0].length;
        }

        for (let x = 0; x < 3; x++) {
            stateSpaceSize2d[x] = new Array(3);
            for (let y = 0; y < 3; y++) {
                stateSpaceSize2d[x][y] = {
                    x: stateSpaceSize1d[x],
                    y: stateSpaceSize1d[y]
                };
            }
        }

        App.data.stateSpaceSize = {
            oneD: stateSpaceSize1d,
            // [x][y]
            twoD: stateSpaceSize2d
        };

        console.log("State space size:", App.data.stateSpaceSize);

        App.updateViewsWithData([probData, peaksData]);
    }


    // function updateViewsWithData(data) {
    App.updateViewsWithData = function (data) {

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
        App.timeSlider.resize();
    }


    function updateViewsWithTimeSelection(timestep) {
        // do something
        App.views.trajectoryCube.updateTimeSelector(timestep);
        App.views.projectionMap.setTimestep(timestep);
        App.views.timeCurves.setTimestep(timestep);
        App.views.peakShapes.setTimestep(timestep);
        App.views.stateGlyph.setTimestep(timestep);
    }

    function updateViewsWithStateSelection(state) {
        console.log("callback");
        App.views.timeCurves.setState(state);
        App.views.peakShapes.setState(state);
        App.views.stateGlyph.setState(state);
    }

})();


// /* toggle between hiding and showing the dropdown content */
// function selectProjection() {
//   document.getElementById("projectionDropdown").classList.toggle("show");
// }
//
// // close the dropdown menu if the user clicks outside of it
// window.onclick = function(event) {
//   if (!event.target.matches(".dropbtn")) {
//     let dropdowns = document.getElementsByClassName("dropdown-content");
//     for (let i = 0; i < dropdowns.length; i++) {
//       let openDropdown = dropdowns[i];
//       if (openDropdown.classList.contains('show')) {
//         openDropdown.classList.remove('show');
//       }
//     }
//   }
// }


function selectProjection(val) {

  if (val === "AB")  {
    App.currentProjection = {
        x: 1,
        y: 0
    };
  } else if (val === "AC") {
    App.currentProjection = {
        x: 2,
        y: 0
    };
  } else if (val === "BC") {
    App.currentProjection = {
        x: 2,
        y: 1
    };
  }

  console.log(App.currentProjection);

  App.timeSlider.reset();
  App.views.trajectoryCube.reset();
  App.views.projectionMap.reset();
  App.updateViewsWithData([App.data.probData, App.data.peaksData]);
}
