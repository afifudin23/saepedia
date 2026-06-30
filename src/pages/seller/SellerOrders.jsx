import { useEffect, useState } from "react";
import { sellerApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import DashboardShell from "../../components/DashboardShell";
import { SELLER_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import OrderTimeline from "../../components/OrderTimeline";
import { formatIDR, formatDate } from "../../lib/format";
import { statusBadgeClass, ORDER_STATUS } from "../../lib/status";

export default function SellerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [msg, setMsg] = useState("");

  function load() {
    sellerApi.incomingOrders(user.id).then(setOrders);
  }
  useEffect(load, [user.id]);

  async function process(id) {
    setMsg("");
    try {
      await sellerApi.processOrder(user.id, id);
      setMsg("Pesanan diproses. Sekarang menunggu pengirim.");
      load();
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <DashboardShell title="Pesanan Masuk" subtitle="Proses pesanan agar siap diambil driver." links={SELLER_LINKS}>
      <div className="alert info text-sm">
        Pesanan baru berstatus <strong>Sedang Dikemas</strong>. Klik
        <strong> Proses Pesanan</strong> untuk memindahkannya ke
        <strong> Menunggu Pengirim</strong> agar bisa diambil driver (Level 5).
      </div>
      {msg && <div className="alert success">{msg}</div>}

      {orders.length === 0 ? (
        <div className="empty"><div className="emoji">📥</div>Belum ada pesanan masuk.</div>
      ) : (
        <div className="stack">
          {orders.map((o) => (
            <Card key={o.id}>
              <div className="between">
                <div>
                  <div className="bold text-sm">{o.id}</div>
                  <div className="text-xs muted">{formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.qty, 0)} item · {o.deliveryLabel}</div>
                </div>
                <div className="row">
                  <span className={`badge ${statusBadgeClass(o.status)}`}>{o.status}</span>
                  <strong className="text-sm">{formatIDR(o.total)}</strong>
                </div>
              </div>

              <div className="row mt-2">
                {o.status === ORDER_STATUS.PACKING && (
                  <Button size="sm" onClick={() => process(o.id)}>✅ Proses Pesanan</Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setOpenId(openId === o.id ? null : o.id)}>
                  {openId === o.id ? "Tutup detail" : "Lihat detail"}
                </Button>
              </div>

              {openId === o.id && (
                <div className="grid mt-2" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
                  <div>
                    <div className="bold text-sm mb-2">Item</div>
                    <div className="stack" style={{ gap: 6 }}>
                      {o.items.map((it) => (
                        <div key={it.productId} className="between text-sm">
                          <span>{it.emoji} {it.name} × {it.qty}</span>
                          <span>{formatIDR(it.price * it.qty)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs muted mt-2">
                      Penerima: {o.address.recipient} · {o.address.full}
                    </div>
                  </div>
                  <div>
                    <div className="bold text-sm mb-2">Status</div>
                    <OrderTimeline order={o} />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
