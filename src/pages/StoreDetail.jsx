import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { catalogApi } from "../lib/api";
import ProductCard from "../components/ProductCard";

export default function StoreDetail() {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    catalogApi.getStore(id).then(setStore).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="page container"><div className="empty">{error}</div></div>;
  if (!store) return <div className="page container"><div className="empty">Memuat…</div></div>;

  return (
    <div className="page container">
      <div className="card mb-2">
        <div className="card-body row">
          <span className="avatar" style={{ width: 56, height: 56, fontSize: "1.6rem" }}>
            🏪
          </span>
          <div>
            <h1>{store.name}</h1>
            <p className="muted">{store.description || "Toko di SEAPEDIA"}</p>
          </div>
        </div>
      </div>

      <div className="section-head">
        <h2>Produk Toko ({store.products.length})</h2>
      </div>
      {store.products.length === 0 ? (
        <div className="empty">Belum ada produk.</div>
      ) : (
        <div className="product-grid">
          {store.products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
