import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const ROLE_LABEL = {
  admin: "Admin",
  seller: "Seller",
  buyer: "Buyer",
  driver: "Driver",
};

const DASHBOARD_PATH = {
  admin: "/admin",
  seller: "/seller",
  buyer: "/buyer",
  driver: "/driver",
};

export default function Navbar() {
  const { user, activeRole, isAuthenticated, logout, setActiveRole } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const [q, setQ] = useState("");
  const ddRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submitSearch(e) {
    e.preventDefault();
    navigate(`/products?q=${encodeURIComponent(q)}`);
  }

  async function handleLogout() {
    await logout();
    setDdOpen(false);
    navigate("/");
  }

  async function switchRole(r) {
    try {
      await setActiveRole(r);
      setDdOpen(false);
      navigate(DASHBOARD_PATH[r]);
    } catch {
      /* ignore */
    }
  }

  const otherRoles = user ? user.roles.filter((r) => r !== activeRole && r !== "admin") : [];

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="logo">🌊</span> SEAPEDIA
        </Link>

        <form className="nav-search" onSubmit={submitSearch}>
          <input
            className="input"
            placeholder="Cari produk di seluruh toko…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Cari produk"
          />
        </form>

        <button
          className="menu-toggle"
          aria-label="Menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          ☰
        </button>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)}>
          <NavLink to="/products" className="nav-link">
            Katalog
          </NavLink>

          {!isAuthenticated && (
            <>
              <NavLink to="/login" className="nav-link">
                Masuk
              </NavLink>
              <Link to="/register" className="btn sm">
                Daftar
              </Link>
            </>
          )}

          {isAuthenticated && activeRole === "buyer" && (
            <Link to="/buyer/cart" className="nav-link" aria-label="Keranjang">
              🛒 Keranjang{cart.count > 0 ? ` (${cart.count})` : ""}
            </Link>
          )}

          {isAuthenticated && (
            <div className="dropdown" ref={ddRef} onClick={(e) => e.stopPropagation()}>
              <button
                className="row"
                style={{ background: "none", border: "none" }}
                onClick={() => setDdOpen((o) => !o)}
              >
                {activeRole && (
                  <span className="role-pill">● {ROLE_LABEL[activeRole] || activeRole}</span>
                )}
                <span className="avatar">{user.username[0].toUpperCase()}</span>
              </button>

              {ddOpen && (
                <div className="dropdown-menu">
                  <div style={{ padding: "8px 12px" }}>
                    <div className="bold">{user.username}</div>
                    <div className="text-xs muted">{user.email}</div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile" onClick={() => setDdOpen(false)}>
                    👤 Profil & Role
                  </Link>
                  {activeRole && (
                    <Link to={DASHBOARD_PATH[activeRole]} onClick={() => setDdOpen(false)}>
                      📊 Dashboard {ROLE_LABEL[activeRole]}
                    </Link>
                  )}
                  {otherRoles.length > 0 && (
                    <>
                      <div className="dropdown-divider" />
                      <div className="text-xs muted" style={{ padding: "4px 12px" }}>
                        Ganti role aktif
                      </div>
                      {otherRoles.map((r) => (
                        <button key={r} onClick={() => switchRole(r)}>
                          🔄 Beralih ke {ROLE_LABEL[r]}
                        </button>
                      ))}
                    </>
                  )}
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout}>🚪 Keluar</button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
