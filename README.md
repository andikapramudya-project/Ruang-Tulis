# Ruang-Tulis

Blog statis dengan editor rich text dan layanan publisher terpisah. Folder Ruang Tulis yang kosong digantikan oleh implementasi Ruang-Tulis-main.

## Menjalankan

```sh
npm ci
npm run build
npm test
npm run dev
```

`index.html` adalah pembaca dan `tulis.html` editor. Build menghasilkan aset browser dan bundle worker. Konten `posts/`, `posts.json`, dan gambar yang digunakan situs merupakan data publik aplikasi, bukan draft agent. Artikel tambahan dalam arsip Telegram tidak dimasukkan otomatis ke sumber yang sudah lengkap.

Sebelum hosting baru, sesuaikan `site.config.js`. Untuk layanan penerbitan, sesuaikan `publisher/wrangler.toml`, numeric GitHub user ID, namespace KV, OAuth, dan secrets; lihat `docs/AKTIVASI-EDITOR.md`. Editor lokal tidak berarti layanan penerbitan sudah aktif. Root yang telah dibangun dapat di-host di GitHub Pages. Lisensi dependency tetap tersedia di `assets/THIRD-PARTY.txt`.

## Rilis dan repositori

Tidak ditemukan rilis jadi yang sesuai dalam sumber terpilih. Paket ini berisi sumber; hasil build baru dapat dibuat sesuai lingkungan dan konfigurasi masing-masing.

Gunakan folder ini sebagai root repositori baru. Kredensial, riwayat Git lama, data pribadi, cache, rancangan agent, dan draft tidak disertakan. Metadata yang masih bertanda `REPLACE_WITH_...` perlu diisi sesuai hosting tujuan.

## Pemeriksaan paket sumber — 22 November 2026

Build bundel browser/publisher, 12 tes, dan pembukaan halaman di Chrome headless lulus. Hosting dan OAuth belum dikonfigurasi.
