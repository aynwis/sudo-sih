// india-scene.js
// A satellite tile-coverage grid over India's real bounding box
// (68.09-97.41E, 6.75-37.08N), not a political boundary trace. Each bar is
// one grid cell; cells outside India's landmass (checked against a
// simplified point-in-polygon mask, computed offline) are omitted entirely,
// so the remaining bars read as India's silhouette by shape, without
// depending on a hand-traced coastline rendering cleanly in 3D.
//
// Independent Three.js scene/renderer from the background terrain scene.
(function () {
  var GRID_CELLS = [
    [1,8,0],[1,9,0],[1,10,0],[2,9,0],[2,10,0],[2,11,0],[2,12,0],
    [3,5,1],[3,6,1],[3,7,1],[3,8,1],[3,9,0],[3,10,0],[3,11,0],[3,12,0],[3,13,0],
    [4,3,0],[4,4,0],[4,5,1],[4,6,1],[4,7,1],[4,8,1],[4,9,0],[4,10,0],[4,11,0],[4,12,0],[4,13,0],[4,14,0],[4,16,0],
    [5,1,0],[5,2,0],[5,3,0],[5,4,0],[5,5,1],[5,6,1],[5,7,1],[5,8,1],[5,9,0],[5,10,0],[5,11,0],[5,12,0],[5,13,0],[5,14,0],[5,15,0],[5,16,0],
    [6,2,0],[6,3,0],[6,4,0],[6,5,1],[6,6,1],[6,7,1],[6,8,1],[6,9,0],[6,10,0],[6,11,0],[6,12,0],[6,13,0],
    [7,5,1],[7,6,1],[7,7,1],[7,8,1],[7,9,0],[7,10,0],[7,11,0],[7,12,0],
    [8,6,0],[8,7,0],[8,8,0],[8,9,0],[8,10,0],[8,11,0],[8,12,0],
    [9,7,0],[9,8,0],[9,9,0],[9,10,0],[9,11,0],
    [10,8,0],[10,9,0],[10,10,0],[10,11,0],
    [11,9,0],[11,10,0],[11,11,0],
    [12,10,0],[12,11,0],
    [13,10,0],
    [14,10,0]
  ];
  var GRID_X = 18, GRID_Z = 18;
  var CELL_SIZE = 1.05, CELL_GAP = 0.14;
  var WORLD_SIZE = GRID_X * CELL_SIZE;

  var canvas = document.getElementById('india-canvas');
  var wrap = canvas.parentElement;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0e0d0b, 0.02);

  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  camera.position.set(2, 16, 15);
  var lookTarget = new THREE.Vector3(0, 0, 0);

  scene.add(new THREE.AmbientLight(0x1a1712, 1.5));
  var key = new THREE.DirectionalLight(0xede7da, 1.6);
  key.position.set(6, 14, 8);
  scene.add(key);
  var rim = new THREE.DirectionalLight(0x3d7068, 1.1);
  rim.position.set(-8, 6, -6);
  scene.add(rim);

  var dimMat = new THREE.MeshStandardMaterial({ color: 0x1c1811, roughness: 0.85, metalness: 0.05 });
  var mhMat = new THREE.MeshStandardMaterial({ color: 0xd89344, roughness: 0.45, metalness: 0.25, emissive: 0xd89344, emissiveIntensity: 0.28 });

  var barGeo = new THREE.BoxGeometry(CELL_SIZE - CELL_GAP, 1, CELL_SIZE - CELL_GAP);
  var mhBars = [];
  var allBars = [];

  GRID_CELLS.forEach(function (cell) {
    var cx = cell[0], cz = cell[1], isMh = cell[2] === 1;
    var height = isMh ? 0.9 : 0.32;
    var mesh = new THREE.Mesh(barGeo, isMh ? mhMat : dimMat);
    mesh.scale.y = height;
    var worldX = (cx - GRID_X / 2 + 0.5) * CELL_SIZE;
    var worldZ = (cz - GRID_Z / 2 + 0.5) * CELL_SIZE;
    mesh.position.set(worldX, height / 2, -worldZ);
    mesh.userData.isMh = isMh;
    scene.add(mesh);
    allBars.push(mesh);
    if (isMh) mhBars.push(mesh);
  });

  var plateGeo = new THREE.PlaneGeometry(WORLD_SIZE * 1.15, WORLD_SIZE * 1.15);
  plateGeo.rotateX(-Math.PI / 2);
  var plateMat = new THREE.MeshBasicMaterial({ color: 0x0e0d0b, transparent: true, opacity: 0.6 });
  var plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.y = -0.01;
  scene.add(plate);

  var raycaster = new THREE.Raycaster();
  var mouseNDC = new THREE.Vector2();
  var targetCamPos = camera.position.clone();
  var targetLook = lookTarget.clone();

  function renderReadout(mode) {
    var el = document.getElementById('mapReadout');
    if (mode === 'maharashtra') {
      el.innerHTML =
        '<div class="r-title">Maharashtra — tile02_Jamunjhola</div>' +
        '<div class="r-status">Active satellite coverage</div>' +
        '<div class="stat"><span>Ground-truth points</span><span class="v">143</span></div>' +
        '<div class="stat"><span>Validated in tile02</span><span class="v">55</span></div>' +
        '<div class="stat"><span>Validation AUC</span><span class="v">0.87</span></div>' +
        '<div class="stat"><span>Regression-ready</span><span class="v">13</span></div>';
    } else {
      el.innerHTML =
        '<div class="r-title">No tile selected</div>' +
        '<div class="r-empty">Click the raised amber tiles to load their satellite pipeline stats. Only Maharashtra has active coverage in this pilot — every other tile is landmass with no data behind it yet.</div>';
    }
  }
  renderReadout(null);

  function onClick(e) {
    var rect = canvas.getBoundingClientRect();
    mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseNDC, camera);
    var hits = raycaster.intersectObjects(allBars);
    if (hits.length > 0) {
      var hit = hits[0].object;
      if (hit.userData.isMh) {
        targetCamPos.set(0, 8, 7);
        targetLook.set(0, 0, -2.5);
        renderReadout('maharashtra');
      } else {
        targetCamPos.set(2, 16, 15);
        targetLook.set(0, 0, 0);
        renderReadout(null);
      }
    }
  }
  canvas.addEventListener('click', onClick);

  function resize() {
    var w = wrap.clientWidth, h = wrap.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  var clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    camera.position.lerp(targetCamPos, 0.05);
    lookTarget.lerp(targetLook, 0.05);
    camera.lookAt(lookTarget);

    var pulse = 1 + Math.sin(t * 2) * 0.06;
    mhBars.forEach(function (m) { m.scale.y = 0.9 * pulse; m.position.y = (0.9 * pulse) / 2; });

    renderer.render(scene, camera);
  }
  animate();
})();
