import { Database, MapPin, Gauge, Search, Loader2 } from "lucide-react";
import ProspectivityHeatmap from "../components/ProspectivityHeatmap";
import RegressionCard from "../components/RegressionCard";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import WhyPanel from "../components/WhyPanel";
import shapChart from "../assets/shap_feature_importance.png";
import { useProbabilityImage } from "../hooks/useProbabilityImage";
import { useRegressionEstimate, useValidationPoints } from "../hooks/useBackend";
import { forensicsBullets } from "../lib/forensicsBullets";
import { TILE02_BOUNDS } from "../lib/mockData";
import "../styles/intro.css";

export default function Home() {
  const probImage = useProbabilityImage("/api/raster/probability.png");
  const validationPoints = useValidationPoints();
  const regressionEstimate = useRegressionEstimate();

  const bullets = forensicsBullets(143, 231, 380, 88);

  return (
    <div id="dashboard" className="intro-root px-6 py-8 sm:px-10 lg:h-screen lg:overflow-hidden" style={{ scrollMarginTop: 70 }}>
      <div className="mx-auto flex h-full max-w-[1800px] flex-col space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="strata-index !mb-1">07 — the live model</div>
            <h1 className="font-display text-2xl text-bone">Everything above, running for real.</h1>
            <p className="mt-1 text-sm text-bone-dim">tile02_Jamunjhola, Maharashtra — updates as the pipeline runs</p>
          </div>
          <StatusBadge status={regressionEstimate.data?.status} />
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          {/* Map -- left, fills the available height */}
          <div className="min-h-[500px]">
            {probImage.status === "loading" && (
              <p className="panel flex h-full items-center gap-2 text-sm text-bone-dim">
                <Loader2 size={14} className="animate-spin" /> Loading probability surface…
              </p>
            )}
            {probImage.status === "error" && (
              <p className="panel text-sm text-rose-400">Couldn't load raster: {probImage.error}</p>
            )}
            {probImage.status === "success" && (
              <ProspectivityHeatmap
                probabilityImageUrl={probImage.url}
                bounds={TILE02_BOUNDS}
                groundTruthSites={validationPoints.data?.sites ?? []}
              />
            )}
          </div>

          {/* Data -- right, stacked vertically, scrolls internally so the map never has to move */}
          <div className="space-y-4 lg:h-full lg:overflow-y-auto lg:pr-1">
            <StatCard icon={Database} tone="teal" label="Ground-truth points" value={143} hint="USGS MRDS, deduplicated" />
            <StatCard
              icon={MapPin}
              tone="teal"
              label="Validation set"
              value={validationPoints.isLoading ? "…" : validationPoints.isError ? "—" : validationPoints.data.count}
              hint="tile02_Jamunjhola"
            />
            <StatCard icon={Gauge} tone="hero" label="Validation AUC" value={regressionEstimate.data?.auc ?? "…"} hint="single XGBoost classifier" />

            {regressionEstimate.data && <RegressionCard data={regressionEstimate.data} />}

            <div className="panel">
              <div className="panel-eyebrow">
                <div className="chip teal">
                  <Search size={15} strokeWidth={2} />
                </div>
                <span className="label">Data forensics</span>
              </div>
              <ul className="space-y-2.5">
                {bullets.map((b) => (
                  <li key={b} className="flex gap-2.5 text-sm text-bone-dim">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ochre-bright" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <WhyPanel imageSrc={shapChart} />
          </div>
        </div>
      </div>
    </div>
  );
}
