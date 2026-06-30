# Panduan Changelog - SEAPEDIA Web

Panduan menulis & memelihara `CHANGELOG.md` untuk frontend **SEAPEDIA Web**
(React + Vite).

Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) dan
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

- **Sumber versi:** field `version` di `package.json`.
- **Release otomatis:** `npm run release` (lihat `scripts/release.js`) 	— bump
  version, commit, tag, dan push. Script menolak release bila `CHANGELOG.md`
  belum punya entry `## [X.Y.Z]` untuk versi target.
- **Changelog aktif:** lihat [`../CHANGELOG.md`](../CHANGELOG.md).

---

## Template Update Selanjutnya

Gunakan template ini saat menambahkan versi baru di `CHANGELOG.md`:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Detail Versi X.Y.Z

#### 📦 Kategori Perubahan (pilih yang sesuai)

- **Deskripsi:**
  - **Nama Fitur/Fix:** Penjelasan detail perubahan
  - **Impact:** Dampak ke pengguna / alur UI
  - **Technical Notes:** Catatan teknis (komponen/hook/route yang terdampak)
```

### Kategori yang Tersedia

- `✨ Fitur Baru` — halaman, komponen, atau alur baru
- `🐛 Bug Fix` — perbaikan bug UI/logic
- `🎨 UI/UX` — styling, layout, aksesibilitas, micro-interaction
- `🚀 Peningkatan Performa` — bundle size, lazy-load, memoization
- `🔒 Security` — XSS, sanitasi input, penanganan token/sesi
- `🔌 API Integration` — penyesuaian terhadap endpoint/kontrak backend
- `📝 Documentation` — README, panduan, komentar
- `♻️ Refactor` — rapikan kode tanpa mengubah perilaku
- `🔧 Configuration` — Vite, ESLint, env vars
- `🧪 Testing` — penambahan/update test
- `🔨 Breaking Changes` — perubahan yang memutus kompatibilitas

---

## Contoh Entry Changelog

### Contoh 1: Penambahan Fitur Baru (MINOR)

```markdown
## [0.2.0] - 2026-07-10

### Detail Versi 0.2.0

#### ✨ Pencarian & Filter Katalog

- **Deskripsi:**
  - **Halaman:** `Products` mendukung query `?search=` & filter kategori
  - **Komponen:** Input pencarian debounce + dropdown kategori
  - **Impact:** Buyer/guest lebih cepat menemukan produk
  - **Technical Notes:** Memakai `useSearchParams`, hasil dari `catalogApi.listProducts`

#### 🎨 UI/UX

- **Deskripsi:**
  - **Skeleton Loading:** Placeholder kartu produk saat fetch
  - **Empty State:** Pesan ramah saat hasil pencarian kosong
```

### Contoh 2: Bug Fix (PATCH)

```markdown
## [0.1.1] - 2026-07-02

### Detail Versi 0.1.1

#### 🐛 Bug Fix Checkout

- **Deskripsi:**
  - **Kode Diskon:** Perbaikan kode tidak valid yang tetap mengurangi total
  - **Saldo:** Tombol bayar nonaktif bila saldo < total
  - **Impact:** Mencegah checkout dengan total yang salah

#### 🔒 Security

- **Deskripsi:**
  - **Sanitasi Ulasan:** Pastikan komentar dirender sebagai teks (anti-XSS)
```

### Contoh 3: Breaking Changes (MAJOR)

```markdown
## [1.0.0] - 2026-08-01

### Detail Versi 1.0.0

#### 🔨 Breaking Changes

- **Deskripsi:**
  - **Auth:** Login berpindah dari `username` ke **email** mengikuti kontrak backend baru
  - **Routing:** Path dashboard dipindah dari `/dashboard/*` ke `/{role}/*`
  - **Impact:** Sesi lama tidak kompatibel — pengguna harus login ulang

#### 🔌 API Integration

- **Deskripsi:**
  - **Adapter:** `src/lib/api.js` menyesuaikan field response baru (snake_case → camelCase)
```

---

## Pedoman Versioning

### MAJOR (X.0.0)

- Perubahan yang memutus kompatibilitas (auth, struktur rute, kontrak data UI)
- Penyesuaian besar yang mengharuskan aksi pengguna (mis. login ulang)
- Penggantian/penghapusan halaman atau alur utama

### MINOR (0.X.0)

- Penambahan halaman/komponen/fitur yang backward-compatible
- Penambahan opsi/field opsional pada form atau tampilan
- Peningkatan UX signifikan tanpa memutus alur lama

### PATCH (0.0.X)

- Bug fix
- Perbaikan styling/teks/copy
- Peningkatan performa kecil tanpa perubahan perilaku
- Refactor internal tanpa perubahan tampilan/perilaku

---

## Alur Release (singkat)

1. Tambahkan entry `## [X.Y.Z] - YYYY-MM-DD` di `CHANGELOG.md` (pakai template di atas).
2. Pastikan `npm run build` lolos.
3. Jalankan `npm run release` → pilih tipe bump → pilih *Hanya bump* atau *Release penuh*.
4. Script otomatis update `package.json`, commit (deskripsi changelog jadi body),
   tag `vX.Y.Z` (release penuh), lalu push.

> Catatan: release penuh hanya dari branch `dev`; tag versi tidak boleh sudah ada.

---

## Changelog Maintenance — Best Practices

1. **Update setiap rilis** — dokumentasikan semua perubahan yang user-facing.
2. **Kelompokkan per kategori** (emoji) agar mudah dibaca.
3. **Tulis impact ke pengguna**, bukan sekadar detail teknis.
4. **Tandai breaking changes** dengan 🔨 dan prefix `BREAKING`.
5. **Sertakan komponen/route terdampak** untuk memudahkan review.

### Contoh Buruk ❌

```markdown
## [0.2.0] - 2026-07-10
- nambah search
- fix bug
- ganti style
```

### Contoh Baik ✅

```markdown
## [0.2.0] - 2026-07-10

### Detail Versi 0.2.0

#### ✨ Pencarian Katalog

- **Deskripsi:**
  - **Halaman:** `Products` — pencarian + filter kategori
  - **Impact:** Menemukan produk lebih cepat
  - **Technical Notes:** `useSearchParams` + `catalogApi.listProducts`
```

---

## Version History Reference

| Version | Date       | Type    | Description                                                          |
| ------- | ---------- | ------- | -------------------------------------------------------------------- |
| 0.1.0   | 2026-06-30 | Initial | Frontend Level 1–7 + integrasi SEAPEDIA API, UI modern, foto produk |

---

**Note:** Changelog akan terus diupdate seiring pengembangan. Untuk breaking
changes, jelaskan dampaknya ke pengguna dan langkah yang perlu dilakukan.