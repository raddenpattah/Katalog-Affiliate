# Fase 2: Full Autofill Artikel

## Akar Masalah
- Wrapper relation untuk `productIds` dan `internalLinks` sudah terpasang. Namun, handler menolak nilai rekomendasi ketika nilai field saat ini `undefined`, karena memakai tes truthy sebelum memeriksa kekosongan.
- `ctaType` sebelumnya tidak diminta oleh Gemini/Groq, tidak dikirim oleh API, dan belum punya widget wrapper untuk menerima event metadata.
- `productIds` memakai `value_field: id`; nilai rekomendasi produk dari provider tetap memakai ID tersebut. Artikel terkait memakai slug relation yang dikonfigurasi di CMS.

## Perubahan
- `public/admin/generate-blog-widget.js`: memperlakukan `undefined`/`null` sebagai field kosong; membaca dan mengirim `ctaType`; dispatch ketiga rekomendasi; menambahkan log `Auto-fill productIds`, `Auto-fill internalLinks`, dan `Auto-fill ctaType`.
- `public/admin/config.yml`: mengganti widget CTA ke wrapper `ai-cta-type` agar ikut menerima event tanpa menimpa pilihan manual.
- `api/generate-blog.js`: menambahkan `ctaType` ke event metadata NDJSON.
- `lib/providers/gemini.js` dan `lib/providers/groq.js`: meminta AI memilih `product` atau `article`, memvalidasi nilainya, dan menyertakannya pada hasil provider.

## Backup
Folder: `laporan/`  
Backup dibuat sebelum edit dengan timestamp `2026-10-13-1216`:
- `laporan/widget-ai-blog.backup-2026-10-13-1216`
- `laporan/api-generate-blog.backup-2026-10-13-1216`
- `laporan/config-blog.backup-2026-10-13-1216`
- `laporan/gemini-provider.backup-2026-10-13-1216`
- `laporan/groq-provider.backup-2026-10-13-1216`

## Cara Test
1. Jalankan `vercel dev`, buka CMS, lalu buat artikel baru.
2. Isi judul dan kategori; biarkan ID Produk, Artikel Terkait, dan Tipe CTA kosong.
3. Klik **Generate Artikel AI**.
4. Pastikan 3-7 produk, 2-3 artikel terkait, dan CTA `product`/`article` otomatis terpilih.
5. Isi pilihan manual pada field tersebut, generate ulang, lalu pastikan nilainya tidak ditimpa.
6. Periksa console untuk log auto-fill ketiga field, simpan artikel, lalu cek halaman artikel.

Validasi lokal: tes mock event-flow memastikan tiga field kosong terisi dan nilai manual tetap, pemeriksaan sintaks/YAML lulus, `npm run build` berhasil, dan `git diff --check` bersih. Tes generate live di Decap belum dilakukan.

## Expected Result
- Artikel, deskripsi, tags, `productIds`, `internalLinks`, dan `ctaType` terisi otomatis setelah generate.
- Pilihan yang sudah diisi manual tetap dipertahankan.
- Console menampilkan nilai rekomendasi untuk tiga field.
- Tidak ada file Pin Generator yang diubah.

Checkpoint sebelum eksekusi: commit `614c26f` (`checkpoint: sebelum fix autofill`).