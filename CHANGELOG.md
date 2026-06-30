# Changelog - SEAPEDIA Web

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.1] - 2026-06-30

### Detail Versi 0.1.1

Penyempurnaan dokumentasi & tooling tanpa perubahan perilaku aplikasi.

#### 📝 Documentation

- **Deskripsi:**
  - **README:** Dirombak agar sesuai kondisi terintegrasi backend — perbaiki tarif
    ongkir (Rp20/10/5 ribu), SLA overdue (Regular 3 hari), aturan diskon (**satu
    kode per checkout**), kode voucher/promo demo, tabel keamanan FE vs BE, dan
    struktur folder; hapus referensi mock/`db.js`/Prisma
  - **Developer Guide:** Tambah `docs/DEVELOPER_GUIDE.md` (tech stack, arsitektur
    ringkas, quick start, env, scripts, konvensi kode, cara menambah fitur)
  - **Changelog Guide:** Perbaiki `docs/CHANGELOG_GUIDE.md` yang sebelumnya berisi
    konten proyek lain → disesuaikan untuk SEAPEDIA Web (React/Vite)

#### 🔧 Configuration

- **Deskripsi:**
  - **Release Script:** Pindah `scripts/release.mjs` → `scripts/release.js`
    (`package.json` `type: module` membuat `.js` sudah ESM); `npm run release` diperbarui

#### 🎨 UI/UX

- **Deskripsi:**
  - **Pesan Error Koneksi:** Diganti lebih ramah saat backend tidak aktif
    ("Server SEAPEDIA sedang tidak aktif. Coba lagi sebentar ya 🙏")

---

## [0.1.0] - 2026-06-30

### Detail Versi 0.1.0

Frontend web marketplace multi-role (Admin, Seller, Buyer, Driver) — implementasi
**Level 1 sampai Level 7** Technical Challenge COMPFEST 18 SEAPEDIA, terintegrasi
dengan SEAPEDIA API (Go).

#### 🚀 Initial Setup & Configuration

- **Deskripsi:**
  - **Vite + React Setup:** Inisialisasi SPA dengan React 19 + Vite, struktur folder
    modular (`components`, `pages`, `context`, `lib`)
  - **Routing:** `react-router-dom` dengan pemisahan rute publik & dashboard privat
  - **Design System:** Token warna/spacing/shadow + komponen reusable di `index.css`
    (font Plus Jakarta Sans)
  - **Environment Configuration:** `VITE_API_URL` untuk base URL backend
    (default `http://localhost:5000/api/v1`)

#### 🛠️ Technical Setup

- **Deskripsi:**
  - **HTTP Client:** `src/lib/http.js` — fetch wrapper dengan bearer JWT + parsing
    response envelope standar (`status`/`data`/`list_data`/`error_code`)
  - **API Adapter:** `src/lib/api.js` — memetakan response snake_case backend ke
    bentuk camelCase yang dipakai UI (auth, catalog, review, seller, wallet, address,
    cart, order, discount, driver, admin)
  - **State Context:** `AuthContext` (multi-role + active role + sesi) dan
    `CartContext` (badge keranjang reaktif)
  - **Reusable UI:** Button, Input, Card, Navbar, Footer, DashboardShell, ProtectedRoute,
    PriceBreakdown, OrderTimeline, StarRating, Loading
  - **Linting:** ESLint untuk menjaga konsistensi kode
  - **Release Manager:** Script interaktif `scripts/release.js` untuk bump version,
    commit, tag, dan push (`npm run release`)

#### 🔐 Level 1 — Marketplace Publik, Autentikasi, Multi-Role & Review

- **Deskripsi:**
  - **Halaman Publik:** Landing, katalog produk, detail produk read-only, login & register
  - **Autentikasi:** Register/login (pakai **email**) + logout (invalidasi token server-side)
  - **Multi-Role & Active Role:** Halaman pemilihan role aktif; otorisasi rute mengikuti
    **active role**; ganti role memanggil `/auth/select-role` (token baru)
  - **Profil:** Ringkasan role yang dimiliki + role aktif + entry point saldo lintas role
  - **Public Review:** Form ulasan aplikasi (nama, rating 1–5, komentar) tanpa transaksi,
    dirender sebagai teks (aman XSS)

#### 🏪 Level 2 — Seller: Toko & Produk

- **Deskripsi:**
  - **Store Management:** Form buat/ubah toko (nama unik, error bila duplikat) + halaman toko publik
  - **Product CRUD:** Buat/ubah/hapus produk milik sendiri lewat dashboard seller
  - **Public Catalog:** Katalog & detail produk dari data backend + info toko + **foto produk**

#### 🛒 Level 3 — Buyer: Wallet, Cart & Checkout

- **Deskripsi:**
  - **Wallet:** Saldo, dummy top-up, riwayat transaksi
  - **Address:** CRUD alamat pengiriman (validasi nama/telepon/alamat)
  - **Cart (single-store):** Add/update/remove + aturan satu toko (dijelaskan di UI)
  - **Checkout:** Ringkasan subtotal, ongkir per metode, **PPN 12%**, total; cek saldo;
    status awal **Sedang Dikemas**; riwayat & detail order + timeline status

#### 🎟️ Level 4 — Diskon & Pemrosesan Order Seller

- **Deskripsi:**
  - **Diskon di Checkout:** Input satu kode (voucher/promo), totals dihitung server via preview
  - **Seller Process Order:** Tombol proses Sedang Dikemas → Menunggu Pengirim + timeline
  - **Laporan:** Laporan pengeluaran buyer & pendapatan seller

#### 🚚 Level 5 — Pengiriman & Workflow Driver

- **Deskripsi:**
  - **Driver Jobs:** Cari job (Menunggu Pengirim), detail job, ambil job (→ Sedang Dikirim),
    konfirmasi selesai (→ Pesanan Selesai)
  - **Driver Dashboard:** Job aktif, riwayat, total penghasilan (80% ongkir)

#### 🛡️ Level 6 — Admin Monitoring & Overdue

- **Deskripsi:**
  - **Monitoring:** Tab users, stores, products, orders, voucher/promo, delivery, overdue
  - **Discount Management UI:** Generate voucher/promo + list + detail
  - **Overdue & Simulasi Waktu:** Tombol maju N hari + jalankan sweep overdue (auto refund/return)

#### 🔒 Level 7 — Security & Finalisasi

- **Deskripsi:**
  - **XSS:** Konten user dirender sebagai teks (React auto-escape), util `sanitizeText`
  - **Validasi Input:** Email, telepon, rating, harga, stok, kuantitas, diskon (`src/lib/validate.js`)
  - **RBAC:** Rute & aksi mengikuti active role; sesi kedaluwarsa + logout membersihkan sesi
  - **Dokumentasi:** README, panduan demo end-to-end, security notes, akun demo

#### 🎨 UI/UX

- **Deskripsi:**
  - Tampilan modern (gradien, glass navbar, kartu interaktif, responsif desktop/mobile)
  - Foto produk asli (`image_url`) dengan fallback ikon
  - Loading spinner + empty state + panduan 3 langkah di beranda

---

