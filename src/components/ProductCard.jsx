import { Link } from "react-router-dom";
import { formatIDR } from "../lib/format";

export default function ProductCard({ product }) {
  const soldOut = product.stock <= 0;
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-thumb">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          product.emoji || "📦"
        )}
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="price">{formatIDR(product.price)}</div>
        {product.store && (
          <div className="product-store">🏪 {product.store.name}</div>
        )}
        <div className="text-xs">
          {soldOut ? (
            <span className="badge red">Stok habis</span>
          ) : (
            <span className="muted">Stok: {product.stock}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
