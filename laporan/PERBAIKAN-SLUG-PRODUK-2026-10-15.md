# Laporan Perbaikan Slug Produk

**Tanggal:** 15 Oktober 2026
**Ruang lingkup:** URL detail produk, tautan produk, dan redirect Vercel

## Ringkasan

Slug eksplisit ditambahkan ke 22 file produk yang belum memiliki slug valid.
Satu slug valid yang sudah ada dipertahankan. Semua 23 produk kini memiliki slug
unik dalam format kebab-case huruf kecil. Nilai `id`, `shopeeUrl`, `image`, dan
field produk lainnya tidak diubah.

## Pemetaan ID ke slug

| ID lama | Produk / keterangan | Slug akhir |
|---|---|---|
| `Pohon Palem Bahan Plastik` | Pohon palem 140/160 cm | `pohon-palem-plastik-140-160cm` |
| `cermin-dinding-gantung-aesthetic` | Cermin dinding | `cermin-dinding-gantung-aesthetic` |
| `DAUN MONSTERA JUMBO ARTIFICIAL ` | Daun monstera artificial D24 | `daun-monstera-artificial-d24` |
| `Karpet Lantai Ruang Tamu` | Karpet ruang tamu 100x150 cm | `karpet-lantai-ruang-tamu-100x150cm` |
| `Karpet Lantai` | Karpet shaggy premium | `karpet-shaggy-bulu-premium` |
| `LAMPU DINDING HIAS` | Lampu dinding/pilar | `lampu-dinding-hias-pilar` |
| `Lampu Meja Aesthetic` | Lampu meja minimalis | `lampu-meja-aesthetic-minimalis` |
| `Lampu Meja Lampu Tidur Led` | Lampu LED vintage gaya Jepang | `lampu-meja-led-vintage-jepang` |
| `Lampu lantai berdiri` | Lampu lantai berdiri double | `lampu-lantai-berdiri-double` |
| `Lampu Tidur Anak ` | Lampu tidur anak rabbit LED | `lampu-tidur-anak-rabbit-led` |
| `Lampu tidur Bulan` | Lampu moonlight 3D 8 cm | `lampu-tidur-bulan-3d-moonlight-8cm` |
| `Panel PVC` | LAZZEN wood panel | `lazzen-wood-panel-pvc-2-9m` |
| `Panel PVC` | Marmer panel UV | `marmer-panel-pvc-uv` |
| `Lampu Meja Lampu Kamar Tidur` | Lampu kamar MIMOON | `mimoon-lampu-kamar-tidur-aesthetic` |
| `rak-ambalan-30cm` | Rak ambalan kayu; slug valid sebelumnya dipertahankan | `rak-ambalan-dinding-minimalis-kayu-60-150cm` |
| `Rak Ambalan` | Rak ambalan extra lebar tanpa bor | `rak-ambalan-extra-lebar-30cm-tanpa-bor` |
| `TANAMAN PLASTIK AGLONEMA` | Aglonema/monstera artificial | `tanaman-aglonema-monstera-artificial` |
| `Wall Panel Wood Panel PVC` | Wall panel PVC 150x15 mm | `wall-panel-pvc-150x15mm` |
| `Panel PVC` | Wallboard WPC PVC 40 cm | `wallboard-wpc-pvc-40cm` |
| `Wallpaper Dinding Wood Panel ` | Wallpaper wood panel 120x280 cm | `wallpaper-wood-panel-120x280cm` |
| `WPC Wall Panel` | WPC wood panel 2.9 m x 30 cm | `wpc-wood-wall-panel-2-9m-30cm` |
| `WPC Outdoor` | WPC outdoor kisi-kisi | `wpc-outdoor-wall-panel-kisi-kisi` |
| `wpc-wood-wall-panel` | WPC wood wall panel; slug kanonis dipulihkan | `wpc-wood-wall-panel` |

## Tautan dan redirect

- `ProductCard.astro` dan CTA produk unggulan pada halaman artikel sekarang
  membentuk URL dari `slug`, tanpa fallback ke `id`.
- Relasi `productIds` pada frontmatter artikel tetap menggunakan `id` sebagai
  kunci pencarian produk; URL yang ditampilkan untuk produk terkait menggunakan
  slug produk.
- Rute halaman detail dihasilkan dari slug yang didefinisikan pada JSON produk.
- `vercel.json` memiliki 22 redirect permanen dengan status 301 dari URL lama
  menuju rute slug kanonis. Tiga redirect tambahan mencakup URL file lama untuk
  produk LAZZEN, marmer, dan wallboard WPC yang ditemukan pada katalog live.
- ID `Panel PVC` dipakai tiga produk berbeda. Sesuai persetujuan, URL lama
  `/produk/Panel%20PVC` diarahkan ke produk LAZZEN; satu URL lama tidak dapat
  diarahkan ke tiga halaman sekaligus. URL live ketiga produk tersebut memiliki
  path file lama yang berbeda, sehingga masing-masing juga memiliki redirect
  khusus menuju slug kanonisnya.
- `@astrojs/sitemap` terpasang sebagai integrasi Astro. `astro.config.mjs`
  menggunakan `https://alfeto.vercel.app` sebagai `site`.
- `public/robots.txt` mengizinkan semua crawler dan menunjuk ke
  `https://alfeto.vercel.app/sitemap-index.xml`.

## Validasi

- JSON produk: 23 slug valid dan unik.
- Field selain `slug`: dibandingkan dengan versi sebelum perubahan dan tidak
  berubah.
- Katalog live: 23 tautan produk diperiksa; 20 URL lama memiliki redirect 301
  yang sesuai dan tiga sudah menjadi URL kanonis.
- Sitemap: index terbuat dan sitemap-nya memuat seluruh 23 halaman produk dan
  3 halaman artikel.
- Robots: `dist/robots.txt` tercopy dengan referensi sitemap index yang benar.
- Redirect: seluruh tujuan yang dicek cocok dengan rute produk hasil build;
  konfigurasi berisi 22 redirect berstatus 301.
- HTML hasil build: seluruh 555 referensi ke URL produk menunjuk ke rute slug
  yang dihasilkan.
- `git diff --check`: berhasil.
- `npm run build`: berhasil; Astro membangun 31 halaman tanpa error.
