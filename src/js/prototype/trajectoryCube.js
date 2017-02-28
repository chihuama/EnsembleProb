var App = App || {};
App.views = App.views || {};

App.views.trajectoryCube = (function() {
  let targetElement = null;
  let scene = null;
  let camera = null;


  let group = null;
  let bbox = null;

  let timeSelector = null;
  let curPeak = null;

  let size = null;

  let timeStepTraj = null;
  let numX;
  let numY;

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
  }


  function addCamera() {
    // camera = new THREE.OrthographicCamera( size.width / - 2, size.width / 2, size.height / 2, size.height / - 2, 1, 1000 );
    camera = new THREE.PerspectiveCamera( 110, size.width / size.height, 0.1, 1000 );
    camera.position.set(0, 0, 50);
    // camera.rotation.y = 180 * Math.PI / 180;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  }


  function createRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(size.width, size.height);
    targetElement.appendChild(renderer.domElement);
  }


  function createBoundingBox(numberOfStatesX, numberOfStatesY) {
    if (bbox) {
      bbox.remove();
    }
    let box = new THREE.BoxGeometry(numberOfStatesX, TIME_STEP, numberOfStatesY);
    let geometry = new THREE.EdgesGeometry( box );
    let material = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 2 });
    let cube = new THREE.LineSegments( geometry, material );
    // bbox = scene.add(cube);

    group.add( cube );
  }


  function createTrajectory() {
    let colorMap = ['#ffffb2','#fed976','#feb24c','#fd8d3c','#f03b20','#bd0026'];
    let materials = colorMap.map((hex) => new THREE.LineBasicMaterial({ color: hex, linewidth: 2 }) );

    console.log(materials);

    if (timeStepTraj) {
      for (let t = 0; t < TIME_STEP - 1; t++) {
        for (let trajStartCoord of Object.keys(timeStepTraj[t])) {
          let trajStart = timeStepTraj[t][trajStartCoord];
          for (let trajEndCoord of Object.keys(timeStepTraj[t][trajStartCoord].to)) {
            let trajEnd = timeStepTraj[t][trajStartCoord].to[trajEndCoord]

            let startCoord = new THREE.Vector3(trajStart.coord.x - numX/2, t - TIME_STEP/2, numY/2 - trajStart.coord.y);
            let endCoord = new THREE.Vector3(trajEnd.coord.x - numX/2, t + 1 - TIME_STEP/2, numY/2 - trajEnd.coord.y);

            let geometry = new THREE.Geometry();
            geometry.vertices.push(startCoord, endCoord);

            line = new THREE.Line(geometry, materials[trajEnd.count-1]);

            group.add(line);

          }
        }
      }
    }

  }


  function createTimeSelector(numberOfStatesX, numberOfStatesY, timestep) {
    let box = new THREE.BoxGeometry(numberOfStatesX, 1, numberOfStatesY);
    let geometry = new THREE.EdgesGeometry( box );
    let material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    timeSelector = new THREE.LineSegments( geometry, material );
    timeSelector.position.setY(timestep - TIME_STEP/2);
    group.add( timeSelector );

    // highlightPeak(timestep);
  }

  function updateTimeSelector(timestep) {
    timeSelector.position.setY(timestep - TIME_STEP/2);

    // highlightPeak(timestep);
  }


  function highlightPeak(timestep) {
    if (curPeak) {
      console.log(curPeak);
      curPeak.children.forEach((child) => {
        curPeak.remove(child)
      })
    }

    // suggestion: move spheres which are already added, add spheres if you have too few, remove ifyou have too many
    // maybe too much adding and removing makes it slow..

    let material = new THREE.MeshBasicMaterial( { color: 0xffff00 });

    if (timeStepTraj) {
      for (let trajStartCoord of Object.keys(timeStepTraj[timestep])) {
        let trajCoord = timeStepTraj[timestep][trajStartCoord];

        let geometry = new THREE.SphereGeometry(0.5, 50, 50);
        let sphere = new THREE.Mesh( geometry, material );

        sphere.position.setX(trajCoord.coord.x - numX/2);
        sphere.position.setY(timestep - TIME_STEP/2);
        sphere.position.setZ(numY/2 - trajCoord.coord.y);

        curPeak.add(sphere);
      }
    }

  }


  function render() {
    group.rotation.y += 0.002;
    renderer.render(scene, camera);
  }


  function setData(data) {
    // data[0]: probVal, data[1]: peakInfo
    // Pa: data[1][0][0~5], Pb: data[1][1][0~5], Pc: data[1][2][0~5]

    // project to A & B
    let y = numY = data[0][0][0].length;
    let x = numX = data[0][1][0].length;

    // extract path information between timesteps from full peak data
    let yData = data[1][0]; // a
    let xData = data[1][1]; // b

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
             let nextX = xData[runNumber][timestep+1].reduce(function (prev, curr) {
              return (Math.abs(curr.index - peakX.index) < Math.abs(prev.index - peakX.index) ? curr : prev);
            });

             let nextY = yData[runNumber][timestep+1].reduce(function (prev, curr) {
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

    console.log(timeStepTraj);

    createBoundingBox(x, y);
    createTrajectory();
    createTimeSelector(x, y, 0);
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


  // return public methods
  return {
    // public methods
    create: setupView,
    draw: render,
    resize: resize,
    // getter / setter
    setData: setData,
    getSize: getSize,
    updateTimeSelector: updateTimeSelector
  };

})();
