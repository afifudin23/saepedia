import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { catalogApi } from "../lib/api";
import ProductCard from "../components/ProductCard";
import Reviews from "../components/Reviews";
import Button from "../components/ui/Button";

export default function Landing() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    catalogApi.listProducts().then((p) => setFeatured(p.slice(0, 8)));
  }, []);

  return (
    <div className="page container">
      <section className="hero">
        <div>
          <span className="badge" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>
            🌊 Marketplace Multi-Toko
          </span>
          <h1>Belanja dari banyak toko, dalam satu pengalaman SEAPEDIA.</h1>
          <p>
            SEAPEDIA menghubungkan <strong>penjual, pembeli, dan kurir</strong> di
            satu tempat. Jelajahi ribuan produk dari berbagai toko sebagai tamu —
            tanpa perlu login.
          </p>
          <div className="row wrap">
            <Button as={Link} to="/products" variant="accent">
              Mulai Belanja
            </Button>
            <Button as={Link} to="/register" variant="secondary">
              Buka Toko Gratis
            </Button>
          </div>
        </div>
        <div className="hero-emoji">🛍️</div>
      </section>

      {/* Why marketplace, not single store */}
      <div className="stats mt-3">
        <div className="stat">
          <div className="label">Banyak Toko</div>
          <div className="value">Multi-seller</div>
          <p className="text-sm muted">Setiap penjual punya toko sendiri.</p>
        </div>
        <div className="stat">
          <div className="label">Empat Peran</div>
          <div className="value">4 Role</div>
          <p className="text-sm muted">Admin, Seller, Buyer, Driver.</p>
        </div>
        <div className="stat">
          <div className="label">Aturan Keranjang</div>
          <div className="value">1 Toko / Cart</div>
          <p className="text-sm muted">Checkout per toko agar pengiriman rapi.</p>
        </div>
        <div className="stat">
          <div className="label">Pembayaran</div>
          <div className="value">Dompet</div>
          <p className="text-sm muted">Top-up saldo & bayar instan.</p>
        </div>
      </div>

      {/* Featured products (guest-accessible) */}
      <section className="mt-3">
        <div className="section-head">
          <h2>Produk Pilihan</h2>
          <Link to="/products" className="nav-link">
            Lihat semua →
          </Link>
        </div>
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* How it works — helps new users understand the flow */}
      <section className="mt-3">
        <div className="section-head"><h2>Cara Belanja di SEAPEDIA</h2></div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {[
            { n: "1", icon: "🔎", t: "Jelajahi Produk", d: "Telusuri katalog dari berbagai toko tanpa perlu login." },
            { n: "2", icon: "🛒", t: "Masuk & Isi Keranjang", d: "Daftar/masuk sebagai Buyer, isi saldo, lalu tambah ke keranjang." },
            { n: "3", icon: "📦", t: "Checkout & Lacak", d: "Bayar pakai dompet dan pantau status pesanan sampai tiba." },
          ].map((s) => (
            <div key={s.n} className="card">
              <div className="card-body">
                <div className="row">
                  <span className="avatar" style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>{s.icon}</span>
                  <div>
                    <div className="text-xs muted bold">LANGKAH {s.n}</div>
                    <div className="card-title" style={{ marginBottom: 0 }}>{s.t}</div>
                  </div>
                </div>
                <p className="text-sm muted mt-2">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Reviews />
    </div>
  );
}
