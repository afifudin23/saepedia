# 🌊 SEAPEDIA — Marketplace Multi-Role

SEAPEDIA adalah aplikasi marketplace e-commerce multi-toko untuk Technical
Challenge **COMPFEST 18 — Software Engineering Academy**. Aplikasi menghubungkan
**Admin, Seller, Buyer, dan Driver** dalam satu ekosistem belanja.

> **Status:** Frontend **Level 1–7** (React + Vite), **terintegrasi penuh**
> dengan backend SEAPEDIA API (Go) melalui `fetch`. Seluruh data berasal dari API.

---

## 🧱 Stack

- **Frontend:** React 19 + Vite + React Router
- **Backend:** SEAPEDIA API — **Go** (Gin + GORM + PostgreSQL + JWT) — repo terpisah `saepedia-api`
- **Auth state:** React Context + `localStorage` (menyimpan JWT + active role)
- **Komunikasi:** `fetch` via `src/lib/http.js`; pemetaan response di `src/lib/api.js`

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

| Email                     | Password      | Role                                 |
| ------------------------- | ------------- | ------------------------------------ |
| `admin@seapedia.test`   | `Admin123`  | Admin                                |
| `seller1@seapedia.test` | `Seller123` | Seller (punya toko + produk)         |
| `buyer1@seapedia.test`  | `Buyer123`  | Buyer (saldo Rp1.000.000)            |
| `driver1@seapedia.test` | `Driver123` | Driver                               |
| `multi1@seapedia.test`  | `Multi123`  | Buyer + Seller + Driver (multi-role) |

> Seeder juga membuat `seller2/3`, `buyer2/3`, `driver2` (pola password sama per role).

**Setup Admin:** admin dibuat lewat seeder backend (`scripts/seed`); registrasi
publik tidak bisa membuat admin. Admin selalu memiliki role aktif `admin`.

---

## 🗺️ Fitur per Level

### Level 1 — Public Marketplace, Authentication & Reviews

- Landing page, katalog produk publik, detail produk read-only.
- Register & **login pakai email**; password di-hash (argon2id) + **JWT** di backend.
- **Multi-role:** satu akun bisa punya >1 role; setelah login user **memilih
  active role** (`/select-role`). Ganti role memanggil `/auth/select-role`
  (token baru). Otorisasi mengikuti **active role**, bukan sekadar daftar role.
- Ulasan aplikasi publik (rating 1–5 + komentar) tanpa perlu checkout.
- Komponen reusable (Button, Input, Card, Navbar, Footer) + routing publik vs
  privat + dashboard shells untuk semua role + nav responsif.

### Level 2 — Seller Experience

- Buat/ubah profil toko dengan **nama unik** (validasi anti-duplikat).
- CRUD produk (nama, deskripsi, harga, stok, **foto via URL**) — seller hanya
  dapat mengubah produk miliknya.
- Katalog publik menampilkan produk dari toko nyata + blok info toko + **foto produk**.

### Level 3 — Buyer Wallet, Cart & Checkout

- Dompet + **top-up simulasi** + riwayat transaksi.
- Manajemen alamat pengiriman (validasi nama/telepon/alamat).
- Keranjang dengan **aturan satu toko** (lihat di bawah).
- Checkout: metode pengiriman (Instant / Next Day / Regular), perhitungan
  **subtotal, diskon, ongkir, PPN 12%, total**, pengecekan saldo, pengurangan
  stok aman (tidak negatif), pembuatan order + **riwayat status bertimestamp**.
- Riwayat & detail pesanan Buyer (dengan timeline status), daftar pesanan masuk
  Seller.

### Level 4 — Discounts & Seller Order Processing

- Sistem **Voucher & Promo** (dibedakan via `kind`): voucher punya kuota pakai &
  kedaluwarsa; promo punya kedaluwarsa. Admin generate/list/detail + validasi
  saat checkout + efek diskon di ringkasan.
- **Seller memproses pesanan**: Sedang Dikemas → Menunggu Pengirim (timeline +
  timestamp, hanya pemilik toko).
- **Laporan Buyer** (pengeluaran) & **Laporan Seller** (pendapatan).

### Level 5 — Delivery & Driver Workflow

- Job muncul untuk Driver hanya saat status **Menunggu Pengirim**; ada halaman
  detail job.
