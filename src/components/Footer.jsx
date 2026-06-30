import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ color: "#fff" }}>
              <span className="logo">🌊</span> SEAPEDIA
            </div>
            <p className="mt-1" style={{ maxWidth: 320 }}>
              Marketplace multi-toko yang menghubungkan penjual, pembeli, dan
              kurir dalam satu ekosistem belanja.
            </p>
          </div>
          <div>
            <h4>Marketplace</h4>
            <div className="stack" style={{ gap: 6 }}>
              <Link to="/products">Katalog Produk</Link>
              <Link to="/#reviews">Ulasan Aplikasi</Link>
              <Link to="/register">Buka Toko</Link>
            </div>
          </div>
          <div>
            <h4>Akun</h4>
            <div className="stack" style={{ gap: 6 }}>
              <Link to="/login">Masuk</Link>
              <Link to="/register">Daftar</Link>
              <Link to="/profile">Profil</Link>
            </div>
          </div>
          <div>
            <h4>Tentang</h4>
            <div className="stack" style={{ gap: 6 }}>
              <span>COMPFEST 18</span>
              <span>Software Engineering Academy</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} SEAPEDIA — Marketplace multi-role.
        </div>
      </div>
    </footer>
  );
}
