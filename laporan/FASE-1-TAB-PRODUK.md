# Fase 1: Tab Produk

## Ringkasan
Field Nama Produk kini tetap menyimpan nama asli dari Shopee, sedangkan AI mengisi Title Pinterest secara terpisah. Ditambahkan shared-data API untuk produk, blog, dan kategori; widget mengambil konteks blog secara opsional sebelum meminta konten produk. Halaman produk memakai Title Pinterest untuk H1 dan title metadata, dengan fallback ke Nama Produk.

## File Dibuat
- `api/data-provider.js`: endpoint GET untuk membaca data produk, artikel blog, kategori, atau semuanya.
- `laporan/FASE-1-TAB-PRODUK.md`: laporan implementasi ini.

## File Diubah
- `public/admin/config.yml`: Nama Produk kembali memakai widget string dengan hint; menambahkan Title Pinterest opsional dengan widget AI.
- `public/admin/generate-product-widget.js`: fetch `/api/data-provider?type=blog` sebelum generate, lanjut meski fetch konteks gagal, dan menulis hasil AI ke `titlePinterest` tanpa mengubah `title`.
- `src/pages/produk/[id].astro`: H1, title, dan metadata sosial memakai Title Pinterest dengan fallback ke Nama Produk.
- `api/generate-product.js`: menerima konteks blog opsional, meneruskannya sebagai konteks tambahan, serta merespons `slug`, `titlePinterest`, `description`, dan `spesifikasi` tanpa field `title`.
- `src/content.config.ts`: menambahkan `titlePinterest` opsional agar Astro mempertahankan field tersebut saat memuat produk. Perubahan tambahan ini disetujui sebelum implementasi.

## File Backup
Semua backup dibuat sebelum edit dengan timestamp `2026-10-13-0954`:
- `laporan/config.yml.backup-2026-10-13-0954`
- `laporan/widget-ai-produk.backup-2026-10-13-0954`
- `laporan/produk-page.backup-2026-10-13-0954`
- `laporan/api-generate-product.backup-2026-10-13-0954`
- `laporan/content-config.backup-2026-10-13-0954` (tambahan untuk schema yang disetujui)

## Cara Test
1. Atur `ENABLE_AI_GENERATOR=true` dan minimal satu API key provider AI di environment Vercel.
2. Jalankan `vercel dev` dari root project agar endpoint serverless lokal tersedia.
3. Buka `/admin/`, buat produk baru, lalu isi Nama Produk asli dan Kategori.
4. Klik tombol AI di field Title Pinterest. Pastikan pesan sukses muncul dan Nama Produk tetap sama.
5. Pastikan Title Pinterest, slug, deskripsi, dan spesifikasi terisi, lalu simpan produk.
6. Buka halaman produk hasil build atau deployment; periksa H1 dan title browser. Kosongkan Title Pinterest untuk memastikan fallback memakai Nama Produk.
7. Uji data bersama dengan membuka `/api/data-provider?type=all`; respons memuat `products`, `blog`, dan `categories`.

Validasi yang dijalankan: `node --check` pada tiga file JavaScript, parsing YAML CMS, `npm run build`, serta pemanggilan langsung handler shared-data. Hasil lokal: build berhasil; endpoint mengembalikan 22 produk, 3 artikel, dan 5 kategori.

## Expected Result
- CMS menampilkan Nama Produk dan Title Pinterest sebagai field terpisah. Tombol AI berada di Title Pinterest dan tidak menimpa Nama Produk.
- H1 dan title metadata memakai Title Pinterest jika terisi; jika kosong, keduanya memakai Nama Produk. Meta description memakai deskripsi produk.
- Shared-data API mengembalikan data sesuai parameter `type`; konteks blog yang gagal dimuat tidak menghentikan pembuatan produk.

## Catatan
- Nama file `api/data-provider.js` dipetakan Vercel ke `/api/data-provider`. Widget memakai route tersebut; tidak ada rewrite tambahan di `vercel.json`.
- API shared-data membaca file proyek secara sinkron. Build Astro dan pemanggilan handler lokal sudah lolos, tetapi packaging file sumber di runtime serverless deployment belum diuji.
- Generate AI live belum diuji menggunakan API key provider.
- Checkpoint sebelum eksekusi dibuat sebagai commit `8deed76` (`checkpoint: sebelum update tab produk`).
- File Pin Generator dan endpoint/library pin tidak diubah.

## Yang Belum Dikerjakan
- Fase 2: integrasi shared-data API ke tab Pin Generator.
- Fase 2: penyelarasan data produk/blog untuk pembuatan pin dan rekomendasi lintas-tab.
- Fase 2: pengujian end-to-end di deployment Vercel dengan kredensial AI aktif.

## Git Diff Summary
- Diubah: `public/admin/config.yml`, `public/admin/generate-product-widget.js`, `src/pages/produk/[id].astro`, `api/generate-product.js`, `src/content.config.ts`.
- Dibuat: `api/data-provider.js`, laporan ini, dan lima file backup bertimestamp.
- Checkpoint pra-eksekusi: commit `8deed76`.