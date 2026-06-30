// Currency, date and tax/delivery constants + helpers.
// Business rules (per SEAPEDIA spec) are centralised here so the same
// numbers are used in the UI and can later be mirrored by the backend.

export const PPN_RATE = 0.12; // PPN 12%

// Delivery methods (id/fee/SLA selaras dengan backend SEAPEDIA API).
// slaDays = batas waktu penyelesaian sebelum pesanan dianggap overdue (Level 6).
export const DELIVERY_METHODS = [
  { id: "instant", label: "Instant", fee: 20000, eta: "± 1 jam", slaDays: 1 },
  { id: "next_day", label: "Next Day", fee: 10000, eta: "1 hari", slaDays: 2 },
  { id: "regular", label: "Regular", fee: 5000, eta: "2-3 hari", slaDays: 3 },
];

// Driver earning rule (Level 5): driver memperoleh 80% dari ongkos kirim.
export const DRIVER_EARNING_RATE = 0.8;
export function driverEarning(deliveryFee) {
  return Math.round((Number(deliveryFee) || 0) * DRIVER_EARNING_RATE);
}

export function getDeliveryMethod(id) {
  return DELIVERY_METHODS.find((m) => m.id === id) || DELIVERY_METHODS[2];
}

export function formatIDR(value) {
  const n = Number(value) || 0;
  return "Rp" + n.toLocaleString("id-ID");
}

export function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Checkout calculation — single source of truth.
// PPN is calculated on (subtotal - discount), and documented in the README.
export function calcCheckout({ subtotal, discount = 0, deliveryFee = 0 }) {
  const taxable = Math.max(0, subtotal - discount);
  const ppn = Math.round(taxable * PPN_RATE);
  const total = taxable + deliveryFee + ppn;
  return { subtotal, discount, deliveryFee, ppn, total };
}
