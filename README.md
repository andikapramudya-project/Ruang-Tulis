# Ruang Tulis

Blog pribadi berbahasa Indonesia untuk opini, refleksi, dan catatan. Statis, cepat, tanpa framework, dan bisa langsung di-hosting di GitHub Pages. Dilengkapi editor tulis bergaya Telegra.ph: tulis judul dan isi, tempel gambar, klik **Terbitkan**.

**Situs:** https://andikapramudya-project.github.io/Ruang-Tulis/

## Fitur

**Pembaca**
- Tampilan bersih bergaya Notion: palet netral, font Inter, label kategori berwarna, tema terang dan gelap mengikuti perangkat
- Beranda dengan tulisan unggulan bergambar, arsip per bulan, dan filter kategori
- Halaman artikel dengan breadcrumb, properti tulisan (tanggal, kategori, waktu baca), pilihan font Sans/Serif, serta tautan tulisan sebelumnya/berikutnya
- Responsif dari 375 px hingga layar lebar, dengan navigasi keyboard, skip link, dan dukungan `prefers-reduced-motion`
- Pratinjau tautan (Open Graph) saat dibagikan

**Penulis** (`tulis.html`)
- Editor rich text berbasis TipTap: tebal, miring, judul, tautan, kutipan, dan daftar
- Gambar ditempel atau diseret, lalu otomatis diperkecil (maks. 1600 px) dan dikonversi ke WebP
- Draft tersimpan otomatis di browser, lengkap dengan pratinjau
- Satu klik **Terbitkan**: tulisan, gambar, dan `posts.json` masuk ke GitHub dalam satu commit, tanpa upload file Markdown manual
- Login GitHub lewat Cloudflare Worker; hanya akun pemilik yang boleh menerbitkan

## Teknologi

HTML, CSS, dan JavaScript murni untuk situs pembaca. Editor memakai TipTap, `marked`, `dompurify`, dan `turndown`, dibangun dengan esbuild. Penerbitan memakai Cloudflare Worker dan GitHub OAuth. Tulisan disimpan sebagai Markdown di folder `posts/`.

## Struktur proyek

```
index.html        Halaman pembaca
tulis.html        Editor penulis
style.css         Gaya situs (token warna & tipografi di bagian atas)
script.js         Logika pembaca: routing, daftar, artikel
posts/            Tulisan (Markdown)
posts.json        Daftar tulisan (judul, tanggal, kategori, ringkasan, sampul)
images/           Gambar tulisan
src/              Sumber editor dan renderer
publisher/        Cloudflare Worker untuk penerbitan
docs/             Panduan aktivasi editor
tests/            Pengujian layanan penerbitan
```

## Menjalankan secara lokal

Butuh Node.js versi LTS terbaru.

```sh
npm ci
npm run dev      # buka http://127.0.0.1:4173
npm test         # jalankan pengujian
npm run build    # bangun ulang assets/ dan bundle Worker setelah mengubah src/ atau publisher/
```

Menambah tulisan tidak memerlukan build.

## Menambah tulisan

**Lewat editor (disarankan).** Aktifkan layanan penerbitan satu kali dengan mengikuti [panduan aktivasi](docs/AKTIVASI-EDITOR.md). Setelah itu, buka `tulis.html`, masuk dengan GitHub, tulis, lalu klik **Terbitkan**.

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

Situs ini siap dipakai di GitHub Pages: pilih branch `main`, folder `/ (root)`. Sesuaikan `site.config.js` bila repositori atau alamat situs berubah.

## Lisensi

Konten tulisan © Andika Pramudya. Lisensi dependensi pihak ketiga tersedia di `assets/THIRD-PARTY.txt`.
