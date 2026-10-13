# Fase 2: Artikel Creation

## Ringkasan
Alur AI artikel sekarang menerima katalog produk dan artikel terkait sebagai konteks, lalu mengembalikan rekomendasi produk serta artikel bersama konten. Widget Decap mengambil kedua dataset itu dan mengisi `productIds` serta `internalLinks` hanya jika field masih kosong. ProductCard dan halaman blog mengarahkan pembaca ke halaman detail produk, bukan langsung ke Shopee.

## File Diubah
- `api/generate-blog.js`: menerima dan membatasi konteks produk/blog, meneruskannya ke provider, lalu menambahkan `recommendedProductIds` dan `recommendedArticles` ke event metadata final.
- `public/admin/generate-blog-widget.js`: mengambil `/api/data-provider?type=products` dan `?type=blog`; mengirim konteks; mengisi field rekomendasi yang kosong saja.
- `public/admin/config.yml`: menambahkan relation `internalLinks`, pilihan `ctaType`, serta wrapper relation untuk auto-fill `productIds` dan `internalLinks`.
- `src/pages/blog/[slug].astro`: merender produk rekomendasi, tautan “Baca juga”, dan CTA sesuai tipe pilihan.
- `src/components/ProductCard.astro`: gambar, judul, dan CTA menuju halaman detail produk; menampilkan deskripsi maksimum dua baris.
- `lib/ai-provider.js`, `lib/providers/gemini.js`, `lib/providers/groq.js`: meneruskan konteks ke model, meminta JSON rekomendasi, dan memvalidasi ID yang dikembalikan terhadap kandidat.
- `src/content.config.ts`: mengizinkan `internalLinks` dan `ctaType` pada schema Astro.

## Backup
Salinan aktif dibuat sebelum edit dengan timestamp `2026-10-13-1132`:
- `laporan/api-generate-blog.backup-2026-10-13-1132`
- `laporan/widget-ai-blog.backup-2026-10-13-1132`
- `laporan/config-blog.backup-2026-10-13-1132`
- `laporan/blog-page.backup-2026-10-13-1132`
- `laporan/product-card.backup-2026-10-13-1132`
- `laporan/ai-provider-blog-context.backup-2026-10-13-1132`
- `laporan/gemini-blog-context.backup-2026-10-13-1132`
- `laporan/groq-blog-context.backup-2026-10-13-1132`
- `laporan/content-config-blog-context.backup-2026-10-13-1132`

Backup `blog-page` dan `product-card` tanggal saja sudah ada dari fase sebelumnya, sehingga tidak ditimpa.

## Cara Test
1. Pastikan `ENABLE_AI_GENERATOR=true` dan API key Gemini atau Groq tersedia.
2. Jalankan `vercel dev`, buka `/admin/`, lalu buat artikel baru.
3. Isi judul dan kategori, lalu klik **Generate Artikel AI**.
4. Pastikan isi artikel, deskripsi, tags, rekomendasi 3-7 produk, dan 2-3 artikel terkait diterima.
5. Pastikan nilai rekomendasi hanya mengisi `productIds`/`internalLinks` yang masih kosong; pilihan manual yang sudah ada tetap dipertahankan.
6. Simpan dan buka halaman artikel. ProductCard harus membuka `/produk/<slug>` dan menampilkan CTA **Lihat Detail Produk**; tautan Shopee berada di halaman detail produk.
7. Periksa CTA artikel pada pilihan `Produk` dan `Artikel`.

Validasi lokal yang dijalankan: parsing YAML Decap, pemeriksaan sintaks JS, tes validasi input API, pemeriksaan editor, dan `npm run build` (berhasil).

## Expected Result
- Provider hanya memilih ID produk/artikel dari konteks yang diberikan; produk menggunakan `product.id` agar sesuai relation CMS, sementara URL menggunakan slug produk dengan fallback ID.
- Artikel berisi tautan internal ke halaman produk dan section produk rekomendasi; artikel terkait tampil sebagai “Baca juga”.
- Tidak ada CTA ProductCard yang langsung menuju Shopee.

## Catatan
- API mempertahankan protokol NDJSON streaming yang sudah digunakan widget; event metadata final berisi `description`, `tags`, `recommendedProductIds`, dan `recommendedArticles`.
- `productIds` Decap memakai `value_field: id`, sehingga rekomendasi menggunakan ID untuk menjaga kompatibilitas konten yang ada.
- Build dan validasi API lokal berhasil; pemanggilan model AI live belum dijalankan dengan API key.
- `src/content.config.ts` dan modul provider ditambahkan ke scope setelah dikonfirmasi karena dibutuhkan agar metadata tersimpan dan AI dapat menghasilkan rekomendasi terverifikasi.
- Git worktree bersih di awal; tidak ada checkpoint commit kosong.