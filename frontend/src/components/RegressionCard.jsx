// Placeholder standing in for Dharti's real RegressionCard -- swap the
// import in Home.jsx once her component lands.
export default function RegressionCard({ data }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
      <div className="text-slate-400 mb-2">Grade regression estimate</div>
      <pre className="text-xs text-slate-500 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
