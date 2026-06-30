// Main order lifecycle statuses (must stay visible across the app).
export const ORDER_STATUS = {
  PACKING: "Sedang Dikemas",
  WAITING_DRIVER: "Menunggu Pengirim",
  SHIPPING: "Sedang Dikirim",
  DONE: "Pesanan Selesai",
  RETURNED: "Dikembalikan",
};

// Order of the main lifecycle, used by the timeline / status tracker.
export const ORDER_FLOW = [
  ORDER_STATUS.PACKING,
  ORDER_STATUS.WAITING_DRIVER,
  ORDER_STATUS.SHIPPING,
  ORDER_STATUS.DONE,
];

export function statusBadgeClass(status) {
  switch (status) {
    case ORDER_STATUS.PACKING:
      return "orange";
    case ORDER_STATUS.WAITING_DRIVER:
      return "blue";
    case ORDER_STATUS.SHIPPING:
      return "blue";
    case ORDER_STATUS.DONE:
      return "green";
    case ORDER_STATUS.RETURNED:
      return "red";
    default:
      return "gray";
  }
}
