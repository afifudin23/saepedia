import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import DashboardShell from "../../components/DashboardShell";
import { BUYER_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { formatIDR } from "../../lib/format";

export default function Cart() {
  const { cart, updateQty, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <DashboardShell title="Keranjang" subtitle="Satu keranjang hanya untuk satu toko." links={BUYER_LINKS}>
      {/* Single-store rule explained in the UI (spec requirement). */}
      <div className="alert info text-sm">
        ℹ️ <strong>Aturan satu toko:</strong> keranjang hanya boleh berisi produk
        dari satu toko. Untuk belanja dari toko lain, kosongkan keranjang terlebih
        dahulu.
      </div>

      {cart.items.length === 0 ? (
        <div className="empty">
          <div className="emoji">🛒</div>
          Keranjang kosong. <Link to="/products">Cari produk →</Link>
        </div>
      ) : (
        <>
          <Card title={`🏪 ${cart.store?.name || "Toko"}`} action={
            <Button size="sm" variant="ghost" onClick={clearCart}>Kosongkan</Button>
          }>
            <div className="stack">
              {cart.items.map((it) => (
                <div key={it.productId} className="between" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: 12 }}>
                  <div className="row">
                    <span style={{ fontSize: "1.8rem" }}>{it.emoji}</span>
                    <div>
                      <div className="bold text-sm">{it.name}</div>
                      <div className="price text-sm">{formatIDR(it.price)}</div>
                      <div className="text-xs muted">Stok: {it.stock}</div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="row" style={{ gap: 4 }}>
                      <Button size="sm" variant="secondary" onClick={() => updateQty(it.productId, it.qty - 1)}>−</Button>
                      <span style={{ minWidth: 28, textAlign: "center" }}>{it.qty}</span>
                      <Button size="sm" variant="secondary" disabled={it.qty >= it.stock} onClick={() => updateQty(it.productId, it.qty + 1)}>＋</Button>
                    </div>
                    <strong className="text-sm" style={{ minWidth: 90, textAlign: "right" }}>
                      {formatIDR(it.price * it.qty)}
                    </strong>
                    <Button size="sm" variant="danger" onClick={() => removeItem(it.productId)}>🗑</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="between">
              <span className="muted">Subtotal ({cart.count} item)</span>
              <strong className="price" style={{ fontSize: "1.2rem" }}>{formatIDR(cart.subtotal)}</strong>
            </div>
            <Button block className="mt-2" onClick={() => navigate("/buyer/checkout")}>
              Lanjut ke Checkout →
            </Button>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
