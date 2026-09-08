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

export default function Home() {
  const probImage = useProbabilityImage("/api/raster/probability.png");
  const validationPoints = useValidationPoints();
  const regressionEstimate = useRegressionEstimate();

  const bullets = forensicsBullets(143, 231, 380, 88);

  return (
    <div id="dashboard" className="min-h-screen bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-ink">MnSight Dashboard</h1>
            <p className="mt-1 text-sm text-ink-soft">Live prospectivity model — tile02_Jamunjhola, Maharashtra</p>
          </div>
          <StatusBadge status={regressionEstimate.data?.status} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={Database} tone="teal" label="Ground-truth points" value={143} hint="USGS MRDS, deduplicated" />
          <StatCard
            icon={MapPin}
            tone="teal"
            label="Validation set"
            value={validationPoints.isLoading ? "…" : validationPoints.isError ? "—" : validationPoints.data.count}
            hint="tile02_Jamunjhola"
          />
          <StatCard icon={Gauge} tone="hero" label="Validation AUC" value={regressionEstimate.data?.auc ?? "…"} hint="single XGBoost classifier" />
        </div>

        {probImage.status === "loading" && (
          <p className="flex items-center gap-2 rounded-2xl border border-line bg-white p-5 text-sm text-ink-soft">
            <Loader2 size={14} className="animate-spin" /> Loading probability surface…
          </p>
        )}
        {probImage.status === "error" && (
          <p className="rounded-2xl border border-line bg-white p-5 text-sm text-rose">Couldn't load raster: {probImage.error}</p>
        )}
        {probImage.status === "success" && (
          <ProspectivityHeatmap
            probabilityImageUrl={probImage.url}
            bounds={TILE02_BOUNDS}
            groundTruthSites={validationPoints.data?.sites ?? []}
          />
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {regressionEstimate.data && <RegressionCard data={regressionEstimate.data} />}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm shadow-black/[0.03]">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-soft text-teal">
                <Search size={16} strokeWidth={2} />
              </div>
              <div className="text-sm font-medium text-ink">Data forensics</div>
            </div>
            <ul className="space-y-2.5">
              {bullets.map((b) => (
                <li key={b} className="flex gap-2.5 text-sm text-ink-soft">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ochre-bright" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WhyPanel imageSrc={shapChart} />
        </div>
      </div>
    </div>
  );
}
