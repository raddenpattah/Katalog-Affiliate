# Laporan Perbaikan Bug Generator AI

**Tanggal:** 15 Oktober 2026  
**Cakupan:** Model Gemini, parsing respons produk, error provider, autentikasi settings, dan panduan env Vercel.

## Ringkasan Perubahan

### Bug 1 — Model Gemini

- Mengganti `GEMINI_MODEL` di `.env.local` dan `.env.vercel.local` menjadi `gemini-3.5-flash`.
- Tidak ada `GEMINI_MODEL` di `.env`; file env lain tidak memiliki nilai lama `gemini-1.5-flash` atau `gemini-3.8-flash`.
- Memperbarui default model di `lib/product-ai.js`, `lib/providers/gemini.js`, dan `lib/config-store.js`.
- Memperbarui placeholder model di CMS, komentar `.env.example`, README, dan fallback pada `test-gemini.mjs`.
- Referensi di arsip laporan lama dibiarkan sebagai catatan historis.

### Bug 2 — Parsing Respons Produk

- Parser memeriksa isi code fence lebih dulu, lalu respons lengkap.
- Pemindaian menghormati kurung kurawal bersarang, tanda kutip, dan escape sehingga dapat melewati teks tambahan atau kurung kurawal yang bukan bagian dari JSON.
- Jika tidak ditemukan object JSON valid, error tetap diawali `Hasil AI tidak valid:` dan menyertakan paling banyak 200 karakter awal respons.
- Nilai yang dikenali sebagai API key/token disamarkan pada cuplikan.

### Bug 3 — Error Provider

- `generateProduct()` menyimpan pesan asli error per provider, termasuk kegagalan Gemini dan Groq.
- Error akhir menggabungkan detail kedua provider; nilai key/token dan cuplikan respons disamarkan.
- Endpoint mengembalikan pesan provider yang informatif dan mencatat diagnostik tanpa mencatat cuplikan respons mentah.

### Bug 4 — Token Admin Settings

- Endpoint `api/settings.js` memang membaca `process.env.AI_SETTINGS_ADMIN_TOKEN`; tidak ditemukan endpoint settings lain yang membaca token dari sumber yang keliru.
- Token env dan header kini menormalkan spasi dan kutip sebelum dibandingkan. Perbandingan tetap case-sensitive.
- Pemeriksaan lokal memastikan nilai di `.env` dan `.env.local` sama setelah normalisasi. Nilai token tidak dimasukkan ke laporan.

Cara memeriksa token lokal tanpa membagikan nilainya:

```sh
grep '^AI_SETTINGS_ADMIN_TOKEN=' .env.local
```

Jangan tempelkan hasil perintah tersebut ke chat atau tiket publik.

## Validasi

- Tes parser: JSON biasa, fenced JSON, teks pengantar/penutup, kurung kurawal palsu sebelum JSON, cuplikan 200 karakter, dan penyamaran key — lulus.
- Tes error provider tersimulasi: detail Gemini dan Groq tergabung, key uji tersamarkan — lulus.
- Tes token settings: normalisasi spasi/kutip dan case-sensitive — lulus. Jalur penyimpanan pada tes lokal tidak dapat diuji tuntas karena `BLOB_AI_CONFIG_READ_WRITE_TOKEN` tidak tersedia di lingkungan tes.
- Perintah yang diminta:

  ```sh
  node --env-file=.env --env-file=.env.local test-gemini.mjs
  ```

  Skrip memakai `gemini-3.5-flash` dan menerima respons HTTP `503 Service Unavailable` dari Google dengan keterangan model sedang mengalami permintaan tinggi. Ini bukan lagi `404` model tidak ditemukan. Skrip menangkap error tersebut sehingga exit code proses tetap `0`; generasi live belum terkonfirmasi berhasil pada percobaan ini. Cuplikan respons mentah disembunyikan dari laporan.
- `npm run build`: berhasil; Astro menghasilkan 31 halaman termasuk halaman produk, artikel, dan sitemap.

## Checklist Vercel

1. Buka **Vercel Dashboard → Project → Settings → Environment Variables**.
2. Atur `GEMINI_MODEL` menjadi `gemini-3.5-flash` untuk target environment yang dipakai (Production, Preview, dan/atau Development).
3. Pastikan `GEMINI_API_KEY` berisi key valid dan `ENABLE_AI_GENERATOR` bernilai `true`. Jangan menaruh key di kode atau membagikannya.
4. Jangan mengubah `GEMINI_FALLBACK_MODEL` kecuali memang ingin mengganti model fallback.
5. Setelah menyimpan perubahan env, lakukan redeploy agar deployment baru memakai nilai tersebut.
6. Catatan penting: generator produk membaca model tersimpan di konfigurasi AI Blob (atau default `gemini-3.5-flash`), bukan `GEMINI_MODEL` sebagai override. Jika CMS masih menampilkan model lama, ubah dan simpan **Model Utama** melalui halaman pengaturan AI admin juga. `GEMINI_MODEL` dipakai skrip `test-gemini.mjs`, tetapi bukan override untuk nilai konfigurasi Blob.

## File yang Disentuh

- `.env.local` dan `.env.vercel.local` (lokal/diabaikan Git)
- `.env.example`
- `README.md`
- `lib/product-ai.js`
- `lib/providers/gemini.js`
- `lib/config-store.js`
- `api/generate-product.js`
- `api/settings.js`
- `public/admin/settings.html`
- `test-gemini.mjs`
