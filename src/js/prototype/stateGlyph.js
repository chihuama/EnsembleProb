var App = App || {};
App.views = App.views || {};

App.views.stateGlyph = (function() {
    let targetElement = null;
    let svg = null;
    let size = null;

    let sgData = null;

    let currentState = [0, 0];
    let currentIndex = null;
    let neighborsIndex = null;
    let glyphVector = null;
    let minVal = null;
    let maxVal = null;

    let currentTime = 0;

    function setupView(targetID) {
        targetElement = d3.select("#" + targetID);

        calculateNewComponentSize();

        svg = targetElement.append("svg")
            .attr("id", targetID + "_svg")
            .attr("width", size.width)
            .attr("height", size.height)
            .attr("viewBox", " 0 0 " + size.width + " " + size.height)
            .style("background", "#EEE");
    }

    function draw() {

        if (!sgData && !currentState) return;

        d3.selectAll(".selectedStateGlyph").remove();

        let colors = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f'];

        let angle = Math.PI * 2 / 8;

        let margin = {
            left: (size.width / sgData.length) * 0.05,
            right: (size.width / sgData.length) * 0.05,
            top: size.height * 0.05,
            bottom: size.height * 0.05
        };

        let scale = d3.scaleLinear()
            .domain([minVal, maxVal])
            .range([(size.height * 0.9 / 2) * 0.1, size.height * 0.9 / 2]);

        for (let i = 0; i < sgData.length; i++) {

            let cx = (size.width / sgData.length) * i + (size.width / sgData.length) / 2;
            let cy = size.height / 2;

            for (let j = 0; j < 8; j++) {
                let vectorLength = scale(Math.abs(glyphVector[i][j]));
                let group;

                if (glyphVector[i][j] !== 0) {
                    let glyph = svg.append("line")
                        .attr("class", "selectedStateGlyph")
                        .attr("x1", cx)
                        .attr("y1", cy)
                        .attr("x2", cx + Math.sin(angle * j) * vectorLength)
                        .attr("y2", cy - Math.cos(angle * j) * vectorLength)
                        .style("stroke", colors[i])
                        .style("stroke-width", 2);

                    group = svg.append("g")
                        .attr("class", "selectedStateGlyph")
                        .attr("transform", "translate(" + (cx + Math.sin(angle * j) * vectorLength) + "," + (cy - Math.cos(angle * j) * vectorLength) + ") rotate(" + (angle * j * 180 / Math.PI) + ")");
                }

                if (glyphVector[i][j] > 0) { // outbound
                    let arrowLeft = group.append("line")
                        .attr("x1", 0)
                        .attr("y1", 0)
                        .attr("x2", -scale(minVal) / 2)
                        .attr("y2", scale(minVal))
                        .style("stroke", colors[i])
                        .style("stroke-width", 2);

                    let arrowRight = group.append("line")
                        .attr("x1", 0)
                        .attr("y1", 0)
                        .attr("x2", scale(minVal) / 2)
                        .attr("y2", scale(minVal))
                        .style("stroke", colors[i])
                        .style("stroke-width", 2);
                } else if (glyphVector[i][j] < 0) { // inbound
                    let arrowLeft = group.append("line")
                        .attr("x1", 0)
                        .attr("y1", 0)
                        .attr("x2", -scale(minVal) / 2)
                        .attr("y2", -scale(minVal))
                        .style("stroke", colors[i])
                        .style("stroke-width", 2);

                    let arrowRight = group.append("line")
                        .attr("x1", 0)
                        .attr("y1", 0)
                        .attr("x2", scale(minVal) / 2)
                        .attr("y2", -scale(minVal))
                        .style("stroke", colors[i])
                        .style("stroke-width", 2);
                }

            }
        }
    }

    function setData(data) {
        let index = (FILE_NUM / 2 - 1) + App.currentProjection.y + App.currentProjection.x;
        sgData = data[0][index];

        setState(currentState);
    }

    function setTimestep(timestep) {
        currentTime = timestep;

        calVector();
        draw();
    }

    function setState(state) {
        currentState = state;

        let xSize = App.data.stateSpaceSize.oneD[App.currentProjection.x];
        let ySize = App.data.stateSpaceSize.oneD[App.currentProjection.y];
        currentIndex = currentState[1] * xSize + currentState[0];

        neighborsIndex = [];

        for (let i = 0; i < 8; i++) {
          neighborsIndex[i] = -1;
        }

        neighborsIndex[0] = (currentState[1] + 1) * xSize + currentState[0];
        neighborsIndex[1] = (currentState[1] + 1) * xSize + (currentState[0] + 1);
        neighborsIndex[2] = currentState[1] * xSize + (currentState[0] + 1);
        neighborsIndex[3] = (currentState[1] - 1) * xSize + (currentState[0] + 1);
        neighborsIndex[4] = (currentState[1] - 1) * xSize + currentState[0];
        neighborsIndex[5] = (currentState[1] - 1) * xSize + (currentState[0] - 1);
        neighborsIndex[6] = currentState[1] * xSize + (currentState[0] - 1);
        neighborsIndex[7] = (currentState[1] + 1) * xSize + (currentState[0] - 1);

        // biundary
        if (currentState[0] == 0) { // left boundary
          neighborsIndex[5] = -1;
          neighborsIndex[6] = -1;
          neighborsIndex[7] = -1;
          if (currentState[1] == 0) {  // bottom left conner
            neighborsIndex[3] = -1;
            neighborsIndex[4] = -1;
          } else if (currentState[1] == ySize - 1) {  // top left
            neighborsIndex[0] = -1;
            neighborsIndex[1] = -1;
          }
        } else if (currentState[0] == xSize - 1) { // right boundary
          neighborsIndex[1] = -1;
          neighborsIndex[2] = -1;
          neighborsIndex[3] = -1;
          if (currentState[1] == 0) {  // bottom right
            neighborsIndex[4] = -1;
            neighborsIndex[5] = -1;
          } else if (currentState[1] == ySize - 1) {  // top right
            neighborsIndex[0] = -1;
            neighborsIndex[7] = -1;
          }
        } else if (currentState[1] == 0) { // bottom boundary
          neighborsIndex[3] = -1;
          neighborsIndex[4] = -1;
          neighborsIndex[5] = -1;
        } else if (currentState[1] == ySize - 1) { // top boundary
          neighborsIndex[0] = -1;
          neighborsIndex[1] = -1;
          neighborsIndex[7] = -1;
        }
        // else {
        //     neighborsIndex.push((currentState[1] + 1) * xSize + currentState[0]);
        //     neighborsIndex.push((currentState[1] + 1) * xSize + (currentState[0] + 1));
        //     neighborsIndex.push(currentState[1] * xSize + (currentState[0] + 1));
        //     neighborsIndex.push((currentState[1] - 1) * xSize + (currentState[0] + 1));
        //     neighborsIndex.push((currentState[1] - 1) * xSize + currentState[0]);
        //     neighborsIndex.push((currentState[1] - 1) * xSize + (currentState[0] - 1));
        //     neighborsIndex.push(currentState[1] * xSize + (currentState[0] - 1));
        //     neighborsIndex.push((currentState[1] + 1) * xSize + (currentState[0] - 1));
        // }

        calVector();
        draw();
    }

    function calVector() {
        let xSize = App.data.stateSpaceSize.oneD[App.currentProjection.x];
        let ySize = App.data.stateSpaceSize.oneD[App.currentProjection.y];

        glyphVector = [];

        for (let i = 0; i < sgData.length; i++) { // sgData.length: # of runs
            glyphVector[i] = [];
            for (let j = 0; j < 8; j++) { // 8 neighbors
                if (neighborsIndex[j] >= 0) {
                    let neighborValue = +d3.values(sgData[i][neighborsIndex[j]])[currentTime + 2];
                    let stateValue = +d3.values(sgData[i][currentIndex])[currentTime + 2];
                    glyphVector[i].push((neighborValue - stateValue));
                } else {
                    glyphVector[i].push(0);
                }
            }
            // console.log(glyphVector[i]);
        }
        console.log(neighborsIndex);
        console.log(glyphVector);
        // A:3, C:9 : 0.012025238325095, 0.0150576218952293
        // A:2, C:9 : 0.0120266823517525, 0.0151262139833606
        calMinMax();
    }

    function calMinMax() {
        let min = [],
            max = [];

        for (let i = 0; i < sgData.length; i++) {
            min[i] = d3.min(glyphVector[i].filter(function(x) {
                return x !== 0;
            }), (d) => Math.abs(d));
            max[i] = d3.max(glyphVector[i].filter(function(x) {
                return x !== 0;
            }), (d) => Math.abs(d));
        }

        minVal = d3.min(min); //.toFixed(3);
        maxVal = d3.max(max); //.toFixed(3);

        // console.log(minVal);
        // console.log(maxVal);
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
            height: targetElement.node().clientWidth / 6
        };
    }

    function getSize() {
        return size;
    }

    // return public methods
    return {
        // publi methods
        create: setupView,
        draw: draw,
        resize: resize,
        // getter / setter
        getSize: getSize,
        setData: setData,
        setTimestep: setTimestep,
        setState: setState
    };

})();