- Ambil job (→ Sedang Dikirim, satu order satu driver) & konfirmasi selesai
  (→ Pesanan Selesai). Setiap perubahan bertimestamp.
- Dashboard Driver: job aktif, riwayat, penghasilan. Tracking di Buyer & Seller.

### Level 6 — Admin Monitoring & Overdue Handling

- Dashboard monitoring: users, stores, products, orders, voucher/promo,
  pengiriman, overdue.
- **UI kelola Voucher & Promo** (buat + daftar + **detail**).
- **Overdue auto refund/return** berdasarkan SLA metode kirim + **simulasi
  waktu** (maju N hari → auto-handle). Refund kembali ke dompet, stok dipulihkan,
  status → Dikembalikan, tercegah dari refund ganda.

### Level 7 — Security Hardening & Finalization

- **XSS:** konten user (ulasan/komentar) dirender sebagai teks via JSX (React
  auto-escape); tidak ada `dangerouslySetInnerHTML`. Util `sanitizeText`
  (`src/lib/validate.js`) sebagai pertahanan tambahan; backend juga meng-escape saat simpan.
- **SQL Injection:** dicegah di backend lewat **GORM / parameterized query**.
- **Validasi input:** email, telepon, rating (1–5), harga, stok, kuantitas,
  nilai diskon — divalidasi di frontend & **wajib divalidasi ulang server-side**.
- **RBAC:** route privat & aksi data mengikuti **active role**; kepemilikan data
  ditegakkan server-side (produk seller, order buyer, job driver).
- **Sesi:** JWT (24 jam di backend); **logout meng-invalidate token** (denylist);
  frontend juga menyimpan kedaluwarsa sesi & membersihkan saat logout.

---

## 📐 Aturan Bisnis Penting

### Aturan Keranjang Satu Toko (Single-store checkout)

> **Satu keranjang hanya boleh berisi produk dari satu toko.**

Jika Buyer menambahkan produk dari toko berbeda, sistem menolak (backend `409 CONFLICT`) dan meminta mengosongkan keranjang dulu. Aturan ini:

- ditampilkan jelas di halaman Keranjang & saat menambah produk,
- ditegakkan di backend; di frontend error dipetakan menjadi `DIFFERENT_STORE`.

### Perhitungan PPN 12%

PPN dihitung sebesar **12%** dari **(subtotal − diskon)** — diskon diterapkan
**sebelum** PPN:

```
taxable      = subtotal − diskon
PPN          = taxable × 12%
Total Akhir  = taxable + ongkir + PPN
```

Totals di checkout **dihitung oleh backend** (endpoint `checkout/preview`) agar
konsisten; `src/lib/format.js` (`calcCheckout`) hanya cerminan untuk tampilan.

### Ongkos Kirim per Metode

| Metode   | `delivery_method` | Tarif    | Estimasi  |
| -------- | ------------------- | -------- | --------- |
| Instant  | `instant`         | Rp20.000 | ± 1 jam  |
| Next Day | `next_day`        | Rp10.000 | 1 hari    |
| Regular  | `regular`         | Rp5.000  | 2–3 hari |

### Status Order (lifecycle utama)

`Sedang Dikemas → Menunggu Pengirim → Sedang Dikirim → Pesanan Selesai`
(dan `Dikembalikan`). Setelah checkout sukses, status awal selalu
**Sedang Dikemas**. Setiap perubahan status disimpan dengan timestamp.

### Aturan Diskon (Voucher & Promo)

- **Satu kode per checkout** (voucher **ATAU** promo, tidak digabung).
- **Diskon dihitung dari subtotal, SEBELUM PPN** (lihat rumus PPN di atas).
- Voucher kedaluwarsa / kuota habis dan Promo kedaluwarsa **ditolak**.
- Voucher (punya kuota) & Promo (tanpa kuota) dibedakan jelas di sistem (`kind`).

Kode demo dari seed — voucher: `SEAPEDIA10`, `GROCERY15`, `NEWUSER20`, `FLASH25`,
`HEMAT50K`; promo: `HEMAT5K`, `POTONG10K`, `POTONG20K`, `PROMO10`, `GAJIAN`.

### Aturan Penghasilan Driver

