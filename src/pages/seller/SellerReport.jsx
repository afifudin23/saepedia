import { useEffect, useState } from "react";
import { sellerApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import DashboardShell from "../../components/DashboardShell";
import { SELLER_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import { formatIDR, formatDate } from "../../lib/format";
import { statusBadgeClass } from "../../lib/status";

export default function SellerReport() {
  const { user } = useAuth();
  const [data, setData] = useState({ orders: [], totalIncome: 0, counts: {} });

  useEffect(() => {
    sellerApi.report(user.id).then(setData);
  }, [user.id]);

  return (
    <DashboardShell title="Laporan Pendapatan" subtitle="Ringkasan penjualan tokomu." links={SELLER_LINKS}>
      <div className="stats">
        <div className="stat"><div className="label">Pendapatan (selesai)</div><div className="value text-sm">{formatIDR(data.totalIncome)}</div></div>
        <div className="stat"><div className="label">Pesanan Selesai</div><div className="value">{data.counts.done || 0}</div></div>
        <div className="stat"><div className="label">Diproses/Dikirim</div><div className="value">{(data.counts.waiting || 0) + (data.counts.shipping || 0)}</div></div>
        <div className="stat"><div className="label">Dikembalikan</div><div className="value">{data.counts.returned || 0}</div></div>
      </div>

      <div className="alert info text-sm">
        Pendapatan dihitung dari <strong>(subtotal − diskon)</strong> pesanan yang
        sudah <strong>Pesanan Selesai</strong>. Pesanan yang dikembalikan/refund
        <strong> tidak dihitung</strong> sebagai pendapatan.
      </div>

      <Card title="Rincian Pesanan" className="full">
        {data.orders.length === 0 ? (
          <div className="empty">Belum ada pesanan.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th><th>Tanggal</th><th className="text-right">Subtotal</th>
                  <th className="text-right">Diskon</th><th className="text-right">Total</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id}>
                    <td className="text-xs">{o.id}</td>
                    <td className="text-sm">{formatDate(o.createdAt)}</td>
                    <td className="text-right">{formatIDR(o.subtotal)}</td>
                    <td className="text-right">{formatIDR(o.discount)}</td>
                    <td className="text-right bold">{formatIDR(o.total)}</td>
                    <td><span className={`badge ${statusBadgeClass(o.status)}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
