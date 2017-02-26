
function trajectoryCube() {
  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set(0, 0, 100);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3(-10, 0, 0));
  geometry.vertices.push(new THREE.Vector3(0, 10, 0));
  geometry.vertices.push(new THREE.Vector3(10, 0, 0));
  // for (var t = 0; t < TIME_STEP; t++) {
  //   geometry.vertices[t] = new THREE.Vector3(x, y, z);
  // }

  var material = new THREE.LineBasicMaterial({ color: 0x0000ff });

  var line = new THREE.Line(geometry, material);

  scene.add(line);
  renderer.render(scene, camera);
}