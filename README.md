<p align="center"><img src="favicon.svg" width="64" alt="Logo Ruang Tulis" /></p>

<h1 align="center">Ruang Tulis</h1>

<p align="center">Blog pribadi berbahasa Indonesia untuk opini, refleksi, dan catatan, dengan editor tulis bergaya Telegra.ph.</p>

<p align="center">
  <img alt="Stack" src="https://img.shields.io/badge/situs-HTML%20%C2%B7%20CSS%20%C2%B7%20JS%20murni-f0db4f?style=flat-square" />
  <img alt="Editor" src="https://img.shields.io/badge/editor-TipTap-0ea5e9?style=flat-square" />
  <img alt="Hosting" src="https://img.shields.io/badge/hosting-GitHub%20Pages-555?style=flat-square" />
  <img alt="Penerbitan" src="https://img.shields.io/badge/penerbitan-Cloudflare%20Worker-f38020?style=flat-square" />
</p>

<p align="center">
  <a href="https://andikapramudya-project.github.io/Ruang-Tulis/">Kunjungi situs</a> ·
  <a href="#fitur">Fitur</a> ·
  <a href="#menjalankan-secara-lokal">Menjalankan</a> ·
  <a href="#menambah-tulisan">Menambah tulisan</a> ·
  <a href="docs/AKTIVASI-EDITOR.md">Aktivasi editor</a>
</p>

---

## Ringkasan

Ruang Tulis adalah situs statis yang cepat, tanpa framework, dan siap di-hosting di GitHub Pages. Menulis dilakukan lewat editor di browser: tulis judul dan isi, tempel gambar, lalu klik **Terbitkan**. Tulisan, gambar, dan daftar tulisan masuk ke GitHub dalam satu commit.

## Fitur

**Pembaca**

- Tampilan bersih bergaya Notion: palet netral, font Inter, label kategori netral, tema terang dan gelap mengikuti perangkat.
- Beranda dengan tulisan unggulan bergambar, arsip per bulan, dan filter kategori.
- Halaman artikel dengan breadcrumb, estimasi waktu baca, bar progres baca, serta tautan tulisan sebelumnya/berikutnya.
- Responsif dari 375 px hingga layar lebar, dengan navigasi keyboard, *skip link*, dan dukungan `prefers-reduced-motion`.
- Pratinjau tautan (Open Graph) saat dibagikan.

**Penulis** (`tulis.html`)

- Editor rich text berbasis TipTap: tebal, miring, judul, tautan, kutipan, dan daftar.
- Gambar ditempel atau diseret, lalu otomatis diperkecil (maks. 1600 px) dan dikonversi ke WebP.
- Draft tersimpan otomatis di browser, lengkap dengan pratinjau.
- Satu klik **Terbitkan**, tanpa unggah file Markdown manual.
- Login GitHub lewat Cloudflare Worker; hanya akun pemilik yang boleh menerbitkan.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Situs pembaca | HTML, CSS, dan JavaScript murni |
| Editor | TipTap, `marked`, `dompurify`, `turndown`, dibangun dengan esbuild |
| Penerbitan | Cloudflare Worker dan GitHub OAuth |
| Konten | Markdown di folder `posts/` |

## Struktur proyek

```text
index.html            Halaman pembaca
tulis.html            Editor penulis
style.css, editor.css Gaya situs dan editor
script.js             Logika pembaca: routing, daftar, artikel
ui.js                 Ikon dan tombol tema (dipakai bersama)
writer-ui.js          Menu dan toolbar ruang penulis
manage.js             Hapus tulisan yang sudah terbit dari ruang penulis
theme-init.js         Menerapkan tema tersimpan sebelum render pertama
site.config.js        Konfigurasi publik (repositori, alamat situs, Worker)
posts/                Tulisan (Markdown)
posts.json            Daftar tulisan (judul, tanggal, kategori, ringkasan, sampul)
images/               Gambar tulisan
src/, lib/            Sumber editor, renderer, dan modul bersama
assets/               Hasil build editor dan renderer
publisher/            Cloudflare Worker untuk penerbitan
scripts/              Skrip dev dan build
docs/                 Panduan aktivasi editor
tests/                Pengujian layanan penerbitan dan sematan
```

## Menjalankan secara lokal

Butuh Node.js versi LTS terbaru.

```sh
npm ci
npm run dev      # buka http://127.0.0.1:4173
npm test         # jalankan pengujian
npm run build    # bangun ulang assets/ dan bundle Worker setelah mengubah src/ atau publisher/
```

Menambah tulisan tidak memerlukan build. Bila `src/`, `lib/`, atau `publisher/worker.mjs` diubah pada branch selain `main`, workflow **Bangun editor** membangun ulang `assets/` dan bundle Worker secara otomatis.

## Menambah tulisan

**Lewat editor (disarankan).** Aktifkan layanan penerbitan satu kali dengan mengikuti [panduan aktivasi](docs/AKTIVASI-EDITOR.md). Setelah itu, buka `tulis.html`, masuk dengan GitHub, tulis, lalu klik **Terbitkan**.

<details>
<summary>Fitur editor lengkap</summary>

Judul, tebal/miring, tautan, subjudul, kutipan, daftar, **kode** (teks terpilih jadi kode sebaris, selain itu blok kode), **garis pemisah**, **gambar** dari perangkat atau dari alamat https (diunduh Worker saat terbit), **sematan** YouTube, X/Twitter, Instagram, Facebook, Telegram, dan TikTok, serta tombol ↑ ↓ (Alt+↑/↓) untuk memindah blok, gandakan blok, dan hapus blok. Sesi login bertahan 7 hari di perangkat yang sama.

Setelah memperbarui `publisher/worker.mjs`, tempel ulang `publisher/worker.bundle.mjs` ke Cloudflare (Edit code → Deploy).
</details>

**Manual.** Tambahkan file `posts/nama-tulisan.md`, taruh gambar di `images/`, lalu daftarkan di `posts.json`:

```json
{
  "title": "Judul tulisan",
  "date": "2026-11-23",
  "category": "Monthly Essay",
  "excerpt": "Ringkasan satu atau dua kalimat.",
  "file": "posts/nama-tulisan.md",
  "cover": "images/nama-sampul.jpg"
}
```

Kolom `cover` bersifat opsional; kategori yang dikenali adalah `Weekly Note`, `Monthly Essay`, dan `Personal`.

## Deploy

Situs siap dipakai di GitHub Pages: pilih branch `main`, folder `/ (root)`. Sesuaikan `site.config.js` bila repositori atau alamat situs berubah.

## Lisensi

Konten tulisan © Andika Pramudya. Lisensi dependensi pihak ketiga tersedia di [`assets/THIRD-PARTY.txt`](assets/THIRD-PARTY.txt).
