import { useEffect } from "react";
import * as THREE from "three";

// The full-page background terrain -- a Perlin-noise-displaced mesh standing
// in for the tile's DEM + probability surface. Camera orbits/descends as the
// page scrolls, then the whole canvas fades out once the reader reaches
// `fadeToSectionId` -- the point where the page stops being a scroll
// narrative and hands off to the real dashboard underneath.
export function useTerrainScene(canvasRef, veilRef, fadeToSectionId) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0e0d0b, 0.028);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 10, 26);

    scene.add(new THREE.AmbientLight(0x1a1712, 1.4));
    const key = new THREE.DirectionalLight(0xd89344, 2.2);
    key.position.set(12, 18, 10);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x3d7068, 1.6);
    rim.position.set(-14, 6, -10);
    scene.add(rim);

    function makeNoise2D(seed) {
      const perm = new Uint8Array(512);
      let s = seed;
      function rnd() {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
      }
      const p = new Uint8Array(256);
      for (let i = 0; i < 256; i++) p[i] = i;
      for (let i = 255; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        const t = p[i];
        p[i] = p[j];
        p[j] = t;
      }
      for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
      function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
      }
      function lerp(a, b, t) {
        return a + t * (b - a);
      }
      function grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y,
          v = h < 2 ? y : x;
        return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
      }
      return function (x, y) {
        const X = Math.floor(x) & 255,
          Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = fade(x),
          v = fade(y);
        const aa = perm[X + perm[Y]],
          ab = perm[X + perm[Y + 1]],
          ba = perm[X + 1 + perm[Y]],
          bb = perm[X + 1 + perm[Y + 1]];
        return lerp(lerp(grad(aa, x, y), grad(ba, x - 1, y), u), lerp(grad(ab, x, y - 1), grad(bb, x - 1, y - 1), u), v);
      };
    }
    const noise = makeNoise2D(1337);
    function terrainHeight(x, z) {
      let h = 0,
        amp = 1,
        freq = 0.06,
        sum = 0;
      for (let o = 0; o < 5; o++) {
        h += noise(x * freq, z * freq) * amp;
        sum += amp;
        amp *= 0.5;
        freq *= 2.1;
      }
      return h / sum;
    }

    const SIZE = 60,
      SEG = 72;
    const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    geo.rotateX(-Math.PI / 2);
    const posAttr = geo.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);
    const colorLow = new THREE.Color(0x17140f);
    const colorMid = new THREE.Color(0x3d7068);
    const colorHigh = new THREE.Color(0xd89344);

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i),
        z = posAttr.getZ(i);
      const h = terrainHeight(x, z);
      posAttr.setY(i, h * 3.4);
      const prob = (noise((x + 100) * 0.09, (z + 100) * 0.09) + 1) / 2;
      const c = new THREE.Color();
      if (prob < 0.5) c.lerpColors(colorLow, colorMid, prob / 0.5);
      else c.lerpColors(colorMid, colorHigh, (prob - 0.5) / 0.5);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0.08 });
    const terrain = new THREE.Mesh(geo, mat);
    scene.add(terrain);

    const wireMat = new THREE.MeshBasicMaterial({ color: 0xede7da, wireframe: true, transparent: true, opacity: 0.045 });
    const wireMesh = new THREE.Mesh(geo, wireMat);
    wireMesh.position.y = 0.01;
    scene.add(wireMesh);

    const markerGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const markerMatMine = new THREE.MeshBasicMaterial({ color: 0x5b9e93 });
    const markerMatBlock = new THREE.MeshBasicMaterial({ color: 0xd89344 });
    const markers = [];
    for (let i = 0; i < 22; i++) {
      const mx = (Math.random() - 0.5) * SIZE * 0.8;
      const mz = (Math.random() - 0.5) * SIZE * 0.8;
      const my = terrainHeight(mx, mz) * 3.4 + 0.5;
      const m = new THREE.Mesh(markerGeo, i % 3 === 0 ? markerMatBlock : markerMatMine);
      m.position.set(mx, my, mz);
      scene.add(m);
      markers.push(m);
    }

    let scrollProgress = 0;

    function fadeRange() {
      const fadeSection = fadeToSectionId ? document.getElementById(fadeToSectionId) : null;
      if (!fadeSection) return { start: 0.45, end: 0.6 };
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return { start: 0.45, end: 0.6 };
      const sectionTop = fadeSection.offsetTop;
      const start = Math.max(0, (sectionTop - window.innerHeight * 0.9) / docHeight);
      const end = Math.min(1, sectionTop / docHeight);
      return { start, end: Math.max(end, start + 0.05) };
    }

    function updateScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = h > 0 ? window.scrollY / h : 0;

      const range = fadeRange();
      let fade = (scrollProgress - range.start) / (range.end - range.start);
      fade = Math.min(1, Math.max(0, fade));
      const opacity = 1 - fade;
      canvas.style.opacity = opacity;
      if (veilRef.current) veilRef.current.style.opacity = opacity;
      canvas.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
    }
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    let mouseX = 0,
      mouseY = 0;
    function onMouseMove(e) {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    }
    window.addEventListener("mousemove", onMouseMove);

    const clock = new THREE.Clock();
    let frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      const orbitAngle = scrollProgress * Math.PI * 1.1 + t * 0.02;
      const radius = 26 - scrollProgress * 8;
      const height = 10 - scrollProgress * 10;
      camera.position.x = Math.sin(orbitAngle) * radius + mouseX * 2;
      camera.position.z = Math.cos(orbitAngle) * radius;
      camera.position.y = height + mouseY * 1.2;
      camera.lookAt(0, -1, 0);

      markers.forEach((m, i) => {
        m.position.y += Math.sin(t * 1.4 + i) * 0.0015;
      });

      if (canvas.style.visibility !== "hidden") renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      mat.dispose();
      wireMat.dispose();
      markerGeo.dispose();
      markerMatMine.dispose();
      markerMatBlock.dispose();
      renderer.dispose();
    };
  }, [canvasRef, veilRef, fadeToSectionId]);
}
