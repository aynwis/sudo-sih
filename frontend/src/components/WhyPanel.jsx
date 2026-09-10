import { Sparkles } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Precomputed model-level SHAP summary used by the demo. It is not a
// per-pixel explanation for the deterministic raster surface.
const SHAP_DATA = [
  { feature: "Fe-oxide ratio", value: 0.31 },
  { feature: "SAR roughness (VV)", value: 0.24 },
  { feature: "Elevation", value: 0.19 },
  { feature: "Hydroxyl ratio", value: 0.14 },
  { feature: "NDVI", value: 0.08 },
  { feature: "Slope", value: 0.04 },
];

function ShapTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-basalt-2 px-3 py-2 text-xs text-bone shadow-lg">
      <div className="font-medium">{payload[0].payload.feature}</div>
      <div className="text-bone-dim">mean |SHAP| {payload[0].value.toFixed(2)}</div>
    </div>
  );
}

export default function WhyPanel() {
  return (
    <div className="panel">
      <div className="panel-eyebrow">
        <div className="chip ochre">
          <Sparkles size={15} strokeWidth={2} />
        </div>
        <span className="label">What drives the model</span>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={SHAP_DATA} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
            <CartesianGrid horizontal={false} stroke="rgba(237,231,218,0.08)" />
            <XAxis
              type="number"
              domain={[0, 0.35]}
              tick={{ fill: "#c9c0ac", fontSize: 11 }}
              axisLine={{ stroke: "rgba(237,231,218,0.14)" }}
              tickLine={false}
              label={{ value: "mean |SHAP value|", position: "insideBottom", offset: -4, fill: "#c9c0ac", fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="feature"
              width={130}
              tick={{ fill: "#ede7da", fontSize: 12 }}
              axisLine={{ stroke: "rgba(237,231,218,0.14)" }}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: "rgba(237,231,218,0.04)" }} content={<ShapTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {SHAP_DATA.map((d) => (
                <Cell key={d.feature} fill={d.feature === "Fe-oxide ratio" ? "#d89344" : "#b8752e"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-bone-dim">
        Precomputed model-level SHAP summary; the demo raster is not a live per-pixel explanation.
      </p>
    </div>
  );
}
