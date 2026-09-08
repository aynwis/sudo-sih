// Placeholder standing in for Dharti's real StatusBadge -- swap the import
// in Home.jsx once her component lands.
export default function StatusBadge({ status }) {
  if (!status) return null;
  const isOk = status === "ok" || status === "ready";
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full border ${
        isOk ? "text-teal-300 border-teal-700 bg-teal-950" : "text-amber-300 border-amber-700 bg-amber-950"
      }`}
    >
      {status}
    </span>
  );
}
