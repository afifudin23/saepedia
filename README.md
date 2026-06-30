# 🌊 SEAPEDIA — Marketplace Multi-Role

SEAPEDIA adalah aplikasi marketplace e-commerce multi-toko untuk Technical
Challenge **COMPFEST 18 — Software Engineering Academy**. Aplikasi menghubungkan
**Admin, Seller, Buyer, dan Driver** dalam satu ekosistem belanja.

> **Status saat ini:** Frontend **Level 1–7** (React + Vite), sudah
> **terintegrasi dengan backend asli** SEAPEDIA API (Go) melalui `fetch`.
> Lapisan mock `localStorage` sudah dihapus; seluruh data berasal dari API.

---

## 🧱 Stack

- **Frontend:** React 19 + Vite + React Router
- **State auth/cart:** React Context + `localStorage`
- **Data sementara:** mock API layer (`src/lib/api.js`, `src/lib/db.js`)

---

## 🚀 Menjalankan Aplikasi

Aplikasi ini butuh **backend SEAPEDIA API (Go)** berjalan lebih dulu.

### 1. Jalankan backend (`saepedia-api`)

Ikuti README backend: siapkan PostgreSQL, `cp .env.example .env`, lalu:

```bash
make migrate-up   # buat tabel
make seed         # akun demo
make run          # server di http://localhost:5000
```

### 2. Jalankan frontend (folder ini)

Prasyarat: **Node.js 18+**.

```bash
npm install
npm run dev      # mode pengembangan (http://localhost:5173)
npm run build    # build produksi -> dist/
npm run preview  # pratinjau hasil build
```

### Konfigurasi URL API

