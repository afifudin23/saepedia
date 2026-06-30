import { useEffect, useState } from "react";
import { adminApi, discountApi } from "../../lib/api";
import DashboardShell from "../../components/DashboardShell";
import { ADMIN_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { formatIDR, formatDate } from "../../lib/format";

const EMPTY = { code: "", discountType: "fixed", value: "", minSpend: "", expiry: "", maxUsage: "" };

export default function AdminDiscounts() {
  const [vouchers, setVouchers] = useState([]);
  const [promos, setPromos] = useState([]);
  const [vForm, setVForm] = useState(EMPTY);
  const [pForm, setPForm] = useState(EMPTY);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [detail, setDetail] = useState(null); // { kind, data }

  async function openDetail(kind, id) {
    setErr("");
    try {
      const data = kind === "voucher" ? await adminApi.getVoucher(id) : await adminApi.getPromo(id);
      setDetail({ kind, data });
    } catch (e) {
      setErr(e.message);
    }
  }

  function load() {
    discountApi.list().then(({ vouchers, promos }) => {
      setVouchers(vouchers);
      setPromos(promos);
    });
  }
  useEffect(load, []);

  async function createVoucher(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    try {
      await adminApi.createVoucher(vForm);
      setVForm(EMPTY);
      setMsg("Voucher dibuat.");
      load();
    } catch (e) { setErr(e.message); }
  }
  async function createPromo(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    try {
      await adminApi.createPromo(pForm);
      setPForm(EMPTY);
      setMsg("Promo dibuat.");
      load();
    } catch (e) { setErr(e.message); }
  }

  return (
    <DashboardShell title="Voucher & Promo" subtitle="Buat dan kelola kode diskon." links={ADMIN_LINKS}>
      {msg && <div className="alert success">{msg}</div>}
      {err && <div className="alert error">{err}</div>}

      {detail && (
        <Card
          title={`${detail.kind === "voucher" ? "🎟️ Voucher" : "🏷️ Promo"}: ${detail.data.code}`}
          action={<Button size="sm" variant="ghost" onClick={() => setDetail(null)}>Tutup</Button>}
        >
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
            <div><div className="text-xs muted">Tipe potongan</div><strong>{detail.data.discountType === "percent" ? "Persentase" : "Tetap"}</strong></div>
            <div><div className="text-xs muted">Nilai</div><strong>{detail.data.discountType === "percent" ? detail.data.value + "%" : formatIDR(detail.data.value)}</strong></div>
            <div><div className="text-xs muted">Min. belanja</div><strong>{formatIDR(detail.data.minSpend || 0)}</strong></div>
            {detail.kind === "voucher" && (
              <div><div className="text-xs muted">Kuota terpakai</div><strong>{detail.data.used}/{detail.data.maxUsage ?? "∞"}</strong></div>
            )}
            <div><div className="text-xs muted">Kedaluwarsa</div><strong>{formatDate(detail.data.expiry)}</strong></div>
          </div>
        </Card>
      )}

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
        {/* Voucher */}
        <Card title="🎟️ Buat Voucher">
          <form className="stack" onSubmit={createVoucher}>
            <Input label="Kode" value={vForm.code} onChange={(e) => setVForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} required />
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <Input as="select" label="Tipe" value={vForm.discountType} onChange={(e) => setVForm((f) => ({ ...f, discountType: e.target.value }))}>
                <option value="fixed">Potongan tetap (Rp)</option>
                <option value="percent">Persentase (%)</option>
              </Input>
              <Input label="Nilai" type="number" min="1" value={vForm.value} onChange={(e) => setVForm((f) => ({ ...f, value: e.target.value }))} required />
            </div>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <Input label="Min. Belanja" type="number" min="0" value={vForm.minSpend} onChange={(e) => setVForm((f) => ({ ...f, minSpend: e.target.value }))} />
              <Input label="Kuota Pakai" type="number" min="1" value={vForm.maxUsage} onChange={(e) => setVForm((f) => ({ ...f, maxUsage: e.target.value }))} placeholder="100" />
            </div>
            <Input label="Kedaluwarsa" type="date" value={vForm.expiry} onChange={(e) => setVForm((f) => ({ ...f, expiry: e.target.value }))} hint="Kosong = 30 hari dari sekarang" />
            <Button type="submit">Buat Voucher</Button>
          </form>
        </Card>

        {/* Promo */}
        <Card title="🏷️ Buat Promo">
          <form className="stack" onSubmit={createPromo}>
            <Input label="Kode" value={pForm.code} onChange={(e) => setPForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} required />
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <Input as="select" label="Tipe" value={pForm.discountType} onChange={(e) => setPForm((f) => ({ ...f, discountType: e.target.value }))}>
                <option value="fixed">Potongan tetap (Rp)</option>
                <option value="percent">Persentase (%)</option>
              </Input>
              <Input label="Nilai" type="number" min="1" value={pForm.value} onChange={(e) => setPForm((f) => ({ ...f, value: e.target.value }))} required />
            </div>
            <Input label="Min. Belanja" type="number" min="0" value={pForm.minSpend} onChange={(e) => setPForm((f) => ({ ...f, minSpend: e.target.value }))} />
            <Input label="Kedaluwarsa" type="date" value={pForm.expiry} onChange={(e) => setPForm((f) => ({ ...f, expiry: e.target.value }))} hint="Kosong = 30 hari dari sekarang" />
            <Button type="submit">Buat Promo</Button>
          </form>
        </Card>
      </div>

      <Card title="Daftar Voucher" className="full">
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>Kode</th><th>Tipe</th><th>Nilai</th><th>Min. Belanja</th><th>Kuota</th><th>Kedaluwarsa</th><th></th></tr></thead>
            <tbody>{vouchers.map((v) => (
              <tr key={v.id}>
                <td className="bold">{v.code}</td><td>{v.discountType}</td>
                <td>{v.discountType === "percent" ? v.value + "%" : formatIDR(v.value)}</td>
                <td>{formatIDR(v.minSpend || 0)}</td><td>{v.used}/{v.maxUsage}</td>
                <td className="text-sm">{formatDate(v.expiry)}</td>
                <td className="text-right"><Button size="sm" variant="secondary" onClick={() => openDetail("voucher", v.id)}>Detail</Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>

      <Card title="Daftar Promo" className="full">
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead><tr><th>Kode</th><th>Tipe</th><th>Nilai</th><th>Min. Belanja</th><th>Kedaluwarsa</th><th></th></tr></thead>
            <tbody>{promos.map((p) => (
              <tr key={p.id}>
                <td className="bold">{p.code}</td><td>{p.discountType}</td>
                <td>{p.discountType === "percent" ? p.value + "%" : formatIDR(p.value)}</td>
                <td>{formatIDR(p.minSpend || 0)}</td><td className="text-sm">{formatDate(p.expiry)}</td>
                <td className="text-right"><Button size="sm" variant="secondary" onClick={() => openDetail("promo", p.id)}>Detail</Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
    </DashboardShell>
  );
}
