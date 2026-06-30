import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import { ADMIN_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { DELIVERY_METHODS, formatIDR, formatDate } from "../../lib/format";

export default function AdminOverdue() {
  const [overdue, setOverdue] = useState([]);
  const [clock, setClock] = useState({ offsetDays: 0, nowIso: "" });
  const [msg, setMsg] = useState("");

  function load() {
    adminApi.overdueOrders().then(setOverdue);
    adminApi.clockInfo().then(setClock);
  }
  useEffect(load, []);

  async function simulate(days) {
    const res = await adminApi.simulateNextDay(days);
    setMsg(`Waktu maju ${days} hari. Dipindai ${res.scanned} pesanan, ${res.refunded} di-refund/return.`);
    load();
  }
  async function sweep() {
    const res = await adminApi.runOverdueSweep();
    setMsg(`Sweep dijalankan. Dipindai ${res.scanned}, ${res.refunded} di-refund/return.`);
    load();
  }

  return (
    <DashboardShell title="Overdue & Simulasi Waktu" subtitle="Tangani pesanan yang melewati SLA pengiriman." links={ADMIN_LINKS}>
      <Card title="⏰ Simulasi Waktu">
        <p className="text-sm muted mb-2">
          Waktu sistem saat ini (simulasi): <strong>{clock.nowIso ? formatDate(clock.nowIso) : "-"}</strong>
          {" "}(offset +{clock.offsetDays} hari).
        </p>
        <div className="row wrap">
          <Button onClick={() => simulate(1)}>⏭️ Maju 1 Hari + Auto Handle</Button>
          <Button variant="secondary" onClick={() => simulate(3)}>⏭️ Maju 3 Hari</Button>
          <Button variant="ghost" onClick={sweep}>🔄 Jalankan Sweep Sekarang</Button>
        </div>
        {msg && <div className="alert success mt-2">{msg}</div>}
      </Card>

      <Card title="📋 Aturan SLA & Overdue">
        <table className="table">
          <thead><tr><th>Metode</th><th>SLA</th><th>Aturan</th></tr></thead>
          <tbody>
            {DELIVERY_METHODS.map((m) => (
              <tr key={m.id}><td>{m.label}</td><td>{m.slaDays} hari</td>
                <td className="text-sm muted">Jika belum selesai setelah {m.slaDays} hari → auto refund + return</td></tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs muted mt-2">
          Overdue → dana dikembalikan ke dompet Buyer, stok dipulihkan, status menjadi
          <strong> Dikembalikan</strong>. Tercegah dari refund ganda. Pendapatan Seller
          tidak menghitung pesanan yang dikembalikan.
        </p>
      </Card>

      <Card title="Pesanan Overdue Saat Ini" className="full">
        {overdue.length === 0 ? (
          <div className="empty">Tidak ada pesanan overdue. Coba <strong>Maju 3 Hari</strong> untuk memunculkannya.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead><tr><th>Order</th><th>Status</th><th>Metode</th><th>Jatuh Tempo</th><th className="text-right">Total</th></tr></thead>
              <tbody>{overdue.map((o) => (
                <tr key={o.id}>
                  <td className="text-xs">{o.id}</td>
                  <td><span className="badge orange">{o.status}</span></td>
                  <td>{o.deliveryLabel}</td>
                  <td className="text-sm">{formatDate(o.dueAt)}</td>
                  <td className="text-right">{formatIDR(o.total)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
