import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import DashboardShell from "../../components/DashboardShell";
import { BUYER_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import { formatIDR, formatDate } from "../../lib/format";
import { statusBadgeClass } from "../../lib/status";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    orderApi.myOrders(user.id).then(setOrders);
  }, [user.id]);

  return (
    <DashboardShell title="Pesanan Saya" subtitle="Riwayat dan status pesanan." links={BUYER_LINKS}>
      {orders.length === 0 ? (
        <div className="empty">
          <div className="emoji">📦</div>
          Belum ada pesanan. <Link to="/products">Mulai belanja →</Link>
        </div>
      ) : (
        <div className="stack">
          {orders.map((o) => (
            <Link key={o.id} to={`/buyer/orders/${o.id}`}>
              <Card>
                <div className="between">
                  <div>
                    <div className="bold">🏪 {o.storeName}</div>
                    <div className="text-xs muted">{o.id} · {formatDate(o.createdAt)}</div>
                  </div>
                  <span className={`badge ${statusBadgeClass(o.status)}`}>{o.status}</span>
                </div>
                <div className="between mt-2 text-sm">
                  <span className="muted">
                    {o.items.reduce((n, i) => n + i.qty, 0)} item · {o.deliveryLabel}
                  </span>
                  <strong className="price">{formatIDR(o.total)}</strong>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
