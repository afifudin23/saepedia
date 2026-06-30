import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import DashboardShell from "../../components/DashboardShell";
import { BUYER_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import PriceBreakdown from "../../components/PriceBreakdown";
import OrderTimeline from "../../components/OrderTimeline";
import { formatIDR, formatDate } from "../../lib/format";
import { statusBadgeClass } from "../../lib/status";

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    orderApi.get(user.id, id).then(setOrder).catch((e) => setError(e.message));
  }, [user.id, id]);

  if (error)
    return (
      <DashboardShell title="Detail Pesanan" links={BUYER_LINKS}>
        <div className="empty">{error}</div>
      </DashboardShell>
    );
  if (!order)
    return (
      <DashboardShell title="Detail Pesanan" links={BUYER_LINKS}>
        <div className="empty">Memuat…</div>
      </DashboardShell>
    );

  return (
    <DashboardShell
      title="Detail Pesanan"
      subtitle={<Link to="/buyer/orders" className="nav-link">← Kembali ke daftar</Link>}
      links={BUYER_LINKS}
    >
      <Card>
        <div className="between">
          <div>
            <div className="bold">🏪 {order.storeName}</div>
            <div className="text-xs muted">{order.id} · {formatDate(order.createdAt)}</div>
          </div>
          <span className={`badge ${statusBadgeClass(order.status)}`}>{order.status}</span>
        </div>
      </Card>

      <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr", alignItems: "start" }}>
        <div className="stack">
          <Card title="Item Pesanan">
            <div className="stack" style={{ gap: 8 }}>
              {order.items.map((it) => (
                <div key={it.productId} className="between text-sm">
                  <span>{it.emoji} {it.name} × {it.qty}</span>
                  <span>{formatIDR(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Alamat & Pengiriman">
            <div className="text-sm">
              <div className="bold">{order.address.label} · {order.address.recipient}</div>
              <div className="muted">{order.address.phone}</div>
              <div className="muted">{order.address.full}</div>
              <div className="mt-1">Metode: <strong>{order.deliveryLabel}</strong></div>
            </div>
          </Card>
        </div>

        <div className="stack">
          <Card title="Rincian Pembayaran">
            <PriceBreakdown
              subtotal={order.subtotal}
              discount={order.discount}
              deliveryFee={order.deliveryFee}
              ppn={order.ppn}
              total={order.total}
            />
          </Card>

          <Card title="Status Pesanan">
            <OrderTimeline order={order} />
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
