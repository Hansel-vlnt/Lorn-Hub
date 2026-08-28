# ⚖️ Lorn-Hub — Asisten & Kompilasi Hukum Indonesia (PWA Offline-First)

**Lorn-Hub** adalah platform web Progressive Web App (PWA) modern yang dirancang khusus untuk **mahasiswa hukum dan praktisi hukum di Indonesia**. Aplikasi ini memecahkan masalah akses regulasi yang lambat dan berat dengan menyediakan database pasal-pasal hukum terstruktur yang dapat diakses dan dicari secara **100% offline**, cepat (0.01 detik), serta dapat di-install langsung di smartphone (Android & iOS) dan PC/Laptop.

---

## 🌟 Fitur Utama

1. **⚡ Pencarian Kilat Offline (0.01s):**
   - Pencarian nomor pasal (contoh: `362`, `1365`, `28A`, `77`).
   - Pencarian kata kunci kasus & unsur delik (contoh: `pencurian`, `wanprestasi`, `pencemaran nama baik`, `praperadilan`, `gratifikasi`, `pesangon`).
   - Filter berdasarkan rumpun hukum: *Pidana, Perdata, Tata Negara, Acara, Khusus, Ketenagakerjaan*.

2. **🔄 Komparasi KUHP Baru (UU 1/2023) vs KUHP Lama (WvS):**
   - Tampilan *side-by-side* perbandingan pasal demi pasal antara KUHP Kolonial (Wetboek van Strafrecht) dan KUHP Nasional 2023.
   - Penjelasan pokok perbedaan ancaman pidana, pergeseran delik aduan, dan catatan penting untuk ujian/sidang semu.

3. **🎓 Toolkit Belajar Mahasiswa Hukum (Study Desk):**
   - **Highlighter / Stabilo Digital:** Tandai pasal penting dengan 5 pilihan warna (Kuning, Hijau, Biru, Pink, Oranye).
   - **Catatan Kuliah Pribadi:** Tambahkan catatan materi dosen atau ringkasan yuridis pada tiap pasal.
   - **Bookmark & Folder Koleksi:** Kelompokkan pasal ke dalam folder (contoh: *Hukum Pidana 1*, *Moot Court*, *Tugas Skripsi*).
   - **Generator Sitasi Resmi 1-Klik:** Salin kutipan dalam format *Footnote Standar FH Indonesia*, *Daftar Pustaka*, *In-text Citation*, dan format teks ringkas WhatsApp.

4. **📱 Progressive Web App (PWA) & Offline Ready:**
   - Bisa di-install di layar utama HP tanpa perlu melalui App Store / Play Store.
   - Full Service Worker caching — tetap berfungsi normal di ruang sidang, kelas, atau ruang bawah tanah tanpa koneksi internet.
   - Pengaturan mode gelap/terang, ukuran font, dan pilihan font *Serif (buku hukum)* vs *Sans-Serif (modern)*.

---

## 📚 Dataset Hukum Bawaan

| No | Regulasi | Kode | Kategori |
|---|---|---|---|
| 1 | **UUD 1945** (Perubahan I-IV) | `UUD-1945` | Tata Negara / Konstitusi |
| 2 | **KUHP Baru** (UU No. 1 Tahun 2023) | `KUHP-2023` | Hukum Pidana Materiil |
| 3 | **KUHP Lama** (WvS / Staatsblad 1915:732) | `KUHP-WVS` | Hukum Pidana Materiil |
| 4 | **KUHPerdata** (Burgerlijk Wetboek / BW) | `KUHPERDATA` | Hukum Perdata |
| 5 | **KUHAP** (UU No. 8 Tahun 1981) | `KUHAP` | Hukum Acara Pidana |
| 6 | **UU ITE** (UU 11/2008 jo UU 1/2024) | `UU-ITE` | Hukum Siber & Informasi |
| 7 | **UU Tipikor** (UU 31/1999 jo UU 20/2001) | `UU-TIPIKOR` | Tindak Pidana Khusus |
| 8 | **UU Ketenagakerjaan** (Pasca UU Cipta Kerja) | `UU-NAKER` | Hukum Ketenagakerjaan |

---

## 📂 Struktur Folder Proyek

```
Lorn-Hub/
├── public/
│   ├── favicon.svg               # Ikon timbangan keadilan
│   └── data/                     # Dataset JSON hukum terstruktur
│       ├── uud-1945.json
│       ├── kuhp-baru-uu-1-2023.json
│       ├── kuhp-lama-wvs.json
│       ├── kuhperdata.json
│       ├── kuhap.json
│       ├── uu-ite.json
│       ├── uu-tipikor.json
│       └── uu-ketenagakerjaan.json
├── src/
│   ├── components/
│   │   ├── layout/               # Header, MobileNav, Sidebar, OfflineBanner, PwaInstallPrompt
│   │   ├── search/               # SearchBar, FilterChips, SearchResultCard, SearchView
│   │   ├── law/                  # LawReader, ArticleCard, TableOfContents
│   │   ├── comparison/           # KuhpComparisonMatrix
│   │   ├── study/                # StudyDesk, NotesDrawer, BookmarkDrawer, CitationModal
│   │   └── ui/                   # Badge, Button, Modal, Tabs, Toast
│   ├── context/
│   │   ├── LawContext.tsx         # Legal datasets cache & search indexer
│   │   ├── UserDataContext.tsx    # Notes, bookmarks, highlights persistence
│   │   └── ThemeContext.tsx       # Dark mode & typography settings
│   ├── hooks/
│   │   ├── useSearch.ts           # MiniSearch full-text query hook
│   │   ├── useOfflineStatus.ts    # Online/offline network detection
│   │   └── usePWAInstall.ts       # PWA Add to Home Screen install prompt
│   ├── services/
│   │   ├── searchEngine.ts        # MiniSearch multi-field search engine
│   │   ├── storageService.ts      # LocalStorage & IndexedDB service
│   │   └── citationGenerator.ts   # Legal Footnote & APA bibliography generator
│   ├── types/
│   │   ├── law.ts                 # Schema artikel, ayat, metadata hukum
│   │   ├── search.ts              # Schema filter & hasil pencarian
│   │   └── user.ts                # Schema bookmark, highlight, dan catatan
│   ├── data/
│   │   ├── lawsMetadata.ts        # Katalog undang-undang
│   │   └── comparisons.ts         # Matriks KUHP Baru vs Lama
│   ├── App.tsx                    # Root container & navigation router
│   ├── main.tsx                   # React root & providers wrapper
│   └── index.css                  # Tailwind styles & legal typography
├── index.html                     # HTML5 template & PWA meta tags
├── vite.config.ts                 # Vite + React + VitePWA plugin config
├── tailwind.config.js             # Tailwind theme & legal color palette
├── tsconfig.json                  # TypeScript compiler settings
└── package.json
```

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

### Prasyarat
- **Node.js** (versi 18 ke atas)
- **npm** atau package manager lainnya

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Server Pengembangan (Development Mode)
```bash
npm run dev
```
Buka browser di alamat `http://localhost:5173`.

### 3. Build untuk Produksi (PWA Standalone Production)
```bash
npm run build
npm run preview
```

---

## 📄 Lisensi
Proyek ini dibuat untuk mendukung kemudahan akses hukum dan pembelajaran bagi mahasiswa hukum dan masyarakat Indonesia.
