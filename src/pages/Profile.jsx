import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const ROLE_LABEL = { admin: "Admin", seller: "Seller", buyer: "Buyer", driver: "Driver" };
const DASHBOARD_PATH = { admin: "/admin", seller: "/seller", buyer: "/buyer", driver: "/driver" };

export default function Profile() {
  const { user, activeRole, setActiveRole } = useAuth();

  return (
    <div className="page container">
      <h1>Profil Saya</h1>
      <p className="muted mb-2">Ringkasan akun, role, dan saldo lintas peran.</p>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
        <Card title="Informasi Akun">
          <div className="stack" style={{ gap: 8 }}>
            <div className="between"><span className="muted">Username</span><strong>{user.username}</strong></div>
            <div className="between"><span className="muted">Email</span><span>{user.email}</span></div>
            <div className="between"><span className="muted">Telepon</span><span>{user.phone || "-"}</span></div>
            <div className="between"><span className="muted">Role Aktif</span>
              <span className="role-pill">● {ROLE_LABEL[activeRole] || "-"}</span>
            </div>
          </div>
        </Card>

        <Card title="Role yang Dimiliki">
          <div className="stack">
            {user.roles.map((r) => (
              <div key={r} className="between">
                <div className="row">
                  <span className="badge">{ROLE_LABEL[r] || r}</span>
                  {r === activeRole && <span className="text-xs muted">(aktif)</span>}
                </div>
                <div className="row">
                  {r !== activeRole && r !== "admin" && (
                    <Button size="sm" variant="secondary" onClick={() => setActiveRole(r)}>
                      Jadikan Aktif
                    </Button>
                  )}
                  {r === activeRole && (
                    <Button size="sm" as={Link} to={DASHBOARD_PATH[r]}>
                      Buka Dashboard
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Financial summary entry point (placeholder — real numbers arrive later). */}
      <Card title="Ringkasan Keuangan (lintas role)" className="mt-2">
        <p className="text-sm muted mb-2">
          Saldo dompet, pendapatan Seller, dan penghasilan Driver akan terisi pada
          level berikutnya. Berikut titik masuknya:
        </p>
        <div className="stats">
          <div className="stat">
            <div className="label">💰 Saldo Buyer</div>
            <div className="value text-sm">{user.roles.includes("buyer") ? <Link to="/buyer/wallet">Lihat dompet →</Link> : "—"}</div>
          </div>
          <div className="stat">
            <div className="label">🏪 Pendapatan Seller</div>
            <div className="value text-sm">{user.roles.includes("seller") ? <Link to="/seller">Lihat ringkasan →</Link> : "—"}</div>
          </div>
          <div className="stat">
            <div className="label">🚚 Penghasilan Driver</div>
            <div className="value text-sm">{user.roles.includes("driver") ? "Level 5" : "—"}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
