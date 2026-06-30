import { useEffect, useState } from "react";
import { addressApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import DashboardShell from "../../components/DashboardShell";
import { BUYER_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { required, isPhone } from "../../lib/validate";

const EMPTY = { label: "", recipient: "", phone: "", full: "" };

export default function Addresses() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  function load() {
    addressApi.list(user.id).then(setList);
  }
  useEffect(load, [user.id]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!required(form.recipient)) return setError("Nama penerima wajib diisi.");
    if (!isPhone(form.phone)) return setError("No. telepon tidak valid (8–15 digit).");
    if (form.full.trim().length < 5) return setError("Alamat lengkap minimal 5 karakter.");
    try {
      await addressApi.add(user.id, form);
      setForm(EMPTY);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }
  async function remove(id) {
    await addressApi.remove(user.id, id);
    load();
  }
  async function setDefault(id) {
    await addressApi.setDefault(user.id, id);
    load();
  }

  return (
    <DashboardShell title="Alamat Pengiriman" subtitle="Kelola alamat untuk checkout." links={BUYER_LINKS}>
      <div className="between">
        <span className="muted text-sm">{list.length} alamat</span>
        <Button onClick={() => setShowForm((s) => !s)}>＋ Tambah Alamat</Button>
      </div>

      {showForm && (
        <Card title="Alamat Baru">
          <form className="stack" onSubmit={submit}>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <Input label="Label" name="label" placeholder="Rumah / Kantor" value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
              <Input label="Penerima" name="recipient" value={form.recipient}
                onChange={(e) => setForm((f) => ({ ...f, recipient: e.target.value }))} required />
            </div>
            <Input label="No. Telepon" name="phone" value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="08xxxxxxxxxx" required />
            <Input label="Alamat Lengkap" as="textarea" rows={2} name="full" value={form.full}
              onChange={(e) => setForm((f) => ({ ...f, full: e.target.value }))} required />
            {error && <div className="alert error">{error}</div>}
            <div className="row">
              <Button type="submit">Simpan</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
            </div>
          </form>
        </Card>
      )}

      {list.length === 0 ? (
        <div className="empty"><div className="emoji">📍</div>Belum ada alamat tersimpan.</div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {list.map((a) => (
            <Card key={a.id}>
              <div className="between">
                <strong>{a.label}</strong>
                {a.isDefault && <span className="badge green">Utama</span>}
              </div>
              <div className="text-sm mt-1">{a.recipient} · {a.phone}</div>
              <p className="text-sm muted mt-1">{a.full}</p>
              <div className="row mt-2">
                {!a.isDefault && <Button size="sm" variant="secondary" onClick={() => setDefault(a.id)}>Jadikan Utama</Button>}
                <Button size="sm" variant="danger" onClick={() => remove(a.id)}>Hapus</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
