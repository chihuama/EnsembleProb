var App = App || {};
App.views = App.views || {};

App.views.projectionMap = (function() {
  let targetElement = null;

  let size = null;

  function setupView(targetID) {
    targetElement = document.getElementById(targetID);

    resize();
    draw();
  }

  function draw() {

  }

  function setData(data) {

  }

  function resize() {
    calculateNewComponentSize();

    // update svg size
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
    draw: draw,
    resize: resize,
    // getter / setter
    setData: setData,
    getSize: getSize,
  };

})();
