import { Database, Gauge, Loader2, MapPin, Search } from "lucide-react";

import ProspectivityHeatmap from "../components/ProspectivityHeatmap";
import RegressionCard from "../components/RegressionCard";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import WhyPanel from "../components/WhyPanel";

import { useProbabilityImage } from "../hooks/useProbabilityImage";
import {
  useRegressionEstimate,
  useValidationPoints,
} from "../hooks/useBackend";

import { forensicsBullets } from "../lib/forensicsBullets";
import "../styles/intro.css";

export default function Home() {
  const probImage = useProbabilityImage("tile02_jamunjhola");
  const validationPoints = useValidationPoints();
  const regressionEstimate = useRegressionEstimate();

  const bullets = forensicsBullets(143, 231, 380, 88);

  return (
    <div
      id="dashboard"
      className="intro-root px-6 pt-2 pb-8 sm:px-10"
      style={{ scrollMarginTop: 62 }}
    >
      <div className="mx-auto max-w-[1800px] space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="strata-index !mb-2">
              07 — the live model
            </div>

            <h1 className="font-display text-2xl text-bone">
              Everything above, running for real.
            </h1>

            <p className="mt-1 text-sm text-bone-dim">
              tile02_Jamunjhola, Maharashtra — updates as the pipeline runs
            </p>
          </div>

          <StatusBadge status={regressionEstimate.data?.status} />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_720px] lg:items-start">
          {/* Map */}
          <div>
            {probImage.status === "loading" && (
              <p className="panel flex items-center gap-2 text-sm text-bone-dim">
                <Loader2 size={14} className="animate-spin" />
                Loading probability surface…
              </p>
            )}

            {probImage.status === "error" && (
              <p className="panel text-sm text-rose-400">
                Couldn't load raster: {probImage.error}
              </p>
            )}

            {probImage.status === "success" && (
              <ProspectivityHeatmap
                probabilityImageUrl={probImage.url}
                bounds={probImage.bounds}
                rasterSource={probImage.source}
                groundTruthSites={validationPoints.data?.sites ?? []}
                height={650}
              />
            )}
          </div>

          {/* Data panel */}
          <div className="space-y-3">
            {/* Statistics */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <StatCard
                icon={Database}
                tone="teal"
                label="Ground-truth points"
                value={143}
                hint="USGS MRDS, deduplicated"
              />

              <StatCard
                icon={MapPin}
                tone="teal"
                label="Ground-truth feed"
                value={
                  validationPoints.isLoading
                    ? "…"
                    : validationPoints.isError
                      ? "—"
                      : validationPoints.data.count
                }
                hint="231 source rows · 143 verified clusters"
              />

              <StatCard
                icon={Gauge}
                tone="hero"
                label="Grade regression R²"
                value={regressionEstimate.data?.gradeR2 ?? "…"}
                hint="XGBoost, held-out validation"
              />
            </div>

            {/* Regression + Forensics */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {regressionEstimate.data && (
                <RegressionCard data={regressionEstimate.data} />
              )}

              <div className="panel">
                <div className="panel-eyebrow">
                  <div className="chip teal">
                    <Search size={15} strokeWidth={2} />
                  </div>

                  <span className="label">Data forensics</span>
                </div>

                <ul className="space-y-2">
                  {bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex gap-2.5 text-xs text-bone-dim"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ochre-bright" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Explanation */}
            <WhyPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
