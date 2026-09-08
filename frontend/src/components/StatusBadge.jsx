// Placeholder standing in for Dharti's real StatusBadge -- swap the import
// in Home.jsx once her component lands.
export default function StatusBadge({ status }) {
  if (!status) return null;
  const isOk = status === "ok" || status === "ready";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        isOk ? "bg-teal-soft text-teal" : "bg-ochre-soft text-ochre"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isOk ? "bg-teal-bright" : "bg-ochre-bright"}`} />
      {status}
    </span>
  );
}
