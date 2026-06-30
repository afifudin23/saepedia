import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const DASHBOARD_PATH = {
  admin: "/admin",
  seller: "/seller",
  buyer: "/buyer",
  driver: "/driver",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { activeRole } = await login(form);
      const from = location.state?.from?.pathname;
      if (!activeRole) {
        navigate("/select-role", { replace: true });
      } else {
        navigate(from || DASHBOARD_PATH[activeRole] || "/", { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <Card className="auth-card" title="Masuk ke SEAPEDIA">
        <form className="stack" onSubmit={submit}>
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            required
          />
          {error && <div className="alert error">{error}</div>}
          <Button type="submit" disabled={busy} block>
            {busy ? "Memproses…" : "Masuk"}
          </Button>
        </form>

        <p className="text-sm mt-2 muted">
          Belum punya akun? <Link to="/register">Daftar di sini</Link>
        </p>

        <div className="alert info mt-2 text-xs">
          <strong>Akun demo (login pakai email):</strong>
          <br />🛠️ admin@seapedia.test / <code>Admin123</code>
          <br />🛍️ buyer1@seapedia.test / <code>Buyer123</code>
          <br />🏪 seller1@seapedia.test / <code>Seller123</code>
          <br />🚚 driver1@seapedia.test / <code>Driver123</code>
          <br />🔀 multi1@seapedia.test / <code>Multi123</code> (multi-role)
        </div>
      </Card>
    </div>
  );
}
