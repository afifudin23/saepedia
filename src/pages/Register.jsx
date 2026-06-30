import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isEmail } from "../lib/validate";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const ROLE_OPTIONS = [
  { id: "buyer", label: "Buyer", desc: "Belanja & checkout" },
  { id: "seller", label: "Seller", desc: "Buka toko & jual produk" },
  { id: "driver", label: "Driver", desc: "Ambil & antar pesanan" },
];

export default function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [roles, setRoles] = useState(["buyer"]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function toggleRole(r) {
    setRoles((cur) =>
      cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!isEmail(form.email)) return setError("Format email tidak valid.");
    if (String(form.password).length < 6) return setError("Password minimal 6 karakter.");
    if (roles.length === 0) {
      setError("Pilih minimal satu role.");
      return;
    }
    setBusy(true);
    try {
      await register({ email: form.email, password: form.password, roles });
      // Auto login for a smooth demo.
      const { activeRole } = await login({
        email: form.email,
        password: form.password,
      });
      navigate(activeRole ? `/${activeRole}` : "/select-role", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <Card className="auth-card" title="Daftar Akun SEAPEDIA">
        <form className="stack" onSubmit={submit}>
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            required
            minLength={6}
            hint="Minimal 6 karakter."
          />

          <div className="field">
            <label>Daftar sebagai (boleh lebih dari satu)</label>
            <div className="stack">
              {ROLE_OPTIONS.map((r) => (
                <label
                  key={r.id}
                  className={`card ${roles.includes(r.id) ? "" : ""}`}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    borderColor: roles.includes(r.id) ? "var(--color-primary)" : undefined,
                  }}
                >
                  <div className="row">
                    <input
                      type="checkbox"
                      checked={roles.includes(r.id)}
                      onChange={() => toggleRole(r.id)}
                    />
                    <div>
                      <div className="bold">{r.label}</div>
                      <div className="text-xs muted">{r.desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <span className="hint">
              Satu akun (email) boleh memiliki beberapa role sekaligus.
            </span>
          </div>

          {error && <div className="alert error">{error}</div>}
          <Button type="submit" disabled={busy} block>
            {busy ? "Mendaftarkan…" : "Daftar"}
          </Button>
        </form>

        <p className="text-sm mt-2 muted">
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </p>
      </Card>
    </div>
  );
}
