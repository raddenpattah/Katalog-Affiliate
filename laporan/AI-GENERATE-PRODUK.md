# AI Generate Produk

## File dibuat
- `lib/product-ai.js`
- `api/generate-product.js`
- `public/admin/generate-product-widget.js`

## File diubah
- `public/admin/config.yml`: menambahkan field slug, spesifikasi, gambar tambahan, dan widget AI pada judul.
- `public/admin/index.html`: memuat script widget produk.

## Backup
- `laporan/config.yml.backup-2026-10-13`
- `laporan/index.html.backup-2026-10-13`

## Cara test
1. Pastikan `ENABLE_AI_GENERATOR=true` dan minimal salah satu `GEMINI_API_KEY` atau `GROQ_API_KEY` tersedia di environment.
2. Jalankan aplikasi melalui Vercel Dev agar endpoint `/api/generate-product` tersedia.
3. Buka `/admin/`, tambah produk, isi Nama Produk dan Kategori, lalu klik **AI Generate Semua Field**.
4. Pastikan slug, judul bersih, deskripsi, dan spesifikasi terisi. Field deskripsi opsional dapat diisi sebagai konteks tambahan.

Validasi yang dijalankan: pemeriksaan sintaks JavaScript, parsing YAML Decap, `git diff --check`, dan `npm run build` (berhasil).

## Catatan
- `ai-provider.js` saat ini khusus artikel dan tidak menerima prompt/format keluaran kustom. Untuk menjaga batas file yang disepakati, generator produk memakai SDK Gemini/Groq secara khusus dan membaca urutan/model/provider aktif dari `config-store.js`.
- Status Git awal bersih, jadi tidak ada perubahan pra-eksekusi yang perlu dibuatkan commit checkpoint.
- Build memberi dua warning duplicate ID blog yang sudah ada dan tidak terkait perubahan ini.