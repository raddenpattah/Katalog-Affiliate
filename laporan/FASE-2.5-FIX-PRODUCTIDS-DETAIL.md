# Fase 2.5: Fix Product IDs Autofill

## Diagnosis Final
- Format rekomendasi benar: provider memvalidasi setiap nilai terhadap `product.id`, dan `productIds` sebelumnya memakai `value_field: id`.
- Source RelationControl menunjukkan multi-value disimpan sebagai `Immutable.List` string. Saat merender, RelationControl mencocokkan setiap string ke opsi yang tersedia dan membuang opsi yang tidak ditemukan.
- Opsi product relation tidak tersedia di initial/query hits yang dipakai browser CMS. Upaya widget sebelumnya menambahkan query hits sendiri tetapi tidak membuat nilai produk tampil konsisten. Source Decap tidak tersedia lokal karena admin memuat CMS dari CDN.

## Fix yang Dipilih: Opsi C
- `productIds` sekarang memakai custom wrapper `ai-product-ids-list` dengan kontrol dasar Decap `list` dan item string.
- Nilai tetap `Immutable.List` string berisi ID produk, sehingga tidak membutuhkan lookup/options relation.
- Field tetap bisa diedit manual dengan menambah atau menghapus ID produk. Kekurangannya: tidak ada dropdown pencarian produk; penulis perlu memasukkan ID yang valid.

## File Diubah
- `public/admin/generate-blog-widget.js`: membungkus widget `list`, memakai `BaseControl.defaultProps.value` untuk membentuk Immutable List ketika nilai awal `undefined`, dan menghapus injeksi queryHits khusus relation yang tidak efektif.
- `public/admin/config.yml`: mengubah `productIds` ke widget list berisi item string. Perubahan config diperlukan hanya karena Opsi C.

## Backup
Folder: `/home/alto/Katalog-Affiliate/laporan/`  
Backup dibuat sebelum edit dengan timestamp `2026-10-13-1309`:
- `laporan/widget.backup-2026-10-13-1309`
- `laporan/config.backup-2026-10-13-1309`

## Cara Test
1. Buka CMS → Blog → New Blog; isi judul dan kategori.
2. Biarkan ID Produk kosong, lalu klik **Generate Artikel AI**.
3. Pastikan 3-7 ID tampil sebagai item list; ID dengan spasi seperti `Rak Ambalan` tetap diterima.
4. Tambahkan/hapus satu ID manual dan pastikan edit tersimpan.
5. Generate ulang setelah memilih ID manual; nilai yang sudah terisi tidak ditimpa.
6. Simpan artikel dan buka halaman artikel untuk memastikan rekomendasi produk di-resolve melalui `product.id`.

## Expected Result
- Auto-fill menyimpan Immutable List string, termasuk saat nilai awal field `undefined`.
- ID produk bisa diedit sebagai item list; tidak ada dropdown relation untuk productIds.
- `internalLinks` tetap memakai relation widget yang ada.

## Validasi dan Catatan
- Tes widget mock memakai `value: undefined`; memverifikasi tiga ID, termasuk `Rak Ambalan` dengan spasi, tersimpan di Immutable List dan callback edit manual tersedia.
- `node --check`, parsing YAML, `npm run build` (31 halaman), dan `git diff --check` berhasil.
- Pengujian langsung di browser CMS belum dilakukan.
- Checkpoint pra-eksekusi: commit `93e8c71` (`checkpoint: sebelum fix productids detail`).