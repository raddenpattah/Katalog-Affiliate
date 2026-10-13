# Fase 2.7: Fix Format Product IDs

## Diagnosis Mismatch
- Widget `ai-product-ids-list` menerima `recommendedProductIds` sebagai array string dan mengirimkannya melalui `onChange` sebagai Immutable List string.
- Config sebelumnya mendefinisikan sub-field `productId` di dalam widget list. Decap lalu memperlakukan setiap item sebagai object `{ productId: ... }`, sedangkan template blog mencari produk dengan membandingkan setiap item langsung ke `product.id`.

## Opsi yang Dipilih
- Menghapus sub-field dan menjadikan `productIds` list of string sederhana.
- Dipilih karena provider, widget, dan template sudah menggunakan array string ID. Dengan schema ini, CMS menyimpan format yang sama tanpa transformasi objek.
- `productIds` tetap bisa diedit manual sebagai daftar string; tidak ada dropdown pencarian relation untuk field ini.

## Perubahan
- `public/admin/config.yml`: `productIds` memakai `ai-product-ids-list` tanpa nested `field`, dengan hint contoh ID.
- `public/admin/generate-blog-widget.js` tidak perlu diubah: sudah mengirim array string dan mengonversinya menjadi Immutable List untuk widget list Decap.
- Template blog dan provider tidak diubah.

## Backup
Folder: `/home/alto/Katalog-Affiliate/laporan/`  
Backup dibuat sebelum edit dengan timestamp `2026-10-13-1342`:
- `laporan/config.backup-2026-10-13-1342`
- `laporan/widget.backup-2026-10-13-1342`

## Cara Test
1. Jalankan `vercel dev`, buka CMS → Blog → New Blog.
2. Isi judul dan kategori; biarkan ID Produk kosong.
3. Klik **Generate Artikel AI**.
4. Pastikan 3-7 ID muncul sebagai item list string, bukan object.
5. Tambah/edit/hapus ID secara manual, lalu simpan draft dan pastikan nilainya tersimpan.
6. Publish artikel dan buka halaman artikel; pastikan lookup `products.find(({ id }) => id === productId)` menampilkan produk terkait.

## Expected Result
- Data CMS berbentuk `advanced.productIds: ["rak-ambalan-30cm", "Rak Ambalan", ...]`.
- Tidak ada object `{ productId: "..." }` di frontmatter.
- Template blog menerima array string ID yang sama formatnya dengan `product.id`.

## Validasi dan Catatan
- Parse YAML memastikan `productIds` tidak memiliki nested `field` dan memakai widget `ai-product-ids-list`.
- `npm run build` berhasil (31 halaman).
- Pengujian generate/publish langsung di browser CMS belum dilakukan.
- Checkpoint sebelum eksekusi: commit `6ccd174` (`checkpoint: sebelum fix format productIds`).

## Git Diff Summary
- Diubah: `public/admin/config.yml` saja.
- Dibuat: laporan ini dan dua backup bertimestamp.
- Widget, template blog, provider, dan file Pin tidak diubah.