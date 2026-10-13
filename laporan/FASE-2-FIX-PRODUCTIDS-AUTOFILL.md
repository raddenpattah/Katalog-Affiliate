# Fase 2: Fix Product IDs Autofill

## Temuan
- Nilai rekomendasi provider difilter terhadap `product.id`, bukan slug; konfigurasi CMS juga memakai `value_field: id`. Jadi format ID sudah cocok.
- Decap CMS RelationControl untuk multi-select mengharapkan `Immutable.List`, sedangkan wrapper sebelumnya memanggil `onChange()` dengan JavaScript array biasa. Karena itu console menampilkan data, tetapi nilai relation tidak tersimpan pada entry.

## Perbaikan
- `public/admin/generate-blog-widget.js`: array rekomendasi untuk relation/list sekarang dikonversi ke tipe Immutable dari nilai field saat ini melalui `clear().concat(...)` sebelum `onChange()`.
- Ditambahkan log tipe nilai yang diterima wrapper agar format dapat diperiksa di console.
- Tidak perlu mengubah provider atau `value_field`.

## Backup
Folder: `laporan/`  
Backup dibuat sebelum edit dengan timestamp `2026-10-13-1236`:
- `laporan/widget.backup-2026-10-13-1236`
- `laporan/config.backup-2026-10-13-1236`
- `laporan/gemini-provider.backup-2026-10-13-1236`
- `laporan/groq-provider.backup-2026-10-13-1236`

## Validasi
- Tes widget mock memastikan `onChange` relation menerima Immutable List berisi ID yang diharapkan.
- Pemeriksaan sintaks JS dan `npm run build` berhasil (31 halaman).
- Generate langsung di browser CMS/API produksi belum dijalankan.

## Git Diff Summary
- Kode diubah: `public/admin/generate-blog-widget.js` saja.
- File Pin Generator tidak disentuh.