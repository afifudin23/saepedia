import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { walletApi, addressApi, orderApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import DashboardShell from "../../components/DashboardShell";
import { BUYER_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { formatIDR, formatDate } from "../../lib/format";
import { statusBadgeClass } from "../../lib/status";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { cart } = useCart();
  const [wallet, setWallet] = useState({ balance: 0 });
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    walletApi.get(user.id).then(setWallet);
    addressApi.list(user.id).then(setAddresses);
    orderApi.myOrders(user.id).then(setOrders);
  }, [user.id]);

  const spending = orders.reduce((s, o) => s + o.total, 0);

  return (
    <DashboardShell title="Dashboard Buyer" subtitle="Dompet, keranjang, dan pesananmu." links={BUYER_LINKS}>
      <div className="stats">
        <div className="stat"><div className="label">💰 Saldo Dompet</div><div className="value text-sm">{formatIDR(wallet.balance)}</div></div>
        <div className="stat"><div className="label">🛒 Item di Keranjang</div><div className="value">{cart.count}</div></div>
        <div className="stat"><div className="label">📍 Alamat Tersimpan</div><div className="value">{addresses.length}</div></div>
        <div className="stat"><div className="label">📦 Total Pesanan</div><div className="value">{orders.length}</div></div>
      </div>

      <Card title="Ringkasan Pengeluaran">
        <div className="between">
          <span className="muted">Total dibelanjakan (semua pesanan)</span>
          <strong className="price">{formatIDR(spending)}</strong>
        </div>
      </Card>

      <Card title="Pesanan Terakhir" action={<Link to="/buyer/orders" className="nav-link">Lihat semua →</Link>}>
        {orders.length === 0 ? (
          <div className="empty">
            <div className="emoji">🛍️</div>
            Belum ada pesanan. <Link to="/products">Mulai belanja →</Link>
          </div>
        ) : (
          <div className="stack">
            {orders.slice(0, 3).map((o) => (
              <Link key={o.id} to={`/buyer/orders/${o.id}`} className="between" style={{ padding: "8px 0" }}>
                <div>
                  <div className="bold text-sm">{o.storeName}</div>
                  <div className="text-xs muted">{formatDate(o.createdAt)}</div>
                </div>
                <div className="row">
                  <span className={`badge ${statusBadgeClass(o.status)}`}>{o.status}</span>
                  <strong className="text-sm">{formatIDR(o.total)}</strong>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <div className="row">
        <Button as={Link} to="/buyer/wallet" variant="secondary">💰 Top-up Saldo</Button>
        <Button as={Link} to="/products">🛍️ Belanja</Button>
      </div>
    </DashboardShell>
  );
}