Frontend membaca `VITE_API_URL` (lihat `.env.example`). Default:
`http://localhost:5000/api/v1`. Untuk mengubah, buat file `.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 👤 Akun Demo (seed)

Akun dibuat oleh seeder backend (`make seed`). **Login memakai email.**

| Email                     | Password    | Role                         |
| ------------------------- | ----------- | ---------------------------- |
| `admin@seapedia.test`     | `Admin123`  | Admin                        |
| `seller1@seapedia.test`   | `Seller123` | Seller (punya toko + produk) |
| `buyer1@seapedia.test`    | `Buyer123`  | Buyer (saldo Rp1.000.000)    |
| `driver1@seapedia.test`   | `Driver123` | Driver                       |
| `multi1@seapedia.test`    | `Multi123`  | Buyer + Seller + Driver (multi-role) |

> Seeder juga membuat `seller2/3`, `buyer2/3`, `driver2` (pola password sama per role).

**Setup Admin:** admin dibuat lewat seeder backend (`scripts/seed`); registrasi
publik tidak bisa membuat admin. Admin selalu memiliki role aktif `admin`.

---

## 🗺️ Fitur per Level

### Level 1 — Public Marketplace, Authentication & Reviews

- Landing page, katalog produk publik, detail produk read-only.
- Register & login; password & sesi (mock token, JWT asli menyusul di backend).
- **Multi-role:** satu username non-admin bisa punya >1 role; setelah login
  user **memilih active role** (`/select-role`). Otorisasi mengikuti **active
  role**, bukan sekadar daftar role.
- Ulasan aplikasi publik (rating 1–5 + komentar) tanpa perlu checkout.
- Komponen reusable (Button, Input, Card, Navbar, Footer) + routing publik vs
  privat + dashboard shells untuk semua role + nav responsif.

### Level 2 — Seller Experience

- Buat/ubah profil toko dengan **nama unik** (validasi anti-duplikat).
- CRUD produk (nama, deskripsi, harga, stok, kategori) — seller hanya dapat
  mengubah produk miliknya.
- Katalog publik menampilkan produk dari toko nyata + blok info toko.

### Level 3 — Buyer Wallet, Cart & Checkout

- Dompet + **top-up simulasi** + riwayat transaksi.
- Manajemen alamat pengiriman.
- Keranjang dengan **aturan satu toko** (lihat di bawah).
- Checkout: metode pengiriman (Instant / Next Day / Regular), perhitungan
  **subtotal, diskon, ongkir, PPN 12%, total**, pengecekan saldo, pengurangan
  stok aman (tidak boleh negatif), pembuatan order + **riwayat status
  bertimestamp**.
- Riwayat & detail pesanan Buyer (dengan timeline status), daftar pesanan masuk
  Seller.

### Level 4 — Discounts & Seller Order Processing

- Sistem **Voucher & Promo** (dibedakan jelas): voucher punya kuota pakai &
  kedaluwarsa; promo punya kedaluwarsa. Endpoint generate/list (Admin) + validasi
  saat checkout + efek diskon di ringkasan.
- **Seller memproses pesanan**: Sedang Dikemas → Menunggu Pengirim (timeline +
  timestamp, hanya pemilik toko).
- **Laporan Buyer** (pengeluaran) & **Laporan Seller** (pendapatan).

### Level 5 — Delivery & Driver Workflow

- Job muncul untuk Driver hanya saat status **Menunggu Pengirim**.
- Ambil job (→ Sedang Dikirim, satu order satu driver) & konfirmasi selesai
  (→ Pesanan Selesai). Setiap perubahan bertimestamp.
- Dashboard Driver: job aktif, riwayat, penghasilan. Tracking di Buyer & Seller.

### Level 6 — Admin Monitoring & Overdue Handling

- Dashboard monitoring: users, stores, products, orders, voucher/promo,
  pengiriman, overdue.
- **UI kelola Voucher & Promo** (buat + daftar + detail).
- **Overdue auto refund/return** berdasarkan SLA metode kirim + **simulasi
  waktu** (maju N hari → auto-handle). Refund kembali ke dompet, stok dipulihkan,
  status → Dikembalikan, tercegah dari refund ganda.

### Level 7 — Security Hardening & Finalization

- **XSS:** seluruh konten user (ulasan/komentar) dirender sebagai teks via JSX
  (React auto-escape); tidak ada `dangerouslySetInnerHTML`. Util `sanitizeText`
  sebagai pertahanan tambahan (`src/lib/validate.js`).
- **Validasi input:** email, telepon, rating (1–5), harga, stok, kuantitas,
  nilai diskon divalidasi sebelum disimpan.
- **RBAC:** route privat & aksi data mengikuti **active role**; kepemilikan
  data ditegakkan (produk seller, order buyer, job driver).
- **Sesi:** token/sesi kedaluwarsa 7 hari; logout membersihkan sesi.

> ℹ️ **Catatan SQL Injection:** karena lapisan data saat ini berbasis
> `localStorage` (belum ada SQL), proteksi SQLi akan diterapkan di backend asli
> melalui **parameterized query / ORM** (Prisma) — lihat bagian Keamanan.

---

## 📐 Aturan Bisnis Penting

### Aturan Keranjang Satu Toko (Single-store checkout)

> **Satu keranjang hanya boleh berisi produk dari satu toko.**

Jika Buyer menambahkan produk dari toko berbeda, sistem menolak dan meminta
mengosongkan keranjang dulu. Aturan ini:

- ditampilkan jelas di halaman Keranjang & saat menambah produk,
- ditegakkan di lapisan data (`cartApi.add` mengembalikan error
  `DIFFERENT_STORE`).

### Perhitungan PPN 12%

PPN dihitung sebesar **12%** dari **(subtotal − diskon)**:

```
taxable      = subtotal − diskon
PPN          = taxable × 12%
Total Akhir  = taxable + ongkir + PPN
```

Pada Level 3 diskon selalu 0 (Voucher/Promo diperkenalkan di Level 4), namun
baris diskon tetap ditampilkan agar ringkasan konsisten. Sumber tunggal
perhitungan ada di `src/lib/format.js` (`calcCheckout`).

### Ongkos Kirim per Metode

| Metode    | Tarif    | Estimasi  |
| --------- | -------- | --------- |
| Instant   | Rp25.000 | ± 1 jam   |
| Next Day  | Rp12.000 | 1 hari    |
| Regular   | Rp8.000  | 2–4 hari  |

### Status Order (lifecycle utama)

`Sedang Dikemas → Menunggu Pengirim → Sedang Dikirim → Pesanan Selesai`
(dan `Dikembalikan`). Setelah checkout sukses, status awal selalu
**Sedang Dikemas**. Setiap perubahan status disimpan dengan timestamp.

### Aturan Kombinasi Diskon (Voucher & Promo)

- Boleh menggabungkan **1 Voucher + 1 Promo** dalam satu checkout (tidak boleh
  2 voucher atau 2 promo).
- **Diskon dihitung dari subtotal, SEBELUM PPN** (lihat rumus PPN di atas).
- Voucher kedaluwarsa / kuota habis dan Promo kedaluwarsa **ditolak**.
- Voucher dan Promo dibedakan jelas di ringkasan checkout (badge berbeda).

Kode demo: voucher `HEMAT50K` (Rp50.000, min. Rp200rb), `DISKON10` (10%);
promo `GRANDOPEN` (5%), `ONGKIRHEMAT` (Rp8.000, min. Rp100rb); `KADALUARSA`
(voucher contoh yang sudah expired).

### Aturan Penghasilan Driver

Driver memperoleh **80% dari ongkos kirim** untuk setiap job yang diselesaikan
(`src/lib/format.js` → `driverEarning`).

### SLA Overdue & Simulasi Waktu

| Metode   | SLA (batas selesai) |
| -------- | ------------------- |
| Instant  | 1 hari              |
| Next Day | 2 hari              |
| Regular  | 4 hari              |

Pesanan yang sudah dibayar tetapi belum **Pesanan Selesai** melewati SLA →
**auto refund + return**: dana kembali ke dompet Buyer (tercatat di riwayat),
stok dipulihkan, status → **Dikembalikan**, dan dicegah dari refund/restore
ganda. Pendapatan Seller tidak menghitung pesanan yang dikembalikan.

**Simulasi waktu:** login sebagai Admin → menu *Overdue & Simulasi* → tombol
**Maju 1/3 Hari** akan memajukan jam sistem (offset) lalu menjalankan sweep
overdue otomatis. Tersedia juga *Jalankan Sweep Sekarang*.

---

## 🔐 Keamanan (Security Notes)

| Aspek | Penanganan saat ini (frontend + mock) | Rencana backend |
| ----- | ------------------------------------- | --------------- |
| **XSS** | Konten user dirender sbagai teks (React auto-escape), tanpa `dangerouslySetInnerHTML`; util `sanitizeText` | Sanitasi server-side tambahan |
| **SQL Injection** | Belum relevan (data di `localStorage`, bukan SQL) | **Parameterized query / ORM Prisma** |
| **Validasi input** | `src/lib/validate.js` (email, telepon, rating, harga, stok, kuantitas, diskon) | Re-validasi server-side wajib |
| **RBAC** | Route & aksi mengikuti **active role**; kepemilikan data ditegakkan di `api.js` | Verifikasi role + ownership di setiap endpoint |
| **Sesi** | Token/sesi kedaluwarsa 7 hari; logout membersihkan sesi | JWT bertanda tangan + expiry |

> Prinsip: backend **tidak boleh percaya** role/izin hanya karena muncul di UI —
> semua otorisasi diverifikasi ulang di server.

---

## 📁 Struktur Folder

```
src/
  components/        # Komponen reusable + Navbar/Footer/Layout/ProtectedRoute
    ui/              # Button, Input, Card, StarRating
  context/           # AuthContext (multi-role), CartContext
  lib/               # api.js (mock API), db.js (seed+localStorage), format.js, status.js
  pages/             # Halaman publik + dashboard per role (seller/, buyer/, driver/, admin/)
  App.jsx            # Definisi routing
  main.jsx
