import { useRef } from "react";
import { useTerrainScene } from "../hooks/useTerrainScene";
import IndiaMap from "./IndiaMap";
import DepthSlider from "./DepthSlider";
import ReceiptLedgerPreview from "./ReceiptLedgerPreview";
import "../styles/intro.css";

// The scroll narrative that leads into the real dashboard. The terrain
// canvas is pinned as a fixed background and fades out as the reader
// approaches the ledger section, so it reads as the overlay lifting away
// rather than a page swap. The nav itself lives at the app level (SiteNav)
// since it needs to stay visible over the dashboard too.
export default function IntroScene() {
  const canvasRef = useRef(null);
  const veilRef = useRef(null);

  useTerrainScene(canvasRef, veilRef, "close");

  return (
    <div className="intro-root">
      <canvas id="scene-canvas" ref={canvasRef}></canvas>
      <div className="scene-veil" ref={veilRef}></div>

      <div className="intro-content">
        <div id="top" />
        <section className="hero">
          <div className="hero-eyebrow">Manganese prospectivity mapping — Maharashtra, tile02_Jamunjhola</div>
          <h1>
            Reading the ground <span className="accent">before</span> anyone drills it.
          </h1>
          <p className="hero-sub">
            An AI/ML prospectivity model built on real satellite imagery, validated against real ground-truth sites,
            with every number traceable back to the file it came from.
          </p>
          <div className="hero-meta">
            <div>
              <span className="num">143</span>verified occurrence points
            </div>
            <div>
              <span className="num">55</span>validated in tile02
            </div>
            <div>
              <span className="num">13</span>regression-ready sites
            </div>
          </div>
          <div className="scroll-cue">
            <div className="line"></div>Scroll to descend
          </div>
        </section>

        <section className="strata" id="terrain-intro">
          <div className="strata-copy">
            <div className="strata-index">01 — the terrain behind you</div>
            <h2>Every ridge you're seeing is real elevation data.</h2>
            <p>
              The mesh in the background is displaced by the tile's actual DEM and probability surface — not a
              decorative shape. As you scroll, the camera moves through the same layers the model reads: elevation,
              spectral index, SAR roughness, prospectivity.
            </p>
          </div>
          <div className="strata-card">
            <div className="row"><span className="k">Sensor stack</span><span className="v">Sentinel-2 + Sentinel-1 SAR</span></div>
            <div className="row"><span className="k">Elevation source</span><span className="v">SRTM DEM</span></div>
            <div className="row"><span className="k">Model</span><span className="v">XGBoost, single classifier</span></div>
            <div className="row"><span className="k">Known error caught</span><span className="v flag">Sandur Mines, ~380km off</span></div>
          </div>
        </section>

        <section className="strata reverse" id="forensics">
          <div className="strata-copy">
            <div className="strata-index">02 — data forensics, not a footnote</div>
            <h2>We audited the government database. It had a mislocated mine in it.</h2>
            <p>
              Sandur Mines was listed roughly 380 kilometers from the real Sandur belt. We found it, verified it
              against a second source, and excluded it — the same discipline applied across 231 raw rows before they
              became 143 trusted ones.
            </p>
          </div>
          <div className="strata-card">
            <div className="row"><span className="k">Raw ground-truth rows</span><span className="v">231</span></div>
            <div className="row"><span className="k">Verified unique locations</span><span className="v ok">143</span></div>
            <div className="row"><span className="k">Duplicate-mine rows removed</span><span className="v">88</span></div>
            <div className="row"><span className="k">Validation set (tile02)</span><span className="v ok">55</span></div>
          </div>
        </section>

        <section className="map-section" id="map">
          <div className="map-head">
            <div className="strata-index">03 — where the model is actually looking</div>
            <h2>One country. One tile with real coverage.</h2>
            <p>Each bar is a coverage tile across India's landmass. Only Maharashtra is lit — click it to load the pipeline stats for tile02_Jamunjhola.</p>
          </div>
          <IndiaMap />
        </section>

        <section className="depth-section" id="depth">
          <div className="depth-head">
            <div className="strata-index">04 — descend through the model</div>
            <h2>Pull the core. Watch what each layer actually is.</h2>
            <p>Drag to move through the raster stack the way you'd read strata in a core sample — surface imagery down to the prospectivity output.</p>
          </div>
          <DepthSlider />
        </section>

        <section className="ledger" id="ledger">
          <div className="ledger-head">
            <div className="strata-index">05 — verify, live</div>
            <h2>Click a number, see the file it came from.</h2>
            <p>Every stat on this page traces to one of these. This is the actual receipt-sheet pattern the dashboard uses live, below.</p>
          </div>
          <ReceiptLedgerPreview />
        </section>

        <section className="close" id="close">
          <div className="close-glow" />
          <div className="strata-index">06 — see it live</div>
          <h2>See the live model, not a mockup of one.</h2>
          <p className="close-sub">
            Everything above was the pitch. Below is the actual tool — real satellite data, real ground-truth
            markers, click-to-verify traceability.
          </p>
          <a href="#dashboard" className="close-cta">
            Open the live dashboard <span className="arrow">→</span>
          </a>
        </section>
      </div>
    </div>
  );
}
