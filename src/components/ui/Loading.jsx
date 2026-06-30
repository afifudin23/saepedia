// Reusable loading indicator with an optional label.
export default function Loading({ label = "Memuat…" }) {
  return (
    <div className="empty">
      <div className="spinner" />
      <p className="mt-2 muted text-sm">{label}</p>
    </div>
  );
}
