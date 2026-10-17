# KIYAAAA — KOMPAS100 Signal Engine

Dashboard HTML untuk UTS Algorithmic Trading, dengan endpoint serverless Vercel untuk mengambil data historis harian terbaru dari Yahoo Finance.

## Struktur

- `index.html` — dashboard utama KIYAAAA, identitas mahasiswa, mode terang/gelap, upload/simpan JSON, dan visualisasi.
- `api/chart.js` — endpoint Vercel yang mengambil data harian dari Yahoo Finance dan mengubahnya menjadi format `{ d, o, c }` yang dipakai dashboard.
- `vercel.json` — konfigurasi header dasar.

## Deploy ke GitHub lalu Vercel

1. Buat repository baru di GitHub.
2. Upload isi folder ini ke root repository (pastikan `index.html`, `api/`, dan `vercel.json` berada di root).
3. Buka Vercel dan pilih **Add New → Project**.
4. Import repository GitHub tadi.
5. Untuk proyek statis + serverless function ini, biarkan Framework Preset **Other**. Tidak perlu Build Command atau Output Directory khusus.
6. Klik **Deploy**.
7. Setelah deploy selesai, buka domain Vercel. Klik **🌐 Harga Yahoo** untuk menguji data. Endpoint pengujian satu saham: `/api/chart?s=BBCA&range=3y`.

## Cara kerja data

- Di Vercel, dashboard mencoba `/api/chart` terlebih dahulu untuk setiap saham. Endpoint tersebut meminta data harian dari Yahoo Finance.
- Tombol **Upload JSON** tetap tersedia sebagai sumber data alternatif. Setelah upload, tombol **Harga Yahoo** dapat ditekan untuk mengambil data terbaru lagi.
- Cache browser dapat membuat dashboard muncul lebih cepat. Tombol **Harga Yahoo** memulai proses pembaruan data.
- Data yang tersedia adalah data historis **harian** terbaru yang diterbitkan Yahoo Finance, bukan harga tick real-time/intraday. Jadwal pembaruan dan ketersediaan tergantung Yahoo Finance; endpoint gratis dapat terkena rate limit.
- Jika endpoint serverless gagal, dashboard mencoba proxy publik dari browser dan/atau cache yang tersedia.

## Catatan untuk tugas UTS

Jangan menganggap angka yang tampil otomatis membuktikan seluruh persyaratan backtest. Verifikasi data, biaya, asumsi eksekusi, validasi out-of-sample/walk-forward, forward test, serta log trade sebelum dikumpulkan. Jika dosen mensyaratkan HTML sepenuhnya offline tanpa mengambil data saat dibuka, siapkan snapshot data tertanam terpisah karena fitur Yahoo hosted membutuhkan internet.
