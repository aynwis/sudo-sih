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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">MnSight Dashboard</h1>
        <StatusBadge status={regressionEstimate.data?.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Ground-truth points" value={143} hint="USGS MRDS, deduplicated" />
        <StatCard
          label="Validation set"
          value={validationPoints.isLoading ? "…" : validationPoints.isError ? "—" : validationPoints.data.count}
          hint="tile02_Jamunjhola"
        />
        <StatCard label="Validation AUC" value={regressionEstimate.data?.auc ?? "…"} />
      </div>

      {probImage.status === "loading" && <p className="text-sm text-slate-500">Loading probability surface…</p>}
      {probImage.status === "error" && <p className="text-sm text-rose-400">Couldn't load raster: {probImage.error}</p>}
      {probImage.status === "success" && (
        <ProspectivityHeatmap
          probabilityImageUrl={probImage.url}
          bounds={TILE02_BOUNDS}
          groundTruthSites={validationPoints.data?.sites ?? []}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {regressionEstimate.data && <RegressionCard data={regressionEstimate.data} />}
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="text-sm text-slate-400 mb-2">Data forensics</div>
          <ul className="text-sm text-slate-300 space-y-1.5 list-disc list-inside">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WhyPanel imageSrc={shapChart} />
      </div>
    </div>
  );
}
