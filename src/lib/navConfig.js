// Sidebar link sets for each role's private dashboard.
export const BUYER_LINKS = [
  { to: "/buyer", label: "Ringkasan", icon: "📊", end: true },
  { to: "/buyer/wallet", label: "Dompet & Top-up", icon: "💰" },
  { to: "/buyer/addresses", label: "Alamat", icon: "📍" },
  { to: "/buyer/cart", label: "Keranjang", icon: "🛒" },
  { to: "/buyer/orders", label: "Pesanan Saya", icon: "📦" },
  { to: "/buyer/report", label: "Laporan Belanja", icon: "🧾" },
];

export const SELLER_LINKS = [
  { to: "/seller", label: "Ringkasan", icon: "📊", end: true },
  { to: "/seller/store", label: "Profil Toko", icon: "🏪" },
  { to: "/seller/products", label: "Produk", icon: "📦" },
  { to: "/seller/orders", label: "Pesanan Masuk", icon: "📥" },
  { to: "/seller/report", label: "Laporan Pendapatan", icon: "🧾" },
];

export const DRIVER_LINKS = [
  { to: "/driver", label: "Ringkasan", icon: "📊", end: true },
  { to: "/driver/jobs", label: "Cari Job", icon: "🔍" },
];

export const ADMIN_LINKS = [
  { to: "/admin", label: "Monitoring", icon: "📊", end: true },
  { to: "/admin/discounts", label: "Voucher & Promo", icon: "🎟️" },
  { to: "/admin/overdue", label: "Overdue & Simulasi", icon: "⏰" },
];
