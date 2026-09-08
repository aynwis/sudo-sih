import { TrendingUp } from "lucide-react";

// Placeholder standing in for Dharti's real RegressionCard -- swap the
// import in Home.jsx once her component lands.
export default function RegressionCard({ data }) {
  return (
    <div className="panel">
      <div className="panel-eyebrow">
        <div className="chip teal">
          <TrendingUp size={15} strokeWidth={2} />
        </div>
        <span className="label">Grade regression estimate</span>
      </div>
      <pre className="text-xs text-bone-dim whitespace-pre-wrap font-sans leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
