import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { catalogApi } from "../lib/api";
import { formatIDR } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, activeRole } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    setError("");
    catalogApi.getProduct(id).then(setProduct).catch((e) => setError(e.message));
  }, [id]);

  async function handleAdd() {
    setMsg(null);
    try {
      await addToCart(product.id, qty);
      setMsg({ type: "success", text: "Ditambahkan ke keranjang." });
    } catch (e) {
      if (e.code === "DIFFERENT_STORE") {
        setMsg({ type: "warn", text: e.message, conflict: true });
      } else {
        setMsg({ type: "error", text: e.message });
      }
    }
  }

  if (error) return <div className="page container"><div className="empty">{error}</div></div>;
  if (!product) return <div className="page container"><div className="empty">Memuat…</div></div>;

  const soldOut = product.stock <= 0;
  const isBuyer = isAuthenticated && activeRole === "buyer";

  return (
    <div className="page container">
      <p className="text-sm muted mb-2">
        <Link to="/products">Katalog</Link> / {product.name}
      </p>

      <div className="grid" style={{ gridTemplateColumns: "minmax(280px, 420px) 1fr", alignItems: "start" }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="product-thumb" style={{ fontSize: "6rem", borderRadius: 12 }}>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              product.emoji
            )}
          </div>
        </div>

        <div className="stack">
          <div>
            <span className="badge gray">{product.category}</span>
            <h1 className="mt-1">{product.name}</h1>
            <div className="price" style={{ fontSize: "1.8rem" }}>
              {formatIDR(product.price)}
            </div>
            <p className="text-sm mt-1">
              {soldOut ? (
                <span className="badge red">Stok habis</span>
              ) : (
                <span className="muted">Stok tersedia: {product.stock}</span>
              )}
            </p>
          </div>

          <p>{product.description}</p>

          {/* Store info block */}
          {product.store && (
            <Card>
              <div className="between">
                <div className="row">
                  <span className="avatar">🏪</span>
                  <div>
                    <div className="bold">{product.store.name}</div>
                    <div className="text-xs muted">Toko di SEAPEDIA</div>
                  </div>
                </div>
                <Button as={Link} to={`/store/${product.store.id}`} variant="secondary" size="sm">
                  Kunjungi Toko
                </Button>
              </div>
            </Card>
          )}

          {/* Purchase actions — only for buyers. Guests see a prompt. */}
          {isBuyer ? (
            <Card>
              <div className="row wrap">
                <div className="field" style={{ maxWidth: 110 }}>
                  <label>Jumlah</label>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={product.stock}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                    disabled={soldOut}
                  />
                </div>
                <Button onClick={handleAdd} disabled={soldOut} style={{ marginTop: 22 }}>
                  🛒 Tambah ke Keranjang
                </Button>
              </div>
              {msg && (
                <div className={`alert ${msg.type} mt-2`}>
                  {msg.text}
                  {msg.conflict && (
                    <div className="mt-1">
                      <Button size="sm" variant="secondary" as={Link} to="/buyer/cart">
                        Buka Keranjang
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ) : (
            <div className="alert info">
              {isAuthenticated
                ? "Beralih ke role Buyer untuk membeli produk ini."
                : "Masuk sebagai Buyer untuk menambahkan ke keranjang dan checkout."}
              {!isAuthenticated && (
                <div className="mt-1">
                  <Button size="sm" onClick={() => navigate("/login")}>
                    Masuk
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
