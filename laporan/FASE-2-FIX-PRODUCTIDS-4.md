# Fase 2.4: Fix Product IDs Autofill

## Diagnosis
- `recommendedProductIds` berisi ID produk, bukan slug. Contoh `rak-ambalan-30cm`, `Rak Ambalan`, dan `cermin-dinding-gantung-aesthetic` cocok dengan nilai `id` pada file produk.
- `productIds` memakai `value_field: id`; tidak ada perubahan konfigurasi atau sanitasi ID yang diperlukan. Spasi pada ID `Rak Ambalan` valid.
- RelationControl menampilkan pilihan terpilih hanya jika nilainya cocok dengan option yang tersedia. Blog memiliki sedikit opsi; katalog produk lebih besar dan pilihan rekomendasi belum tentu ada di initial/query hits.

## Perubahan
- `public/admin/generate-blog-widget.js`: menambahkan log nilai/current value/tipe/empty state serta log pemanggilan `onChange`.
- Event metadata sekarang turut membawa record produk rekomendasi.
- Wrapper `ai-product-ids` menambahkan produk rekomendasi ke `queryHits` RelationControl, sehingga option terpilih dapat dirender meskipun tidak ada di hasil awal.
- Nilai tetap diteruskan sebagai Immutable List dan pilihan manual tidak ditimpa.
- `public/admin/config.yml` dan provider tidak diubah.

## Backup
Folder: `/home/alto/Katalog-Affiliate/laporan/`  
Backup widget dibuat sebelum edit: `laporan/widget.backup-2026-10-13-1258`.

## Validasi
- Tes mock relation memverifikasi tiga ID termasuk ID berspasi diteruskan sebagai Immutable List dan ketiga record tersedia sebagai `queryHits`.
- `node --check public/admin/generate-blog-widget.js` berhasil.
- Tes CMS live belum dilakukan; verifikasi akhir tetap perlu di halaman Blog baru pada browser.

## Diff Summary
- Hanya `public/admin/generate-blog-widget.js` diubah untuk perbaikan ini; config/provider dan Pin Generator tidak disentuh.