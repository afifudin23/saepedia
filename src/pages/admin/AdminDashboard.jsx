import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import { ADMIN_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import { formatIDR, formatDate } from "../../lib/format";
import { statusBadgeClass } from "../../lib/status";

const TABS = ["Pengguna", "Toko", "Produk", "Pesanan", "Diskon", "Pengiriman", "Overdue"];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("Pengguna");

  useEffect(() => {
    adminApi.monitoring().then(setData);
  }, []);

  if (!data) return <DashboardShell title="Monitoring" links={ADMIN_LINKS}><div className="empty">Memuat…</div></DashboardShell>;

  return (
    <DashboardShell title="Monitoring Marketplace" subtitle="Pantau seluruh aktivitas SEAPEDIA." links={ADMIN_LINKS}>
      <div className="stats">
        <div className="stat"><div className="label">Pengguna</div><div className="value">{data.users.length}</div></div>
        <div className="stat"><div className="label">Toko</div><div className="value">{data.stores.length}</div></div>
        <div className="stat"><div className="label">Produk</div><div className="value">{data.products.length}</div></div>
        <div className="stat"><div className="label">Pesanan</div><div className="value">{data.orders.length}</div></div>
        <div className="stat"><div className="label">Overdue</div><div className="value">{data.overdue.length}</div></div>
      </div>

      <div className="row wrap">
        {TABS.map((t) => (
          <button key={t} className={`nav-link ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <Card className="full">
        <div style={{ overflowX: "auto" }}>
          {tab === "Pengguna" && (
            <table className="table">
              <thead><tr><th>Username</th><th>Email</th><th>Role</th></tr></thead>
              <tbody>{data.users.map((u) => (
                <tr key={u.id}><td>{u.username}</td><td>{u.email}</td>
                  <td>{u.roles.map((r) => <span key={r} className="badge gray" style={{ marginRight: 4 }}>{r}</span>)}</td></tr>
              ))}</tbody>
            </table>
          )}
          {tab === "Toko" && (
            <table className="table">
              <thead><tr><th>Nama</th><th>Deskripsi</th></tr></thead>
              <tbody>{data.stores.map((s) => <tr key={s.id}><td>{s.name}</td><td className="muted text-sm">{s.description}</td></tr>)}</tbody>
            </table>
          )}
          {tab === "Produk" && (
            <table className="table">
              <thead><tr><th>Produk</th><th className="text-right">Harga</th><th className="text-right">Stok</th></tr></thead>
              <tbody>{data.products.map((p) => <tr key={p.id}><td>{p.emoji} {p.name}</td><td className="text-right">{formatIDR(p.price)}</td><td className="text-right">{p.stock}</td></tr>)}</tbody>
            </table>
          )}
          {tab === "Pesanan" && (
            <table className="table">
              <thead><tr><th>Order</th><th>Tanggal</th><th className="text-right">Total</th><th>Status</th></tr></thead>
              <tbody>{data.orders.map((o) => <tr key={o.id}><td className="text-xs">{o.id}</td><td className="text-sm">{formatDate(o.createdAt)}</td><td className="text-right">{formatIDR(o.total)}</td><td><span className={`badge ${statusBadgeClass(o.status)}`}>{o.status}</span></td></tr>)}</tbody>
            </table>
          )}
          {tab === "Diskon" && (
            <>
              <div className="bold mb-2">Voucher</div>
              <table className="table mb-2">
                <thead><tr><th>Kode</th><th>Tipe</th><th>Nilai</th><th>Kuota</th><th>Kedaluwarsa</th></tr></thead>
                <tbody>{data.vouchers.map((v) => <tr key={v.id}><td>{v.code}</td><td>{v.discountType}</td><td>{v.discountType === "percent" ? v.value + "%" : formatIDR(v.value)}</td><td>{v.used}/{v.maxUsage}</td><td className="text-sm">{formatDate(v.expiry)}</td></tr>)}</tbody>
              </table>
              <div className="bold mb-2">Promo</div>
              <table className="table">
                <thead><tr><th>Kode</th><th>Tipe</th><th>Nilai</th><th>Kedaluwarsa</th></tr></thead>
                <tbody>{data.promos.map((p) => <tr key={p.id}><td>{p.code}</td><td>{p.discountType}</td><td>{p.discountType === "percent" ? p.value + "%" : formatIDR(p.value)}</td><td className="text-sm">{formatDate(p.expiry)}</td></tr>)}</tbody>
              </table>
            </>
          )}
          {tab === "Pengiriman" && (
            <table className="table">
              <thead><tr><th>Order</th><th>Toko</th><th>Status</th><th>Driver</th></tr></thead>
              <tbody>{data.deliveries.length === 0 ? <tr><td colSpan={4} className="muted">Belum ada pengiriman.</td></tr> :
                data.deliveries.map((d) => <tr key={d.id}><td className="text-xs">{d.id}</td><td>{d.storeName}</td><td><span className={`badge ${statusBadgeClass(d.status)}`}>{d.status}</span></td><td className="text-sm">{d.driverId || "—"}</td></tr>)}</tbody>
            </table>
          )}
          {tab === "Overdue" && (
            <table className="table">
              <thead><tr><th>Order</th><th>Status</th><th>Jatuh Tempo</th><th className="text-right">Total</th></tr></thead>
              <tbody>{data.overdue.length === 0 ? <tr><td colSpan={4} className="muted">Tidak ada pesanan overdue. Coba simulasi waktu di menu Overdue & Simulasi.</td></tr> :
                data.overdue.map((o) => <tr key={o.id}><td className="text-xs">{o.id}</td><td><span className="badge red">{o.status}</span></td><td className="text-sm">{formatDate(o.dueAt)}</td><td className="text-right">{formatIDR(o.total)}</td></tr>)}</tbody>
            </table>
          )}
        </div>
      </Card>
    </DashboardShell>
  );
}
