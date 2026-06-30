import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sellerApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import DashboardShell from "../../components/DashboardShell";
import { SELLER_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { formatIDR } from "../../lib/format";

const EMPTY = { name: "", description: "", price: "", stock: "", image: "", category: "" };

export default function SellerProducts() {
  const { user } = useAuth();
  const [store, setStore] = useState(undefined); // undefined = loading
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  async function loadProducts() {
    setProducts(await sellerApi.myProducts(user.id));
  }

  useEffect(() => {
    sellerApi.myStore(user.id).then((s) => setStore(s || null));
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  function openCreate() {
    setForm(EMPTY);
    setEditingId(null);
    setError("");
    setShowForm(true);
  }
  function openEdit(p) {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      image: p.image || "",
      category: p.category,
    });
    setEditingId(p.id);
    setError("");
    setShowForm(true);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) await sellerApi.updateProduct(user.id, editingId, form);
      else await sellerApi.createProduct(user.id, form);
      setShowForm(false);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(p) {
    if (!confirm(`Hapus produk "${p.name}"?`)) return;
    await sellerApi.deleteProduct(user.id, p.id);
    loadProducts();
  }

  if (store === null) {
    return (
      <DashboardShell title="Produk" links={SELLER_LINKS}>
        <div className="alert warn">
          Buat toko terlebih dahulu sebelum menambah produk.{" "}
          <Link to="/seller/store"><strong>Buat toko →</strong></Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Produk Saya"
      subtitle="Kelola produk yang dijual di tokomu."
      links={SELLER_LINKS}
    >
      <div className="between">
        <span className="muted text-sm">{products.length} produk</span>
        <Button onClick={openCreate}>＋ Tambah Produk</Button>
      </div>

      {showForm && (
        <Card title={editingId ? "Edit Produk" : "Produk Baru"}>
          <form className="stack" onSubmit={submit}>
            <Input label="Nama Produk" name="name" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            <Input label="URL Gambar" name="image" type="url" value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="https://… (opsional)" hint="Kosongkan untuk pakai ikon default." />
            <Input label="Deskripsi" as="textarea" rows={2} name="description" value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              <Input label="Harga (Rp)" type="number" min="0" name="price" value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
              <Input label="Stok" type="number" min="0" name="stock" value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} required />
              <Input label="Kategori" name="category" value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="mis. Elektronik" />
            </div>
            {error && <div className="alert error">{error}</div>}
            <div className="row">
              <Button type="submit">{editingId ? "Simpan" : "Tambah"}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
            </div>
          </form>
        </Card>
      )}

      <Card bodyClass="" className="full">
        {products.length === 0 ? (
          <div className="empty"><div className="emoji">📦</div>Belum ada produk.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Kategori</th>
                  <th className="text-right">Harga</th>
                  <th className="text-right">Stok</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        {p.image ? (
                          <img src={p.image} alt="" width={36} height={36}
                            style={{ borderRadius: 8, objectFit: "cover" }}
                            onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        ) : (
                          <span style={{ fontSize: "1.4rem" }}>{p.emoji}</span>
                        )}
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td><span className="badge gray">{p.category}</span></td>
                    <td className="text-right">{formatIDR(p.price)}</td>
                    <td className="text-right">
                      {p.stock > 0 ? p.stock : <span className="badge red">habis</span>}
                    </td>
                    <td>
                      <div className="row" style={{ justifyContent: "flex-end" }}>
                        <Button size="sm" variant="secondary" onClick={() => openEdit(p)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => remove(p)}>Hapus</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
