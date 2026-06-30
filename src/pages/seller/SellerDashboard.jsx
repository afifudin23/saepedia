import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sellerApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import DashboardShell from "../../components/DashboardShell";
import { SELLER_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { formatIDR } from "../../lib/format";
import { ORDER_STATUS } from "../../lib/status";

export default function SellerDashboard() {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    sellerApi.myStore(user.id).then(setStore);
    sellerApi.myProducts(user.id).then(setProducts);
    sellerApi.incomingOrders(user.id).then(setOrders);
  }, [user.id]);

  // Seller income = sum of completed orders' subtotal (simple rule; refined later).
  const income = orders
    .filter((o) => o.status === ORDER_STATUS.DONE)
    .reduce((s, o) => s + o.subtotal, 0);
  const newOrders = orders.filter((o) => o.status === ORDER_STATUS.PACKING).length;

  return (
    <DashboardShell title="Dashboard Seller" subtitle="Kelola toko dan produkmu." links={SELLER_LINKS}>
      {!store && (
        <div className="alert warn">
          Kamu belum punya toko.{" "}
          <Link to="/seller/store"><strong>Buat toko sekarang →</strong></Link>
        </div>
      )}

      <div className="stats">
        <div className="stat"><div className="label">Toko</div><div className="value text-sm">{store?.name || "Belum ada"}</div></div>
        <div className="stat"><div className="label">Total Produk</div><div className="value">{products.length}</div></div>
        <div className="stat"><div className="label">Pesanan Baru</div><div className="value">{newOrders}</div></div>
        <div className="stat"><div className="label">Pendapatan (selesai)</div><div className="value text-sm">{formatIDR(income)}</div></div>
      </div>

      <Card title="Aksi Cepat">
        <div className="row wrap">
          <Button as={Link} to="/seller/store" variant="secondary">🏪 Profil Toko</Button>
          <Button as={Link} to="/seller/products">📦 Kelola Produk</Button>
          <Button as={Link} to="/seller/orders" variant="secondary">📥 Pesanan Masuk</Button>
        </div>
      </Card>
    </DashboardShell>
  );
}
