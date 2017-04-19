var App = App || {};
App.views = App.views || {};

App.views.trajectoryCube = (function() {
    let targetElement = null;
    let scene = null;
    let camera = null;
    let renderer = null;

    let group = null;
    let bbox = null;

    let timeSelector = null;
    let curPeak = null;

    let size = null;

    let timeStepTraj = null;
    let numX;
    let numY;

    let isRotating = false;

    let controls;


    function setupView(targetID) {
        targetElement = document.getElementById(targetID);
        scene = new THREE.Scene();
        group = new THREE.Group();
        scene.add(group);

        curPeak = new THREE.Group();
        group.add(curPeak);

        calculateNewComponentSize();

        addCamera();
        createRenderer();

        // resize();

        // rotate, zoom, pan
        controls = new THREE.TrackballControls(camera, renderer.domElement);

        controls.rotateSpeed = 0.8;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.6;

        controls.noZoom = false;
        controls.noPan = true;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        controls.keys = [65, 83, 68];

        controls.addEventListener('change', render);
    }


    function addCamera() {
        // camera = new THREE.OrthographicCamera( size.width / - 2, size.width / 2, size.height / 2, size.height / - 2, 1, 1000 );
        camera = new THREE.PerspectiveCamera(110, size.width / size.height, 1, 1000);
        camera.position.set(0, 0, 80);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    }


    function createRenderer() {
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(size.width, size.height);
        renderer.setClearColor(0xeeeeee); // #eeeeee;
        targetElement.appendChild(renderer.domElement);
    }


    function createBoundingBox(numberOfStatesX, numberOfStatesY) {
        if (bbox) {
            bbox.remove();
        }
        let box = new THREE.BoxGeometry(numberOfStatesX, TIME_STEP, numberOfStatesY);
        let geometry = new THREE.EdgesGeometry(box);
        let material = new THREE.LineBasicMaterial({
            color: 0x999999,
            linewidth: 2
        });
        let cube = new THREE.LineSegments(geometry, material);
        // bbox = scene.add(cube);

        group.add(cube);
    }


    function createTrajectory() {
        // let colorMap = ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'];
        let colorMap = ['#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'];
        // let materials = colorMap.map((hex) => new THREE.LineBasicMaterial({ color: hex, linewidth: 2 }));
        let materials = colorMap.map((hex) => new THREE.LineBasicMaterial({
            color: hex,
            linewidth: (colorMap.indexOf(hex) + 1) / 2
        }));

        if (timeStepTraj) {
            for (let t = 0; t < TIME_STEP - 1; t++) {
                for (let trajStartCoord of Object.keys(timeStepTraj[t])) {
                    let trajStart = timeStepTraj[t][trajStartCoord];
                    for (let trajEndCoord of Object.keys(timeStepTraj[t][trajStartCoord].to)) {
                        let trajEnd = timeStepTraj[t][trajStartCoord].to[trajEndCoord]

                        let startCoord = new THREE.Vector3(trajStart.coord.x - numX / 2, t - TIME_STEP / 2, numY / 2 - trajStart.coord.y);
                        let endCoord = new THREE.Vector3(trajEnd.coord.x - numX / 2, t + 1 - TIME_STEP / 2, numY / 2 - trajEnd.coord.y);

                        let geometry = new THREE.Geometry();
                        geometry.vertices.push(startCoord, endCoord);

                        line = new THREE.Line(geometry, materials[trajEnd.count - 1]);

                        group.add(line);

                    }
                }
            }
        }

    }


    function createTimeSelector(numberOfStatesX, numberOfStatesY, timestep) {
        let box = new THREE.BoxGeometry(numberOfStatesX, 1, numberOfStatesY);
        let geometry = new THREE.EdgesGeometry(box);
        let material = new THREE.LineBasicMaterial({
            color: 0x444444,
            linewidth: 2
        });
        timeSelector = new THREE.LineSegments(geometry, material);
        timeSelector.position.setY(timestep - TIME_STEP / 2);
        group.add(timeSelector);

        highlightPeak(timestep);
    }

    function updateTimeSelector(timestep) {
        timeSelector.position.setY(timestep - TIME_STEP / 2);

        highlightPeak(timestep);
    }


    function highlightPeak(timestep) {

        curPeak.children.forEach((child) => {
            curPeak.remove(child);
        })
        group.remove(curPeak);

        curPeak = new THREE.Group();

        // suggestion: move spheres which are already added, add spheres if you have too few, remove ifyou have too many
        // maybe too much adding and removing makes it slow..

        let material = new THREE.MeshBasicMaterial({
            color: 0x4daf4a
        });

        if (timeStepTraj) {
            for (let trajStartCoord of Object.keys(timeStepTraj[timestep])) {
                let trajCoord = timeStepTraj[timestep][trajStartCoord];

                let geometry = new THREE.SphereGeometry(0.75, 50, 50);
                let sphere = new THREE.Mesh(geometry, material);

                sphere.position.setX(trajCoord.coord.x - numX / 2);
                sphere.position.setY(timestep - TIME_STEP / 2);
                sphere.position.setZ(numY / 2 - trajCoord.coord.y);

                curPeak.add(sphere);
            }
        }

        group.add(curPeak);
        render();
    }


    function animate() {
        // console.log(event.clientX);
        requestAnimationFrame(animate);
        controls.update();
    }


    function render() {
        if (isRotating) {
            group.rotation.y += 0.002;
        }
        renderer.render(scene, camera);
    }


    function setData(data) {
        // data[0]: probVal, data[1]: peakInfo
        // Pa: data[1][0][0~5], Pb: data[1][1][0~5], Pc: data[1][2][0~5]

        // project to B & C
        let y = numY = data[0][App.currentProjection.y][0].length;
        let x = numX = data[0][App.currentProjection.x][0].length;

        // extract path information between timesteps from full peak data
        let yData = data[1][App.currentProjection.y]; // a
        let xData = data[1][App.currentProjection.x]; // b

        timeStepTraj = new Array(TIME_STEP - 1);

        for (let ind = 0; ind < TIME_STEP - 1; ind++) {
            timeStepTraj[ind] = {};
        }

        for (let runNumber = 0; runNumber < RUN_NUM; runNumber++) {
            for (let timestep = 0; timestep < TIME_STEP - 1; timestep++) {
                // create peaks from both axes
                for (let peakX of xData[runNumber][timestep]) {
                    for (let peakY of yData[runNumber][timestep]) {
                        let fromString = "x" + peakX.index + "y" + peakY.index;

                        // find peak in next timestep
                        let nextX = xData[runNumber][timestep + 1].reduce(function(prev, curr) {
                            return (Math.abs(curr.index - peakX.index) < Math.abs(prev.index - peakX.index) ? curr : prev);
                        });

                        let nextY = yData[runNumber][timestep + 1].reduce(function(prev, curr) {
                            return (Math.abs(curr.index - peakY.index) < Math.abs(prev.index - peakY.index) ? curr : prev);
                        });

                        // create object key in next timestep
                        let toString = "x" + nextX.index + "y" + nextY.index;

                        if (!timeStepTraj[timestep][fromString]) {
                            timeStepTraj[timestep][fromString] = {
                                coord: {
                                    x: peakX.index,
                                    y: peakY.index
                                },
                                to: {}
                            };
                        }

                        if (!timeStepTraj[timestep][fromString].to[toString]) {
                            timeStepTraj[timestep][fromString].to[toString] = {
                                coord: {
                                    x: nextX.index,
                                    y: nextY.index
                                },
                                count: 0
                            };
                        }

                        timeStepTraj[timestep][fromString].to[toString].count++;
                    }
                }
            }
        }

        // console.log(timeStepTraj);

        createBoundingBox(x, y);
        createTrajectory();
        createTimeSelector(x, y, 0);

        render();
    }


    function resize() {
        calculateNewComponentSize();

        renderer.setSize(size.width, size.height);
    }


    function calculateNewComponentSize() {
        size = {
            width: targetElement.clientWidth,
            height: targetElement.clientWidth * 1.4
        };
    }


    function getSize() {
        return size;
    }

    function rotate(id, val) {
        isRotating = !isRotating;
        d3.select("#" + id).attr("value", isRotating ? "pause" : "rotate");
        // setInterval(render, 10);
    }

    function zoomIn() {
        camera.position.z -= 5;
    }

    function zoomOut() {
        camera.position.z += 5;
    }

    function resetCamera() {
        camera.position.set(0, 0, 80);
    }

    function reset() {
        for (let i = group.children.length - 1; i >= 0; i--) {
            group.remove(group.children[i]);
        }
    }


    // return public methods
    return {
        // public methods
        create: setupView,
        draw: animate, //render,
        resize: resize,
        // getter / setter
        setData: setData,
        getSize: getSize,
        updateTimeSelector: updateTimeSelector,
        // rotate: rotate,
        // zoomIn: zoomIn,
        // zoomOut: zoomOut
        resetCamera: resetCamera,
        reset: reset
    };

})();
