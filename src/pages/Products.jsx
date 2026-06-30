import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { catalogApi } from "../lib/api";
import ProductCard from "../components/ProductCard";
import Input from "../components/ui/Input";
import Loading from "../components/ui/Loading";

export default function Products() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalogApi.categories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    catalogApi.listProducts({ q, category }).then((p) => {
      setProducts(p);
      setLoading(false);
    });
  }, [q, category]);

  function update(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  return (
    <div className="page container">
      <div className="section-head">
        <div>
          <h1>Katalog Produk</h1>
          <p className="muted">Produk dari berbagai toko di SEAPEDIA.</p>
        </div>
      </div>

      <div className="row wrap mb-2">
        <div style={{ flex: 1, minWidth: 220 }}>
          <Input
            placeholder="Cari produk…"
            value={q}
            onChange={(e) => update("q", e.target.value)}
            aria-label="Cari"
          />
        </div>
        <select
          className="select"
          style={{ maxWidth: 200 }}
          value={category}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loading label="Memuat produk…" />
      ) : products.length === 0 ? (
        <div className="empty">
          <div className="emoji">🔍</div>
          Tidak ada produk yang cocok.
        </div>
      ) : (
        <>
          <p className="muted text-sm mb-2">{products.length} produk ditemukan</p>
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
