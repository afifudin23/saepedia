import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import DashboardShell from "../../components/DashboardShell";
import { BUYER_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import { formatIDR, formatDate } from "../../lib/format";
import { statusBadgeClass } from "../../lib/status";

export default function BuyerReport() {
  const { user } = useAuth();
  const [data, setData] = useState({ orders: [], totalSpent: 0, totalRefunded: 0, counts: {} });

  useEffect(() => {
    orderApi.report(user.id).then(setData);
  }, [user.id]);

  return (
    <DashboardShell title="Laporan Belanja" subtitle="Ringkasan pengeluaranmu." links={BUYER_LINKS}>
      <div className="stats">
        <div className="stat"><div className="label">Total Belanja</div><div className="value text-sm">{formatIDR(data.totalSpent)}</div></div>
        <div className="stat"><div className="label">Total Dikembalikan</div><div className="value text-sm">{formatIDR(data.totalRefunded)}</div></div>
        <div className="stat"><div className="label">Pesanan Selesai</div><div className="value">{data.counts.done || 0}</div></div>
        <div className="stat"><div className="label">Total Pesanan</div><div className="value">{data.counts.total || 0}</div></div>
      </div>

      <Card title="Rincian Transaksi" className="full">
        {data.orders.length === 0 ? (
          <div className="empty">Belum ada transaksi.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th><th>Tanggal</th><th className="text-right">Subtotal</th>
                  <th className="text-right">Diskon</th><th className="text-right">Ongkir</th>
                  <th className="text-right">PPN</th><th className="text-right">Total</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id}>
                    <td className="text-xs"><Link to={`/buyer/orders/${o.id}`}>{o.id}</Link></td>
                    <td className="text-sm">{formatDate(o.createdAt)}</td>
                    <td className="text-right">{formatIDR(o.subtotal)}</td>
                    <td className="text-right">{formatIDR(o.discount)}</td>
                    <td className="text-right">{formatIDR(o.deliveryFee)}</td>
                    <td className="text-right">{formatIDR(o.ppn)}</td>
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
