// terrain-scene.js
// The full-page background terrain -- a Perlin-noise-displaced mesh standing
// in for the tile's DEM + probability surface. Camera orbits/descends as the
// page scrolls.
(function () {
  var canvas = document.getElementById('scene-canvas');
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0e0d0b, 0.028);

  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 10, 26);

  scene.add(new THREE.AmbientLight(0x1a1712, 1.4));
  var key = new THREE.DirectionalLight(0xd89344, 2.2);
  key.position.set(12, 18, 10);
  scene.add(key);
  var rim = new THREE.DirectionalLight(0x3d7068, 1.6);
  rim.position.set(-14, 6, -10);
  scene.add(rim);

  function makeNoise2D(seed) {
    var perm = new Uint8Array(512);
    var s = seed;
    function rnd() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }
    var p = new Uint8Array(256);
    for (var i = 0; i < 256; i++) p[i] = i;
    for (var i = 255; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = p[i]; p[i] = p[j]; p[j] = t; }
    for (var i = 0; i < 512; i++) perm[i] = p[i & 255];
    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function lerp(a, b, t) { return a + t * (b - a); }
    function grad(hash, x, y) {
      var h = hash & 3;
      var u = h < 2 ? x : y, v = h < 2 ? y : x;
      return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
    }
    return function (x, y) {
      var X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
      x -= Math.floor(x); y -= Math.floor(y);
      var u = fade(x), v = fade(y);
      var aa = perm[X + perm[Y]], ab = perm[X + perm[Y + 1]], ba = perm[X + 1 + perm[Y]], bb = perm[X + 1 + perm[Y + 1]];
      return lerp(
        lerp(grad(aa, x, y), grad(ba, x - 1, y), u),
        lerp(grad(ab, x, y - 1), grad(bb, x - 1, y - 1), u),
        v
      );
    };
  }
  var noise = makeNoise2D(1337);
  function terrainHeight(x, z) {
    var h = 0, amp = 1, freq = 0.06, sum = 0;
    for (var o = 0; o < 5; o++) {
      h += noise(x * freq, z * freq) * amp;
      sum += amp;
      amp *= 0.5; freq *= 2.1;
    }
    return h / sum;
  }

  var SIZE = 60, SEG = 72;
  var geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  var posAttr = geo.attributes.position;
  var colors = new Float32Array(posAttr.count * 3);
  var colorLow = new THREE.Color(0x17140f);
  var colorMid = new THREE.Color(0x3d7068);
  var colorHigh = new THREE.Color(0xd89344);

  for (var i = 0; i < posAttr.count; i++) {
    var x = posAttr.getX(i), z = posAttr.getZ(i);
    var h = terrainHeight(x, z);
    posAttr.setY(i, h * 3.4);
    var prob = (noise((x + 100) * 0.09, (z + 100) * 0.09) + 1) / 2;
    var c = new THREE.Color();
    if (prob < 0.5) c.lerpColors(colorLow, colorMid, prob / 0.5);
    else c.lerpColors(colorMid, colorHigh, (prob - 0.5) / 0.5);
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  var mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0.08 });
  var terrain = new THREE.Mesh(geo, mat);
  scene.add(terrain);

  var wireMat = new THREE.MeshBasicMaterial({ color: 0xede7da, wireframe: true, transparent: true, opacity: 0.045 });
  var wireMesh = new THREE.Mesh(geo, wireMat);
  wireMesh.position.y = 0.01;
  scene.add(wireMesh);

  var markerGeo = new THREE.SphereGeometry(0.14, 12, 12);
  var markerMatMine = new THREE.MeshBasicMaterial({ color: 0x5b9e93 });
  var markerMatBlock = new THREE.MeshBasicMaterial({ color: 0xd89344 });
  var markers = [];
  for (var i = 0; i < 22; i++) {
    var mx = (Math.random() - 0.5) * SIZE * 0.8;
    var mz = (Math.random() - 0.5) * SIZE * 0.8;
    var my = terrainHeight(mx, mz) * 3.4 + 0.5;
    var m = new THREE.Mesh(markerGeo, i % 3 === 0 ? markerMatBlock : markerMatMine);
    m.position.set(mx, my, mz);
    scene.add(m);
    markers.push(m);
  }

  var scrollProgress = 0;
  var veil = document.querySelector('.scene-veil');
  var mapSection = document.getElementById('map');

  // The overlay dissolves once the reader reaches the "real" content --
  // the map section, where the page stops being a scroll narrative and
  // starts being the actual interactive tool. Fade is driven by that
  // section's scroll position, not a fixed fraction of page height, so it
  // still lines up if sections above are edited later.
  function fadeRange() {
    if (!mapSection) return { start: 0.45, end: 0.6 };
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return { start: 0.45, end: 0.6 };
    var sectionTop = mapSection.offsetTop;
    var start = Math.max(0, (sectionTop - window.innerHeight * 0.9) / docHeight);
    var end = Math.min(1, sectionTop / docHeight);
    return { start: start, end: Math.max(end, start + 0.05) };
  }

  function updateScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = h > 0 ? window.scrollY / h : 0;

    var range = fadeRange();
    var fade = (scrollProgress - range.start) / (range.end - range.start);
    fade = Math.min(1, Math.max(0, fade));
    var opacity = 1 - fade;
    canvas.style.opacity = opacity;
    if (veil) veil.style.opacity = opacity;
    canvas.style.visibility = opacity <= 0.001 ? 'hidden' : 'visible';
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  var mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  });

  var clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    var orbitAngle = scrollProgress * Math.PI * 1.1 + t * 0.02;
    var radius = 26 - scrollProgress * 8;
    var height = 10 - scrollProgress * 10;
    camera.position.x = Math.sin(orbitAngle) * radius + mouseX * 2;
    camera.position.z = Math.cos(orbitAngle) * radius;
    camera.position.y = height + mouseY * 1.2;
    camera.lookAt(0, -1, 0);

    markers.forEach(function (m, i) { m.position.y += Math.sin(t * 1.4 + i) * 0.0015; });

    if (canvas.style.visibility !== 'hidden') renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
