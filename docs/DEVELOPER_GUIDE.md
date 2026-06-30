# Developer Guide — SEAPEDIA Web

> Ringkasan untuk developer frontend. Backend & kontrak API: lihat repo
> `saepedia-api` (`docs/API_ENDPOINTS.md`, Postman). Changelog:
> [../CHANGELOG.md](../CHANGELOG.md) · panduannya: [CHANGELOG_GUIDE.md](CHANGELOG_GUIDE.md).

---

## 1. Tech Stack

| Layer | Library |
|---|---|
| UI | [React](https://react.dev) 19 |
| Build / Dev server | [Vite](https://vite.dev) 8 |
| Routing | [react-router-dom](https://reactrouter.com) 7 |
| State | React Context (`AuthContext`, `CartContext`) |
| HTTP | `fetch` (wrapper di `src/lib/http.js`) |
| Lint | ESLint |
| Styling | CSS design system (`src/index.css`) |

---

## 2. Arsitektur

```
src/
  components/  (ui/)   # Komponen reusable + Navbar/Footer/ProtectedRoute
  context/             # AuthContext (multi-role), CartContext
  lib/                 # http.js, api.js, format.js, status.js, validate.js, navConfig.js
  pages/               # Halaman publik + dashboard per role (seller/ buyer/ driver/ admin/)
  App.jsx · main.jsx   # Routing & entry point
```

Alur data: **Page → `api.js` → `http.js` → SEAPEDIA API**. `api.js` memetakan
response backend (snake_case) ke camelCase yang dipakai UI. Otorisasi rute lewat
`<ProtectedRoute roles={[...]} />` mengikuti **active role**.

---

## 3. Quick Start

> Butuh backend `saepedia-api` berjalan di `http://localhost:5000` lebih dulu.

```bash
npm install
cp .env.example .env    # opsional — set VITE_API_URL bila beda
npm run dev             # http://localhost:5173
```

---

## 4. Environment Variables

```env
VITE_API_URL=http://localhost:5000/api/v1
```

> Default sudah mengarah ke sana bila `.env` tidak dibuat. Variabel Vite **wajib**
> berprefiks `VITE_` agar terbaca di klien.

---

## 5. NPM Scripts

| Command | Deskripsi |
|---|---|
| `npm run dev` | Dev server + HMR (port 5173) |
| `npm run build` | Build produksi ke `dist/` |
| `npm run preview` | Pratinjau hasil build |
| `npm run lint` | Jalankan ESLint |
| `npm run release` | Release manager (bump version + commit + tag + push) |

---

## 6. Konvensi Kode

- **API call**: selalu lewat `src/lib/api.js` (jangan `fetch` langsung di komponen).
  `http.js` otomatis menyisipkan bearer JWT & mem-parsing envelope
  (`status`/`data`/`list_data`/`error_code`); error dilempar sebagai `Error` dengan `.code`.
- **Auth**: pakai `useAuth()` (`user`, `activeRole`, `login`, `logout`, `setActiveRole`).
  Bungkus rute privat dengan `<ProtectedRoute roles={[...]}>`.
- **UI**: gunakan komponen reusable (`Button`, `Input`, `Card`, …) + class design
  system di `index.css`; hindari inline-style besar.
- **Uang / status / aturan**: ambil dari `lib/format.js` (`formatIDR`, `calcCheckout`,
  `DELIVERY_METHODS`) & `lib/status.js` (`ORDER_STATUS`) — jangan hardcode.
- **Keamanan**: render konten user sebagai teks (tanpa `dangerouslySetInnerHTML`);
  validasi input lewat `lib/validate.js`.

---

## 7. Menambah Halaman / Fitur Baru

1. Tambah fungsi di `src/lib/api.js` (panggil endpoint + map response ke camelCase).
2. Buat halaman di `src/pages/...` memakai komponen reusable.
3. Daftarkan route di `App.jsx` (bungkus `ProtectedRoute` bila privat); tambahkan
   link sidebar di `src/lib/navConfig.js` bila masuk dashboard role.
