import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { walletApi, addressApi, orderApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import DashboardShell from "../../components/DashboardShell";
import { BUYER_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PriceBreakdown from "../../components/PriceBreakdown";
import { DELIVERY_METHODS, formatIDR } from "../../lib/format";

export default function Checkout() {
  const { user } = useAuth();
  const { cart, refresh } = useCart();
  const navigate = useNavigate();

  const [wallet, setWallet] = useState({ balance: 0 });
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [method, setMethod] = useState("regular");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Discount (backend: only ONE code per checkout — voucher OR promo).
  const [codeInput, setCodeInput] = useState("");
  const [code, setCode] = useState("");
  const [codeMsg, setCodeMsg] = useState("");
  const [totals, setTotals] = useState({ subtotal: cart.subtotal, discount: 0, deliveryFee: 0, ppn: 0, total: 0 });

  useEffect(() => {
    walletApi.get(user.id).then(setWallet);
    addressApi.list(user.id).then((list) => {
      setAddresses(list);
      const def = list.find((a) => a.isDefault) || list[0];
      if (def) setAddressId(def.id);
    });
  }, [user.id]);

  // Totals are computed by the backend (preview) so PPN/discount match exactly.
  const loadPreview = useCallback(
    async (activeCode) => {
      try {
        const t = await orderApi.preview(user.id, { deliveryMethod: method, code: activeCode });
        setTotals(t);
        return t;
      } catch (e) {
        // Invalid code -> show message and fall back to totals without code.
        if (activeCode) {
          setCodeMsg(e.message);
          setCode("");
          const t = await orderApi.preview(user.id, { deliveryMethod: method, code: "" });
          setTotals(t);
        }
        return null;
      }
    },
    [user.id, method]
  );

  useEffect(() => {
    if (cart.items.length) loadPreview(code);
  }, [cart.items.length, method, code, loadPreview]);

  async function applyCode() {
    const c = codeInput.trim().toUpperCase();
    if (!c) return;
    setCodeMsg("");
    const t = await loadPreview(c);
    if (t) {
      setCode(c);
      setCodeInput("");
    }
  }
  function removeCode() {
    setCode("");
    setCodeMsg("");
  }

  const insufficient = wallet.balance < totals.total;

  async function confirm() {
    setError("");
    if (!addressId) {
      setError("Pilih alamat pengiriman terlebih dahulu.");
      return;
    }
    setBusy(true);
    try {
      const order = await orderApi.checkout(user.id, { deliveryMethod: method, addressId, code });
      await refresh();
      navigate(`/buyer/orders/${order.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <DashboardShell title="Checkout" links={BUYER_LINKS}>
        <div className="empty">
          <div className="emoji">🛒</div>
          Keranjang kosong. <Link to="/products">Belanja dulu →</Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Checkout" subtitle={`Pesanan dari ${cart.store?.name}`} links={BUYER_LINKS}>
      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", alignItems: "start" }}>
        <div className="stack">
          {/* Address */}
          <Card title="📍 Alamat Pengiriman">
            {addresses.length === 0 ? (
              <div className="alert warn">
                Belum ada alamat. <Link to="/buyer/addresses"><strong>Tambah alamat →</strong></Link>
              </div>
            ) : (
              <div className="stack">
                {addresses.map((a) => (
                  <label key={a.id} className="card" style={{ padding: 12, cursor: "pointer", borderColor: addressId === a.id ? "var(--color-primary)" : undefined }}>
                    <div className="row">
                      <input type="radio" name="addr" checked={addressId === a.id} onChange={() => setAddressId(a.id)} />
                      <div>
                        <div className="bold text-sm">{a.label} · {a.recipient}</div>
                        <div className="text-xs muted">{a.full}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </Card>

          {/* Delivery method */}
          <Card title="🚚 Metode Pengiriman">
            <div className="stack">
              {DELIVERY_METHODS.map((m) => (
                <label key={m.id} className="card" style={{ padding: 12, cursor: "pointer", borderColor: method === m.id ? "var(--color-primary)" : undefined }}>
                  <div className="between">
                    <div className="row">
                      <input type="radio" name="method" checked={method === m.id} onChange={() => setMethod(m.id)} />
                      <div>
                        <div className="bold text-sm">{m.label}</div>
                        <div className="text-xs muted">Estimasi: {m.eta} · SLA {m.slaDays} hari</div>
                      </div>
                    </div>
                    <strong className="text-sm">{formatIDR(m.fee)}</strong>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Discount code (single) */}
          <Card title="🎟️ Kode Diskon (Voucher / Promo)">
            {code ? (
              <div className="row wrap">
                <span className="badge blue">Kode aktif: {code} (−{formatIDR(totals.discount)})</span>
                <Button size="sm" variant="ghost" onClick={removeCode}>Hapus</Button>
              </div>
            ) : (
              <div className="row">
                <input
                  className="input"
                  placeholder="Masukkan satu kode…"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCode())}
                />
                <Button type="button" variant="secondary" onClick={applyCode}>Terapkan</Button>
              </div>
            )}
            {codeMsg && <div className="alert error mt-2 text-sm">{codeMsg}</div>}
            <p className="text-xs muted mt-1">
              Hanya <strong>satu kode</strong> per checkout (voucher <em>atau</em> promo).
              Diskon dihitung dari subtotal, sebelum PPN. Coba: <code>SEAPEDIA10</code>, <code>HEMAT5K</code>.
            </p>
          </Card>

          {/* Items */}
          <Card title="🛍️ Item">
            <div className="stack" style={{ gap: 8 }}>
              {cart.items.map((it) => (
                <div key={it.productId} className="between text-sm">
                  <span>{it.emoji} {it.name} × {it.qty}</span>
                  <span>{formatIDR(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Summary */}
        <Card title="Ringkasan Pembayaran">
          <PriceBreakdown
            subtotal={totals.subtotal}
            discount={totals.discount}
            deliveryFee={totals.deliveryFee}
            ppn={totals.ppn}
            total={totals.total}
          />

          <div className="dropdown-divider" style={{ margin: "14px 0" }} />
          <div className="between text-sm">
            <span className="muted">Saldo dompet</span>
            <strong>{formatIDR(wallet.balance)}</strong>
          </div>
          {insufficient && (
            <div className="alert error mt-2 text-sm">
              Saldo tidak cukup. Kurang {formatIDR(totals.total - wallet.balance)}.{" "}
              <Link to="/buyer/wallet"><strong>Top-up →</strong></Link>
            </div>
          )}
          {error && <div className="alert error mt-2">{error}</div>}

          <Button block className="mt-2" disabled={busy || insufficient || !addressId} onClick={confirm}>
            {busy ? "Memproses…" : `Bayar ${formatIDR(totals.total)}`}
          </Button>
          <p className="text-xs muted mt-1 text-center">
            Pesanan akan berstatus <strong>Sedang Dikemas</strong> setelah pembayaran.
          </p>
        </Card>
      </div>
    </DashboardShell>
  );
}
