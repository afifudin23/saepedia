import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";

const ROLE_INFO = {
  buyer: { icon: "🛍️", label: "Buyer", desc: "Kelola dompet, keranjang, dan checkout pesanan." },
  seller: { icon: "🏪", label: "Seller", desc: "Buat toko, kelola produk, dan proses pesanan." },
  driver: { icon: "🚚", label: "Driver", desc: "Cari job pengiriman, ambil, dan selesaikan." },
};

const DASHBOARD_PATH = { buyer: "/buyer", seller: "/seller", driver: "/driver", admin: "/admin" };

export default function RoleSelect() {
  const { user, isAuthenticated, loading, setActiveRole } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="page container"><div className="empty">Memuat…</div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const selectable = user.roles.filter((r) => r !== "admin");

  async function choose(role) {
    await setActiveRole(role);
    navigate(DASHBOARD_PATH[role] || "/", { replace: true });
  }

  return (
    <div className="page container">
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1>Pilih Role Aktif</h1>
        <p className="muted mb-2">
          Akun <strong>{user.username}</strong> memiliki beberapa role. Pilih role
          yang ingin kamu gunakan untuk sesi ini. Otorisasi mengikuti role aktif —
          kamu bisa berganti role kapan saja dari menu profil.
        </p>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          {selectable.map((r) => {
            const info = ROLE_INFO[r] || { icon: "👤", label: r, desc: "" };
            return (
              <button
                key={r}
                onClick={() => choose(r)}
                style={{ textAlign: "left", border: "none", background: "none", padding: 0 }}
              >
                <Card className="full">
                  <div style={{ fontSize: "2.4rem" }}>{info.icon}</div>
                  <div className="card-title mt-1">{info.label}</div>
                  <p className="text-sm muted">{info.desc}</p>
                </Card>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
