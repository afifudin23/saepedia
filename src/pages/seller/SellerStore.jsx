import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sellerApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import DashboardShell from "../../components/DashboardShell";
import { SELLER_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function SellerStore() {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    sellerApi.myStore(user.id).then((s) => {
      setStore(s);
      if (s) setForm({ name: s.name, description: s.description || "" });
    });
  }, [user.id]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setOk(false);
    setBusy(true);
    try {
      const saved = await sellerApi.saveStore(user.id, form);
      setStore(saved);
      setOk(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardShell title="Profil Toko" subtitle="Identitas tokomu di SEAPEDIA." links={SELLER_LINKS}>
      <Card title={store ? "Edit Toko" : "Buat Toko"}>
        <form className="stack" onSubmit={submit}>
          <Input
            label="Nama Toko"
            name="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            hint="Nama toko harus unik di seluruh SEAPEDIA."
            error={error}
            required
          />
          <Input
            label="Deskripsi"
            as="textarea"
            rows={3}
            name="description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          {ok && (
            <div className="alert success">
              Toko tersimpan.{" "}
              {store && <Link to={`/store/${store.id}`}>Lihat halaman publik →</Link>}
            </div>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? "Menyimpan…" : store ? "Simpan Perubahan" : "Buat Toko"}
          </Button>
        </form>
      </Card>

      {store && (
        <Card title="Pratinjau Publik">
          <div className="row">
            <span className="avatar" style={{ width: 48, height: 48, fontSize: "1.4rem" }}>🏪</span>
            <div>
              <div className="bold">{store.name}</div>
              <div className="text-sm muted">{store.description || "Tanpa deskripsi"}</div>
            </div>
          </div>
        </Card>
      )}
    </DashboardShell>
  );
}
