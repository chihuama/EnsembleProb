var App = App || {};
App.views = App.views || {};

App.views.trajectoryCube = (function() {
  let targetElement = null;
  let scene = null;
  let camera = null;

  let box = [];

  let size = null;

  function setupView(targetID) {
    targetElement = document.getElementById(targetID);
    scene = new THREE.Scene();

    addCamera();
    createRenderer();

    resize();
    render();
  }

  function addCamera() {
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set(0, 0, 100);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  function createRenderer() {
    renderer = new THREE.WebGLRenderer();
    targetElement.appendChild(renderer.domElement);
  }

  function createBoundingBox(numberOfStatesX, numberOfStatesY) {

  }

  function render() {

  }

  function setData(data) {

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
  };

})();
