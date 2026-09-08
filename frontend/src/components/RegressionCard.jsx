import { TrendingUp } from "lucide-react";

// Placeholder standing in for Dharti's real RegressionCard -- swap the
// import in Home.jsx once her component lands.
export default function RegressionCard({ data }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm shadow-black/[0.03]">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-soft text-teal">
          <TrendingUp size={16} strokeWidth={2} />
        </div>
        <div className="text-sm font-medium text-ink">Grade regression estimate</div>
      </div>
      <div className="rounded-xl bg-paper-2 p-3">
        <pre className="text-xs text-ink-soft whitespace-pre-wrap font-sans">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
