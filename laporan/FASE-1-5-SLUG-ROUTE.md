# Fase 1.5: Route Produk dengan Slug

## File Diubah
- `src/pages/produk/[id].astro` diganti menjadi `src/pages/produk/[slug].astro`; halaman sekarang membuat route dari slug dan memakai ID sebagai fallback.
- `src/components/ProductCard.astro` menghubungkan nama produk ke halaman detail dan tetap mempertahankan tautan Shopee.
- `src/data/products.ts` menambahkan field slug opsional dan resolver route bersama untuk kartu produk.
- `src/content.config.ts` mengizinkan slug opsional pada schema data produk Astro.
- `api/data-provider.js` selalu menyertakan slug produk di response, memakai slug AI, fallback ID, dan key file untuk ID duplikat.
- `laporan/FASE-1-5-SLUG-ROUTE.md` berisi laporan ini.

`src/pages/index.astro` dan `src/pages/blog/[slug].astro` diperiksa; keduanya memakai `ProductCard`, jadi link detail diperbarui di komponen bersama dan tidak perlu mengubah halaman-halamannya.

## File Backup
Dibuat sebelum edit pada `2026-10-13`:
- `laporan/produk-page-id.backup-2026-10-13`
- `laporan/product-card.backup-2026-10-13`
- `laporan/index-page.backup-2026-10-13`
- `laporan/blog-page.backup-2026-10-13`
- `laporan/content-config-slug.backup-2026-10-13`
- `laporan/products-type.backup-2026-10-13`

## Cara Test
1. Jalankan `npm run build`.
2. Untuk produk lama tanpa slug, buka link detail dari kartu; produk dengan ID unik memakai ID sebagai fallback.
3. Untuk tiga produk lama dengan ID sama (`Panel PVC`), pastikan masing-masing memakai rute key file yang unik.
4. Tambahkan produk baru melalui CMS, isi slug AI, lalu build ulang dan buka `/produk/<slug>/`.
5. Cek tautan nama produk di homepage dan bagian produk pada halaman blog; tautan Shopee tetap tersedia.
6. Buka `/api/data-provider?type=products` dan pastikan setiap objek mempunyai `slug`.

## Catatan Fallback
- Urutan pilihan route: slug eksplisit, lalu ID. Jika ID kosong slug-nya atau bertabrakan, key file dipakai agar semua halaman tetap unik.
- Slug eksplisit yang duplikat diprioritaskan untuk produk pertama secara deterministik; produk berikutnya memakai key file.
- Produk saat ini belum memiliki field slug; route produk baru akan menggunakan slug ketika CMS menyimpannya.
- File Pin Generator tidak diubah.

## Validasi
- `npm run build` berhasil menghasilkan 22 halaman produk.
- Artifact homepage memiliki 22 link detail unik dan semuanya mengarah ke halaman yang terbangun.
- Checkpoint pra-eksekusi: commit `678d1c7` (`checkpoint: sebelum ubah route slug`).