Driver memperoleh **80% dari ongkos kirim** untuk setiap job yang diselesaikan
(dikunci di backend saat job selesai; `src/lib/format.js` → `driverEarning`
untuk tampilan).

### SLA Overdue & Simulasi Waktu

| Metode   | SLA (batas selesai) |
| -------- | ------------------- |
| Instant  | 1 hari              |
| Next Day | 2 hari              |
| Regular  | 3 hari              |

Pesanan yang sudah dibayar tetapi belum **Pesanan Selesai** melewati SLA →
**auto refund + return**: dana kembali ke dompet Buyer (tercatat di riwayat),
stok dipulihkan, status → **Dikembalikan**, dan dicegah dari refund/restore
ganda. Pendapatan Seller tidak menghitung pesanan yang dikembalikan.

**Simulasi waktu:** login sebagai Admin → menu *Overdue & Simulasi* → tombol
**Maju 1/3 Hari** memajukan jam virtual lalu menjalankan sweep overdue otomatis.
Tersedia juga *Jalankan Sweep Sekarang*.

---

## 🔐 Keamanan (Security Notes)

| Aspek                    | Frontend (SEAPEDIA Web)                                                                                        | Backend (SEAPEDIA API)                              |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **XSS**            | Konten user dirender sebagai teks (React auto-escape), tanpa`dangerouslySetInnerHTML`; util `sanitizeText` | Escape konten user saat disimpan                    |
| **SQL Injection**  | — (tidak akses DB langsung)                                                                                   | **GORM / parameterized query**                |
| **Validasi input** | `src/lib/validate.js` (email, telepon, rating, harga, stok, kuantitas, diskon)                               | `go-playground/validator` (re-validasi wajib)     |
| **RBAC**           | Route & aksi mengikuti**active role**                                                                    | Verifikasi active role + ownership di tiap endpoint |
| **Sesi / Token**   | Simpan JWT + kedaluwarsa; logout bersihkan sesi                                                                | JWT HS256 (24 jam) +**denylist logout**       |

> Prinsip: backend **tidak percaya** role/izin hanya karena muncul di UI —
> semua otorisasi diverifikasi ulang di server.

---

## 📁 Struktur Folder

```
src/
  components/        # Navbar, Footer, Layout, ProtectedRoute, DashboardShell,
                     #   ProductCard, Reviews, PriceBreakdown, OrderTimeline
    ui/              # Button, Input, Card, StarRating, Loading
  context/           # AuthContext (multi-role + active role), CartContext
  lib/               # http.js (fetch client), api.js (adapter ke backend),
                     #   format.js, status.js, validate.js, navConfig.js
  pages/             # Halaman publik + dashboard per role (seller/ buyer/ driver/ admin/)
  App.jsx            # Definisi routing
  main.jsx
scripts/release.js   # Release manager (npm run release)
docs/CHANGELOG_GUIDE.md
CHANGELOG.md
```

---

## 🔌 Integrasi Backend

Seluruh akses data melewati `src/lib/api.js` yang memanggil backend via
`src/lib/http.js` (fetch + bearer JWT + parsing envelope `status`/`data`/
`list_data`/`error_code`). Adapter memetakan response **snake_case** backend ke
bentuk **camelCase** yang dipakai komponen, sehingga UI tetap rapi tanpa
tersebar logika parsing.

Modul API: `authApi`, `catalogApi`, `reviewApi`, `sellerApi`, `walletApi`,
`addressApi`, `cartApi`, `orderApi`, `discountApi`, `driverApi`, `adminApi`.

---

## 📜 Dokumentasi API

Swagger UI = **origin** dari `VITE_API_URL` (tanpa `/api/v1`) + `/docs/v1/index.html`.

Default (lokal): [http://localhost:5000/docs/v1/index.html](http://localhost:5000/docs/v1/index.html)

---

## 🏷️ Changelog & Release

- Catatan rilis: [`CHANGELOG.md`](CHANGELOG.md) (format Keep a Changelog + SemVer).
- Panduan menulis changelog: [`docs/CHANGELOG_GUIDE.md`](docs/CHANGELOG_GUIDE.md).
- Rilis terbantu: **`npm run release`** (`scripts/release.js`) — bump versi di
  `package.json`, commit, tag `vX.Y.Z`, dan push secara interaktif.

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

