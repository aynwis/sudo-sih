// interactions.js
// Plain DOM interactions that don't touch Three.js: the depth-slider content
// swap and the receipt-ledger hover/click affordance.
(function () {
  var layers = [
    { name: "Surface — Sentinel-2 optical", desc: "True-color and false-color composite, DN-scaled to reflectance before anything downstream touches it.", stats: [["Resolution", "10m/px"], ["Bands used", "6"], ["Cloud cover", "<5%"]] },
    { name: "SAR — Sentinel-1 roughness", desc: "Radar backscatter, unaffected by cloud cover — the VV/VH ratio flags surface roughness tied to exposed rock.", stats: [["Polarization", "VV, VH"], ["Pass", "descending"], ["Speckle filter", "applied"]] },
    { name: "Elevation — SRTM DEM", desc: "Slope and elevation derived directly from the DEM, feeding the terrain you're standing on right now.", stats: [["Source", "SRTM"], ["Slope band", "re-exported, D1"], ["Vertical accuracy", "±16m"]] },
    { name: "Spectral indices", desc: "Fe-oxide ratio, hydroxyl ratio, NDVI, SAR roughness — the actual feature stack the classifier trains on.", stats: [["Fe-oxide range", "0.8 – 2.1"], ["NDVI range", "-0.1 – 0.6"], ["Feature count", "13"]] },
    { name: "Prospectivity output", desc: "XGBoost probability surface, validated against 55 tile02 ground-truth sites.", stats: [["Validation AUC", "0.87"], ["Method", "single XGBoost"], ["Scope", "tile02_Jamunjhola"]] }
  ];

  var slider = document.getElementById('depthSlider');
  var readout = document.getElementById('depthReadout');

  function renderLayer(i) {
    var l = layers[i];
    var statsHtml = l.stats.map(function (kv) {
      return '<div class="stat"><span>' + kv[0] + '</span><span class="v">' + kv[1] + '</span></div>';
    }).join('');
    readout.innerHTML =
      '<div>' +
        '<div class="layer-name">' + l.name + '</div>' +
        '<div class="layer-desc">' + l.desc + '</div>' +
      '</div>' +
      '<div>' + statsHtml + '</div>';
  }
  renderLayer(0);
  slider.addEventListener('input', function (e) { renderLayer(+e.target.value); });

  // Ledger rows -- click just gives a small visual acknowledgment; this is a
  // static demo page, not wired to a real backend lookup.
  var rows = document.querySelectorAll('.ledger-row');
  rows.forEach(function (row) {
    row.addEventListener('click', function () {
      row.style.borderTopColor = 'var(--ochre-bright)';
      setTimeout(function () { row.style.borderTopColor = ''; }, 400);
    });
  });
})();