```

---

## 🔌 Rencana Integrasi Backend

Semua akses data melewati `src/lib/api.js` yang sudah berbentuk fungsi async
(mengembalikan Promise). Saat backend siap, cukup ganti isi tiap fungsi dengan
panggilan `fetch()` ke endpoint REST — komponen UI tidak perlu diubah.

> ⚠️ **Catatan:** `src/lib/db.js` (dan keseluruhan lapisan `src/lib/api.js`)
> bersifat **sementara** — hanya simulasi backend berbasis `localStorage` agar
> Level 1–7 bisa didemokan tanpa server. Akan **digantikan backend API asli**
> (Express + Prisma) tanpa mengubah komponen/halaman UI.

---

## 🧪 Panduan Demo End-to-End

1. **Guest:** buka beranda → jelajah katalog & detail produk → kirim **ulasan
   aplikasi** (tanpa login).
2. **Buyer** (`buyer1@seapedia.test`/`Buyer123`): top-up dompet → tambah produk
   ke keranjang (coba tambah dari toko berbeda → ditolak) → checkout pilih metode
   kirim + kode diskon (`SEAPEDIA10`) → cek ringkasan (subtotal, diskon, ongkir,
   PPN 12%, total) → bayar.
3. **Seller** (`seller1@seapedia.test`/`Seller123`): kelola toko & produk → buka
   **Pesanan Masuk** → **Proses Pesanan** (Sedang Dikemas → Menunggu Pengirim).
4. **Driver** (`driver1@seapedia.test`/`Driver123`): **Cari Job** → Ambil Job
   (→ Sedang Dikirim) → **Konfirmasi Selesai** (→ Pesanan Selesai); lihat penghasilan.
5. **Admin** (`admin@seapedia.test`/`Admin123`): Monitoring semua data → buat
   Voucher/Promo → menu **Overdue & Simulasi** → *Maju 3 Hari* untuk memicu
   **auto refund/return** pada pesanan yang belum selesai.
6. **Keamanan:** masukkan `<script>alert(1)</script>` di kolom ulasan →
   ditampilkan sebagai teks biasa (tidak tereksekusi).

> **Multi-role:** login `multi1@seapedia.test`/`Multi123` → muncul **pilih
> active role** → coba berganti role dari menu profil; otorisasi mengikuti role aktif.

## 📜 Dokumentasi API

Karena backend belum diintegrasikan, kontrak API direpresentasikan oleh fungsi
di `src/lib/api.js` (authApi, catalogApi, reviewApi, sellerApi, walletApi,
addressApi, cartApi, orderApi, discountApi, driverApi, adminApi). Dokumentasi
**Swagger/OpenAPI** resmi akan ditambahkan bersama backend.
