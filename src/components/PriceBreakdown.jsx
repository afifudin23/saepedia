import { formatIDR, PPN_RATE } from "../lib/format";

// Reusable checkout summary: subtotal, discount, delivery fee, PPN 12%, total.
export default function PriceBreakdown({ subtotal, discount = 0, deliveryFee = 0, ppn, total }) {
  return (
    <div className="stack" style={{ gap: 8 }}>
      <Row label="Subtotal" value={subtotal} />
      <Row label="Diskon" value={-discount} />
      <Row label="Ongkos Kirim" value={deliveryFee} />
      <Row label={`PPN ${Math.round(PPN_RATE * 100)}%`} value={ppn} />
      <div className="dropdown-divider" />
      <div className="between">
        <strong>Total</strong>
        <strong className="price" style={{ fontSize: "1.15rem" }}>{formatIDR(total)}</strong>
      </div>
    </div>
  );
}

function Row({ label, value, hint }) {
  return (
    <div className="between">
      <span className="muted">
        {label}
        {hint && <span className="text-xs"> ({hint})</span>}
      </span>
      <span>{value < 0 ? `- ${formatIDR(-value)}` : formatIDR(value)}</span>
    </div>
  );
}
