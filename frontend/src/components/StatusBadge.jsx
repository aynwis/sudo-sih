// Placeholder standing in for Dharti's real StatusBadge -- swap the import
// in Home.jsx once her component lands.
export default function StatusBadge({ status }) {
  if (!status) return null;
  const isOk = status === "ok" || status === "ready";
  return (
    <span className={`pill-badge ${isOk ? "ok" : "pending"}`}>
      <span className="dot" />
      {status}
    </span>
  );
}
